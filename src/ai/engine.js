/**
 * Lightweight in-memory behavioral-cognitive engine emulating
 * multi-modal fusion, recurrent memory, RL-style adaptation, and Bayesian confidence.
 * This is a deterministic, self-contained simulation (no external APIs or storage).
 */

const sigmoid = (x) => 1 / (1 + Math.exp(-x))
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v))
const lerp = (a, b, t) => a + (b - a) * t

const MODE_NAMES = ['Rational', 'Emotional', 'Deceptive', 'Impulsive', 'Deliberate']
const PERSONALITY_TRAITS = [
  'Foresight',
  'Adaptivity',
  'Assertiveness',
  'Restraint',
  'Cooperation',
  'Authenticity',
]

class BehavioralCognitiveEngine {
  constructor(seed = 7) {
    this.t = 0
    this.hidden = [0.1, 0.05, 0.08, 0.04]
    this.cell = [0, 0, 0, 0]
    this.dirichlet = Array(MODE_NAMES.length).fill(1.4)
    this.policy = [0.32, 0.28, 0.24, 0.18]
    this.personality = [0.72, 0.78, 0.63, 0.58, 0.74, 0.69]
    this.random = this.makeRng(seed)
  }

  makeRng(seed) {
    let s = seed
    return () => {
      s ^= s << 13
      s ^= s >> 17
      s ^= s << 5
      return ((s < 0 ? ~s + 1 : s) % 1000) / 1000
    }
  }

  /**
   * Build a compact feature vector from a multi-modal frame.
   */
  fuseFeatures(frame) {
    const { facial, voice, text, physio, behavior } = frame
    const features = [
      facial.microTension,
      facial.eyeAspect,
      voice.pitchVar,
      voice.energy,
      text.hedging,
      text.assertiveness,
      physio.hrv,
      physio.eda,
      behavior.cursorEntropy,
      behavior.gazeStability,
      behavior.keystrokeLatency,
    ]
    const mean = features.reduce((s, v) => s + v, 0) / features.length
    const variance =
      features.reduce((s, v) => s + (v - mean) * (v - mean), 0) / Math.max(1, features.length - 1)
    const energy = features.reduce((s, v) => s + Math.abs(v), 0) / features.length
    return { vector: features.map((v) => clamp(v / 100)), mean: clamp(mean / 100), variance, energy }
  }

