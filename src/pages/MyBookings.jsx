import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import toast from "react-hot-toast"

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  /* ===============================
     FETCH REAL BOOKINGS
  =============================== */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my-bookings")
        setBookings(res.data)
      } catch (err) {
        console.error(err)
        setError("Unable to load bookings.")
      }
      setLoading(false)
    }

    fetchBookings()
  }, [])

  /* ===============================
     CANCEL BOOKING
  =============================== */
  const handleCancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`)
      toast.success("Booking cancelled")

      setBookings((prev) =>
        prev.map((booking) =>
          (booking.id || booking._id) === id
            ? { ...booking, status: "CANCELLED" }
            : booking
        )
      )
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to cancel booking.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mt-16 px-6"
      >
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            My Bookings
          </h2>
          <p className="text-gray-600">
            Track your real-time parking reservations
          </p>
        </div>

        {loading ? (
          <p className="text-lg font-semibold">Loading bookings...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-xl">
            <p className="text-gray-500 text-lg">
              You have no bookings yet 🚗
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking, index) => {
              const bookingId = booking.id || booking._id

              return (
                <motion.div
                  key={bookingId}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-8 flex flex-col md:flex-row justify-between gap-6"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {booking.parkingSpotName}
                    </h3>

                    <div className="text-gray-600 space-y-1">
                      <p>📅 Booked: {new Date(booking.createdAt).toLocaleString()}</p>
                      <p>⏰ {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p>
                      <p>💰 Price: ₹{booking.totalPrice} ({booking.paymentMethod})</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <StatusBadge status={booking.status} />

                    <div className="flex gap-4 mt-6 items-center">
                      {booking.status === "CONFIRMED" && (
                        <div className="text-xs text-gray-500 italic mr-2">
                          Free cancellation up to 48h before start
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/booking/${bookingId}`)}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                      >
                        View
                      </button>

                      {booking.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleCancel(bookingId)}
                          className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* STATUS BADGE */
function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-100 text-emerald-700",
    Completed: "bg-sky-100 text-sky-700",
    Cancelled: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
        }`}
    >
      {status}
    </span>
  )
}
