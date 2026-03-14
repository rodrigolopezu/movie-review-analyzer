import { useState, useEffect } from "react"
import { IoIosStar, IoIosStarHalf, IoIosStarOutline, IoMdInformationCircle, IoMdClose } from "react-icons/io"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import axios from "axios"

export default function App() {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [review, setReview] = useState("")
  const [result, setResult] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function analyzeReview(text) {
    if (text.length < 10) {
      setResult(null)
      return
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/analyze`, {
        texto: text
      })
      setResult(response.data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  async function fetchMovie() {
    setLoading(true)
    setReview("")
    setResult(null)
    const randomList = Math.floor(Math.random() * 4)
    const page = Math.floor(Math.random() * 3) + 1
    let url = `https://api.themoviedb.org/3/movie/${['top_rated', 'popular', 'now_playing', 'upcoming'][randomList]}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-EN&page=${page}`

    try {
      const response = await fetch(url)
      const data = await response.json()
      setMovie(data.results[Math.floor(Math.random() * data.results.length)])
    } finally {
      setLoading(false)
    }
  }

  function renderStars(estrellas = 0) {
    const starsArray = []
    for (let i = 0; i < 5; i++) {
      const key = `star-${i}`
      if (i < Math.floor(estrellas)) starsArray.push(<IoIosStar key={key} />)
      else if (i < estrellas) starsArray.push(<IoIosStarHalf key={key} />)
      else starsArray.push(<IoIosStarOutline key={key} />)
    }
    return starsArray
  }

  useEffect(() => { fetchMovie() }, [])
  useEffect(() => {
    const timer = setTimeout(() => analyzeReview(review), 500)
    return () => clearTimeout(timer)
  }, [review])

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center font-[Rubik] overflow-hidden transition-all relative">
      
      {/* Botón Info Flotante */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="absolute top-4 right-4 z-40 text-slate-400 hover:text-teal transition-all"
      >
        <IoMdInformationCircle size={32} />
      </button>

      <header className="text-center py-6 px-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]">
          Movie Review <span className="text-teal">Analyzer</span>
        </h1>
        <p className="text-sm md:text-base mt-2 text-slate-400 font-medium">
          Aplicando un modelo IA que analiza el sentimiento de tu reseña
        </p>
      </header>

      <main className="flex flex-col md:flex-row gap-8 px-6 max-w-6xl w-full mx-auto flex-1 overflow-hidden">
        
        <div className="w-full md:w-2/5 flex flex-col items-center">
          <div className="relative group w-full max-w-[280px] md:max-w-sm rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] border-2 border-teal/30 bg-slate-800 aspect-[2/3] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
                <p className="text-teal font-bold animate-pulse">Buscando...</p>
              </div>
            ) : movie && (
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src={"https://image.tmdb.org/t/p/w500" + movie.poster_path} 
                alt={movie.title}
              />
            )}
          </div>
          
          <button 
            onClick={fetchMovie} 
            className="w-full max-w-[280px] md:max-w-sm rounded-xl mt-4 py-3 bg-teal text-white font-bold text-lg shadow-lg shadow-teal/20 hover:shadow-teal/40 hover:-translate-y-1 transition-all active:scale-95"
          >
            Cambiar Película
          </button> 
        </div>

        <div className="w-full md:w-3/5 overflow-y-auto pr-2 pb-4">
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-teal rounded-full inline-block"></span>
              Tu Reseña
            </h2>
            
            <textarea
              className="w-full h-40 p-5 rounded-2xl bg-slate-900/80 text-slate-100 border border-slate-700 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all resize-none placeholder:text-slate-600 text-lg shadow-inner"
              placeholder="Escribe tu reseña..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-2">Valoración IA</p>
                <div className="flex justify-center text-3xl text-amber drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                  {renderStars(result?.estrellas)}
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-center text-center">
                <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-2">Sentimiento</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-black text-white">{result ? result.sentimiento : "---"}</span>
                  <span className={`text-xl ${!result ? "animate-bounce" : ""}`}>{result ? result.emojis : "🍿"}</span>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-2">Confianza</p>
                <span className="text-xl font-black text-white">
                  {result ? `${Math.round(result.puntaje * 100)}%` : "---"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Ajustado */}
      <footer className="py-4 w-full flex flex-col items-center gap-2 bg-[#0f172a]">
        <p className="text-xs text-slate-500 font-medium">Desarrollado por Rodrigo López Monroy</p>
        <div className="flex gap-4">
          <a href="https://github.com/rodrigolopezu" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
            <FaGithub size={24} />
          </a>
          <a href="https://www.linkedin.com/in/rodrigo-l%C3%B3pez-578826379/" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#0077b5] transition-colors">
            <FaLinkedin size={24} />
          </a>
        </div>
      </footer>

      {/* Modal Acerca de */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <IoMdClose size={28} />
            </button>
            <h2 className="text-2xl font-black text-white mb-6 border-b border-slate-800 pb-2">Información del Proyecto</h2>
            <div className="space-y-6">
              <section>
                <h3 className="text-teal font-bold text-sm mb-2 uppercase tracking-wider">Backend (Python)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FastAPI, Uvicorn, HuggingFace Transformers (bert-base-multilingual-uncased-sentiment), Pydantic y python-dotenv.
                </p>
              </section>
              <section>
                <h3 className="text-teal font-bold text-sm mb-2 uppercase tracking-wider">Frontend (React)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vite, React Hooks, Tailwind CSS, Axios, React Icons y Debouncing para optimización de API.
                </p>
              </section>
              <section>
                <h3 className="text-teal font-bold text-sm mb-2 uppercase tracking-wider">Arquitectura</h3>
                <p className="text-xs text-slate-400">Cliente-servidor con gestión de CORS, Variables de entorno y consumo de API externa TMDB.</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}