  /**
   * One-step recurrent update with small LSTM-style gating and policy adaptation.
   */
  step(frame, opts = {}) {
    const sensitivity = opts.sensitivity ?? 0.8
    this.t += 1
    const fusion = this.fuseFeatures(frame)
    const x = fusion.vector

    // Tiny LSTM-ish cell update (4 dims)
    for (let i = 0; i < 4; i += 1) {
      const offset = (i * 3) % x.length
      const slice = (x[offset] + x[(offset + 2) % x.length] + x[(offset + 4) % x.length]) / 3
      const inputGate = sigmoid(slice * 4 - 1 + this.hidden[i] * 0.8)
      const forgetGate = sigmoid(1.5 - slice * 2)
      const outputGate = sigmoid(slice * 3 + 0.3)
      const candidate = Math.tanh(slice * 2 + this.random() * 0.1)
      this.cell[i] = forgetGate * this.cell[i] + inputGate * candidate
      this.hidden[i] = outputGate * Math.tanh(this.cell[i])
    }

    // Graph-style fusion weighting modalities
    const modalityScores = {
      facial: frame.facial.microTension * 0.6 + frame.facial.eyeAspect * 0.4,
      voice: frame.voice.pitchVar * 0.4 + frame.voice.energy * 0.6,
      text: frame.text.sentiment * 0.5 + frame.text.hedging * 0.5,
      physio: frame.physio.eda * 0.5 + (100 - frame.physio.hrv) * 0.5,
      behavior: frame.behavior.cursorEntropy * 0.5 + (100 - frame.behavior.gazeStability) * 0.5,
    }

    const graphSignal =
      (modalityScores.facial * 0.22 +
        modalityScores.voice * 0.2 +
        modalityScores.text * 0.18 +
        modalityScores.physio * 0.2 +
        modalityScores.behavior * 0.2) /
      100

    // RL-style reward shaping
    const reward = clamp(
      (frame.text.assertiveness - frame.text.hedging + fusion.mean * 100 - fusion.variance * 40) / 150 +
        (frame.behavior.gazeStability - frame.behavior.cursorEntropy) / 200,
      -0.6,
      0.8,
    )
    this.policy = this.policy.map((w, idx) => clamp(w + reward * (0.1 - idx * 0.015), 0.05, 0.45))

    // Bayesian concentration updates for modes
    const stressSignal = clamp(frame.physio.eda / 100 + (1 - frame.physio.hrv / 100), 0, 1)
    const deceptionCue = clamp(frame.text.hedging / 100 + frame.voice.pitchVar / 200, 0, 1)
    const deliberateCue = clamp(frame.behavior.gazeStability / 100 + fusion.mean, 0, 1)

    this.dirichlet = this.dirichlet.map((v) => v * 0.98)
    this.dirichlet[0] += deliberateCue * 0.9 // rational
    this.dirichlet[1] += fusion.mean * 0.6 // emotional
    this.dirichlet[2] += deceptionCue * 1.1 // deceptive
    this.dirichlet[3] += stressSignal * 0.9 // impulsive
    this.dirichlet[4] += deliberateCue * 0.8 // deliberate

    const dirSum = this.dirichlet.reduce((s, v) => s + v, 0)
    const modeDistribution = MODE_NAMES.map((mode, idx) => {
      const score = (this.dirichlet[idx] / dirSum) * 100
      const ciWidth = Math.max(4, 14 - this.dirichlet[idx] * 0.9)
      return {
        mode,
        score: Math.round(score),
        ci: [Math.max(0, Math.round(score - ciWidth)), Math.min(100, Math.round(score + ciWidth))],
      }
    })

    // Cognitive state synthesis (bounded 0-100)
    const attention = clamp((fusion.energy * 85 + this.hidden[0] * 40 + deliberateCue * 35) * sensitivity, 0, 100)
    const cognitiveLoad = clamp(
      (fusion.variance * 220 + (1 - deliberateCue) * 25 + this.hidden[1] * 70) * sensitivity,
      0,
      100,
    )
    const emotionalValence = clamp(
      (frame.text.sentiment * 0.6 + frame.voice.energy * 0.3 + (1 - stressSignal) * 40) / 1.7,
      0,
      100,
    )
    const stress = clamp((stressSignal * 92 + (1 - fusion.mean) * 25 + this.hidden[2] * 50) * sensitivity, 0, 100)
    const engagement = clamp((attention * 0.6 + frame.behavior.gazeStability * 0.4 - stress * 0.35) * 1.05, 0, 100)
    const deceptionRisk = clamp((deceptionCue * 85 + stress * 0.25 - engagement * 0.1) * 0.9, 0, 100)

    // Personality adaptation (slow drift)
    this.personality = this.personality.map((v, idx) =>
      clamp(
        v +
          (fusion.mean - 0.55) * 0.05 +
          (idx === 1 ? reward * 0.1 : 0) +
          (idx === 5 ? -deceptionCue * 0.02 : 0),
        0.35,
        0.95,
      ),
    )

    const fingerprint = PERSONALITY_TRAITS.map((trait, idx) => ({
      trait,
      score: Math.round(this.personality[idx] * 100),
      drift: Math.round((this.hidden[idx % this.hidden.length] + graphSignal) * 60),
    }))

    const importance = [
      { label: 'Stress variance', importance: Math.round(stressSignal * 100) },
      { label: 'Engagement consistency', importance: Math.round(engagement) },
      { label: 'Emotional drift', importance: Math.round((1 - fusion.mean) * 100) },
      { label: 'Attention stability', importance: Math.round(attention) },
      { label: 'Cognitive load', importance: Math.round(cognitiveLoad) },
    ]

    const systemMetrics = {
      streams: frame.activeModalities,
      latency: Math.round(lerp(48, 92, 1 - fusion.mean) + this.random() * 6),
      accuracy: clamp(95 - deceptionCue * 5 + deliberateCue * 2, 88, 98),
    }

    const biasMetrics = {
      parity: clamp(0.9 + this.random() * 0.08 - deceptionCue * 0.02, 0.82, 0.98),
      opportunity: clamp(0.88 + this.random() * 0.08 - stressSignal * 0.02, 0.82, 0.98),
      calibration: clamp(0.92 + this.random() * 0.05 - fusion.variance * 0.04, 0.88, 0.99),
    }

    return {
      cognitiveState: {
        attention,
        cognitiveLoad,
        emotionalValence,
        stress,
        engagement,
        deceptionRisk,
      },
      modeDistribution,
      featureImportance: importance,
      fingerprint,
      biasMetrics,
      systemMetrics,
      timelinePoint: { time: `T+${this.t}s`, attention, stress },
      reactivityPoint: { time: `T+${this.t}s`, reactivity: clamp(emotionalValence + stress * 0.35, 0, 100) },
      personality: [
        { trait: 'Openness', score: Math.round(lerp(70, 85, this.personality[0])) },
        { trait: 'Conscientiousness', score: Math.round(lerp(60, 90, this.personality[1])) },
        { trait: 'Extraversion', score: Math.round(lerp(45, 80, this.personality[2])) },
        { trait: 'Agreeableness', score: Math.round(lerp(55, 88, this.personality[4])) },
        { trait: 'Neuroticism', score: Math.round(lerp(20, 60, 1 - this.personality[3])) },
      ],
    }
  }

