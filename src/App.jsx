import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BellRing,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Eye,
  Gauge,
  Moon,
  Pause,
  Play,
  RefreshCcw,
  Rocket,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  ToggleLeft,
  ToggleRight,
  Waves,
  Zap,
} from 'lucide-react'
import BehavioralCognitiveEngine, { generateSyntheticFrame } from './ai/engine'
import ArchitectureDiagram from './components/ArchitectureDiagram'
import CognitiveStateCard from './components/CognitiveStateCard'
import ExplanationPanel from './components/ExplanationPanel'
import ModalityIndicator from './components/ModalityIndicator'
import NavigationBar from './components/NavigationBar'
import PersonalityBar from './components/PersonalityBar'
import RiskGauge from './components/RiskGauge'
import ToastStack from './components/ToastStack'

const BehaviorCharts = lazy(() => import('./components/BehaviorCharts'))

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))
const randomInRange = (min, max) => Math.random() * (max - min) + min

const baselineCognitiveState = {
  attention: 76,
  cognitiveLoad: 58,
  emotionalValence: 64,
  stress: 34,
  engagement: 82,
  deceptionRisk: 18,
}

const initialModalities = [
  {
    name: 'Facial Micro-expressions',
    description: 'Action units + blink cadence',
    active: true,
    confidence: 86,
    id: 'facial',
  },
  {
    name: 'Voice Prosody Analysis',
    description: 'Pitch, jitter, shimmer, energy',
    active: true,
    confidence: 82,
    id: 'voice',
  },
  {
    name: 'Text & Linguistic Analysis',
    description: 'Semantics, sentiment, hedging',
    active: true,
    confidence: 79,
    id: 'text',
  },
  {
    name: 'Physiological Signals',
    description: 'HRV, EDA, respiration',
    active: false,
    confidence: 71,
    id: 'physio',
  },
  {
    name: 'Behavioral Telemetry',
    description: 'Cursor, dwell, rhythm',
    active: true,
    confidence: 84,
    id: 'behavior',
  },
]

const initialPersonality = [
  { trait: 'Openness', score: 74, description: 'Abstract thinking, cognitive flexibility' },
  { trait: 'Conscientiousness', score: 68, description: 'Goal alignment, reliability' },
  { trait: 'Extraversion', score: 59, description: 'Social energy & expressiveness' },
  { trait: 'Agreeableness', score: 71, description: 'Cooperation & empathy weighting' },
  { trait: 'Neuroticism', score: 33, description: 'Baseline affective volatility' },
]

const initTimeline = () =>
  Array.from({ length: 14 }).map((_, idx) => ({
    time: `T-${14 - idx}s`,
    attention: clamp(60 + randomInRange(-12, 12)),
    stress: clamp(35 + randomInRange(-8, 8)),
  }))

const initReactivity = () =>
  Array.from({ length: 14 }).map((_, idx) => ({
    time: `T-${14 - idx}s`,
    reactivity: clamp(50 + randomInRange(-18, 14)),
  }))

const initFingerprint = () => [
  { trait: 'Foresight', score: 72, drift: 12 },
  { trait: 'Adaptivity', score: 78, drift: 18 },
  { trait: 'Assertiveness', score: 63, drift: 22 },
  { trait: 'Restraint', score: 58, drift: 28 },
  { trait: 'Cooperation', score: 74, drift: 16 },
  { trait: 'Authenticity', score: 69, drift: 21 },
]

const deriveModeDistribution = (state) => {
  const rational = clamp(35 + state.attention * 0.35 + state.cognitiveLoad * 0.25 - state.stress * 0.3)
  const emotional = clamp(20 + state.emotionalValence * 0.5 + state.stress * 0.2)
  const deceptive = clamp(state.deceptionRisk * 0.9 + (100 - state.engagement) * 0.25)
  const impulsive = clamp(state.stress * 0.45 + (100 - state.cognitiveLoad) * 0.18)
  const deliberate = clamp(30 + state.engagement * 0.35 + state.attention * 0.15 - state.stress * 0.15)
  const total = rational + emotional + deceptive + impulsive + deliberate
  const normalize = (v) => Math.round((v / total) * 100)

  const base = [
    { mode: 'Rational', score: normalize(rational) },
    { mode: 'Emotional', score: normalize(emotional) },
    { mode: 'Deceptive', score: normalize(deceptive) },
    { mode: 'Impulsive', score: normalize(impulsive) },
    { mode: 'Deliberate', score: normalize(deliberate) },
  ]
  const diff = 100 - base.reduce((sum, b) => sum + b.score, 0)
  base[0].score = clamp(base[0].score + diff)

  return base.map((entry) => {
    const margin = randomInRange(3, 8)
    return {
      ...entry,
      ci: [clamp(entry.score - margin), clamp(entry.score + margin)],
    }
  })
}

