import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import api from "../utils/api"
import toast from "react-hot-toast"
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
  FaClipboardList
} from "react-icons/fa"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* ===========================
     FETCH ADMIN DATA
  ============================ */

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get("/admin/stats")
        const appsRes = await api.get("/admin/provider-applications")

        setStats(statsRes.data)
        setApplications(appsRes.data)
      } catch (err) {
        console.error("Admin Dashboard Error:", err.response?.data)
        const msg = err.response?.data?.message || "Unable to load admin dashboard."
        toast.error(msg)
        setError(msg)
        setLoading(false)
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
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-500">
          System Status: <span className="text-emerald-600 flex items-center gap-1 inline-flex"><FaCheckCircle /> Operational</span>
        </div>
      </div>

      {/* =========================
         STATS CARDS
      ========================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} icon={<FaUsers />} color="bg-blue-600" />
        <StatCard label="Providers" value={stats.totalProviders} icon={<FaUser />} color="bg-indigo-600" />
        <StatCard label="Parking Spots" value={stats.totalSpots} icon={<FaParking />} color="bg-purple-600" />
        <StatCard label="Active Bookings" value={stats.activeBookings} icon={<FaClipboardList />} color="bg-pink-600" />
        <StatCard label="Cancelled" value={stats.cancelledBookings} icon={<FaBan />} color="bg-red-500" />
        <StatCard label="Revenue" value={`₹${stats.totalRevenue}`} icon={<FaMoneyBillWave />} color="bg-emerald-600" />
      </div>

      {/* =========================
         PROVIDER APPLICATIONS
      ========================== */}

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <FaList className="text-indigo-600" /> Pending Provider Applications
        </h2>

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
         SYSTEM ALERTS
      ========================== */}

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <FaShieldAlt className="text-orange-500" /> System Alerts
        </h2>

        {stats.systemAlerts?.length === 0 ? (
          <p className="text-gray-500 italic pl-2">
            No active system alerts.
          </p>
        ) : (
          <ul className="space-y-2">
            {stats.systemAlerts.map((alert, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 text-orange-800 rounded-lg text-sm">
                <FaVideo className="mt-1 flex-shrink-0" /> {alert}
              </li>
            ))}
          </ul>
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

/* =========================
   REJECTION MODAL
========================= */

function RejectionModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) return toast.error("Please enter a reason")
    onSubmit(reason)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FaTimes />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-full text-xl">
            <FaBan />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Reject Application</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Please provide a reason for rejecting this application. This will be sent to the provider.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-4 h-32 mb-6 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none transition-shadow"
            placeholder="e.g., Incomplete address details..."
            autoFocus
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-200 transition"
            >
              Reject Application
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/* =========================
   DETAILS MODAL
========================= */

function ApplicationDetailsModal({ applicationId, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/admin/view/${applicationId}`)
        setDetails(res.data)
      } catch (err) {
        toast.error("Failed to load details")
        onClose()
      }
      setLoading(false)
    }
    fetchDetails()
  }, [applicationId, onClose])

  if (loading) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition-colors"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold mb-6 text-gray-800">{details.name}</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-500 mb-2">Provider Details</h3>
            <p className="text-lg flex items-center gap-2"><FaUser className="text-indigo-500" /> {details.user.name}</p>
            <p className="text-lg flex items-center gap-2"><FaPhone className="text-green-500" /> {details.user.phoneNumber}</p>
            <p className="text-lg flex items-center gap-2"><FaEnvelope className="text-blue-500" /> {details.user.email || "N/A"}</p>

            <h3 className="font-semibold text-gray-500 mt-6 mb-2">Location</h3>
            <p className="text-lg flex items-center gap-2"><FaMapMarkerAlt className="text-red-500" /> {details.address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${details.latitude},${details.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline text-sm block mt-1 ml-6"
            >
              View on Map
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-gray-500 mb-2">Parking Details</h3>
            <p className="flex items-center gap-2 mb-1"><FaParking /> Type: <span className="font-medium">{details.parkingType}</span></p>
            <p className="flex items-center gap-2 mb-4"><FaCar /> Total Capacity: <span className="font-medium">{details.totalCapacity}</span></p>

            <h3 className="font-semibold text-gray-500 mb-2">Pricing Structure</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/Hr</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {details.vehicleConfigs && details.vehicleConfigs.length > 0 ? (
                    details.vehicleConfigs.map((config, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-gray-700">{config.vehicleType}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{config.capacity}</td>
                        <td className="px-3 py-2 text-sm font-bold text-emerald-600">₹{config.pricePerHour}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-700">Standard</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{details.totalCapacity}</td>
                      <td className="px-3 py-2 text-sm font-bold text-emerald-600">₹{details.pricePerHour}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {details.weekendPricing > 0 && (
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm flex items-center gap-2 border border-indigo-100">
                <FaCalendarAlt className="text-lg" />
                <div>
                  <span className="font-bold block text-xs uppercase">Weekend Pricing</span>
                  <span className="font-bold text-lg">₹{details.weekendPricing}/hr</span>
                </div>
              </div>
            )}


            <h3 className="font-semibold text-gray-500 mt-6 mb-2">Amenities</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="flex items-center gap-2">{details.cctv ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />} CCTV</p>
              <p className="flex items-center gap-2">{details.covered ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />} Covered</p>
              <p className="flex items-center gap-2">{details.guard ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />} Security Guard</p>
              <p className="flex items-center gap-2">{details.evCharging ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />} EV Charging</p>
              <p className="flex items-center gap-2">{details.monthlyPlan ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />} Monthly Plan</p>
            </div>

            <h3 className="font-semibold text-gray-500 mt-6 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg text-sm">
              {details.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* BANK DETAILS */}
        <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2"><FaUniversity className="text-indigo-600" /> Provider Banking & Logic</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Bank Account</p>
              <p className="font-medium font-mono">{details.bankAccount || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">UPI ID</p>
              <p className="font-medium font-mono">{details.upiId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">GST Number</p>
              <p className="font-medium font-mono">{details.gstNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PAN Number</p>
              <p className="font-medium font-mono">{details.panNumber || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* IMAGES */}
        <h3 className="font-semibold text-gray-500 mt-8 mb-4">Spot Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {details.imageUrls && details.imageUrls.map((url, i) => (
            <img
              key={i}
              src={`http://localhost:8080${url}`}
              alt="Parking Spot"
              className="h-32 w-full object-cover rounded-xl border hover:scale-105 transition-transform"
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
