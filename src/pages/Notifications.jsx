import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* ===============================
     FETCH REAL NOTIFICATIONS
  =============================== */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/notifications"
        )

        if (!res.ok) {
          throw new Error("Failed to fetch notifications")
        }

        const data = await res.json()
        setNotifications(data)
      } catch (err) {
        console.error(err)
        setError("Unable to load notifications.")
      }

      setLoading(false)
    }

    fetchNotifications()
  }, [])

  /* ===============================
     MARK AS READ
  =============================== */
  const markAsRead = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      )

      if (!res.ok) {
        throw new Error("Failed to update")
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  /* ===============================
     DELETE NOTIFICATION
  =============================== */
  const deleteNotification = async (id) => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/${id}`,
        { method: "DELETE" }
      )

      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mt-16 px-6"
      >
        {/* HEADER */}
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            Notifications
          </h2>
          <p className="text-gray-600">
            Stay updated with real-time parking activity
          </p>
        </div>

        {/* STATES */}
        {loading ? (
          <p className="text-lg font-semibold">
            Loading notifications...
          </p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-xl">
            <p className="text-gray-500 text-lg">
              No notifications yet 🔔
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((n, index) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`flex gap-6 p-6 rounded-3xl shadow-xl bg-white cursor-pointer ${
                  !n.read
                    ? "border-l-8 border-indigo-500"
                    : ""
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
                    {new Date(
                      n.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col items-end gap-3">
                  {!n.read && (
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      NEW
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(n.id)
                    }}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ICONS */
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
