import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useState } from "react"

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()

  const spot = location.state?.spot

  const [processing, setProcessing] = useState(false)

  if (!spot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No parking data found.</p>
      </div>
    )
  }

  const handlePayment = () => {
    setProcessing(true)

    setTimeout(() => {
      setProcessing(false)
      alert("Payment Successful 🎉")
      navigate("/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto pt-28 px-6"
      >
        <div className="bg-white p-10 rounded-3xl shadow-2xl">

          <h2 className="text-3xl font-bold mb-8">
            Complete Your Booking
          </h2>

          {/* PARKING SUMMARY */}
          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <h3 className="text-xl font-semibold">
              {spot.name}
            </h3>
            <p className="text-gray-600">{spot.address}</p>

            <div className="mt-4 space-y-2">
              <p>💰 ₹{spot.pricePerHour}/hour</p>
              <p>🅿 Available Slots: {spot.availableSlots}</p>
              <p>⭐ Rating: {spot.rating || "N/A"}</p>
            </div>
          </div>

          {/* PAYMENT OPTIONS */}
          <div className="space-y-4">
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              Pay via UPI
            </button>

            <button className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
              Pay via Card
            </button>

            <button className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
              Net Banking
            </button>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className="mt-8 w-full py-4 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-800"
          >
            {processing ? "Processing..." : "Confirm Payment"}
          </button>

        </div>
      </motion.div>
    </div>
  )
}
