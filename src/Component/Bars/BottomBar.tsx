import { FaHome, FaHistory, FaUser } from "react-icons/fa"

export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center py-3">
        
        {/* Home */}
        <button className="flex flex-col items-center text-blue-600">
          <FaHome className="text-2xl mb-1" />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* History */}
        <button className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition">
          <FaHistory className="text-2xl mb-1" />
          <span className="text-xs font-medium">History</span>
        </button>

        {/* Profile */}
        <button className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition">
          <FaUser className="text-2xl mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </button>

      </div>
    </div>
  )
}
