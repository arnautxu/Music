import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

const SECTIONS = [
  {
    id: 'intro',
    eyebrow: 'A · 33⅓ · 2026',
    title: 'Discos que se hacen para girar.',
    body:
      'Productora musical independiente fundada en Barcelona. Producimos, mezclamos y masterizamos música pensada para sonar igual de bien en un coche, en un club y en un tocadiscos.',
    align: 'left',
  },
  {
    id: 'platter',
    eyebrow: '01 / El plato',
    title: 'Un plato. Una cinta. Mil canciones.',
    body:
      'Plato directo de aluminio fresado, motor coreless y un rumbling silencioso que casi no se oye. Encima, un disco que ya gira por sí mismo.',
    align: 'right',
  },
  {
    id: 'needle',
    eyebrow: '02 / La aguja',
    title: 'La cápsula es la verdad.',
    body:
      'Cada cápsula que cae sobre el surco traduce sesenta años de música a corriente eléctrica. Trabajamos con Ortofon SPU y Audio-Technica VM540 — dos formas distintas de decir lo mismo.',
    align: 'left',
  },
  {
    id: 'label',
    eyebrow: '03 / La etiqueta',
    title: 'Roster que ya gira con nosotros.',
    body:
      'Marta Codinach · Bicicleta Eléctrica · Hermanos Onda · The Crackle · Maia Sur · Niño Sintético · Lluvia Lenta · y siete más esperando turno.',
    align: 'right',
  },
  {
    id: 'controls',
    eyebrow: '04 / Los controles',
    title: '¿Tu próximo disco gira aquí?',
    body:
      'Pulsa Start, baja la aguja y entra al estudio. Margarit 47, baixos · Barcelona. Jueves a partir de las cinco, hay café de filtro.',
    align: 'left',
  },
]

