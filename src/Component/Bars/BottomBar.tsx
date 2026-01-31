import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaHistory, FaUser } from "react-icons/fa";
import Service from "../Services/Service";
import History from "../History/History";
import Profile from "../Profile/Profile";
import logo from '../../assets/logo.png';

// ... imports remain the same

export default function BottomBar() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');
  const navigate = useNavigate();

  const tabs = [
    { id: 'home' as const, icon: FaHome, label: 'Home' },
    { id: 'history' as const, icon: FaHistory, label: 'History' },
    { id: 'profile' as const, icon: FaUser, label: 'Profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':    return <Service />;
      case 'history': return <History />;
      case 'profile': return <Profile />;
      default:        return <Service />;
    }
  };

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  const goToLanding = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - unchanged */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="flex items-center justify-between h-16 max-w-md mx-auto px-6">
          <button
            onClick={goToLanding}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            aria-label="Go to home / landing page"
          >
            <div className="relative">
              <img
                src={logo}
                alt="Magic Lamp Logo"
                className="w-10 h-10 object-contain rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-blue-400 rounded-xl animate-ping opacity-10"></div>
            </div>

            <div className="flex flex-col text-left">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Magic Lamp</h1>
              <p className="text-xs text-gray-500">Your trusted partner</p>
            </div>
          </button>
          <div className="w-10" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pt-16 pb-20">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </div>

      {/* Bottom nav ── simpler, flatter, color-focused */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Optional thin active indicator */}
        <div
          className="absolute top-0 h-1 bg-blue-600 transition-all duration-300 ease-out"
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
                className="flex flex-col items-center justify-center flex-1 py-1 group"
              >
                <Icon
                  className={`
                    text-2xl transition-colors duration-200
                    ${isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500 group-hover:text-blue-500/80'
                    }
                  `}
                />

                <span
                  className={`
                    text-xs font-medium mt-0.5 transition-colors duration-200
                    ${isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-600 group-hover:text-blue-600/90'
                    }
                  `}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}