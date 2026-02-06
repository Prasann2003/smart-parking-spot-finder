import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { isLoggedIn } from "../utils/auth"

export default function Home() {
  const navigate = useNavigate()

  const handleFindParking = () => {
    if (isLoggedIn()) {
      navigate("/dashboard")
    } else {
      navigate("/auth")
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-white overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center px-10">

        {/* Neon Glow Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-32 left-20 w-96 h-96 bg-cyan-500/30 blur-[120px] rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight">
              Park <span className="text-cyan-400">Smarter</span>
              <br />
              Not Harder
            </h1>

            <p className="mt-6 text-lg text-gray-300 max-w-lg">
              Real-time parking discovery, instant booking,
              seamless navigation — powered by intelligent systems.
            </p>

            {/* PRIMARY ACTION BUTTONS */}
            <div className="mt-10 flex gap-6 flex-wrap">
              <button
                onClick={handleFindParking}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-semibold transition shadow-lg shadow-cyan-500/30"
              >
                🚗 Find Parking
              </button>

              <button
                onClick={() => navigate("/auth")}
                className="px-8 py-4 border border-white/30 hover:bg-white/10 rounded-xl font-semibold transition"
              >
                🔐 User Login
              </button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="mt-6 flex gap-6 flex-wrap">
              <button
                onClick={() => navigate("/become-provider")}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold transition shadow-lg shadow-pink-500/30"
              >
                🏢 Become Provider
              </button>

              <button
                onClick={() => navigate("/admin-login")}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-white/20 rounded-xl font-semibold transition"
              >
                🛡 Admin Login
              </button>
            </div>
          </motion.div>

          {/* RIGHT SIDE GLASS CARD */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

              <h3 className="text-2xl font-bold mb-6">
                🚗 Smart Features
              </h3>

              <ul className="space-y-4 text-gray-300">
                <li>✔ Live Slot Tracking</li>
                <li>✔ AI Powered Search</li>
                <li>✔ Secure Payments</li>
                <li>✔ EV Charging Support</li>
                <li>✔ CCTV Verified Locations</li>
              </ul>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-28 px-10 bg-[#111827]">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Smart Parking?
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            "Real-Time Availability",
            "Smart AI Matching",
            "Fast Digital Booking",
            "Secure Locations",
            "Optimized Routes",
            "Future Ready System",
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">
                {feature}
              </h3>
              <p className="text-gray-400 text-sm">
                Experience seamless smart parking with
                modern infrastructure and real-time updates.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-gradient-to-r from-cyan-600 to-pink-600 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready To Experience Smart Parking?
        </h2>

        <p className="text-white/80 mb-10">
          Join thousands of drivers already parking smarter.
        </p>

        <button
          onClick={handleFindParking}
          className="px-10 py-4 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-900 transition"
        >
          Start Now
        </button>
      </section>

    </div>
  )
}