const buildNarrative = (state, mode) => {
  const stressTone = state.stress > 70 ? 'heightened stress response detected' : 'stress within adaptive range'
  const engagementTone = state.engagement > 75 ? 'high sustained engagement' : 'moderate engagement patterns'
  const deceptionTone =
    state.deceptionRisk > 60
      ? 'possible intentional obfuscation'
      : state.deceptionRisk > 35
        ? 'monitor for strategic responses'
        : 'low deception indicators'

  return `Dominant mode: ${mode}. ${stressTone}; ${engagementTone}; ${deceptionTone}. Emotional valence at ${Math.round(
    state.emotionalValence,
  )}% balancing cognitive load ${Math.round(state.cognitiveLoad)}%.`
}

const featureImportanceFromState = (state) => {
  const factors = [
    { label: 'Stress variance', weight: state.stress * 0.9 },
    { label: 'Engagement consistency', weight: 100 - state.engagement * 0.7 },
    { label: 'Emotional drift', weight: 60 + (50 - state.emotionalValence) * 0.6 },
    { label: 'Attention stability', weight: state.attention * 0.8 },
    { label: 'Cognitive load', weight: state.cognitiveLoad * 0.7 },
  ]
  const maxWeight = Math.max(...factors.map((f) => f.weight))
  return factors.map((f) => ({
    ...f,
    importance: Math.round((f.weight / maxWeight) * 100),
  }))
}

