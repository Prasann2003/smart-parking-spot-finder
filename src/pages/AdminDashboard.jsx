import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import toast from "react-hot-toast"
import RejectionModal from "../components/admin/RejectionModal"
import ApplicationDetailsModal from "../components/admin/ApplicationDetailsModal"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaParking,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCar,
  FaCheck,
  FaTimes,
  FaUniversity,
  FaEnvelope,
  FaChargingStation,
  FaShieldAlt,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaBan,
  FaUsers,
  FaList,
  FaClipboardList,
  FaArrowRight
} from "react-icons/fa"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState([])
  const [systemStatus, setSystemStatus] = useState("UNKNOWN")

  /* ===========================
     FETCH ADMIN DATA
  ============================ */

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch health first, independently
        let statusRes = { data: { status: "DOWN" } }
        try {
          statusRes = await api.get("/admin/system-health")
        } catch (healthErr) {
          console.error("Health check failed:", healthErr)
          statusRes = healthErr.response || { data: { status: "DOWN" } }
        }
        setSystemStatus(statusRes.data?.status || "DOWN")

        // Fetch remaining stats
        const statsRes = await api.get("/admin/stats")
        const appsRes = await api.get("/admin/provider-applications-paginated?status=PENDING&size=5")
        const chartRes = await api.get("/admin/revenue-chart")

        setStats(statsRes.data)
        setApplications(appsRes.data.content || [])
        setChartData(chartRes.data || [])
        setError("")
      } catch (err) {
        console.error("Admin Dashboard Error:", err)
        // Set stats to empty/default instead of blank error screen
        setStats({
          totalUsers: 0, totalProviders: 0, totalSpots: 0,
          activeBookings: 0, cancelledBookings: 0,
          totalRevenue: 0, platformEarnings: 0
        })
        setApplications([])
        setChartData([])
        toast.error("Database connection failed. Showing degraded view.")
      }

      setLoading(false)
    }

    fetchAdminData()
  }, [])

  /* ===========================
     APPROVE / REJECT
  ============================ */

  const handleAction = async (id, action, reason = null) => {
    // If action is reject and no reason provided (initial click), open modal
    if (action === "reject" && !reason) {
      setRejectId(id)
      return
    }

    try {
      await api.post(`/admin/provider/${id}/${action}`, { reason })
      toast.success(`Application ${action}ed`)

      setApplications(prev =>
        prev.filter(app => app.id !== id)
      )

      // Close modal if it was open
      setRejectId(null)
    } catch (err) {
      console.error("Action failed", err)
      toast.error("Action failed")
    }
  }

  if (loading) {
    return (
      <div className="pt-32 text-center text-lg">
        Loading Admin Dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-32 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 pt-24 px-6 space-y-10 pb-12">

      {/* =========================
         HEADER
      ========================== */}

      <div className="flex justify-between items-end border-b border-gray-300 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            Monitor and control the entire parking system <FaUniversity className="text-indigo-600" />
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-2.5 rounded-2xl shadow-sm border text-sm font-semibold flex items-center gap-2.5 transition-all duration-300
            ${systemStatus === 'UP'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20'
              : 'bg-red-50/80 border-red-200 text-red-700 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20'
            }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">System Status:</span>
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                {systemStatus === 'UP' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${systemStatus === 'UP' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className={`${systemStatus === 'UP' ? 'text-emerald-700' : 'text-red-700'} font-bold tracking-tight`}>
                {systemStatus === 'UP' ? 'Operational' : (systemStatus || 'Down/Degraded')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* =========================
         STATS CARDS
      ========================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
        <div onClick={() => navigate("/admin/users?role=USER")} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard label="Total Users" value={stats.totalUsers} icon={<FaUsers />} color="bg-blue-600" />
        </div>
        <div onClick={() => navigate("/admin/users?role=PROVIDER")} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard label="Providers" value={stats.totalProviders} icon={<FaUser />} color="bg-indigo-600" />
        </div>
        <StatCard label="Parking Spots" value={stats.totalSpots} icon={<FaParking />} color="bg-purple-600" />
        <StatCard label="Active Bookings" value={stats.activeBookings} icon={<FaClipboardList />} color="bg-pink-600" />
        <StatCard label="Cancelled" value={stats.cancelledBookings} icon={<FaBan />} color="bg-red-500" />
        <StatCard label="Total Revenue" value={`₹${Number(stats.totalRevenue || 0).toFixed(2)}`} icon={<FaMoneyBillWave />} color="bg-emerald-600" />
        <StatCard label="Platform Earnings" value={`₹${Number(stats.platformEarnings || 0).toFixed(2)}`} icon={<FaUniversity />} color="bg-teal-600" />
      </div>

      {/* =========================
         PROVIDER APPLICATIONS
      ========================== */}

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FaList className="text-indigo-600" /> Pending Provider Applications
          </h2>
          <button
            onClick={() => navigate("/admin/applications")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            View All Applications <FaArrowRight size={14} />
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <FaCheckCircle className="mx-auto text-4xl text-gray-300 mb-3" />
            No pending applications. All caught up!
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <motion.div
                key={app.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col lg:flex-row gap-6"
              >
                {/* THUMBNAIL */}
                <div className="w-full lg:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden relative group bg-gray-100">
                  <img
                    src={app.parkingSpot.imageUrls?.[0] ? `http://localhost:8080${app.parkingSpot.imageUrls[0]}` : "https://via.placeholder.com/300?text=No+Image"}
                    alt={app.parkingSpot.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>

                {/* DETAILS */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          {app.user.name}
                          <span className="text-xs font-normal px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full flex items-center gap-1">
                            <FaUser className="text-[10px]" /> Provider
                          </span>
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-red-500" /> {app.parkingSpot.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Starts From</p>
                        <span className="text-2xl font-bold text-emerald-600">
                          ₹{app.parkingSpot.vehicleConfigs?.length > 0
                            ? Math.min(...app.parkingSpot.vehicleConfigs.map(c => c.pricePerHour))
                            : app.parkingSpot.pricePerHour}
                          <span className="text-sm font-medium text-gray-500">/hr</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Capacity</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-1">
                          <FaCar className="text-indigo-500" />
                          {app.parkingSpot.totalCapacity || app.parkingSpot.totalSlots} Slots
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Type</p>
                        <p className="font-semibold text-gray-800">{app.parkingSpot.parkingType}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Contact</p>
                        <p className="font-semibold text-gray-800">{app.user.phoneNumber || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Submitted</p>
                        <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedApp(app.id)}
                      className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-medium transition flex items-center justify-center gap-2"
                    >
                      <FaEye /> View Details
                    </button>
                    <button
                      onClick={() => handleAction(app.id, "approve")}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(app.id, "reject")}
                      className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition flex items-center justify-center gap-2"
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedApp && (
          <ApplicationDetailsModal
            applicationId={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </div>

      {/* =========================
         REVENUE CHART
      ========================== */}

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <FaMoneyBillWave className="text-emerald-500" /> Monthly Revenue Trend
        </h2>

        {chartData.length === 0 ? (
          <p className="text-gray-500 italic pl-2">
            No revenue data available yet.
          </p>
        ) : (
          <div className="h-80 w-full mt-4" style={{ minHeight: "320px" }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#6B7280' }} tickMargin={10} />
                <YAxis stroke="#6B7280" tick={{ fill: '#6B7280' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Amount"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                <Line
                  name="Total Revenue"
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="Platform Earnings"
                  type="monotone"
                  dataKey="platformEarnings"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* =========================
         REJECTION MODAL
      ========================== */}
      {rejectId && (
        <RejectionModal
          isOpen={!!rejectId}
          onClose={() => setRejectId(null)}
          onSubmit={(reason) => handleAction(rejectId, "reject", reason)}
        />
      )}

    </div>
  )
}


/* =========================
   STAT CARD
========================= */

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
        <h3 className="text-2xl font-bold mt-2 tracking-tight">{value ?? 0}</h3>
      </div>
    </motion.div>
  )
}

