import { useEffect, useRef, useState } from 'react'
import './App.css'

const SECTIONS = [
  {
    id: 'intro',
    eyebrow: 'BLACK GROOVE RECORDS',
    title: 'La música no se escucha. Se reproduce.',
    body:
      'Productora musical independiente. Producción, mezcla, mastering y dirección artística para artistas que aún creen en el ritual del vinilo.',
  },
  {
    id: 'about',
    eyebrow: '01 — Quiénes somos',
    title: 'Un estudio. Un sonido. Una aguja.',
    body:
      'Trabajamos desde 2014 con artistas emergentes y consagrados. Cada disco que sale por nuestras manos pasa primero por un tocadiscos.',
  },
  {
    id: 'services',
    eyebrow: '02 — Servicios',
    title: 'Producción · Mezcla · Mastering',
    body:
      'Sesiones en estudio con cinta analógica, mezcla híbrida y mastering preparado tanto para streaming como para corte directo a vinilo.',
  },
  {
    id: 'roster',
    eyebrow: '03 — Roster',
    title: 'Artistas que giran con nosotros',
    body:
      'Lola Vinilo · Costa Eléctrica · Hermanos Onda · The Crackle · Maia Sur · Niño Sintético · y muchos más en el surco.',
  },
  {
    id: 'contact',
    eyebrow: '04 — Contacto',
    title: '¿Tu próximo disco gira aquí?',
    body:
      'Escríbenos a hola@blackgroove.fm — o pásate por el estudio. Café, cerveza y monitores Genelec esperando.',
  },
]

export default function App() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackName, setTrackName] = useState('Side A — Demo Track')
  const [trackUrl, setTrackUrl] = useState(null)
  const audioRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (err) {
        console.warn('No se pudo reproducir:', err)
      }
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

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
  const scale = 1 + progress * 6.2
  const rotate = progress * 540
  const sectionShift = (i) => {
    const d = i - stage
    if (d === 0) return { opacity: 1 - Math.min(1, local * 1.4), y: -local * 60 }
    if (d === 1) return { opacity: Math.max(0, local * 1.4 - 0.2), y: 80 - local * 80 }
    return { opacity: 0, y: d < 0 ? -120 : 200 }
  }

  return (
    <div className="app">
      <div className="scroll-track" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          BLACK GROOVE
          <span className="brand-sub">·records·</span>
        </div>
        <nav className="nav">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Inicio</a>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' }) }}>Estudio</a>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight * 3, behavior: 'smooth' }) }}>Roster</a>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }) }}>Contacto</a>
        </nav>
      </header>

      <main className="stage" style={{ '--p': progress }}>
        <div
          className={`vinyl-wrap ${isPlaying ? 'spinning' : ''}`}
          style={{ transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)` }}
        >
          <div className="vinyl">
            <div className="grooves" />
            <div className="shine" />
            <div className="label">
              <div className="label-inner">
                <div className="label-top">BLACK GROOVE</div>
                <div className="label-mid">{trackName}</div>
                <div className="label-bot">33⅓ RPM · STEREO</div>
                <div className="spindle" />
              </div>
            </div>
          </div>
          <div className="tonearm" aria-hidden="true">
            <div className="arm" />
            <div className="head" />
            <div className="pivot" />
          </div>
        </div>

        <div className="sections">
          {SECTIONS.map((s, i) => {
            const { opacity, y } = sectionShift(i)
            return (
              <section
                key={s.id}
                className="panel"
                style={{
                  opacity,
                  transform: `translate(-50%, calc(-50% + ${y}px))`,
                  pointerEvents: opacity > 0.5 ? 'auto' : 'none',
                }}
              >
                <div className="eyebrow">{s.eyebrow}</div>
                <h1>{s.title}</h1>
                <p>{s.body}</p>
                {i === 0 && (
                  <div className="cta-row">
                    <button className="cta primary" onClick={togglePlay}>
                      {isPlaying ? '❚❚  Pausar' : '▶  Reproducir'}
                    </button>
                    <button className="cta ghost" onClick={() => fileRef.current?.click()}>
                      Cargar tu pista
                    </button>
                  </div>
                )}
                {i === total - 1 && (
                  <a className="cta primary" href="mailto:hola@blackgroove.fm">hola@blackgroove.fm</a>
                )}
              </section>
            )
          })}
        </div>

        <div className="player">
          <button className="play" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <div className="meta">
            <div className="meta-track">{trackName}</div>
            <div className="meta-sub">{isPlaying ? 'reproduciendo · 33⅓' : 'aguja levantada'}</div>
          </div>
          <button className="upload" onClick={() => fileRef.current?.click()}>+ Pista</button>
          <input ref={fileRef} type="file" accept="audio/*" hidden onChange={onFile} />
          <audio
            ref={audioRef}
            src={trackUrl ?? undefined}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            loop
          />
        </div>

        <div className="scroll-hint" style={{ opacity: progress < 0.04 ? 1 : 0 }}>
          <span>desliza para girar el disco</span>
          <div className="hint-arrow" />
        </div>

        <div className="dots">
          {SECTIONS.map((_, i) => (
            <span key={i} className={i === stage ? 'dot active' : 'dot'} />
          ))}
        </div>
      </main>
    </div>
  )
}
