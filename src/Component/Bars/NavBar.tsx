import { FaHome, FaHistory, FaUser } from "react-icons/fa"

export default function NavBar() {
  return (
    <div className="hidden md:flex fixed top-0 left-0 w-full bg-white border-b shadow-sm z-50">
      <div className="max-w-7xl mx-auto w-full px-8 py-4 flex justify-end gap-10">
        
        {/* Home */}
        <button className="flex items-center gap-2 text-blue-600 font-semibold">
          <FaHome className="text-xl" />
          <span>Home</span>
        </button>

        {/* History */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
          <FaHistory className="text-xl" />
          <span>History</span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
          <FaUser className="text-xl" />
          <span>Profile</span>
        </button>

      </div>
    </div>
  )
}
