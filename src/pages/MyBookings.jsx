import Navbar from "../components/Navbar"
import { motion } from "framer-motion"

export default function MyBookings() {
  const bookings = [
    {
      id: 1,
      place: "City Mall Parking",
      date: "12 Feb 2026",
      time: "10:00 AM - 12:00 PM",
      vehicle: "Car",
      status: "Active",
    },
    {
      id: 2,
      place: "Airport Zone Parking",
      date: "05 Feb 2026",
      time: "06:00 PM - 09:00 PM",
      vehicle: "Bike",
      status: "Completed",
    },
    {
      id: 3,
      place: "Railway Station Parking",
      date: "01 Feb 2026",
      time: "08:00 AM - 09:30 AM",
      vehicle: "Car",
      status: "Cancelled",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mt-16 px-6"
      >
        {/* 🌟 HEADER */}
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            My Bookings
          </h2>
          <p className="text-gray-600">
            Track and manage all your parking reservations
          </p>
        </div>

        {/* 📦 BOOKINGS LIST */}
        <div className="space-y-8">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl p-8 flex flex-col md:flex-row justify-between gap-6"
            >
              {/* LEFT DETAILS */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {booking.place}
                </h3>

                <div className="text-gray-600 space-y-1">
                  <p>
                    📅 <span className="font-medium">{booking.date}</span>
                  </p>
                  <p>
                    ⏰ <span className="font-medium">{booking.time}</span>
                  </p>
                  <p>
                    🚗 <span className="font-medium">{booking.vehicle}</span>
                  </p>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex flex-col items-end justify-between">
                {/* STATUS */}
                <StatusBadge status={booking.status} />

                {/* ACTION BUTTONS */}
                <div className="flex gap-4 mt-6">
                  <button className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                    View
                  </button>

                  {booking.status === "Active" && (
                    <button className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* 🔖 STATUS BADGE COMPONENT */
function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-100 text-emerald-700",
    Completed: "bg-sky-100 text-sky-700",
    Cancelled: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  )
}
