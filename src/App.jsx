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
    id: 'about',
    eyebrow: '01 / Estudio',
    title: 'Una sala. Dos cintas. Mil canciones.',
    body:
      'Dos salas analógicas en el barrio del Poble-sec. Cinta de 1/2", consola Trident 80B y un par de monitores Genelec heredados de un estudio que ya no existe. Lo demás lo pone la canción.',
    align: 'right',
  },
  {
    id: 'services',
    eyebrow: '02 / Trabajos',
    title: 'Producir · Mezclar · Cortar a vinilo.',
    body:
      'Sesiones de producción a tarifa por canción. Mezcla híbrida con preamps de los 70 y plug-ins del 2026. Mastering preparado tanto para streaming como para corte directo a 180 g.',
    align: 'left',
  },
  {
    id: 'roster',
    eyebrow: '03 / Roster',
    title: 'Artistas que giran con nosotros.',
    body:
      'Marta Codinach · Bicicleta Eléctrica · Hermanos Onda · The Crackle · Maia Sur · Niño Sintético · Lluvia Lenta · y siete más esperando turno.',
    align: 'right',
  },
  {
    id: 'contact',
    eyebrow: '04 / Cómo llegar',
    title: '¿Tu próximo disco gira aquí?',
    body:
      'Pásate por el estudio cualquier jueves a partir de las cinco. Hay café de filtro y un sofá hundido. Si prefieres escribir, abajo tienes el correo.',
    align: 'left',
  },
]

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M7 5.14v13.72a1 1 0 0 0 1.55.83l10.29-6.86a1 1 0 0 0 0-1.66L8.55 4.31A1 1 0 0 0 7 5.14Z" />
  </svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <rect x="6.5" y="5" width="3.5" height="14" rx="1" />
    <rect x="14" y="5" width="3.5" height="14" rx="1" />
  </svg>
)
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 16V4M6 10l6-6 6 6M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function App() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackName, setTrackName] = useState('Side A — Untitled Demo')
  const [trackUrl, setTrackUrl] = useState(null)
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
  const ease = (t) => 1 - Math.pow(1 - t, 3)
  const scale = 1 + ease(progress) * 5.6
  const rotate = progress * 480

  const panelStyle = (i, align) => {
    const d = i - stage
    const inOff = align === 'left' ? -42 : 42
    const outOff = align === 'left' ? 42 : -42
    if (d === 0) {
      const t = ease(local)
      return {
        opacity: 1 - Math.min(1, t * 1.3),
        transform: `translate3d(${ -t * outOff }px, ${ -t * 24 }px, 0)`,
        filter: `blur(${t * 4}px)`,
      }
    }
    if (d === 1) {
      const t = ease(local)
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
      <div className="scroll-track" aria-hidden="true" />
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
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' }) }}>Estudio</a>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight * 3, behavior: 'smooth' }) }}>Roster</a>
          <a className="nav-cta" href="mailto:hola@cintanegra.fm">Contacto</a>
        </nav>
      </header>

      <main className="stage">
        <div
          className={`vinyl-wrap${isPlaying ? ' spinning' : ''}${progress > 0.005 ? ' settled' : ''}`}
          style={{ transform: `translate3d(-50%, -50%, 0) scale(${scale})`, '--rot': `${rotate}deg` }}
        >
          <div className="vinyl">
            <div className="grooves" />
            <div className="shine" />
            <div className="label">
              <div className="label-inner">
                <div className="label-row">CINTA NEGRA · RECORDS</div>
                <div className="label-track">{trackName}</div>
                <div className="label-row sub">33⅓ rpm · stereo · made in BCN</div>
                <span className="spindle" />
              </div>
            </div>
          </div>
          <div className={`tonearm${isPlaying ? ' down' : ''}`} aria-hidden="true">
            <span className="pivot" />
            <span className="arm" />
            <span className="head" />
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
              {isPlaying ? 'reproduciendo · 33⅓' : 'aguja levantada'}
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
          <span>desliza · el disco se acerca</span>
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
