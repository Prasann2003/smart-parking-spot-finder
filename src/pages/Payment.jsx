import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import api from "../utils/api"
import toast from "react-hot-toast"

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()

  const spot = location.state?.spot

  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [processing, setProcessing] = useState(false)

  // Calculate Price when dates change
  useEffect(() => {
    if (startTime && endTime && spot) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const hours = (end - start) / (1000 * 60 * 60)

      if (hours > 0) {
        setTotalPrice(Math.round(hours * spot.pricePerHour))
      } else {
        setTotalPrice(0)
      }
    }
  }, [startTime, endTime, spot])

  if (!spot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No parking data found.</p>
      </div>
    )
  }

  const handlePayment = async () => {
    if (!startTime || !endTime) {
      toast.error("Please select start and end time")
      return
    }

    setProcessing(true)

    try {
      // Format date to match backend expectation: "yyyy-MM-dd HH:mm:ss"
      // Input gives "yyyy-MM-ddThh:mm"
      const formattedStart = startTime.replace("T", " ") + ":00"
      const formattedEnd = endTime.replace("T", " ") + ":00"

      const payload = {
        parkingSpotId: spot.id,
        startTime: formattedStart,
        endTime: formattedEnd
      }

      await api.post("/bookings/create", payload)
      toast.success("Booking Successful! 🎉")
      navigate("/dashboard")
    } catch (error) {
      console.error("Booking Error", error)
      toast.error(error.response?.data?.message || "Booking failed")
    } finally {
      setProcessing(false)
    }
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

          <div className="grid md:grid-cols-2 gap-10">
            {/* LEFT: DETAILS */}
            <div>
              {/* PARKING SUMMARY */}
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-semibold">
                  {spot.name}
                </h3>
                <p className="text-gray-600">{spot.address}</p>

                <div className="mt-4 space-y-2">
                  <p>💰 ₹{spot.pricePerHour}/hour</p>
                  <p>🅿 Available Slots: {spot.totalCapacity}</p>
                  <p>⭐ Rating: {spot.rating || "N/A"}</p>
                </div>
              </div>

              {/* TIME SELECTION */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border p-3 rounded-lg"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border p-3 rounded-lg"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: PAYMENT */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">Payment Summary</h3>
                <div className="flex justify-between text-lg mb-2">
                  <span>Rate</span>
                  <span>₹{spot.pricePerHour}/hr</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold border-t pt-4">
                  <span>Total Amount</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                  Pay via UPI
                </button>

                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                  Pay via Card
                </button>

                <button
                  onClick={handlePayment}
                  disabled={processing || totalPrice <= 0}
                  className="mt-4 w-full py-4 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {processing ? "Processing..." : `Confirm Booking (₹${totalPrice})`}
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
