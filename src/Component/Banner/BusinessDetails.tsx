import { useEffect, useRef, useState } from 'react'
import bannerImage from '../../assets/logo.png'

export default function BusinessDetails() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeService, setActiveService] = useState<number | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
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

  const services = [
    {
      title: "Food Delivery",
      icon: "🍔",
      desc: "Order delicious food from nearby restaurants and local kitchens and get it delivered fresh to your doorstep. MagicLamp ensures quick pickups, hygienic handling, and timely delivery.",
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "Grocery Delivery",
      icon: "🛒",
      desc: "Buy daily essentials, vegetables, fruits, and household items from trusted local stores. Enjoy convenient same-day delivery.",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Medicine Delivery",
      icon: "💊",
      desc: "Order prescribed and over-the-counter medicines from authorized pharmacies. Upload prescriptions easily and receive medicines safely and securely.",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      title: "Fish & Meat Delivery",
      icon: "🐟",
      desc: "Get fresh fish, chicken, mutton, and seafood sourced from reliable local vendors, ensuring quality and freshness.",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Courier & Parcel",
      icon: "📦",
      desc: "Send documents and parcels within the city quickly and securely for personal or business needs.",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      title: "Taxi & Transportation",
      icon: "🚗",
      desc: "Book auto, car, jeep, or goods vehicles for passenger travel or goods transportation at affordable rates.",
      gradient: "from-indigo-400 to-purple-500"
    },
    {
      title: "Home & Professional Services",
      icon: "🔧",
      desc: "Find verified professionals such as electricians, plumbers, vehicle mechanics, and appliance repair technicians on demand.",
      gradient: "from-teal-400 to-green-500"
    },
  ]

  const faqs = [
    { 
      q: "How do I place an order?", 
      a: "You can place an order through our mobile app or website by selecting a service and confirming your request. Simply browse available services, add items to your cart, and proceed to checkout." 
    },
    { 
      q: "What locations do you serve?", 
      a: "Services are available in selected areas and may expand over time. Check the app for real-time availability in your location." 
    },
    { 
      q: "What payment methods are accepted?", 
      a: "We support UPI, debit cards, credit cards, net banking, and cash on delivery (where applicable). All online payments are secured through trusted payment gateways." 
    },
    { 
      q: "Can I cancel an order?", 
      a: "Yes, orders can be cancelled before dispatch. Cancellation policies depend on the service type. Full refunds are processed for timely cancellations." 
    },
    { 
      q: "How do I contact customer support?", 
      a: "You can contact us via phone at +91-9496343734, email at magiclampinstaserve@gmail.com, or use the in-app support option for instant assistance." 
    },
  ]

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-8 lg:px-16 py-20 overflow-hidden font-poppins bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/30"
    >
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 md:w-[32rem] md:h-[32rem] bg-gradient-to-br from-blue-200 to-blue-100 rounded-full blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 md:w-[32rem] md:h-[32rem] bg-gradient-to-br from-orange-200 to-orange-100 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 md:w-[32rem] md:h-[32rem] bg-gradient-to-br from-purple-200 to-purple-100 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Hero Section - Enhanced */}
          <div className="text-center mb-24">
            <div className="inline-block mb-8 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img
                src={bannerImage}
                alt="MagicLamp Logo"
                className="relative h-24 md:h-32 w-auto mx-auto drop-shadow-2xl animate-float-slow transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <h1 className="font-cinzel text-6xl sm:text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent animate-gradient-x drop-shadow-sm">
              MagicLamp
            </h1>

            <div className="inline-block bg-white/80 backdrop-blur-md px-8 py-3 rounded-full shadow-lg mb-6">
              <p className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">
                InstaServe Solutions Pvt. Ltd.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 text-lg md:text-xl font-medium text-gray-700 mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-semibold">Anything</span>
              <span className="text-gray-400">•</span>
              <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent font-semibold">Anywhere</span>
              <span className="text-gray-400">•</span>
              <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent font-semibold">Anytime</span>
            </div>

            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Your trusted technology-driven platform connecting you with local businesses, 
              service professionals, and delivery partners through one seamless experience.
            </p>
          </div>

          {/* Services Section - Enhanced with hover effects */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Our Services
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Comprehensive solutions for all your daily needs, delivered with care and precision
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveService(idx)}
                  onMouseLeave={() => setActiveService(null)}
                  className={`group relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border-2 transition-all duration-500 cursor-pointer ${
                    activeService === idx 
                      ? 'border-transparent scale-105 shadow-2xl -translate-y-2' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Icon with gradient background */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} mb-6 shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <span className="text-3xl">{service.icon}</span>
                  </div>

                  <h3 className="relative text-2xl font-bold text-gray-800 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-orange-500 transition-all duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="relative text-gray-600 leading-relaxed">
                    {service.desc}
                  </p>

                  {/* Decorative corner accent */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-20 rounded-bl-full rounded-tr-3xl transition-opacity duration-500`}></div>
                </div>
              ))}
            </div>
          </section>

          {/* About Section - Redesigned */}
          <section className="mb-24">
            <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-orange-50/50 backdrop-blur-xl p-10 md:p-16 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="text-center mb-10">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">About Us</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-orange-500 mx-auto rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center">
                    MagicLamp InstaServe Solutions Pvt. Ltd. is a <span className="font-semibold text-blue-600">technology-driven</span> online delivery and service platform designed to simplify everyday needs. We connect customers with local businesses, service professionals, and delivery partners through a single, user-friendly app.
                  </p>
                  
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center">
                    Our goal is to provide <span className="font-semibold text-orange-600">fast, reliable, and affordable services</span> while supporting local vendors and creating value for our community.
                  </p>

                  <div className="pt-8">
                    <p className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent leading-relaxed">
                      Anything. Anytime. Anywhere. For You.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section - Enhanced with accordion */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 text-lg">
                Find quick answers to common questions
              </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-200"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors duration-300 hover:bg-blue-50/50"
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 pr-4 group-hover:text-blue-600 transition-colors">
                      {faq.q}
                    </h3>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-500 ${expandedFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-8 pb-6 pt-2">
                      <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-orange-500 mb-4 rounded-full"></div>
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Terms and Conditions - Enhanced */}
          <section className="mb-24">
            <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-md p-10 md:p-12 rounded-3xl shadow-xl border border-gray-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Terms and Conditions</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-orange-500 mx-auto rounded-full"></div>
              </div>

              <div className="text-gray-700 space-y-5 max-w-4xl mx-auto">
                <p className="text-lg leading-relaxed">
                  By accessing and using the MagicLamp InstaServe Solutions Pvt. Ltd. website and mobile application, you agree to the following terms:
                </p>
                
                <div className="space-y-4 pl-4 border-l-4 border-blue-500">
                  {[
                    "Users must provide accurate information while registering and placing orders.",
                    "Prices, delivery time, and availability may vary based on location and vendor.",
                    "MagicLamp InstaServe Solutions Pvt. Ltd. reserves the right to cancel or refuse any order due to incorrect details, unavailability, or unforeseen circumstances.",
                    "Delivery delays caused by traffic, weather, or vendor-related issues are not the company's liability.",
                    "Any misuse, fraudulent activity, or abusive behavior may lead to account suspension or termination."
                  ].map((term, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center mt-0.5">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="leading-relaxed">{term}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 italic pt-4">
                  * These terms may be updated without prior notice. Please check periodically for changes.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy - Enhanced */}
          <section className="mb-24">
            <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-md p-10 md:p-12 rounded-3xl shadow-xl border border-gray-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Privacy Policy</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-orange-500 mx-auto rounded-full"></div>
              </div>

              <div className="text-gray-700 space-y-5 max-w-4xl mx-auto">
                <p className="text-lg font-semibold text-center text-blue-600 mb-6">
                  MagicLamp InstaServe Solutions Pvt. Ltd. is committed to protecting user privacy.
                </p>
                
                <div className="space-y-4 pl-4 border-l-4 border-orange-500">
                  {[
                    "We collect personal information such as name, phone number, address, and payment details to provide our services.",
                    "Collected data is used strictly for order processing, communication, and customer support.",
                    "We do not sell or misuse user data. Information is shared only with vendors and delivery partners for order fulfillment or when legally required.",
                    "All payments are processed through secure and trusted payment gateways."
                  ].map((policy, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="leading-relaxed">{policy}</p>
                    </div>
                  ))}
                </div>

                <p className="text-center pt-6 font-medium">
                  By using our platform, you consent to this privacy policy.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section - Enhanced */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Get In Touch</h2>
              <p className="text-gray-600 text-lg">We're here to help you 24/7</p>
            </div>

            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 p-1 rounded-3xl shadow-2xl max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl p-10 md:p-12">
                <div className="text-center space-y-6">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      MagicLamp InstaServe Solutions Pvt. Ltd.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <a 
                        href="mailto:magiclampinstaserve@gmail.com" 
                        className="text-lg text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                      >
                        magiclampinstaserve@gmail.com
                      </a>
                    </div>

                    <div className="flex items-center justify-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <a 
                        href="tel:+919496343734" 
                        className="text-lg text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                      >
                        +91-9496343734
                      </a>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 text-lg">[Registered Office Address]</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-gray-100">
                    <div className="inline-block bg-gradient-to-r from-blue-600 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-lg">
                      <p className="text-lg md:text-xl font-bold mb-1">Business Hours</p>
                      <p className="text-sm md:text-base">Monday – Sunday • 24 × 7 Service</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-4 italic">
                      (Customer support timings may vary)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }

        .animate-blob {
          animation: blob 10s infinite;
        }

        .font-cinzel {
          font-family: 'Cinzel Decorative', serif;
        }

        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}