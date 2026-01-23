import {
  FaTaxi,
  FaUtensils,
  FaShippingFast,
  FaTools,
  FaTrain,
  FaPlane,
  FaFilm,
  FaMobileAlt,
  FaPills
} from "react-icons/fa"

const services = [
  { name: "Taxi", icon: FaTaxi, color: "bg-yellow-400" },
  { name: "Delivery", icon: FaShippingFast, color: "bg-blue-400" },
  { name: "Food", icon: FaUtensils, color: "bg-green-400" },
  { name: "Services", icon: FaTools, color: "bg-orange-400" },
  { name: "Medicine", icon: FaPills, color: "bg-red-400" },
  { name: "Train", icon: FaTrain, color: "bg-indigo-400" },
  { name: "Flights", icon: FaPlane, color: "bg-sky-400" },
  { name: "Movies", icon: FaFilm, color: "bg-purple-400" },
  { name: "Recharge", icon: FaMobileAlt, color: "bg-pink-400" },
]

export default function Service() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-100 to-white py-16 px-6">
      
      {/* Heading */}
      

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <div
              key={index}
              className="
                group
                bg-white
                rounded-2xl
                p-6
                shadow-md
                hover:shadow-2xl
                transition-all
                duration-300
                transform
                hover:-translate-y-2
                cursor-pointer
              "
            >
              {/* Icon */}
              <div
                className={`
                  ${service.color}
                  w-16 h-16
                  rounded-xl
                  flex items-center justify-center
                  text-white
                  text-3xl
                  mb-4
                  group-hover:scale-110
                  transition-transform
                `}
              >
                <Icon />
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-gray-800">
                {service.name}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Fast & reliable
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
