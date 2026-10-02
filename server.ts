import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import * as ort from 'onnxruntime-node';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const MODEL_DIR = path.join(process.cwd(), 'models');
const MODEL_PATH = path.join(MODEL_DIR, 'aasist.onnx');
const MODEL_URL = 'https://huggingface.co/SpeechAntiSpoofingBenchmarks/AASIST/resolve/main/aasist.onnx?download=true';
const WINDOW = 64600;
const SAMPLE_RATE = 16000;
const CALIBRATION_DIR = path.join(process.cwd(), 'calibration_samples');

app.use(express.json({ limit: '64mb' }));
app.use(express.urlencoded({ extended: true, limit: '64mb' }));

let sessionPromise: Promise<ort.InferenceSession> | null = null;

type OutputMapping = 'scalar' | 'index0' | 'index1';
interface CalibrationState {
  ready: boolean;
  mapping: OutputMapping;
  threshold: number;
  scale: number;
  humanReferenceScore: number;
  aiReferenceScore: number;
  gap: number;
  source: string;
}

let calibration: CalibrationState = {
  ready: false,
  mapping: 'scalar',
  threshold: 0,
  scale: 1,
  humanReferenceScore: 0,
  aiReferenceScore: 0,
  gap: 0,
  source: 'generic model orientation (not calibrated)',
};

