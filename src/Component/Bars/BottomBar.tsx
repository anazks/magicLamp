import { useState } from "react";
import { useNavigate } from "react-router-dom";           // ← added
import { FaHome, FaHistory, FaUser } from "react-icons/fa";
import Service from "../Services/Service";
import History from "../History/History";
import Profile from "../Profile/Profile";
import logo from '../../assets/logo.png';

export default function BottomBar() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');
  const navigate = useNavigate();                        // ← added

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

  // Function to go to landing page
  const goToLanding = () => {
    navigate('/');
    // Optional: reset tab when going to landing
    // setActiveTab('home');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="flex items-center justify-between h-16 max-w-md mx-auto px-6">
          {/* Logo Section – now clickable */}
          <button
            onClick={goToLanding}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            aria-label="Go to home / landing page"
          >
            <div className="relative">
              <img
                src={logo}
                alt="Magic Lamp Logo"
                className="w-10 h-10 object-contain rounded-xl shadow-md transform hover:scale-110 transition-transform duration-300"
              />
              {/* Subtle pulse effect */}
              <div className="absolute inset-0 bg-blue-400 rounded-xl animate-ping opacity-10"></div>
            </div>

            <div className="flex flex-col text-left">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                Magic Lamp
              </h1>
              <p className="text-xs text-gray-500">Your trusted partner</p>
            </div>
          </button>

          {/* Right side - can add notification bell / menu later */}
          <div className="w-10" /> {/* spacer */}
        </div>
      </header>

      {/* Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto pt-16 pb-20">
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
                <div
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-2xl
                    transition-all duration-300 ease-out
                    ${isActive
                      ? 'bg-blue-100 scale-110'
                      : 'bg-transparent scale-100 group-hover:bg-gray-100 group-hover:scale-105'
                    }
                  `}
                >
                  <Icon
                    className={`
                      text-xl transition-all duration-300
                      ${isActive
                        ? 'text-blue-600 scale-110'
                        : 'text-gray-500 group-hover:text-blue-600'
                      }
                    `}
                  />

                  {isActive && (
                    <>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
                    </>
                  )}
                </div>

                <span
                  className={`
                    text-xs font-medium mt-1 transition-all duration-300
                    ${isActive
                      ? 'text-blue-600 opacity-100 translate-y-0'
                      : 'text-gray-500 opacity-70 translate-y-0.5 group-hover:text-blue-600 group-hover:opacity-100'
                    }
                  `}
                >
                  {tab.label}
                </span>

                <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <span
                    className={`
                      absolute inset-0 bg-blue-400 rounded-full opacity-0 group-active:opacity-20
                      transition-all duration-300 scale-0 group-active:scale-150
                    `}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}