function App() {
  const [monitoring, setMonitoring] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [sensitivity, setSensitivity] = useState(0.8)
  const [activeSection, setActiveSection] = useState('overview')
  const [showSettings, setShowSettings] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastTimeouts = useRef({})
  const engineRef = useRef(new BehavioralCognitiveEngine())
  const warmup = useMemo(() => engineRef.current.warmup(initialModalities, 14), [])

  const [cognitiveState, setCognitiveState] = useState(warmup.last?.cognitiveState ?? baselineCognitiveState)
  const [modalities, setModalities] = useState(initialModalities)
  const [personality, setPersonality] = useState(warmup.last?.personality ?? initialPersonality)
  const [timeline, setTimeline] = useState(warmup.timeline ?? initTimeline())
  const [reactivity, setReactivity] = useState(warmup.reactivity ?? initReactivity())
  const [fingerprint, setFingerprint] = useState(warmup.last?.fingerprint ?? initFingerprint())
  const [modeDistribution, setModeDistribution] = useState(
    warmup.last?.modeDistribution ?? deriveModeDistribution(baselineCognitiveState),
  )
  const [featureImportance, setFeatureImportance] = useState(
    warmup.last?.featureImportance ?? featureImportanceFromState(baselineCognitiveState),
  )
  const [biasMetrics, setBiasMetrics] = useState(warmup.last?.biasMetrics ?? { parity: 0.93, opportunity: 0.9, calibration: 0.96 })
  const [systemMetrics, setSystemMetrics] = useState(
    warmup.last?.systemMetrics ?? { streams: 5, latency: 62, accuracy: 96.4 },
  )
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, idx) => ({
        id: idx,
        top: randomInRange(10, 90),
        left: randomInRange(5, 95),
        delay: idx * 0.6,
      })),
    [],
  )

  const dominantMode = useMemo(
    () => modeDistribution.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), modeDistribution[0]),
    [modeDistribution],
  )

  const narrative = useMemo(() => buildNarrative(cognitiveState, dominantMode?.mode ?? 'Rational'), [
    cognitiveState,
    dominantMode,
  ])

  const pushToast = (title, message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev.slice(-2), { id, title, message, tone }])
    if (toastTimeouts.current[id]) clearTimeout(toastTimeouts.current[id])
    toastTimeouts.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete toastTimeouts.current[id]
    }, 4200)
  }

  useEffect(() => {
    if (!monitoring) return
    const interval = setInterval(() => {
      const frame = generateSyntheticFrame(modalities, Math.random)
      const result = engineRef.current.step(frame, { sensitivity })
      setCognitiveState(result.cognitiveState)
      setTimeline((series) => [...series.slice(Math.max(series.length - 13, 0)), result.timelinePoint])
      setReactivity((series) => [...series.slice(Math.max(series.length - 13, 0)), result.reactivityPoint])
      setFingerprint(result.fingerprint)
      setFeatureImportance(result.featureImportance)
      setModeDistribution(result.modeDistribution)
      setBiasMetrics(result.biasMetrics)
      setSystemMetrics(result.systemMetrics)
      setPersonality(result.personality)
      setModalities((prev) =>
        prev.map((mod) => {
          const confidenceDrift = mod.active ? randomInRange(-3, 4) : -1.5
          return {
            ...mod,
            confidence: clamp(mod.confidence + confidenceDrift, 30, 99),
            active: mod.active && Math.random() > 0.02,
          }
        }),
      )

      if (result.cognitiveState.stress > 82 || result.cognitiveState.deceptionRisk > 70) {
        pushToast(
          'Risk spike',
          result.cognitiveState.stress > result.cognitiveState.deceptionRisk
            ? 'Stress surge detected; monitoring engagement countermeasures.'
            : 'Deception cues elevated; cross-checking modalities.',
          'danger',
        )
      }
    }, 2400)

    return () => clearInterval(interval)
  }, [monitoring, sensitivity, modalities])

  useEffect(
    () => () => {
      Object.values(toastTimeouts.current).forEach((timeout) => clearTimeout(timeout))
    },
    [],
  )

  const reinitializeEngine = (mods = modalities) => {
    engineRef.current = new BehavioralCognitiveEngine()
    const warm = engineRef.current.warmup(mods, 12)
    setCognitiveState(warm.last?.cognitiveState ?? baselineCognitiveState)
    setTimeline(warm.timeline ?? initTimeline())
    setReactivity(warm.reactivity ?? initReactivity())
    setFingerprint(warm.last?.fingerprint ?? initFingerprint())
    setModeDistribution(warm.last?.modeDistribution ?? deriveModeDistribution(baselineCognitiveState))
    setFeatureImportance(warm.last?.featureImportance ?? featureImportanceFromState(baselineCognitiveState))
    setBiasMetrics(warm.last?.biasMetrics ?? { parity: 0.93, opportunity: 0.9, calibration: 0.96 })
    setSystemMetrics(
      warm.last?.systemMetrics ?? { streams: mods.filter((m) => m.active).length, latency: 62, accuracy: 96.4 },
    )
    setPersonality(warm.last?.personality ?? initialPersonality)
  }

  const toggleMonitoring = () => {
    setMonitoring((m) => !m)
    pushToast(!monitoring ? 'Monitoring resumed' : 'Monitoring paused', 'Data generation adjusted.', 'info')
  }

  const handleBaseline = () => {
    reinitializeEngine(modalities)
    pushToast('Baseline calibrated', 'Signals re-centered to reference state.', 'success')
  }

  const handleReset = () => {
    setModalities(initialModalities)
    reinitializeEngine(initialModalities)
    pushToast('Session reset', 'All buffers cleared and session restarted.', 'success')
  }

  const handleExport = () => {
    const payload = {
      cognitiveState,
      modalities,
      personality,
      timeline,
      reactivity,
      fingerprint,
      modeDistribution,
      systemMetrics,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bcd-session.json'
    a.click()
    URL.revokeObjectURL(url)
    pushToast('Data exported', 'Session snapshot downloaded.', 'success')
  }

  const handleSectionChange = (section) => {
    setActiveSection(section)
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const controls = (
    <div className="glass card-hover grid grid-cols-1 gap-3 rounded-2xl border border-border/70 p-4 lg:grid-cols-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggleMonitoring}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-blue-500/20 px-3 py-2 text-sm font-semibold text-blue-100 transition hover:border-blue-400/60 hover:shadow-glow"
          aria-label="Start or stop monitoring"
        >
          {monitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {monitoring ? 'Stop monitoring' : 'Start monitoring'}
        </button>
        <button
          onClick={handleBaseline}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 transition hover:border-emerald-400/60 hover:text-emerald-200"
          aria-label="Baseline calibration"
        >
          <ScanLine className="h-4 w-4" />
          Baseline calibration
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-purple-500/15 px-3 py-2 text-sm text-purple-100 transition hover:border-purple-400/60"
          aria-label="Export data"
        >
          <Download className="h-4 w-4" />
          Export data
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 transition hover:border-amber-400/60 hover:text-amber-200"
          aria-label="Reset session"
        >
          <RefreshCcw className="h-4 w-4" />
          Reset session
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <Gauge className="h-4 w-4 text-emerald-300" />
          Sensitivity
          <input
            type="range"
            min="0.4"
            max="1.4"
            step="0.05"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="h-1 w-28 accent-emerald-400"
            aria-label="Sensitivity"
          />
          <span className="text-slate-200">{sensitivity.toFixed(2)}x</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <ToggleLeft className={`h-5 w-5 ${privacyMode ? 'text-amber-400' : 'text-slate-500'}`} />
          Privacy mode
          <input
            type="checkbox"
            checked={privacyMode}
            onChange={() => setPrivacyMode((p) => !p)}
            className="accent-amber-400"
            aria-label="Privacy mode"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <ToggleRight className={`h-5 w-5 ${soundEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
          Sound fx
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => setSoundEnabled((s) => !s)}
            className="accent-blue-400"
            aria-label="Sound effects"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-200">
          Demo mode enabled
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Build v1.0.0 • Inference latency {systemMetrics.latency}ms
        </span>
      </div>
    </div>
  )

  return (
    <div className={highContrast ? 'contrast-125 saturate-125' : ''}>
      <div className="neon-grid" aria-hidden="true" />
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
          }}
          aria-hidden="true"
        />
      ))}
      <div className="relative z-10 px-4 pb-12 pt-6">
        <header className="mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-glow">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Behavioral Cognitive Discriminator</p>
              <h1 className="text-3xl font-semibold text-slate-50">Neuroscience AI Control Center</h1>
              <p className="text-sm text-slate-400">
                Multi-modal cognitive monitoring with interpretability and ethics safeguards.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              <CheckCircle2 className="h-4 w-4" /> Fairness Audit: PASSED
            </span>
            <button
              onClick={() => setHighContrast((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100 transition hover:border-blue-400/60"
            >
              <Moon className="h-4 w-4" />
              {highContrast ? 'Contrast on' : 'Contrast off'}
            </button>
          </div>
        </header>

        <div className="mx-auto mt-6 max-w-6xl grid gap-4 lg:grid-cols-[260px_1fr]">
          <NavigationBar
            active={activeSection}
            onChange={handleSectionChange}
            onOpenSettings={() => setShowSettings(true)}
          />

          <main className="scroll-area space-y-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Breadcrumb: System Overview / {activeSection.replace('-', ' ')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live refresh every 2.4s
              </div>
            </div>

            {controls}

            <section id="overview" className="space-y-3 transition">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">Real-time Cognitive Monitoring</h2>
                <span className="text-xs text-slate-400">Smooth updates with pulse feedback</span>
              </div>
              <div className="glass grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Signal provenance</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Data is synthesized locally by a handcrafted behavioral engine (no cloud, no external APIs). It
                    generates multimodal frames (facial, voice, text, physio, telemetry), runs a tiny recurrent update,
                    graph-weighted fusion, and Dirichlet/Bayesian confidence to drive the dashboard.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  <p className="text-xs uppercase text-slate-400">Pipeline</p>
                  <p>Sensor frame → Preprocess → Modal encoders → Fusion + recurrent memory → Cognitive discriminator → UI</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Toggle privacy mode to obfuscate values; baseline/reset reseeds the engine for a fresh session.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <CognitiveStateCard
                  title="Attention level"
                  value={cognitiveState.attention}
                  gradient="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400"
                  accent="shadow-[0_0_24px_rgba(59,130,246,0.35)]"
                  icon={Eye}
                  description="Neural focus vector"
                  privacyMode={privacyMode}
                  trend={cognitiveState.attention > 70 ? 'up' : 'stable'}
                />
                <CognitiveStateCard
                  title="Cognitive load"
                  value={cognitiveState.cognitiveLoad}
                  gradient="bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400"
                  accent="shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                  icon={Brain}
                  description="Working memory strain"
                  privacyMode={privacyMode}
                  trend={cognitiveState.cognitiveLoad > 65 ? 'up' : 'stable'}
                />
                <CognitiveStateCard
                  title="Emotional valence"
                  value={cognitiveState.emotionalValence}
                  gradient="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-300"
                  accent="shadow-[0_0_24px_rgba(16,185,129,0.35)]"
                  icon={Activity}
                  description="Affect direction"
                  privacyMode={privacyMode}
                  trend={cognitiveState.emotionalValence > 70 ? 'up' : 'stable'}
                />
                <CognitiveStateCard
                  title="Stress level"
                  value={cognitiveState.stress}
                  gradient="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400"
                  accent="shadow-[0_0_24px_rgba(245,158,11,0.35)]"
                  icon={AlertTriangle}
                  description="Sympathetic arousal"
                  privacyMode={privacyMode}
                  trend={cognitiveState.stress > 60 ? 'up' : 'stable'}
                />
                <CognitiveStateCard
                  title="Engagement score"
                  value={cognitiveState.engagement}
                  gradient="bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300"
                  accent="shadow-[0_0_24px_rgba(59,130,246,0.35)]"
                  icon={Zap}
                  description="Task engrossment"
                  privacyMode={privacyMode}
                  trend={cognitiveState.engagement > 70 ? 'up' : 'stable'}
                />
                <CognitiveStateCard
                  title="Deception risk"
                  value={cognitiveState.deceptionRisk}
                  gradient="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300"
                  accent="shadow-[0_0_24px_rgba(239,68,68,0.35)]"
                  icon={ShieldCheck}
                  description="Integrity monitor"
                  privacyMode={privacyMode}
                  trend={cognitiveState.deceptionRisk > 55 ? 'up' : 'stable'}
                />
              </div>
            </section>

            <section id="fusion" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">Multi-modal Data Fusion</h2>
                <span className="text-xs text-slate-400">Active modalities pulse green</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                {modalities.map((mod) => (
                  <ModalityIndicator
                    key={mod.id}
                    name={mod.name}
                    description={mod.description}
                    active={mod.active}
                    confidence={mod.confidence}
                    icon={Database}
                    onToggle={() =>
                      setModalities((prev) =>
                        prev.map((m) => (m.id === mod.id ? { ...m, active: !m.active } : m)),
                      )
                    }
                  />
                ))}
              </div>
              <ArchitectureDiagram
                stages={[
                  {
                    title: 'Data Input',
                    subtitle: 'Sensors',
                    nodes: ['Video stream', 'Audio', 'Text', 'Physio', 'Telemetry'],
                    kind: 'input',
                  },
                  {
                    title: 'Modal Encoders',
                    subtitle: 'Specialists',
                    nodes: ['CNN micro-expr.', 'Prosody transformer', 'Linguistic LM', 'HRV encoder'],
                    kind: 'encoder',
                  },
                  {
                    title: 'Fusion Layer',
                    subtitle: 'Alignment',
                    nodes: ['Cross-modal attention', 'Temporal sync', 'Uncertainty weighting'],
                    kind: 'fusion',
                  },
                  {
                    title: 'Discriminator',
                    subtitle: 'Inference',
                    nodes: ['Cognitive mode head', 'Risk head', 'Ethics gate'],
                    kind: 'discriminator',
                  },
                  {
                    title: 'Output',
                    subtitle: 'Decisions',
                    nodes: ['Alerts', 'Explanations', 'Adaptation'],
                    kind: 'output',
                  },
                ]}
              />
            </section>

            <section id="discriminator" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">Cognitive Mode Discriminator</h2>
                <span className="text-xs text-slate-400">Confidence intervals show uncertainty</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="space-y-3">
                    {modeDistribution.map((entry) => (
                      <div key={entry.mode}>
                        <div className="flex items-center justify-between text-sm text-slate-200">
                          <span className={entry.mode === dominantMode.mode ? 'gradient-text font-semibold' : ''}>
                            {entry.mode}
                          </span>
                          <span>{entry.score}%</span>
                        </div>
                        <div className="relative h-3 overflow-hidden rounded-full bg-slate-800/70">
                          <div
                            className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 transition-all duration-700"
                            style={{ width: `${entry.score}%` }}
                          />
                          <div
                            className="absolute h-full bg-white/15"
                            style={{
                              left: `${entry.ci[0]}%`,
                              width: `${entry.ci[1] - entry.ci[0]}%`,
                            }}
                            title="Confidence interval"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <ExplanationPanel
                  title="Interpreter"
                  summary={narrative}
                  highlights={[
                    `Dominant mode: ${dominantMode.mode}`,
                    `Attention ${Math.round(cognitiveState.attention)}% with engagement ${Math.round(cognitiveState.engagement)}%`,
                    `Stress ${Math.round(cognitiveState.stress)}% informing deception gate at ${Math.round(cognitiveState.deceptionRisk)}%`,
                  ]}
                  badges={['Explainability', 'Confidence aware']}
                />
              </div>
            </section>

            <section id="personality" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">Personality Profile</h2>
                <span className="text-xs text-slate-400">Adaptive thresholds influence risk</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {personality.map((trait) => (
                  <PersonalityBar
                    key={trait.trait}
                    trait={trait.trait}
                    score={trait.score}
                    description={trait.description}
                    threshold={60}
                  />
                ))}
              </div>
            </section>

            <section id="behavioral" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">Behavioral Inference Engine</h2>
                <span className="text-xs text-slate-400">Temporal + fingerprint analysis</span>
              </div>
              <div className="glass rounded-2xl border border-border/70 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                    <Zap className="h-4 w-4" /> Problem-solving style:{' '}
                    {cognitiveState.cognitiveLoad > 62 ? 'Systematic' : 'Heuristic'}
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                    <Waves className="h-4 w-4" /> Attention drift aligned
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
                    <Rocket className="h-4 w-4" /> Adaptive thresholds engaged
                  </span>
                </div>
              </div>
              <Suspense
                fallback={<div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-slate-900/50" />}
              >
                <BehaviorCharts timeline={timeline} reactivity={reactivity} fingerprint={fingerprint} />
              </Suspense>
            </section>

            <section id="performance" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">Risk Assessment & Alerts</h2>
                <span className="text-xs text-slate-400">Color-coded thresholds</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <RiskGauge label="Deception risk" value={cognitiveState.deceptionRisk} thresholds={[35, 70]} color="#ef4444" />
                <RiskGauge label="Cognitive fatigue" value={cognitiveState.cognitiveLoad} thresholds={[55, 78]} color="#f59e0b" />
                <RiskGauge label="Burnout risk" value={100 - cognitiveState.emotionalValence} thresholds={[45, 70]} color="#8b5cf6" />
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-100">
                      <BellRing className="h-4 w-4 text-amber-400" />
                      Alert timeline
                    </div>
                    <span className="text-xs text-slate-400">Auto-resolves on recovery</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Insider threat score stable: {Math.round(systemMetrics.accuracy)}% confidence.
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Cognitive fatigue monitor tuned to sensitivity {sensitivity.toFixed(2)}x.
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      Burnout watchlist active when valence drops below 40%.
                    </div>
                  </div>
                </div>
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-100">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Insider threat score
                    </div>
                    <span className="text-xs text-slate-400">Synthesized</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Signal coherence</span>
                      <span className="text-emerald-300">92%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500" style={{ width: '92%' }} />
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Access anomaly</span>
                      <span className="text-amber-300">18%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-red-500" style={{ width: '18%' }} />
                    </div>
                    <p className="text-xs text-slate-400">
                      Cross-validates behavioral telemetry against identity graph; triggers only on multi-modal consensus.
                    </p>
                  </div>
                </div>
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center gap-2 text-slate-100">
                    <ThermometerSun className="h-5 w-5 text-orange-400" />
                    System performance
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-slate-200">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase text-slate-400">Active streams</p>
                      <p className="text-xl font-semibold text-emerald-300">{systemMetrics.streams}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase text-slate-400">Latency</p>
                      <p className="text-xl font-semibold text-blue-300">{systemMetrics.latency} ms</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase text-slate-400">Accuracy</p>
                      <p className="text-xl font-semibold text-purple-300">{systemMetrics.accuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="ethics" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">Interpretability & Ethics</h2>
                <span className="text-xs text-slate-400">Bias monitoring + SHAP-style feature importance</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Feature importance</p>
                  <div className="mt-3 space-y-3">
                    {featureImportance.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>{item.label}</span>
                          <span>{item.importance}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400"
                            style={{ width: `${item.importance}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center gap-2 text-slate-100">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    Ethics safeguards
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-slate-300">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-400">Demographic parity</p>
                      <p className="text-lg font-semibold text-emerald-300">{biasMetrics.parity.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-400">Equal opportunity</p>
                      <p className="text-lg font-semibold text-blue-300">{biasMetrics.opportunity.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-400">Calibration</p>
                      <p className="text-lg font-semibold text-purple-300">{biasMetrics.calibration.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" /> Safeguards active
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-blue-200">
                      <Activity className="h-3 w-3" /> Bias monitor running
                    </span>
                  </div>
                </div>
              </div>
              <details className="glass rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <summary className="cursor-pointer text-slate-100">Audit trail & rationale</summary>
                <p className="mt-2 text-xs text-slate-400">
                  Explanations combine SHAP-style feature attributions with modality weights. Uncertainty is visualized
                  through confidence bands; demographic parity and equal opportunity thresholds are enforced with live
                  monitoring hooks. Toggle high-contrast to support review workflows.
                </p>
              </details>
            </section>

            <section id="inference" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">System Architecture Overview</h2>
                <span className="text-xs text-slate-400">Data flow and model specs</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center gap-2 text-slate-100">
                    <Cpu className="h-5 w-5 text-blue-400" />
                    Model specs
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>Fusion Transformer • 12 heads</li>
                    <li>Temporal ConvNet • 1.8M params</li>
                    <li>Uncertainty gating • Monte Carlo dropout</li>
                  </ul>
                </div>
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center gap-2 text-slate-100">
                    <Database className="h-5 w-5 text-purple-400" />
                    Data streams
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>5 concurrent modalities</li>
                    <li>Adaptive sampling at 20Hz</li>
                    <li>Latency-aware fusion bus</li>
                  </ul>
                </div>
                <div className="glass rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center gap-2 text-slate-100">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Health
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>Streaming uptime 99.7%</li>
                    <li>Auto-healing nodes ready</li>
                    <li>Privacy filters engaged</li>
                  </ul>
                </div>
              </div>
            </section>

            <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>Behavioral Cognitive Discriminator • build 1.0.0</span>
              <span>Neuroscience-inspired UX • smooth transitions enabled</span>
            </footer>
          </main>
        </div>

        {showSettings && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass w-full max-w-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-100">
                  <Settings className="h-5 w-5" />
                  Settings & Configuration
                </div>
                <button
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-emerald-400/50"
                  onClick={() => setShowSettings(false)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div>
                    <p className="font-semibold">High contrast</p>
                    <p className="text-xs text-slate-400">Increase clarity for dense data views.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={() => setHighContrast((v) => !v)}
                    className="accent-emerald-400"
                    aria-label="High contrast toggle"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div>
                    <p className="font-semibold">Sound effects</p>
                    <p className="text-xs text-slate-400">Tones for alerts and transitions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled((v) => !v)}
                    className="accent-blue-400"
                    aria-label="Sound effects toggle"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div>
                    <p className="font-semibold">Privacy mode</p>
                    <p className="text-xs text-slate-400">Blur sensitive figures while sharing.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyMode}
                    onChange={() => setPrivacyMode((v) => !v)}
                    className="accent-amber-400"
                    aria-label="Privacy toggle"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastStack toasts={toasts} />
    </div>
  )
}

export default App