async function ensureModel(): Promise<void> {
  if (fs.existsSync(MODEL_PATH) && fs.statSync(MODEL_PATH).size > 1_000_000) return;
  fs.mkdirSync(MODEL_DIR, { recursive: true });
  console.log('AASIST model not found. Downloading the official 1.62 MB ONNX model...');
  const response = await fetch(MODEL_URL, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Could not download AASIST model (${response.status} ${response.statusText}). Download aasist.onnx manually and place it in models/.`);
  }
  const file = fs.createWriteStream(MODEL_PATH);
  await new Promise<void>((resolve, reject) => {
    const reader = response.body!.getReader();
    const pump = async (): Promise<void> => {
      try {
        const { done, value } = await reader.read();
        if (done) {
          file.end(() => resolve());
          return;
        }
        file.write(Buffer.from(value));
        await pump();
      } catch (err) {
        file.destroy();
        reject(err);
      }
    };
    void pump();
  });
  if (fs.statSync(MODEL_PATH).size < 1_000_000) {
    fs.rmSync(MODEL_PATH, { force: true });
    throw new Error('Downloaded AASIST model is incomplete.');
  }
  console.log('AASIST model downloaded.');
}

async function getSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      await ensureModel();
      const session = await ort.InferenceSession.create(MODEL_PATH, {
        executionProviders: ['cpu'],
        graphOptimizationLevel: 'all',
      });
      console.log(`AASIST loaded. Input=${session.inputNames.join(', ')} Output=${session.outputNames.join(', ')}`);
      return session;
    })().catch((err) => {
      sessionPromise = null;
      throw err;
    });
  }
  return sessionPromise;
}

function parsePcm16MonoWav(base64Audio: string): { samples: Float32Array; sampleRate: number } {
  const clean = base64Audio.replace(/^data:audio\/[a-zA-Z0-9.+_-]+;base64,/, '');
  const buf = Buffer.from(clean, 'base64');
  if (buf.length < 44) throw new Error('Audio payload is too small to be a WAV file.');

  let offset = 12;
  let channels = 1;
  let sampleRate = 16000;
  let bitsPerSample = 16;
  let audioFormat = 1;
  let dataStart = -1;
  let dataSize = 0;

  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const next = offset + 8 + size + (size % 2);
    if (id === 'fmt ') {
      audioFormat = buf.readUInt16LE(offset + 8);
      channels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      bitsPerSample = buf.readUInt16LE(offset + 22);
    } else if (id === 'data') {
      dataStart = offset + 8;
      dataSize = Math.min(size, buf.length - dataStart);
      break;
    }
    offset = next;
  }

  if (audioFormat !== 1 || bitsPerSample !== 16 || dataStart < 0) {
    throw new Error('The detector expects 16-bit PCM WAV input.');
  }

  const frames = Math.floor(dataSize / (channels * 2));
  if (frames <= 0) throw new Error('Audio contains no samples.');
  const mono = new Float32Array(frames);
  let pos = dataStart;
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < channels; c++) {
      sum += buf.readInt16LE(pos) / 32768;
      pos += 2;
    }
    mono[i] = sum / channels;
  }
  return { samples: mono, sampleRate };
}

function resampleLinear(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  if (input.length === 0) throw new Error('Audio contains no samples.');
  const outLength = Math.max(1, Math.round(input.length * toRate / fromRate));
  const output = new Float32Array(outLength);
  const ratio = fromRate / toRate;
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const left = Math.min(input.length - 1, Math.floor(pos));
    const right = Math.min(input.length - 1, left + 1);
    const frac = pos - left;
    output[i] = input[left] * (1 - frac) + input[right] * frac;
  }
  return output;
}

function padLikeOfficial(x: Float32Array): Float32Array {
  if (x.length >= WINDOW) return x.slice(0, WINDOW);
  const out = new Float32Array(WINDOW);
  for (let i = 0; i < WINDOW; i++) out[i] = x[i % x.length];
  return out;
}

function makeWindows(samples: Float32Array): Float32Array[] {
  if (!samples.length) throw new Error('Audio contains no samples.');
  if (samples.length <= WINDOW) return [padLikeOfficial(samples)];

  // Deterministic first window, matching the official AASIST evaluation wrapper,
  // followed by a few evenly-spaced windows for longer recordings.
  const starts = new Set<number>([0]);
  const extraCount = Math.min(7, Math.max(0, Math.floor(samples.length / WINDOW) - 1));
  for (let i = 1; i <= extraCount; i++) {
    const maxStart = samples.length - WINDOW;
    starts.add(Math.floor((i / (extraCount + 1)) * maxStart));
  }
  return [...starts].sort((a, b) => a - b).map((start) => samples.slice(start, start + WINDOW));
}

function readOutputVector(output: ort.Tensor): number[] {
  return Array.from(output.data as ArrayLike<number>, Number);
}

async function inferRawOutputs(windows: Float32Array[]): Promise<number[][]> {
  const session = await getSession();
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];
  const outputs: number[][] = [];
  for (const audio of windows) {
    const input = new ort.Tensor('float32', audio, [1, WINDOW]);
    const result = await session.run({ [inputName]: input });
    outputs.push(readOutputVector(result[outputName]));
  }
  return outputs;
}

function candidateScores(outputs: number[][], mapping: OutputMapping): number[] {
  return outputs.map((values) => {
    if (values.length === 0) throw new Error('AASIST returned an empty output tensor.');
    if (values.length === 1 || mapping === 'scalar') return values[0];
    return mapping === 'index0' ? values[0] : values[1];
  });
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function scoreAudio(samples: Float32Array, mapping: OutputMapping = calibration.mapping): Promise<{ score: number; raw: number[] }> {
  const outputs = await inferRawOutputs(makeWindows(samples));
  const scores = candidateScores(outputs, mapping);
  return { score: median(scores), raw: scores };
}

async function calibrateFromReferenceSamples(): Promise<void> {
  const humanPath = path.join(CALIBRATION_DIR, 'reference_human.wav');
  const aiPath = path.join(CALIBRATION_DIR, 'reference_ai.wav');
  if (!fs.existsSync(humanPath) || !fs.existsSync(aiPath)) {
    console.warn('Calibration reference samples not found; using official AASIST orientation without local calibration.');
    return;
  }

  const readWavFile = (filePath: string) => {
    const bytes = fs.readFileSync(filePath);
    const parsed = parsePcm16MonoWav(bytes.toString('base64'));
    return resampleLinear(parsed.samples, parsed.sampleRate, SAMPLE_RATE);
  };

  const humanSamples = readWavFile(humanPath);
  const aiSamples = readWavFile(aiPath);
  const rawHuman = await inferRawOutputs(makeWindows(humanSamples));
  const rawAi = await inferRawOutputs(makeWindows(aiSamples));

  const mappings: OutputMapping[] = rawHuman[0]?.length >= 2 ? ['index0', 'index1'] : ['scalar'];
  let best: CalibrationState | null = null;

  for (const mapping of mappings) {
    const humanScore = median(candidateScores(rawHuman, mapping));
    const aiScore = median(candidateScores(rawAi, mapping));
    const gap = humanScore - aiScore; // expected positive for human-higher mapping
    const absGap = Math.abs(gap);
    if (!best || absGap > Math.abs(best.gap)) {
      best = {
        ready: gap > 0,
        mapping,
        threshold: (humanScore + aiScore) / 2,
        scale: Math.max(absGap / 4, 0.08),
        humanReferenceScore: humanScore,
        aiReferenceScore: aiScore,
        gap,
        source: 'two user-provided labeled reference samples',
      };
    }
  }

  if (!best) throw new Error('Could not determine an AASIST output mapping.');
  if (best.gap < 0) {
    throw new Error('AASIST calibration could not produce a human-higher score from the supplied references. Check that the two reference labels are correct.');
  }
  calibration = best;
  console.log(`Local calibration ready: mapping=${best.mapping}, human=${best.humanReferenceScore.toFixed(4)}, ai=${best.aiReferenceScore.toFixed(4)}, threshold=${best.threshold.toFixed(4)}`);
}

function sigmoid(x: number): number {
  if (x >= 0) return 1 / (1 + Math.exp(-x));
  const e = Math.exp(x);
  return e / (1 + e);
}

function boundedPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}

app.get('/api/health', async (_req, res) => {
  try {
    await getSession();
    res.json({ status: 'ok', detector: 'AASIST-ONNX', modelReady: true, calibration });
  } catch (error) {
    res.status(503).json({ status: 'degraded', detector: 'AASIST-ONNX', modelReady: false, detail: String(error), calibration });
  }
});

app.post('/api/detect-voice', async (req, res) => {
  try {
    const { audioBase64, fileName } = req.body as { audioBase64?: string; fileName?: string };
    if (!audioBase64) return res.status(400).json({ error: 'audioBase64 is required' });

    const decoded = parsePcm16MonoWav(audioBase64);
    const audio = resampleLinear(decoded.samples, decoded.sampleRate, SAMPLE_RATE);
    const result = await scoreAudio(audio);
    const score = result.score;

    // AASIST's official score orientation is higher = more bona fide/human.
    // A local midpoint calibration turns that raw score into an evidence estimate.
    const scale = calibration.ready ? calibration.scale : 1;
    const threshold = calibration.ready ? calibration.threshold : 0;
    const humanEvidence = calibration.ready ? sigmoid((score - threshold) / scale) : sigmoid(score);
    const humanProbability = boundedPercent(humanEvidence * 100);
    const aiProbability = boundedPercent((1 - humanEvidence) * 100);

    const halfGap = calibration.ready ? Math.max(Math.abs(calibration.gap) / 2, 0.08) : 1;
    const distanceFromThreshold = Math.abs(score - threshold);
    const ambiguityRatio = distanceFromThreshold / halfGap;

    let verdict: 'Synthetic Clone' | 'Authentic Human' | 'Suspicious Jitter';
    let riskLevel: 'critical' | 'high' | 'medium' | 'low';
    if (ambiguityRatio < 0.35) {
      verdict = 'Suspicious Jitter';
      riskLevel = 'medium';
    } else if (score < threshold) {
      verdict = 'Synthetic Clone';
      riskLevel = aiProbability >= 90 ? 'critical' : 'high';
    } else {
      verdict = 'Authentic Human';
      riskLevel = 'low';
    }

    const confidenceScore = boundedPercent(50 + Math.min(49, ambiguityRatio * 45));
    const margin = boundedPercent(Math.abs(aiProbability - humanProbability));

    res.json({
      success: true,
      detectionEngine: 'aasist-onnx',
      model: 'SpeechAntiSpoofingBenchmarks/AASIST',
      modelOutput: 'AASIST raw score; higher means more bona-fide/human',
      isAiVoice: verdict === 'Synthetic Clone',
      aiProbability,
      humanProbability,
      confidenceScore,
      verdict,
      detectedSynthesizer: 'Not identifiable from AASIST alone',
      riskLevel,
      calibration,
      anomalies: [
        `Analyzed ${result.raw.length} deterministic ~4.04 s windows.`,
        `Median AASIST bona-fide score: ${score.toFixed(4)}.`,
        calibration.ready
          ? `Local decision threshold: ${threshold.toFixed(4)} using the two labeled reference samples.`
          : 'No local calibration samples were found; the result uses the official model orientation only.',
        `Evidence margin: ${margin.toFixed(1)} percentage points.`,
      ],
      forensicExplanation:
        verdict === 'Synthetic Clone'
          ? `The AASIST anti-spoofing model scored this sample below the locally calibrated decision threshold, making it more consistent with spoofed/synthetic speech than the supplied human reference.`
          : verdict === 'Authentic Human'
            ? `The AASIST anti-spoofing model scored this sample above the locally calibrated decision threshold, making it more consistent with bona-fide human speech than the supplied AI reference.`
            : `The AASIST score falls too close to the calibrated boundary to support a confident binary decision. Treat this sample as uncertain and use an out-of-band verification step.`,
      recommendedCountermeasure:
        verdict === 'Synthetic Clone'
          ? 'Block or step-up verification; require an independent challenge or second factor.'
          : verdict === 'Authentic Human'
            ? 'Allow standard verification while retaining the forensic audit.'
            : 'Require an out-of-band challenge before approving high-risk actions.',
      fileName: fileName || 'audio',
      windowsAnalyzed: result.raw.length,
      sampleRate: SAMPLE_RATE,
      durationSeconds: Math.round((audio.length / SAMPLE_RATE) * 10) / 10,
      rawAasistScores: result.raw,
    });
  } catch (error) {
    console.error('AASIST detection error:', error);
    res.status(500).json({
      error: 'Voice detection failed',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VocalShield AI Server running on http://localhost:${PORT}`);
    console.log('Detector: AASIST ONNX + two-sample local calibration');
  });

  try {
    await getSession();
    await calibrateFromReferenceSamples();
  } catch (err) {
    console.warn('AASIST warm-up/calibration failed:', err);
  }
}

void startServer();
