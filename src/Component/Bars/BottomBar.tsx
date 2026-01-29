import { useState } from "react";
import { FaHome, FaHistory, FaUser } from "react-icons/fa";
import Service from "../Services/Service";
import History from "../History/History";
import Profile from "../Profile/Profile";

export default function BottomBar() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Content Area */}
      <div className="flex-1 pb-20"> {/* Padding bottom for the fixed bar */}
        {renderContent()}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50">
        <div className="max-w-md mx-auto flex justify-around items-center py-3">
          
          {/* Home */}
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center transition ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <FaHome className="text-2xl mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* History */}
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center transition ${
              activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <FaHistory className="text-2xl mb-1" />
            <span className="text-xs font-medium">History</span>
          </button>

          {/* Profile */}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center transition ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <FaUser className="text-2xl mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>

        </div>
      </div>
    </div>
  );
}