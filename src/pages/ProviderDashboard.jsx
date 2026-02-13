import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getCurrentUser } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import api, { toggleStatus } from "../utils/api"
import {
  FaBuilding,
  FaPlus,
  FaMoneyBillWave,
  FaParking,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaEdit,
  FaBan,
  FaCalendarAlt,
  FaUser,
  FaClipboardList
} from "react-icons/fa"

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
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              Manage your parking spaces & earnings <FaBuilding className="text-emerald-600" />
            </p>
          </div>

          <button
            onClick={() => navigate("/add-parking")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
          >
            <FaPlus /> Add New Parking
          </button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard label="Total Parkings" value={stats.totalParkings} icon={<FaParking />} />
          <StatCard label="Active Bookings" value={stats.activeBookings} icon={<FaClipboardList />} />
          <StatCard label="Today's Earnings" value={`₹${stats.todayEarnings}`} icon={<FaMoneyBillWave />} />
          <StatCard label="Monthly Earnings" value={`₹${stats.monthlyEarnings}`} icon={<FaMoneyBillWave />} />
        </div>

        {/* PARKING LIST */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaParking className="text-indigo-600" /> Your Parking Spaces
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

                  <p className="text-gray-600 mt-1 flex items-start gap-1">
                    <span className="mt-1 text-xs"><FaBuilding /></span> {spot.address}
                  </p>

                  <div className="mt-4 text-sm space-y-2">
                    <p className="flex items-center gap-2"><FaMoneyBillWave className="text-green-600" /> ₹{spot.pricePerHour}/hour</p>
                    <p className="flex items-center gap-2"><FaParking className="text-blue-600" /> Total Slots: {spot.totalSlots}</p>
                    <p className="flex items-center gap-2">
                      {spot.availableSlots > 0
                        ? <><FaCheckCircle className="text-green-500" /> Available</>
                        : <><FaTimesCircle className="text-red-500" /> Full</>}
                    </p>
                    <p className="flex items-center gap-2"><FaStar className="text-yellow-500" /> Rating: {spot.rating || "N/A"}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/edit-parking/${spot.id}`, { state: { spot } })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                      <FaEdit /> Edit
                    </button>

                    {spot.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleToggleStatus(spot.id, "MAINTENANCE")}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                      >
                        <FaBan /> Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(spot.id, "ACTIVE")}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-2"
                      >
                        <FaCheckCircle /> Activate
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaClipboardList className="text-indigo-600" /> Recent Bookings
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
                  className="bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100"
                >
                  <div>
                    <p className="font-bold text-lg text-indigo-900">
                      {booking.parkingSpotName}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p className="flex items-center gap-2"><FaCalendarAlt className="text-indigo-500" /> {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p>
                      <p className="flex items-center gap-2"><FaUser className="text-gray-500" /> <span className="font-semibold">{booking.userName || "Unknown User"}</span> ({booking.userPhone || "N/A"})</p>
                      <p className="flex items-center gap-2"><FaMoneyBillWave className="text-green-600" /> Total: ₹{booking.totalPrice}</p>
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
function StatCard({ label, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <p className="text-sm opacity-90">{label}</p>
        <div className="text-2xl opacity-80">{icon}</div>
      </div>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </motion.div>
  )
}
