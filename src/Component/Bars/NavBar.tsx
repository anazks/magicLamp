import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaHistory, FaUser } from "react-icons/fa";
import Service from "../Services/Service";
import History from "../History/History";
import Profile from "../Profile/Profile";
import logo from '../../assets/logo.png'; // adjust path if needed

export default function NavBar() {
  const [activeTab, setActiveTab] = useState<"home" | "history" | "profile">("home");
  const navigate = useNavigate();

  const tabs = [
    { id: "home", icon: FaHome, label: "Home", color: "blue" },
    { id: "history", icon: FaHistory, label: "History", color: "purple" },
    { id: "profile", icon: FaUser, label: "Profile", color: "indigo" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Service />;
      case "history":
        return <History />;
      case "profile":
        return <Profile />;
      default:
        return <Service />;
    }
  };

  const goToLandingPage = () => {
    navigate("/");
    // setActiveTab("home"); // optional
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── DESKTOP TOP NAVIGATION ──────────────────────────────────── */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo + Brand Name */}
            <button
              onClick={goToLandingPage}
              className="flex items-center gap-3 flex-shrink-0 hover:opacity-90 transition-opacity"
              aria-label="Go to landing page"
            >
              <img
                src={logo}
                alt="MagicLamp Logo"
                className="h-9 md:h-11 w-auto object-contain"
              />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                  Magic Lamp
                </span>
              </div>
            </button>

            {/* Center navigation items */}
            <div className="flex items-center justify-center gap-6 lg:gap-10">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? `bg-${tab.color}-50 text-${tab.color}-700 font-medium shadow-sm`
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <div
                      className={`
                        p-1.5 rounded-md transition-colors
                        ${
                          isActive
                            ? `bg-${tab.color}-100 text-${tab.color}-600`
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      <Icon className="text-lg" />
                    </div>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right spacer */}
            <div className="w-32 hidden lg:block" />
          </div>
        </div>
      </nav>

      {/* ─── MOBILE BOTTOM NAVIGATION ────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 shadow-lg">
        <div className="flex justify-around items-center py-3 px-2">
          {/* Logo / Home */}
          <button
            onClick={goToLandingPage}
            className="flex flex-col items-center flex-1 pt-1 pb-2"
            aria-label="Go to landing page"
          >
            <img
              src={logo}
              alt="MagicLamp Logo"
              className="h-7 w-auto object-contain mb-1"
            />
            <span className="text-xs font-medium text-gray-600">Home</span>
          </button>

          {/* Other tabs */}
          {tabs
            .filter((tab) => tab.id !== "home")
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`
                      p-2.5 rounded-full transition-colors mb-1
                      ${
                        isActive
                          ? `bg-${tab.color}-100 text-${tab.color}-600 shadow-sm`
                          : "text-gray-500"
                      }
                    `}
                  >
                    <Icon className="text-2xl" />
                  </div>
                  <span
                    className={`
                      text-xs font-medium
                      ${isActive ? `text-${tab.color}-600` : "text-gray-500"}
                    `}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ───────────────────────────────────────── */}
      <main className="flex-1 pt-0 md:pt-20 pb-20 md:pb-0">
        {renderContent()}
      </main>
    </div>
  );
}