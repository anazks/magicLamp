import { useEffect, useRef, useState } from 'react';
import bannerImage from '../../assets/logo.png';

export default function BusinessDetails() {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V3zM3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6" />
        </svg>
      ),
      desc: "Order delicious food from nearby restaurants and local kitchens with fast doorstep delivery.",
    },
    {
      title: "Grocery Delivery",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-3-4H7L4 7m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0H4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11v6" />
        </svg>
      ),
      desc: "Daily essentials, fresh vegetables, fruits, dairy and household items — delivered quickly.",
    },
    {
      title: "Medicine Delivery",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
        </svg>
      ),
      desc: "Fast delivery of prescription and OTC medicines from verified local pharmacies.",
    },
    {
      title: "Fish & Meat Delivery",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      desc: "Fresh fish, chicken, mutton, prawns and other seafood from trusted local vendors.",
    },
    {
      title: "Courier & Parcel",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      desc: "Reliable intra-city document and parcel delivery — fast and secure.",
    },
    {
      title: "Taxi & Transportation",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      desc: "Book auto-rickshaws, cars, jeeps or goods vehicles for travel and transport.",
    },
    {
      title: "Home Services",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      desc: "Verified electricians, plumbers, carpenters, AC technicians, cleaning services & more.",
    },
  ];

  const faqs = [
    { q: "How do I place an order?", a: "Browse services, select items or professionals, add to cart/book and proceed to checkout." },
    { q: "Which areas do you serve?", a: "Availability varies by city and service. Please check inside the app or website for your location." },
    { q: "What payment methods are accepted?", a: "We accept UPI, credit/debit cards, net banking, wallets and cash on delivery (where available)." },
    { q: "Can I cancel my order?", a: "Yes — you can cancel before the order is dispatched. Full refund for timely cancellations." },
    { q: "How can I contact support?", a: "Call +91 94963 43734, email magiclampinstaserve@gmail.com or use the in-app chat support." },
  ];

  const legalSections = [
    {
      id: 'terms',
      title: 'Terms and Conditions',
      content: `By accessing and using the MagicLamp InstaServe Solutions Pvt. Ltd. website and mobile application, you agree to the following terms:
      
1. Users must provide accurate information while registering and placing orders.
2. Prices, delivery time, and availability may vary based on location and vendor.
3. MagicLamp InstaServe Solutions Pvt. Ltd. reserves the right to cancel or refuse any order due to incorrect details, unavailability, or unforeseen circumstances.
4. Delivery delays caused by traffic, weather, or vendor-related issues are not the company's liability.
5. Any misuse, fraudulent activity, or abusive behavior may lead to account suspension or termination.

These terms may be updated without prior notice.`
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: `MagicLamp InstaServe Solutions Pvt. Ltd. is committed to protecting user privacy.
      
1. We collect personal information such as name, phone number, address, and payment details to provide our services.
2. Collected data is used strictly for order processing, communication, and customer support.
3. We do not sell or misuse user data. Information is shared only with vendors and delivery partners for order fulfillment or when legally required.
4. All payments are processed through secure and trusted payment gateways.

By using our platform, you consent to this privacy policy.`
    }
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/40 to-indigo-50/30 py-16 px-4 sm:px-6 lg:px-8 font-poppins overflow-hidden"
    >
      {/* Subtle background pattern - matching banner */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 79px, #2563eb20 79px, #2563eb20 81px, transparent 81px)`,
            backgroundSize: '100px 100%'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <img
            src={bannerImage}
            alt="MagicLamp Logo"
            className="h-28 sm:h-36 mx-auto mb-6 drop-shadow-xl"
          />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-cinzel mb-4 magic-lamp-gradient animate-gradient-flow">
            MagicLamp
          </h1>
          <p className="text-2xl font-semibold text-slate-700 mb-6 tracking-wide">
            InstaServe Solutions Pvt. Ltd.
          </p>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Connecting people with trusted local businesses, professionals and delivery services — fast, reliable and affordable.
          </p>
        </div>

        {/* Services */}
        <section className="mt-20 sm:mt-28">
          <h2 className="text-4xl sm:text-5xl font-bold font-cinzel text-center text-slate-800 mb-4 magic-lamp-gradient">
            Our Services
          </h2>
          <p className="text-center text-slate-600 text-xl mb-12">
            Everything you need — delivered with care
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 
                           hover:border-blue-300 hover:shadow-xl transition-all duration-300 p-8 
                           flex flex-col items-center text-center group`}
              >
                <div className="text-blue-600 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="mt-24 pt-16 border-t border-blue-100/40">
          <h2 className="text-4xl sm:text-5xl font-bold font-cinzel text-center text-slate-800 mb-10 magic-lamp-gradient">
            About Us
          </h2>
          <div className="max-w-4xl mx-auto text-center text-slate-700 text-xl leading-relaxed space-y-8">
            <p>
              MagicLamp is a technology platform that connects customers with reliable local vendors, service professionals 
              and delivery partners — making everyday life simpler and more convenient.
            </p>
            <p className="font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-500">
              Anything. Anywhere. Anytime.
            </p>
          </div>
        </section>

        {/* Legal Sections - Terms & Privacy */}
        <section className="mt-24 pt-16 border-t border-blue-100/40">
          <h2 className="text-4xl sm:text-5xl font-bold font-cinzel text-center text-slate-800 mb-4 magic-lamp-gradient">
            Legal Information
          </h2>
          <p className="text-center text-slate-600 text-xl mb-12">
            Terms, conditions and privacy policies
          </p>

          <div className="max-w-4xl mx-auto space-y-6">
            {legalSections.map((section) => (
              <div
                key={section.id}
                className="bg-white/80 backdrop-blur-sm border border-blue-100/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-blue-50/30 transition-colors"
                >
                  <span className="font-semibold text-slate-800 text-xl">
                    {section.title}
                  </span>
                  <span className={`text-blue-600 text-2xl transition-transform duration-300 ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <div className={`px-8 pb-6 ${expandedSection === section.id ? 'block' : 'hidden'}`}>
                  <div className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                  <div className="mt-6 pt-6 border-t border-blue-100/50 text-sm text-slate-500">
                    Last updated: {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24 pt-16 border-t border-blue-100/40">
          <h2 className="text-4xl sm:text-5xl font-bold font-cinzel text-center text-slate-800 mb-4 magic-lamp-gradient">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-slate-600 text-xl mb-12">
            Quick answers to common questions
          </p>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm border border-blue-100/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-blue-50/30 transition-colors"
                >
                  <span className="font-semibold text-slate-800 text-xl">
                    {faq.q}
                  </span>
                  <span className={`text-blue-600 text-2xl transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <div className={`px-8 pb-6 text-slate-600 text-lg ${expandedFaq === idx ? 'block' : 'hidden'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-24 pt-16 border-t border-blue-100/40 pb-20">
          <h2 className="text-4xl sm:text-5xl font-bold font-cinzel text-center text-slate-800 mb-10 magic-lamp-gradient">
            Get In Touch
          </h2>

          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border border-blue-100/50 p-10 sm:p-12 text-center shadow-xl">
            <p className="text-2xl font-bold text-slate-800 mb-8">
              MagicLamp InstaServe Solutions Pvt. Ltd.
            </p>

            <div className="space-y-8 text-xl">
              <div>
                <a
                  href="mailto:magiclampinstaserve@gmail.com"
                  className="text-blue-700 hover:text-blue-800 font-semibold flex items-center justify-center gap-4 transition-colors"
                >
                  <span className="text-3xl">✉️</span>
                  magiclampinstaserve@gmail.com
                </a>
              </div>

              <div>
                <a
                  href="tel:+919496343734"
                  className="text-blue-700 hover:text-blue-800 font-semibold flex items-center justify-center gap-4 transition-colors"
                >
                  <span className="text-3xl">📞</span>
                  +91 94963 43734
                </a>
              </div>

              <div className="pt-6">
                <div className="inline-block bg-gradient-to-r from-blue-600 to-amber-500 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-lg">
                  24 × 7 Customer Support
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} MagicLamp InstaServe Solutions Pvt. Ltd. All rights reserved.</p>
            <p className="mt-2">Registered under the Companies Act, 2013</p>
          </div>
        </section>
      </div>

      {/* Gradient text animation - same as banner */}
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
          animation: gradientFlow 10s ease-in-out infinite;
        }

        @keyframes gradientFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}