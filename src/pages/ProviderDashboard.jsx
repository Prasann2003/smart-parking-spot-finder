import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getCurrentUser } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import api, { toggleStatus } from "../utils/api"

export default function ProviderDashboard() {
  const user = getCurrentUser()
  const navigate = useNavigate()

  const handleToggleStatus = async (id, newStatus) => {
    const success = await toggleStatus(id, newStatus)
    if (success) {
      // Optimistic update
      setParkings(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    }
  }

  const [stats, setStats] = useState({
    totalParkings: 0,
    activeBookings: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
  })

  const [parkings, setParkings] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (!user) return
    const email = user.email

    const fetchProviderData = async () => {
      try {
        const dashboardRes = await api.get(`/provider/dashboard?email=${email}`)
        setStats(dashboardRes.data)

        const parkingRes = await api.get(`/provider/parkings?email=${email}`)
        setParkings(parkingRes.data)

        const bookingRes = await api.get(`/provider/bookings?email=${email}`)
        setRecentBookings(bookingRes.data)
      } catch (err) {
        console.error("Provider Dashboard Error:", err)
      }

      setLoading(false)
    }

    fetchProviderData()
  }, []) // Empty dependency array to run only once on mount

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto pt-28 px-6 space-y-16"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {user.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your parking spaces & earnings 🏢
            </p>
          </div>

          <button
            onClick={() => navigate("/add-parking")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg"
          >
            ➕ Add New Parking
          </button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard label="Total Parkings" value={stats.totalParkings} />
          <StatCard label="Active Bookings" value={stats.activeBookings} />
          <StatCard label="Today's Earnings" value={`₹${stats.todayEarnings}`} />
          <StatCard label="Monthly Earnings" value={`₹${stats.monthlyEarnings}`} />
        </div>

        {/* PARKING LIST */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Your Parking Spaces
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : parkings.length === 0 ? (
            <p className="text-gray-500">
              You have not added any parking spaces yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {parkings.map((spot) => (
                <motion.div
                  key={spot.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">{spot.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${spot.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      spot.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                      {spot.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-1">
                    {spot.address}
                  </p>

                  <div className="mt-4 text-sm space-y-1">
                    <p>💰 ₹{spot.pricePerHour}/hour</p>
                    <p>🅿 Total Slots: {spot.totalSlots}</p>
                    <p>
                      {spot.availableSlots > 0
                        ? "🟢 Available"
                        : "🔴 Full"}
                    </p>
                    <p>⭐ Rating: {spot.rating || "N/A"}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/edit-parking/${spot.id}`, { state: { spot } })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Edit ✏️
                    </button>

                    {spot.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleToggleStatus(spot.id, "MAINTENANCE")}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        Deactivate ⛔
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(spot.id, "ACTIVE")}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                      >
                        Activate ✅
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT BOOKINGS */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Recent Bookings
          </h2>

          {recentBookings.length === 0 ? (
            <p className="text-gray-500">
              No bookings yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <p className="font-bold text-lg text-indigo-900">
                      {booking.parkingSpotName}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>📅 {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p>
                      <p>👤 <span className="font-semibold">{booking.userName || "Unknown User"}</span> ({booking.userPhone || "N/A"})</p>
                      <p>💰 Total: ₹{booking.totalPrice}</p>
                    </div>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${booking.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700"
                      : booking.status === "COMPLETED"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* STAT CARD */
function StatCard({ label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl"
    >
      <p className="text-sm opacity-90">{label}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </motion.div>
  )
}
