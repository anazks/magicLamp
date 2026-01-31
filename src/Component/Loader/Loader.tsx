import logo from '../../assets/logo.png';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-gray-50/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Animated logo container */}
        <div className="relative">
          <img
            src={logo}
            alt="Magic Lamp Logo"
            className="w-24 h-24 object-contain rounded-2xl shadow-xl animate-pulse-slow"
          />
          
          {/* Subtle orbiting glow ring */}
          <div className="absolute inset-0 rounded-2xl border-4 border-blue-400/30 animate-ping-slow opacity-40"></div>
          
          {/* Inner shine effect */}
          <div className="absolute inset-[-8px] bg-gradient-to-br from-blue-400/20 to-purple-400/10 rounded-3xl blur-xl animate-pulse-slower"></div>
        </div>

        {/* Optional text below (you can remove if you want logo-only) */}
        <div className="mt-6 text-center">
          <p className="text-gray-700 font-medium tracking-wide animate-pulse">
            Loading Magic Lamp...
          </p>
          <div className="mt-2 flex justify-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}