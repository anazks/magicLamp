import { useState } from "react";
import { FaHome, FaHistory, FaUser, FaBolt } from "react-icons/fa";
import Service from "../Services/Service";
import History from "../History/History";
import Profile from "../Profile/Profile";

export default function BottomBar() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');

  const tabs = [
    { id: 'home' as const, icon: FaHome, label: 'Home' },
    { id: 'history' as const, icon: FaHistory, label: 'History' },
    { id: 'profile' as const, icon: FaUser, label: 'Profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Service />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile />;
      default:
        return <Service />;
    }
  };

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="flex items-center justify-between h-16 max-w-md mx-auto px-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Animated logo icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md transform hover:scale-110 transition-transform duration-300">
                <FaBolt className="text-white text-lg" />
              </div>
              {/* Pulse effect */}
              <div className="absolute inset-0 bg-blue-400 rounded-xl animate-ping opacity-20"></div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                Magic Lamp
              </h1>
              <p className="text-xs text-gray-500">Your trusted partner</p>
            </div>
          </div>

          {/* Right side - Optional notification bell or menu */}
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <svg 
              className="w-6 h-6 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto pt-16 pb-20">
        {/* Fade in animation for content */}
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Animated sliding indicator */}
        <div 
          className="absolute top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full"
          style={{
            left: `${activeIndex * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`,
          }}
        />
        
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center flex-1 group"
              >
                {/* Icon container with bounce animation */}
                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-2xl
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-blue-100 scale-110' 
                    : 'bg-transparent scale-100 group-hover:bg-gray-100 group-hover:scale-105'
                  }
                `}>
                  <Icon 
                    className={`
                      text-xl transition-all duration-300
                      ${isActive 
                        ? 'text-blue-600 scale-110' 
                        : 'text-gray-500 group-hover:text-blue-600'
                      }
                    `}
                  />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                  )}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>

                {/* Label with slide animation */}
                <span className={`
                  text-xs font-medium mt-1 transition-all duration-300
                  ${isActive 
                    ? 'text-blue-600 opacity-100 translate-y-0' 
                    : 'text-gray-500 opacity-70 translate-y-0.5 group-hover:text-blue-600 group-hover:opacity-100'
                  }
                `}>
                  {tab.label}
                </span>

                {/* Ripple effect on click */}
                <span className="absolute inset-0 overflow-hidden rounded-2xl">
                  <span className={`
                    absolute inset-0 bg-blue-400 rounded-full opacity-0 group-active:opacity-20
                    transition-all duration-300 scale-0 group-active:scale-150
                  `} />
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add custom animations to your CSS or Tailwind config */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}