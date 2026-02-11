import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import api from "../utils/api"
import toast from "react-hot-toast"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
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

  const handleAction = async (id, action) => {
    try {
      await api.post(`/admin/provider/${id}/${action}`)
      toast.success(`Application ${action}ed`)

      setApplications(prev =>
        prev.filter(app => app.id !== id)
      )
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 pt-28 px-8 space-y-16">

      {/* =========================
         HEADER
      ========================== */}

      <div>
        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and control the entire parking system
        </p>
      </div>

      {/* =========================
         STATS CARDS
      ========================== */}

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Providers" value={stats.totalProviders} />
        <StatCard label="Parking Spots" value={stats.totalSpots} />
        <StatCard label="Active Bookings" value={stats.activeBookings} />
        <StatCard label="Cancelled" value={stats.cancelledBookings} />
        <StatCard label="Revenue" value={`₹${stats.totalRevenue}`} />
      </div>

      {/* =========================
         PROVIDER APPLICATIONS
      ========================== */}

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6">
          Pending Provider Applications
        </h2>

        {applications.length === 0 ? (
          <p className="text-gray-500">
            No pending applications.
          </p>
        ) : (
          <div className="space-y-6">
            {applications.map(app => (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.02 }}
                className="p-6 border rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6"
              >
                <div>
                  <h3 className="text-xl font-semibold">
                    {app.user.name}
                  </h3>
                  <p className="text-gray-600">
                    📍 {app.parkingSpot.address}
                  </p>
                  <p className="text-gray-600">
                    📞 {app.user.phoneNumber || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    🅿 Capacity: {app.parkingSpot.totalCapacity}
                  </p>
                </div>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => setSelectedApp(app.id)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() =>
                      handleAction(app.id, "approve")
                    }
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleAction(app.id, "reject")
                    }
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
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

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-4">
          System Alerts
        </h2>

        {stats.systemAlerts?.length === 0 ? (
          <p className="text-gray-500">
            No system alerts.
          </p>
        ) : (
          <ul className="list-disc ml-6 text-gray-700">
            {stats.systemAlerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}


/* =========================
   STAT CARD
========================= */

function StatCard({ label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white p-6 rounded-2xl shadow-lg text-center"
    >
      <p className="text-gray-500 text-sm">{label}</p>
      <h3 className="text-2xl font-bold mt-2">
        {value ?? 0}
      </h3>
    </motion.div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold mb-6 text-gray-800">{details.name}</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-500 mb-2">Provider Details</h3>
            <p className="text-lg">👤 {details.user.name}</p>
            <p className="text-lg">📞 {details.user.phoneNumber}</p>
            <p className="text-lg">📧 {details.user.email || "N/A"}</p>

            <h3 className="font-semibold text-gray-500 mt-6 mb-2">Location</h3>
            <p className="text-lg">📍 {details.address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${details.latitude},${details.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline text-sm block mt-1"
            >
              View on Map
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-gray-500 mb-2">Parking Details</h3>
            <p>🅿 Capacity: <span className="font-medium">{details.totalCapacity}</span></p>
            <p>💰 Price: <span className="font-medium">₹{details.pricePerHour}/hr</span></p>

            <h3 className="font-semibold text-gray-500 mt-6 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg text-sm">
              {details.description || "No description provided."}
            </p>
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
