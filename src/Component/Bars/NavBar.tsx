import { useState } from "react";
import { FaHome, FaHistory, FaUser } from "react-icons/fa";
import Service from "../Services/Service";
import History from "../History/History";
import Profile from "../Profile/Profile";

export default function NavBar() {
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
      {/* Top Navigation Bar */}
      <div className="hidden md:flex fixed top-0 left-0 w-full bg-white border-b shadow-sm z-50">
        <div className="max-w-7xl mx-auto w-full px-8 py-4 flex justify-end gap-10">
          
          {/* Home */}
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 transition ${
              activeTab === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FaHome className="text-xl" />
            <span>Home</span>
          </button>

          {/* History */}
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 transition ${
              activeTab === 'history' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FaHistory className="text-xl" />
            <span>History</span>
          </button>

          {/* Profile */}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 transition ${
              activeTab === 'profile' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FaUser className="text-xl" />
            <span>Profile</span>
          </button>

        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 pt-20 md:pt-20"> {/* Padding top for the fixed nav */}
        {renderContent()}
      </div>
    </div>
  );
}