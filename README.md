# Behavioral Cognitive Discriminator (BCD)

AI-powered, multi-modal neuroscience dashboard demonstrating real-time cognitive and behavioral inference with interpretability, ethics, and fusion diagnostics.

## Quickstart

```bash
npm install
npm run dev   # start the interactive dashboard with HMR
npm run build # create production bundle
```

## Feature Map
- Real-time cognitive monitoring: attention, load, emotional valence, stress, engagement, deception risk with gradient progress, pulses, and smooth updates every ~2.4s.
- Multi-modal fusion cards: facial, voice, text, physiological, telemetry with activation pulses, confidence gradients, and fusion architecture diagram.
- Cognitive mode discriminator: probability bars with confidence intervals, dominant-mode highlight, natural language explanation.
- Behavioral inference engine: temporal attention/stress lines, emotional reactivity area, radar fingerprint, problem-solving style indicator, attention drift timeline.
- Risk & alerts: gauges for deception/fatigue/burnout, insider-threat score, alert timeline, cognitive fatigue and burnout monitors.
- Personality profile: Big Five with adaptive thresholds and purple→blue gradients.
- Interpretability & ethics: SHAP-style feature importance, bias metrics (parity/equal opportunity/calibration), safeguards badges, fairness audit passed.
- System architecture & performance: modal encoders, fusion, discriminator cards plus active streams, latency, accuracy readouts.
- Controls & UX: navigation sidebar, breadcrumbs, start/stop, modality toggles, sensitivity slider, baseline calibration, export/reset, privacy mode, high-contrast toggle, settings modal, demo badge, toasts.

All data is synthesized in-memory via a lightweight behavioral-cognitive engine (recurrent memory + graph fusion + Bayesian confidence); no external APIs or storage. Built with React, Tailwind CSS, lucide-react icons, and Recharts for visualization.

## How data is produced in the demo
- A handcrafted `BehavioralCognitiveEngine` (see `src/ai/engine.js`) fuses synthetic facial/voice/text/physio/behavioral streams into a compact feature vector.
- A tiny LSTM-like memory updates hidden/cell state; graph-weighted fusion mixes modality salience; Dirichlet-style Bayesian updates yield cognitive-mode probabilities with confidence intervals.
- Outputs include cognitive states, feature importance, bias metrics, system performance, and a drifting behavioral fingerprint/personality profile. Everything runs deterministically in the browser with seeded randomness—no external AI services or storage.
