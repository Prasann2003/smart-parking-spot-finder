import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* ===============================
     FETCH REAL BOOKINGS
  =============================== */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings")

        if (!res.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const data = await res.json()
        setBookings(data)
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
      const res = await fetch(
        `http://localhost:5000/api/bookings/${id}/cancel`,
        {
          method: "PATCH",
        }
      )

      if (!res.ok) {
        throw new Error("Cancel failed")
      }

      // Update UI after cancel
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      )
    } catch (err) {
      alert("Failed to cancel booking.")
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
        {/* HEADER */}
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            My Bookings
          </h2>
          <p className="text-gray-600">
            Track your real-time parking reservations
          </p>
        </div>

        {/* STATES */}
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
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-3xl shadow-xl p-8 flex flex-col md:flex-row justify-between gap-6"
              >
                {/* LEFT */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {booking.place}
                  </h3>

                  <div className="text-gray-600 space-y-1">
                    <p>
                      📅{" "}
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p>
                      ⏰ {booking.startTime} - {booking.endTime}
                    </p>
                    <p>
                      🚗 {booking.vehicle}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-end justify-between">
                  <StatusBadge status={booking.status} />

                  <div className="flex gap-4 mt-6">
                    <button className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                      View
                    </button>

                    {booking.status === "Active" && (
                      <button
                        onClick={() =>
                          handleCancel(booking.id)
                        }
                        className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  )
}