const PlayIcon = ({ s = 14 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" aria-hidden="true">
    <path d="M7 5.14v13.72a1 1 0 0 0 1.55.83l10.29-6.86a1 1 0 0 0 0-1.66L8.55 4.31A1 1 0 0 0 7 5.14Z" />
  </svg>
)
const PauseIcon = ({ s = 14 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" aria-hidden="true">
    <rect x="6.5" y="5" width="3.5" height="14" rx="1" />
    <rect x="14" y="5" width="3.5" height="14" rx="1" />
  </svg>
)
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 16V4M6 10l6-6 6 6M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// FRAMES — focal points across the turntable scene.
// x/y are % from the turntable center (-50..+50 = edges of the scene canvas).
// scale is the zoom factor.
const FRAMES = [
  { x:   0, y:   0, scale: 0.78 }, // intro · turntable sencer
  { x: -16, y:  -2, scale: 1.55 }, // platter · zoom al plat amb el vinil girant
  { x:  18, y: -22, scale: 2.10 }, // needle · headshell + agulla
  { x: -16, y:  -2, scale: 2.50 }, // label · etiqueta del vinil
  { x:  26, y:  18, scale: 1.90 }, // controls · botons start/speed
]

export default function App() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackName, setTrackName] = useState('Side A — Untitled Demo')
  const [trackUrl, setTrackUrl] = useState(null)
  const [speed, setSpeed] = useState(33)
  const audioRef = useRef(null)
  const fileRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? window.scrollY / max : 0
        setProgress(p)
        rafRef.current = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try { await audio.play(); setIsPlaying(true) } catch (_) {}
    } else {
      audio.pause(); setIsPlaying(false)
    }
  }, [])

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (trackUrl) URL.revokeObjectURL(trackUrl)
    const url = URL.createObjectURL(file)
    setTrackUrl(url)
    setTrackName(file.name.replace(/\.[^.]+$/, ''))
    setIsPlaying(false)
    setTimeout(() => audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {}), 50)
  }

  const total = SECTIONS.length
  const stage = Math.min(total - 1, Math.floor(progress * total * 0.999))
  const local = progress * total - stage
  const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

  const lerp = (a, b, t) => a + (b - a) * t
  const cur = FRAMES[stage]
  const nxt = FRAMES[Math.min(stage + 1, total - 1)]
  const tt = easeInOut(local)
  const focal = {
    x: lerp(cur.x, nxt.x, tt),
    y: lerp(cur.y, nxt.y, tt),
    scale: lerp(cur.scale, nxt.scale, tt),
  }
  // Turntable canvas: 100vmin wide, aspect-ratio 3:2 → half-w 50vmin, half-h 33.33vmin
  const offsetX = -focal.x * focal.scale * 0.50  // 50vmin / 100% = 0.5
  const offsetY = -focal.y * focal.scale * 0.3333

  const panelStyle = (i, align) => {
    const d = i - stage
    const inOff = align === 'left' ? -42 : 42
    const outOff = align === 'left' ? 42 : -42
    if (d === 0) {
      const t = easeInOut(local)
      return {
        opacity: 1 - Math.min(1, t * 1.3),
        transform: `translate3d(${ -t * outOff }px, ${ -t * 24 }px, 0)`,
        filter: `blur(${t * 4}px)`,
      }
    }
    if (d === 1) {
      const t = easeInOut(local)
      return {
        opacity: Math.max(0, t * 1.4 - 0.3),
        transform: `translate3d(${ inOff * (1 - t) }px, ${ 24 - t * 24 }px, 0)`,
        filter: `blur(${(1 - t) * 4}px)`,
      }
    }
    return { opacity: 0, transform: `translate3d(${d < 0 ? -outOff : outOff}px, 0, 0)`, filter: 'blur(8px)' }
  }

  return (
    <div className="app">
      <div className="scroll-track" aria-hidden="true">
        {SECTIONS.map((s) => <div key={s.id} className="scroll-stop" />)}
      </div>
      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="3.6" fill="currentColor" />
            <circle cx="12" cy="12" r="0.9" fill="var(--bg-0)" />
          </svg>
          <span>Cinta&nbsp;Negra</span>
          <span className="brand-meta">est. 2014 · BCN</span>
        </a>
        <nav className="nav" aria-label="primary">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Inicio</a>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' }) }}>Plato</a>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight * 3, behavior: 'smooth' }) }}>Roster</a>
          <a className="nav-cta" href="mailto:hola@cintanegra.fm">Contacto</a>
        </nav>
      </header>

      <main className="stage">
        <div
          className={`turntable${isPlaying ? ' playing' : ''}`}
          style={{
            transform: `translate3d(calc(-50% + ${offsetX}vmin), calc(-50% + ${offsetY}vmin), 0) scale(${focal.scale})`,
          }}
        >
          {/* PLINTH */}
          <div className="plinth">
            <div className="plinth-grain" />
            <div className="plinth-edge" />
          </div>

          {/* STROBE RING + PLATTER */}
          <div className="platter-area">
            <div className="strobe-ring" />
            <div className="strobe-glow" />
            <div className="platter">
              <div className="platter-disc" />
              <div className="platter-spindle" />

              {/* VINYL on top of platter */}
              <div className={`vinyl${isPlaying ? ' spinning' : ''}`} style={{ animationDuration: speed === 45 ? '1.33s' : '1.81s' }}>
                <div className="vinyl-base" />
                <div className="grooves" />
                <div className="grooves-fine" />
                <div className="iridescence" />
                <div className="specular" />
                <div className="dead-wax" />
                <div className="label-ring" />
                <div className="label">
                  <div className="label-inner">
                    <div className="label-row">CINTA NEGRA · RECORDS</div>
                    <div className="label-track">{trackName}</div>
                    <div className="label-row sub">{speed}⅓ rpm · stereo · BCN</div>
                    <span className="spindle-hole" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TONEARM */}
          <div className={`tonearm${isPlaying ? ' down' : ''}`} aria-hidden="true">
            <div className="counterweight" />
            <div className="anti-skate" />
            <div className="pivot-base">
              <div className="pivot-pin" />
            </div>
            <div className="arm">
              <div className="arm-tube" />
              <div className="finger-lift" />
              <div className="headshell">
                <div className="headshell-body" />
                <div className="cartridge" />
                <div className="stylus" />
              </div>
            </div>
          </div>
          <div className="cueing-lever" aria-hidden="true">
            <div className="cueing-stem" />
            <div className="cueing-knob" />
          </div>

          {/* CONTROLS */}
          <div className="controls">
            <div className="speed-group">
              <button
                className={`pill ${speed === 33 ? 'on' : ''}`}
                onClick={() => setSpeed(33)}
                aria-label="33 rpm"
              >
                <span>33</span><em>⅓</em>
              </button>
              <button
                className={`pill ${speed === 45 ? 'on' : ''}`}
                onClick={() => setSpeed(45)}
                aria-label="45 rpm"
              >
                <span>45</span>
              </button>
            </div>
            <button
              className={`start-btn${isPlaying ? ' on' : ''}`}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Stop' : 'Start'}
            >
              <span className="start-led" />
              <span className="start-label">{isPlaying ? 'STOP' : 'START'}</span>
            </button>
            <div className="pitch">
              <span className="pitch-label">PITCH</span>
              <div className="pitch-track">
                <div className="pitch-handle" />
                <span className="pitch-center" />
              </div>
              <span className="pitch-value">±0.0</span>
            </div>
            <div className="power">
              <span className={`power-led${isPlaying ? ' on' : ''}`} />
              <span className="power-label">POWER</span>
            </div>
          </div>

          {/* PLAQUE */}
          <div className="plaque" aria-hidden="true">
            <div className="plaque-line">CINTA NEGRA</div>
            <div className="plaque-sub">DD-2026 · DIRECT DRIVE</div>
          </div>
        </div>

        <div className="sections" aria-live="polite">
          {SECTIONS.map((s, i) => (
            <article
              key={s.id}
              className={`panel panel--${s.align}`}
              style={{ ...panelStyle(i, s.align), pointerEvents: i === stage ? 'auto' : 'none' }}
              aria-hidden={i !== stage}
            >
              <div className="eyebrow"><span className="eyebrow-dot" />{s.eyebrow}</div>
              <h1>{s.title}</h1>
              <p>{s.body}</p>
              {i === 0 && (
                <div className="cta-row">
                  <button className="cta cta--solid" onClick={togglePlay}>
                    <span className="cta-icon">{isPlaying ? <PauseIcon /> : <PlayIcon />}</span>
                    {isPlaying ? 'Pausar el disco' : 'Bajar la aguja'}
                  </button>
                  <button className="cta cta--ghost" onClick={() => fileRef.current?.click()}>
                    <UploadIcon /> Cargar tu pista
                  </button>
                </div>
              )}
              {i === total - 1 && (
                <div className="cta-row">
                  <a className="cta cta--solid" href="mailto:hola@cintanegra.fm">hola@cintanegra.fm</a>
                  <span className="cta--meta">C/ Margarit 47, baixos · BCN</span>
                </div>
              )}
            </article>
          ))}
        </div>

        <aside className="player" aria-label="reproductor">
          <button className="play" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="meta">
            <div className="meta-track">{trackName}</div>
            <div className="meta-sub">
              <span className={`pulse${isPlaying ? ' on' : ''}`} />
              {isPlaying ? `reproduciendo · ${speed}⅓` : 'aguja levantada'}
            </div>
          </div>
          <button className="upload" onClick={() => fileRef.current?.click()}>
            <UploadIcon /><span>Pista</span>
          </button>
          <input ref={fileRef} type="file" accept="audio/*" hidden onChange={onFile} />
          <audio
            ref={audioRef}
            src={trackUrl ?? undefined}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            loop
          />
        </aside>

        <div className="hint" style={{ opacity: progress < 0.04 ? 1 : 0 }} aria-hidden="true">
          <span>desliza · la cámara recorre el tocadiscos</span>
          <span className="hint-line" />
        </div>

        <ol className="dots" aria-hidden="true">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <span className={`dot${i === stage ? ' active' : ''}`} />
              <span className="dot-label">{String(i + 1).padStart(2, '0')}</span>
            </li>
          ))}
        </ol>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                cinta negra records&nbsp;&nbsp;·&nbsp;&nbsp;analog &amp; intentional&nbsp;&nbsp;·&nbsp;&nbsp;est. 2014&nbsp;&nbsp;·&nbsp;&nbsp;33⅓ rpm&nbsp;&nbsp;·&nbsp;&nbsp;cinta negra records&nbsp;&nbsp;·&nbsp;&nbsp;mastered for vinyl&nbsp;&nbsp;·&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
