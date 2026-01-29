import { useEffect, useRef, useState } from 'react';
import bannerImage from '../../assets/logo.png';

export default function BusinessDetails() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  const services = [
    {
      title: "Food Delivery",
      icon: "🍔",
      desc: "Order delicious food from nearby restaurants and local kitchens and get it delivered fresh to your doorstep.",
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "Grocery Delivery",
      icon: "🛒",
      desc: "Buy daily essentials, vegetables, fruits, and household items from trusted local stores.",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Medicine Delivery",
      icon: "💊",
      desc: "Order prescribed and over-the-counter medicines from authorized pharmacies.",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      title: "Fish & Meat Delivery",
      icon: "🐟",
      desc: "Get fresh fish, chicken, mutton, and seafood sourced from reliable local vendors.",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Courier & Parcel",
      icon: "📦",
      desc: "Send documents and parcels within the city quickly and securely.",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      title: "Taxi & Transportation",
      icon: "🚗",
      desc: "Book auto, car, jeep, or goods vehicles for travel or transportation.",
      gradient: "from-indigo-400 to-purple-500"
    },
    {
      title: "Home & Professional Services",
      icon: "🔧",
      desc: "Find verified professionals: electricians, plumbers, mechanics, etc.",
      gradient: "from-teal-400 to-green-500"
    },
  ];

  const faqs = [
    { q: "How do I place an order?", a: "Browse services, add items, and proceed to checkout via app or website." },
    { q: "What locations do you serve?", a: "Check the app for real-time availability in your area." },
    { q: "What payment methods are accepted?", a: "UPI, cards, net banking, and cash on delivery (where available)." },
    { q: "Can I cancel an order?", a: "Yes, before dispatch — full refund for timely cancellations." },
    { q: "How do I contact support?", a: "Call +91-9496343734, email magiclampinstaserve@gmail.com, or use in-app chat." },
  ];

  return (
    <div
      ref={containerRef}
      className="
        relative w-full
        pt-10 pb-16
        sm:pt-16 sm:pb-24
        px-4 sm:px-6 lg:px-16
        font-poppins
        bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/30
        overflow-x-hidden
      "
    >
      {/* Background blobs - smaller on mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/4 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-200 to-orange-100 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-200 to-purple-100 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Hero - compact on mobile */}
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img
                src={bannerImage}
                alt="MagicLamp Logo"
                className="relative h-20 sm:h-28 md:h-32 w-auto mx-auto drop-shadow-xl animate-float-slow group-hover:scale-110 transition-transform"
              />
            </div>

            <h1 className="font-cinzel text-5xl sm:text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              MagicLamp
            </h1>

            <div className="inline-block bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-md mb-6">
              <p className="text-lg sm:text-xl font-bold text-gray-800">
                InstaServe Solutions Pvt. Ltd.
              </p>
            </div>

            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your trusted platform connecting you with local businesses, professionals, and delivery services — fast, reliable, affordable.
            </p>
          </div>

          {/* Services */}
          <section className="mb-16 sm:mb-24">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Our Services
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Everything you need, delivered with care
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveService(idx)}
                  onMouseLeave={() => setActiveService(null)}
                  className={`group relative bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-md border transition-all duration-400 cursor-pointer ${
                    activeService === idx
                      ? 'scale-102 sm:scale-105 shadow-xl -translate-y-1 sm:-translate-y-2 border-transparent'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${service.gradient} mb-4 sm:mb-6 shadow-md transform transition group-hover:scale-110 group-hover:rotate-6`}>
                    <span className="text-2xl sm:text-3xl">{service.icon}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-orange-500 transition-all">
                    {service.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* About - simplified */}
          <section className="mb-16 sm:mb-24">
            <div className="relative bg-white/80 backdrop-blur-md p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl shadow-xl border border-white/60">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800">About Us</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-orange-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-5 sm:space-y-6 text-center max-w-3xl mx-auto">
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                  MagicLamp is a technology platform connecting customers with local vendors, service professionals, and delivery partners — simplifying daily life.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed font-semibold">
                  Anything. Anywhere. Anytime.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16 sm:mb-24">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-gray-800">
                FAQ
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:border-blue-200"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between text-left hover:bg-blue-50/50 transition-colors"
                  >
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 pr-3 sm:pr-4 group-hover:text-blue-600 transition-colors">
                      {faq.q}
                    </h3>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div className={`transition-all duration-400 ${expandedFaq === idx ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 sm:px-8 pb-5 sm:pb-6 pt-1">
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12 sm:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-gray-800">Get In Touch</h2>
              <p className="text-gray-600 text-base sm:text-lg">We're available 24/7</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 p-1 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 text-center space-y-6">
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  MagicLamp InstaServe Solutions Pvt. Ltd.
                </p>

                <div className="space-y-4 sm:space-y-5">
                  <a href="mailto:magiclampinstaserve@gmail.com" className="flex items-center justify-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg">magiclampinstaserve@gmail.com</span>
                  </a>

                  <a href="tel:+919496343734" className="flex items-center justify-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg">+91-9496343734</span>
                  </a>
                </div>

                <div className="pt-4">
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg">
                    <p className="font-bold text-base sm:text-lg">24 × 7 Service</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Poppins:wght@400;500;600;700&display=swap');

        @keyframes float-slow { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(1.5deg); } }
        @keyframes blob { 0% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-30px) scale(1.1); } 66% { transform: translate(-20px,20px) scale(0.95); } 100% { transform: translate(0,0) scale(1); } }

        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-blob { animation: blob 12s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .font-cinzel { font-family: 'Cinzel Decorative', serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
}