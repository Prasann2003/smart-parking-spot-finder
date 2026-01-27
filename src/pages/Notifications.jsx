import Navbar from "../components/Navbar"
import { motion } from "framer-motion"

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      title: "Booking Confirmed",
      message: "Your parking spot at City Mall has been successfully booked.",
      time: "2 minutes ago",
      type: "success",
      read: false,
    },
    {
      id: 2,
      title: "Parking Available",
      message: "Slots are now available at Airport Zone.",
      time: "1 hour ago",
      type: "info",
      read: false,
    },
    {
      id: 3,
      title: "Booking Completed",
      message: "Your booking at Railway Station has been completed.",
      time: "Yesterday",
      type: "completed",
      read: true,
    },
    {
      id: 4,
      title: "Booking Cancelled",
      message: "Your booking at Sector 17 Parking was cancelled.",
      time: "2 days ago",
      type: "danger",
      read: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mt-16 px-6"
      >
        {/* 🔔 HEADER */}
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            Notifications
          </h2>
          <p className="text-gray-600">
            Stay updated with your parking activity
          </p>
        </div>

        {/* 🔔 NOTIFICATION LIST */}
        <div className="space-y-6">
          {notifications.map((n, index) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`flex gap-6 p-6 rounded-3xl shadow-xl bg-white ${
                !n.read ? "border-l-8 border-indigo-500" : ""
              }`}
            >
              {/* ICON */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${getIconBg(
                  n.type
                )}`}
              >
                {getIcon(n.type)}
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {n.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  {n.message}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {n.time}
                </p>
              </div>

              {/* READ STATUS */}
              {!n.read && (
                <span className="self-start mt-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  NEW
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* 🔹 ICON HELPERS */
function getIcon(type) {
  switch (type) {
    case "success":
      return "✅"
    case "info":
      return "📢"
    case "completed":
      return "🏁"
    case "danger":
      return "❌"
    default:
      return "🔔"
  }
}

function getIconBg(type) {
  switch (type) {
    case "success":
      return "bg-emerald-100 text-emerald-700"
    case "info":
      return "bg-sky-100 text-sky-700"
    case "completed":
      return "bg-purple-100 text-purple-700"
    case "danger":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}
