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
  FaClipboardList,
  FaCar
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
        className="max-w-7xl mx-auto pt-24 px-6 space-y-10 pb-12"
      >
        {/* HEADER */}
        <div className="flex justify-between items-end flex-wrap gap-6 border-b border-emerald-100 pb-6">
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
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200 flex items-center gap-2 transition-all transform hover:scale-105 font-medium"
          >
            <FaPlus /> Add New Parking
          </button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard label="Total Parkings" value={stats.totalParkings} icon={<FaParking />} color="bg-blue-600" />
          <StatCard label="Active Bookings" value={stats.activeBookings} icon={<FaClipboardList />} color="bg-indigo-600" />
          <StatCard label="Today's Earnings" value={`₹${stats.todayEarnings}`} icon={<FaMoneyBillWave />} color="bg-emerald-600" />
          <StatCard label="Monthly Earnings" value={`₹${stats.monthlyEarnings}`} icon={<FaMoneyBillWave />} color="bg-teal-600" />
        </div>

        {/* PARKING LIST */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FaParking className="text-indigo-600" /> Your Parking Spaces
          </h2>

          {loading ? (
            <div className="p-12 text-center bg-white/50 rounded-2xl animate-pulse text-gray-500">Loading your spaces...</div>
          ) : parkings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                <FaParking />
              </div>
              <h3 className="text-lg font-bold text-gray-700">No Parking Spaces Yet</h3>
              <p className="text-gray-500 mt-2 mb-6">Start earning by adding your first parking spot.</p>
              <button onClick={() => navigate("/add-parking")} className="text-emerald-600 font-semibold hover:underline">Add Parking Now</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkings.map((spot) => (
                <motion.div
                  key={spot.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1" title={spot.name}>{spot.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${spot.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      spot.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                      {spot.status}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-500 text-sm flex items-start gap-2 mb-4 line-clamp-2 min-h-[2.5rem]">
                      <FaBuilding className="mt-1 flex-shrink-0 text-gray-400" /> {spot.address}
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Rate</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <FaMoneyBillWave className="text-green-600" />
                          {spot.vehicleConfigs && spot.vehicleConfigs.length > 0
                            ? `Starts ₹${Math.min(...spot.vehicleConfigs.map(c => c.pricePerHour))}/hr`
                            : "N/A"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Capacity</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <FaParking className="text-blue-600" /> {spot.totalSlots || 0} Slots
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status</span>
                        <span className="font-bold flex items-center gap-1">
                          {spot.availableSlots > 0
                            ? <span className="text-green-600 flex items-center gap-1"><FaCheckCircle /> Available</span>
                            : <span className="text-red-500 flex items-center gap-1"><FaTimesCircle /> Full</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Rating</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <FaStar className="text-yellow-500" /> {spot.averageRating ? spot.averageRating.toFixed(1) : "N/A"}
                          <span className="text-gray-400 text-xs font-normal">({spot.totalReviews || 0} reviews)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/spot/${spot.id}/reviews`)}
                      className="w-full px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition flex justify-center items-center gap-2 font-medium mb-1"
                    >
                      <FaStar /> View Reviews
                    </button>
                    <button
                      onClick={() => navigate(`/edit-parking/${spot.id}`, { state: { spot } })}
                      className="flex-1 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition flex justify-center items-center gap-2 font-medium"
                    >
                      <FaEdit /> Edit
                    </button>

                    {spot.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleToggleStatus(spot.id, "MAINTENANCE")}
                        className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition flex justify-center items-center gap-2 font-medium"
                      >
                        <FaBan /> Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(spot.id, "ACTIVE")}
                        className="flex-1 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition flex justify-center items-center gap-2 font-medium"
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
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <FaClipboardList className="text-indigo-600" /> Recent Bookings
          </h2>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaClipboardList className="mx-auto text-4xl text-gray-200 mb-3" />
              No bookings received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-50 hover:bg-white p-5 rounded-2xl transition-all hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-200"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-indigo-900">{booking.parkingSpotName}</span>
                      <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600 font-mono">#{booking.id?.toString().slice(-6)}</span>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:gap-6 text-sm text-gray-600">
                      <p className="flex items-center gap-1.5"><FaCalendarAlt className="text-indigo-400" /> {new Date(booking.startTime).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1.5"><FaCar className="text-blue-400" /> {booking.vehicleType || "Standard"}</p>
                      <p className="flex items-center gap-1.5"><FaUser className="text-gray-400" /> {booking.userName || "Guest"}</p>
                      <p className="flex items-center gap-1.5 max-md:font-bold max-md:text-emerald-700"><FaMoneyBillWave className="text-emerald-500" /> ₹{booking.totalPrice}</p>
                    </div>
                  </div>

                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${booking.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : booking.status === "COMPLETED"
                        ? "bg-sky-100 text-sky-700 border border-sky-200"
                        : "bg-red-100 text-red-700 border border-red-200"
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
function StatCard({ label, value, icon, color }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${color} text-white p-6 rounded-2xl shadow-lg relative overflow-hidden h-full min-h-[140px] flex flex-col justify-between`}
    >
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 pointer-events-none">
        {icon}
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90 uppercase tracking-wide">{label}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </div>
    </motion.div>
  )
}
