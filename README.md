# VocalShield AI — AASIST voice deepfake detector (calibrated)

This build fixes the previous detector inversion/calibration problem. It uses the official AASIST ONNX model and reads its output as a **bona-fide score where higher means more human**. The app also calibrates the decision boundary from the two labeled reference clips supplied for this project:

- `calibration_samples/reference_human.wav` — known human reference
- `calibration_samples/reference_ai.wav` — known AI reference

AASIST is an audio anti-spoofing model. Its official model card states that it operates on raw mono 16 kHz speech and that higher score means more bona fide. The official model reports 0.83% EER in-domain on ASVspoof2019-LA, but substantially worse performance out-of-domain, so this project uses an explicit **Uncertain** state rather than claiming perfect accuracy.

## Run in VS Code

```powershell
npm.cmd install
npm.cmd run dev
```

Open:

`http://localhost:3000/`

## First run

The server downloads the official `aasist.onnx` file to `models/` if it is not already present. If your network blocks Hugging Face, manually place the official ONNX file at `models/aasist.onnx`.

## What changed

- Fixed the previous output interpretation: the detector no longer treats the AASIST score as a two-class probability vector by default.
- Handles both scalar AASIST scores and two-value outputs defensively.
- Automatically determines the class index when a two-value output is returned by comparing it against the labeled human/AI references.
- Calibrates a local threshold from the supplied human and AI examples.
- Uses deterministic first-window evaluation plus a small number of additional windows for longer recordings.
- Removes fake ~90% confidence values from the final decision logic.
- The benchmark tab now tests the actual user-provided human/AI references instead of generated oscillator tones.
- Exact TTS vendor is not claimed; AASIST is an authenticity/anti-spoofing detector, not a vendor identifier.
