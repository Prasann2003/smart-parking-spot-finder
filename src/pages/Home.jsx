import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { isLoggedIn } from "../utils/auth"

export default function Home() {
  const navigate = useNavigate()

  const handleFindParking = () => {
    if (isLoggedIn()) {
      navigate("/dashboard")
    } else {
      navigate("/roles")
    }
  }

  return (
    <div className="w-full text-white">

      {/* 🌟 HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-extrabold mb-6"
        >
          Smart Parking Spot Finder
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl text-lg text-white/90 mb-10"
        >
          Find parking spaces instantly using intelligent technology.
          Reduce traffic, save fuel, and park stress-free with real-time
          availability and smart guidance.
        </motion.p>

        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => navigate("/roles")}
            className="px-8 py-4 bg-black/30 hover:bg-black/40 rounded-xl font-semibold"
          >
            Login / Sign Up
          </button>

          <button
            onClick={handleFindParking}
            className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200"
          >
            Find a Parking Spot
          </button>
        </div>
      </section>

      {/* 📘 ABOUT SECTION */}
      <section className="py-24 px-8 bg-white text-black">
        <h2 className="text-4xl font-bold mb-6">What is Smart Parking?</h2>
        <p className="max-w-3xl text-lg text-gray-700 leading-relaxed">
          Smart Parking Spot Finder is an intelligent system that helps users
          locate available parking spaces in real time. Using sensors, cloud
          infrastructure, and smart algorithms, it minimizes congestion and
          improves urban mobility.
        </p>
      </section>

      {/* ⚙️ HOW IT WORKS */}
      <section className="py-24 px-8 bg-gray-100 text-black">
        <h2 className="text-4xl font-bold mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            "User logs in to the system",
            "System fetches real-time parking data",
            "User navigates to available spot"
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-white rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">
                Step {i + 1}
              </h3>
              <p className="text-gray-600">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✨ FEATURES */}
      <section className="py-24 px-8 bg-gradient-to-r from-sky-500 to-indigo-500">
        <h2 className="text-4xl font-bold mb-12">Key Features</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Real-Time Parking Availability",
            "Navigation Assistance",
            "Role-Based Access (Driver / Admin)",
            "Reduced Traffic Congestion",
            "Fuel & Time Saving",
            "Smart City Integration"
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 bg-white text-black rounded-xl shadow-xl"
            >
              <h3 className="font-semibold text-lg">{feature}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🚀 CALL TO ACTION */}
      <section className="py-24 px-8 bg-black text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Find Your Parking Spot?
        </h2>

        <button
          onClick={handleFindParking}
          className="mt-6 px-10 py-4 bg-indigo-600 rounded-xl text-lg font-semibold hover:bg-indigo-700"
        >
          Start Now
        </button>
      </section>

    </div>
  )
}