  warmup(modalities, steps = 12) {
    const timeline = []
    const reactivity = []
    let last = null
    for (let i = 0; i < steps; i += 1) {
      const frame = generateSyntheticFrame(modalities, this.random)
      last = this.step(frame, { sensitivity: 0.8 })
      timeline.push(last.timelinePoint)
      reactivity.push(last.reactivityPoint)
    }
    return { last, timeline, reactivity }
  }
}

/**
 * Synthetic multi-modal frame generator (deterministic per RNG).
 */
export const generateSyntheticFrame = (modalities, rng = Math.random) => {
  const activeModalities = modalities.filter((m) => m.active).length || 1
  const jitter = (scale) => (rng() - 0.5) * scale
  const baseStress = 40 + jitter(30)

  return {
    activeModalities,
    facial: {
      microTension: clamp(55 + jitter(25) + (modalities.find((m) => m.id === 'facial')?.confidence ?? 60) * 0.2, 0, 100),
      eyeAspect: clamp(60 + jitter(20), 0, 100),
    },
    voice: {
      pitchVar: clamp(30 + jitter(35), 5, 95),
      energy: clamp(55 + jitter(30), 0, 100),
    },
    text: {
      sentiment: clamp(60 + jitter(35), 0, 100),
      hedging: clamp(35 + jitter(30), 0, 100),
      assertiveness: clamp(55 + jitter(35), 0, 100),
    },
    physio: {
      hrv: clamp(68 + jitter(25), 30, 95),
      eda: clamp(baseStress + jitter(20), 5, 95),
      respiration: clamp(14 + jitter(6), 6, 24),
    },
    behavior: {
      cursorEntropy: clamp(40 + jitter(30), 0, 100),
      gazeStability: clamp(65 + jitter(25), 0, 100),
      keystrokeLatency: clamp(45 + jitter(25), 0, 100),
    },
  }
}

export default BehavioralCognitiveEngine
