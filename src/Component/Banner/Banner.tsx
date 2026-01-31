import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bannerImage from '../../assets/logo.png'
import BusinessDetails from './BusinessDetails'

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const aboutSectionRef = useRef<HTMLDivElement>(null) // ← ref for BusinessDetails
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current)
    }
  }, [])

  const handleGetStarted = () => {
    setIsMobileMenuOpen(false)
    navigate('/home')
  }

  const handleLogin = () => {
    setIsMobileMenuOpen(false)
    navigate('/login')
  }

  const handleAbout = () => {
    setIsMobileMenuOpen(false)
    // Scroll smoothly to BusinessDetails section
    if (aboutSectionRef.current) {
      aboutSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <>
      {/* ─── FIXED NAVBAR ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src={bannerImage}
                alt="Magic Lamp Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
              <span className="font-cinzel font-black text-xl md:text-2xl bg-gradient-to-r from-blue-700 to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
                Magic Lamp
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              <button
                onClick={handleAbout}
                className="text-slate-700 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                About
              </button>

              <button
                onClick={handleLogin}
                className="
                  px-6 py-2 
                  text-slate-700 font-medium 
                  border border-slate-300 rounded-lg
                  hover:bg-slate-50 hover:border-slate-400
                  transition-all duration-200
                "
              >
                Login
              </button>

              <button
                onClick={handleGetStarted}
                className="
                  px-8 py-2.5
                  bg-gradient-to-r from-blue-600 to-amber-500
                  text-white font-semibold
                  rounded-lg shadow-md
                  hover:shadow-lg hover:brightness-105
                  transition-all duration-300
                "
              >
                Get Started
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-blue-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm py-5 px-5 animate-fade-in">
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleAbout}
                  className="text-slate-700 hover:text-blue-600 font-medium py-2.5 text-left"
                >
                  About
                </button>

                <button
                  onClick={handleLogin}
                  className="
                    py-3 px-6
                    text-slate-700 font-medium 
                    border border-slate-300 rounded-lg
                    hover:bg-slate-50
                    transition-all
                  "
                >
                  Login
                </button>

                <button
                  onClick={handleGetStarted}
                  className="
                    py-3 px-6
                    bg-gradient-to-r from-blue-600 to-amber-500
                    text-white font-semibold
                    rounded-lg shadow-md
                    hover:brightness-105
                    transition-all
                  "
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO BANNER ───────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="
          relative w-full 
          min-h-[85vh] md:min-h-[90vh] 
          flex items-center 
          pt-20 md:pt-24 lg:pt-28 
          pb-16 md:pb-24 
          px-5 sm:px-8 lg:px-16 
          overflow-hidden 
          font-poppins 
          bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/40
        "
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 79px, #2563eb15 79px, #2563eb15 81px, transparent 81px)`,
              backgroundSize: '100px 100%'
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="mb-6">
                <h1
                  className="
                    font-cinzel 
                    text-5xl sm:text-6xl md:text-7xl lg:text-8xl 
                    font-black 
                    leading-tight 
                    tracking-tight
                    whitespace-nowrap
                    magic-lamp-gradient
                    animate-gradient-flow
                  "
                >
                  Magic Lamp
                </h1>
              </div>

              <p className="text-xl sm:text-2xl md:text-3xl tracking-wide font-semibold text-slate-700 uppercase mb-8">
                Anything • Anywhere • Anytime
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <button
                  onClick={handleGetStarted}
                  className="
                    px-10 py-4 
                    bg-gradient-to-r from-blue-700 via-amber-500 to-blue-700 
                    bg-[length:200%_100%] bg-left 
                    text-white font-bold text-lg 
                    rounded-xl shadow-lg
                    hover:shadow-2xl hover:bg-right 
                    transition-all duration-500 
                    flex items-center justify-center gap-3 group
                  "
                >
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <button
                  onClick={handleAbout}
                  className="
                    hidden sm:block
                    px-10 py-4 
                    border-2 border-blue-600 
                    text-blue-700 font-semibold text-lg 
                    rounded-xl 
                    hover:bg-blue-50 
                    transition-colors
                  "
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Floating Logo */}
          <div
            className={`flex-1 flex justify-center order-1 lg:order-2 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="relative max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-amber-200/20 to-blue-300/20 rounded-full blur-3xl opacity-70" />
              
              <div className="relative animate-float-slow">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-amber-400/30 rounded-full blur-2xl opacity-50 animate-pulse" />
                
                <img
                  src={bannerImage}
                  alt="Magic Lamp Logo"
                  className="relative h-[38vh] sm:h-[45vh] md:h-[52vh] lg:h-[65vh] w-auto object-contain drop-shadow-2xl"
                />
                
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-sm" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-br from-amber-400/30 to-transparent rounded-full blur-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Poppins:wght@300;400;500;600;700&display=swap');

          .magic-lamp-gradient {
            background: linear-gradient(
              135deg, 
              #1e40af 0%, 
              #2563eb 25%, 
              #3b82f6 40%, 
              #f59e0b 60%, 
              #fbbf24 75%, 
              #d97706 100%
            );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            background-size: 300% 100%;
          }

          .animate-gradient-flow {
            animation: gradientFlow 8s ease-in-out infinite;
          }

          @keyframes gradientFlow {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50%      { transform: translateY(-20px) rotate(1deg); }
          }

          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }

          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* About / Business Details Section with ref */}
      <div ref={aboutSectionRef}>
        <BusinessDetails />
      </div>
    </>
  )
}