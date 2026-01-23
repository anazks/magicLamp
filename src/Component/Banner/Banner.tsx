import React, { useEffect, useRef, useState } from 'react'
import bannerImage from '../../assets/logo.png'

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-8 lg:px-16 py-12 overflow-hidden font-poppins"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-100 rounded-full blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-orange-100 rounded-full blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-purple-100 rounded-full blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Logo */}
        <div
          className={`flex-1 flex justify-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <img
              src={bannerImage}
              alt="Magic Lamp Logo"
              className="relative h-[45vh] md:h-[55vh] lg:h-[80vh] w-auto object-contain animate-float-slow"
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Title with hover magic */}
            <h1
              className="
                font-cinzel
                text-4xl sm:text-5xl md:text-7xl lg:text-8xl
                font-black
                mb-6
                whitespace-nowrap
                transition-all
                duration-500
                hover:tracking-widest
                cursor-default
              "
            >
              <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent animate-gradient-x hover:scale-105 transition-transform duration-300">
                Magic
              </span>{' '}
              <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent animate-gradient-x-reverse hover:scale-105 transition-transform duration-300">
                Lamp
              </span>
            </h1>

            {/* Slogan with hover glow */}
            <p
              className="
                text-lg sm:text-xl md:text-2xl
                tracking-[0.3em]
                font-semibold
                text-gray-800
                uppercase
                transition-all
                duration-500
                hover:text-blue-600
                hover:tracking-[0.45em]
                animate-fadeInUp
                delay-700
              "
            >
              Anything • Anywhere • Anytime
            </p>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-gray-600 animate-fadeInUp delay-1000">
              Your wishes are our commands.
            </p>

            {/* CTA */}
            <button className="mt-8 px-10 py-4 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeInUp delay-1200 focus:outline-none focus:ring-4 focus:ring-blue-300">
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Animations + Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Poppins:wght@400;500;600;700&display=swap');

        @keyframes float-slow {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-20px)}
        }
        @keyframes gradient-x {
          0%,100%{background-position:0% 50%}
          50%{background-position:100% 50%}
        }
        @keyframes gradient-x-reverse {
          0%,100%{background-position:100% 50%}
          50%{background-position:0% 50%}
        }
        @keyframes fadeInUp {
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes blob {
          0%{transform:translate(0,0) scale(1)}
          33%{transform:translate(30px,-40px) scale(1.1)}
          66%{transform:translate(-20px,20px) scale(0.9)}
          100%{transform:translate(0,0) scale(1)}
        }

        .animate-float-slow{animation:float-slow 6s ease-in-out infinite}
        .animate-gradient-x{background-size:200% 200%;animation:gradient-x 3s ease infinite}
        .animate-gradient-x-reverse{background-size:200% 200%;animation:gradient-x-reverse 3s ease infinite}
        .animate-fadeInUp{animation:fadeInUp 1s ease forwards}
        .animate-blob{animation:blob 7s infinite}

        .font-cinzel { font-family: 'Cinzel Decorative', serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }

        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .delay-700 { animation-delay: .7s; }
        .delay-1000 { animation-delay: 1s; }
        .delay-1200 { animation-delay: 1.2s; }
      `}</style>
    </div>
  )
}
