import  { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bannerImage from '../../assets/logo.png'
import BusinessDetails from './BusinessDetails'

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
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
    navigate('/login')
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-8 lg:px-16 py-12 overflow-hidden font-poppins bg-gradient-to-br from-slate-50 to-blue-50"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(90deg, transparent 79px, #2563eb20 79px, #2563eb20 81px, transparent 81px)`,
            backgroundSize: '100px 100%'
          }}></div>
        </div>

        {/* Light Beam Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Animated Light Beam */}
          <div className="absolute top-0 left-0 h-full w-48 bg-gradient-to-r from-blue-100/0 via-blue-100/20 to-blue-100/0 animate-swipe"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          
          {/* Logo */}
          <div
            className={`flex-1 flex justify-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-amber-200/30 rounded-full blur-2xl opacity-40"></div>
              <img
                src={bannerImage}
                alt="Magic Lamp Logo"
                className="relative h-[45vh] md:h-[55vh] lg:h-[80vh] w-auto object-contain"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left" ref={textRef}>
            <div
              className={`transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {/* Title with Blue & Yellow Effect */}
              <h1
                className="
                  font-cinzel
                  text-4xl sm:text-5xl md:text-7xl lg:text-8xl
                  font-black
                  mb-6
                  whitespace-nowrap
                  relative
                  tracking-tight
                "
              >
                {/* Main Text with Blue & Yellow Gradient */}
                <div className="relative">
                  {/* Magic - Blue */}
                  <span className="relative z-10 inline-block text-gradient-blue-magic">
                    Magic
                  </span>{' '}
                  {/* Lamp - Yellow */}
                  <span className="relative z-10 inline-block text-gradient-yellow-lamp">
                    Lamp
                  </span>
                  
                  {/* Light Effect Overlay */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sweep"></div>
                    </div>
                  </div>
                </div>
              </h1>

              {/* Slogan */}
              <p
                className="
                  text-lg sm:text-xl md:text-2xl
                  tracking-[0.2em]
                  font-semibold
                  text-slate-700
                  uppercase
                  relative
                  mb-4
                "
              >
                Anything • Anywhere • Anytime
              </p>

              {/* Subtitle */}
              <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium italic max-w-lg mx-auto lg:mx-0">
                Where timeless wishes meet modern convenience.
              </p>

              {/* CTA Button */}
              <div className="mt-10 relative group">
                <button 
                  onClick={handleGetStarted}
                  className="
                    relative
                    px-10 py-4
                    bg-gradient-to-r from-blue-700 via-amber-500 to-blue-700
                    bg-size-200
                    text-white
                    font-bold
                    text-lg
                    rounded-lg
                    hover:shadow-xl
                    transition-all
                    duration-500
                    ease-out
                    group-hover:scale-105
                    group-hover:bg-pos-100
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-300
                    flex
                    items-center
                    justify-center
                    gap-3
                    overflow-hidden
                    cursor-pointer
                  "
                >
                  {/* Button Glow Effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  
                  {/* Button Text */}
                  <span className="relative flex items-center gap-2">
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get Started
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </button>
                
                {/* Subtle Button Shadow */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/30 to-amber-400/30 blur-md group-hover:blur-lg transition-all duration-500 -z-10 group-hover:scale-105"></div>
              </div>

              {/* Scroll Indicator */}
              <div className="mt-12 animate-pulse">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500 tracking-widest">EXPLORE</span>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-blue-300/30"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-amber-300/30"></div>

        {/* Animations + Fonts + Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Poppins:wght@300;400;500;600&display=swap');

          /* Light Sweep Animation */
          @keyframes lightSweep {
            0% {
              transform: translateX(-100%) skewX(-15deg);
              opacity: 0;
            }
            10% {
              opacity: 0.3;
            }
            20% {
              opacity: 0.6;
            }
            30% {
              opacity: 0.8;
            }
            40% {
              opacity: 0.6;
            }
            50% {
              opacity: 0.3;
            }
            100% {
              transform: translateX(200%) skewX(-15deg);
              opacity: 0;
            }
          }

          /* Swipe Animation */
          @keyframes swipe {
            0% {
              transform: translateX(-100%);
              opacity: 0.3;
            }
            50% {
              opacity: 0.1;
            }
            100% {
              transform: translateX(100vw);
              opacity: 0.3;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: translateY(0);
            }
            50% {
              opacity: 0.5;
              transform: translateY(5px);
            }
          }

          /* Blue Glow Animation for Magic */
          @keyframes blueGlow {
            0%, 100% {
              filter: brightness(1) saturate(1);
              text-shadow: 
                0 0 20px rgba(37, 99, 235, 0.3),
                0 0 40px rgba(37, 99, 235, 0.2);
            }
            50% {
              filter: brightness(1.1) saturate(1.2);
              text-shadow: 
                0 0 25px rgba(37, 99, 235, 0.5),
                0 0 50px rgba(37, 99, 235, 0.3);
            }
          }

          /* Yellow Glow Animation for Lamp */
          @keyframes yellowGlow {
            0%, 100% {
              filter: brightness(1) saturate(1);
              text-shadow: 
                0 0 20px rgba(245, 158, 11, 0.3),
                0 0 40px rgba(245, 158, 11, 0.2);
            }
            50% {
              filter: brightness(1.1) saturate(1.2);
              text-shadow: 
                0 0 25px rgba(245, 158, 11, 0.5),
                0 0 50px rgba(245, 158, 11, 0.3);
            }
          }

          .animate-light-sweep {
            animation: lightSweep 8s ease-in-out infinite;
          }

          .animate-swipe {
            animation: swipe 20s linear infinite;
          }

          .animate-pulse {
            animation: pulse 2s ease-in-out infinite;
          }

          .font-cinzel { 
            font-family: 'Cinzel Decorative', serif;
            letter-spacing: -0.02em;
          }
          
          .font-poppins { 
            font-family: 'Poppins', sans-serif;
          }

          /* Magic - Blue Gradient */
          .text-gradient-blue-magic {
            background: linear-gradient(
              135deg,
              #1E40AF 0%,     /* Deep blue */
              #2563EB 25%,    /* Royal blue */
              #3B82F6 50%,    /* Bright blue */
              #2563EB 75%,    /* Royal blue */
              #1E40AF 100%    /* Deep blue */
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 100%;
            animation: blueGlow 3s ease-in-out infinite;
          }

          /* Lamp - Yellow Gradient */
          .text-gradient-yellow-lamp {
            background: linear-gradient(
              135deg,
              #D97706 0%,     /* Amber */
              #F59E0B 25%,    /* Yellow amber */
              #FBBF24 50%,    /* Warm yellow */
              #F59E0B 75%,    /* Yellow amber */
              #D97706 100%    /* Amber */
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 100%;
            animation: yellowGlow 3s ease-in-out infinite;
          }

          /* Button Gradient Animation */
          .bg-size-200 {
            background-size: 200% 100%;
          }
          
          .bg-pos-100 {
            background-position: 100% 0;
          }

          /* Enhanced Hover Effects */
          .group:hover .text-gradient-blue-magic {
            filter: brightness(1.15) saturate(1.3);
            text-shadow: 
              0 0 30px rgba(37, 99, 235, 0.6),
              0 0 60px rgba(37, 99, 235, 0.4);
          }
          
          .group:hover .text-gradient-yellow-lamp {
            filter: brightness(1.15) saturate(1.3);
            text-shadow: 
              0 0 30px rgba(245, 158, 11, 0.6),
              0 0 60px rgba(245, 158, 11, 0.4);
          }

          /* Add subtle glow effect around the entire title */
          h1 {
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
          }
        `}</style>
      </div>
      <BusinessDetails />
    </>
  )
}