import { useEffect, useRef, useState } from 'react';
import bannerImage from '../../assets/logo.png';

export default function BusinessDetails() {
  const [isVisible, setIsVisible] = useState(false);
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
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V3zM3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6" />
        </svg>
      ),
      desc: "Order delicious food from nearby restaurants and local kitchens with fast doorstep delivery.",
    },
    {
      title: "Grocery Delivery",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-3-4H7L4 7m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0H4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11v6" />
        </svg>
      ),
      desc: "Daily essentials, fresh vegetables, fruits, dairy and household items — delivered quickly.",
    },
    {
      title: "Medicine Delivery",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
        </svg>
      ),
      desc: "Fast delivery of prescription and OTC medicines from verified local pharmacies.",
    },
    {
      title: "Fish & Meat Delivery",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      desc: "Fresh fish, chicken, mutton, prawns and other seafood from trusted local vendors.",
    },
    {
      title: "Courier & Parcel",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      desc: "Reliable intra-city document and parcel delivery — fast and secure.",
    },
    {
      title: "Taxi & Transportation",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      desc: "Book auto-rickshaws, cars, jeeps or goods vehicles for travel and transport.",
    },
    {
      title: "Home Services",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header / Hero */}
        <div className={`text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <img
            src={bannerImage}
            alt="MagicLamp Logo"
            className="h-24 sm:h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            MagicLamp
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-6">
            InstaServe Solutions Pvt. Ltd.
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connecting people with trusted local businesses, professionals and delivery services — fast, reliable and affordable.
          </p>
        </div>

        {/* Services */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-center text-gray-600 mb-10 sm:mb-12">
            Everything you need — delivered with care
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 border border-gray-200 p-6 flex flex-col items-center text-center"
              >
                <div className="text-blue-600 mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="mt-20 pt-12 border-t border-gray-200">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
            About Us
          </h2>
          <div className="max-w-4xl mx-auto text-center text-gray-700 text-lg leading-relaxed space-y-6">
            <p>
              MagicLamp is a technology platform that connects customers with reliable local vendors, service professionals and delivery partners — making everyday life simpler and more convenient.
            </p>
            <p className="font-semibold text-gray-800 text-xl">
              Anything. Anywhere. Anytime.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20 pt-12 border-t border-gray-200">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Quick answers to common questions
          </p>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 text-lg">
                    {faq.q}
                  </span>
                  <span className={`text-gray-500 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <div className={`px-6 pb-5 text-gray-600 ${expandedFaq === idx ? 'block' : 'hidden'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-20 pt-12 border-t border-gray-200">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
            Get In Touch
          </h2>

          <div className="max-w-xl mx-auto bg-white rounded-xl shadow border border-gray-200 p-8 sm:p-10 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-6">
              MagicLamp InstaServe Solutions Pvt. Ltd.
            </p>

            <div className="space-y-6">
              <div>
                <a
                  href="mailto:magiclampinstaserve@gmail.com"
                  className="text-blue-700 hover:underline text-lg flex items-center justify-center gap-3"
                >
                  ✉️ magiclampinstaserve@gmail.com
                </a>
              </div>

              <div>
                <a
                  href="tel:+919496343734"
                  className="text-blue-700 hover:underline text-lg flex items-center justify-center gap-3"
                >
                  📞 +91 94963 43734
                </a>
              </div>

              <div className="pt-4">
                <div className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-medium">
                  24 × 7 Customer Support
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}