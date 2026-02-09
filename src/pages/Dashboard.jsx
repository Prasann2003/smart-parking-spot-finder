import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import indiaData from "../utils/indiaData"
import { getCurrentUser } from "../utils/auth"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"
import ProviderDashboard from "./ProviderDashboard"
import AdminDashboard from "./AdminDashboard"

export default function Dashboard() {
  const user = getCurrentUser()
  const navigate = useNavigate()

  console.log("Current User in Dashboard:", user)
  console.log("User Role:", user?.role)

  if (!user) return null

  /* =========================
     ROLE BASED RENDERING
  ========================= */

  if (user.role === "PROVIDER") {
    return (
      <>
        <Navbar />
        <ProviderDashboard />
      </>
    )
  }

  if (user.role === "ADMIN") {
    return (
      <>
        <Navbar />
        <AdminDashboard />
      </>
    )
  }

  /* =========================
     DRIVER DASHBOARD
  ========================= */

  return <DriverDashboard user={user} navigate={navigate} />
}

/* =====================================================
   🚗 DRIVER DASHBOARD COMPONENT
===================================================== */

function DriverDashboard({ user, navigate }) {
  const [search, setSearch] = useState({
    state: "",
    district: "",
  })

  const [loading, setLoading] = useState(false)
  const [parkingSpots, setParkingSpots] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState("")

  const [stats, setStats] = useState({
    nearbySpots: 0,
    activeBookings: 0,
    favorites: 0,
    moneySaved: 0,
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [applicationStatus, setApplicationStatus] = useState("NONE")

  /* =========================
     FETCH DASHBOARD SUMMARY
  ========================= */

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const summaryRes = await api.get("/dashboard/summary")
        setStats(summaryRes.data)

        const activityRes = await api.get("/dashboard/activity")
        setRecentActivity(activityRes.data)

        // Check for provider application status
        if (user.role === "USER") {
          try {
            const statusRes = await api.get(`/provider/application-status?email=${user.email}`)
            setApplicationStatus(statusRes.data.status)
          } catch (e) {
            console.error("Failed to fetch app status", e)
          }
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }

    fetchDashboardData()
  }, [])

  /* =========================
     SEARCH BY LOCATION
  ========================= */

  const handleSearch = async () => {
    if (!search.state || !search.district) return

    setLoading(true)
    setShowResults(true)
    setError("")

    try {
      const res = await api.get(`/parking/search?state=${search.state}&district=${search.district}`)
      setParkingSpots(res.data)
      setStats(prev => ({
        ...prev,
        nearbySpots: res.data.length,
      }))
    } catch (err) {
      setError("Unable to fetch parking spots.")
      setParkingSpots([])
    }

    setLoading(false)
  }

  /* =========================
     FIND NEAR ME
  ========================= */

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported")
      return
    }

    setLoading(true)
    setShowResults(true)
    setError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const res = await api.get(
            `/parking/nearby?lat=${latitude}&lng=${longitude}&radius=7`
          )

          // if (!res.ok) throw new Error() // api.get throws on error, so we catch it
          const data = res.data

          setParkingSpots(data)
          setStats(prev => ({
            ...prev,
            nearbySpots: data.length,
          }))
        } catch {
          setError("Unable to fetch nearby parking.")
        }

        setLoading(false)
      },
      () => {
        setError("Location permission denied.")
        setLoading(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto pt-28 px-6 space-y-16 pb-12"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold dark:text-white">
              Welcome, {user.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Find smart parking in seconds 🚗
            </p>
          </div>

        </div>

        {/* APPLICATION STATUS BANNERS */}
        {applicationStatus === "PENDING" && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r" role="alert">
            <p className="font-bold">Application Pending</p>
            <p>Your application to become a provider is currently under review by the admin.</p>
          </div>
        )}

        {applicationStatus === "REJECTED" && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r flex justify-between items-center" role="alert">
            <div>
              <p className="font-bold">Application Rejected</p>
              <p>Your application was rejected. Please contact support or try again.</p>
            </div>
            <button
              onClick={() => navigate("/become-provider")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Re-Apply
            </button>
          </div>
        )}

        {/* BECOME PROVIDER BUTTON (Only show if not pending) */}
        {applicationStatus === "NONE" && (
          <div className="flex justify-end">
            <button
              onClick={() => navigate("/become-provider")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg"
            >
              🏢 Become Parking Provider
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard label="Nearby Spots" value={stats.nearbySpots} color="bg-emerald-500" />
          <StatCard label="Active Bookings" value={stats.activeBookings} color="bg-indigo-500" />
          <StatCard label="Favorites" value={stats.favorites} color="bg-pink-500" />
          <StatCard label="Money Saved" value={`₹${stats.moneySaved}`} color="bg-purple-500" />
        </div>

        {/* FIND NEAR ME */}
        <button
          onClick={handleFindNearMe}
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition"
        >
          📍 Find Parking Near Me (7km)
        </button>

        {/* SEARCH SECTION */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl space-y-6 transition-colors duration-300">
          <h2 className="text-2xl font-bold dark:text-white">Search by Location</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <select
              value={search.state}
              onChange={(e) =>
                setSearch({ ...search, state: e.target.value, district: "" })
              }
              className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select State</option>
              {Object.keys(indiaData).map((state) => (
                <option key={state} value={state} className="text-gray-900 bg-white dark:bg-gray-700 dark:text-white">
                  {state}
                </option>
              ))}
            </select>

            <select
              value={search.district}
              disabled={!search.state}
              onChange={(e) =>
                setSearch({ ...search, district: e.target.value })
              }
              className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select District</option>
              {(indiaData[search.state] || []).map((district) => (
                <option key={district} value={district} className="text-gray-900 bg-white dark:bg-gray-700 dark:text-white">
                  {district}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
            >
              🔍 Search
            </button>
          </div>
        </div>

        {/* RESULTS */}
        {showResults && (
          <div>
            {loading ? (
              <p className="dark:text-white">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : parkingSpots.length === 0 ? (
              <p className="dark:text-white">No parking spots found.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {parkingSpots.map((spot) => (
                  <motion.div
                    key={spot.id}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border dark:border-gray-700 transition-colors duration-300"
                  >
                    <h3 className="text-xl font-bold dark:text-white">{spot.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{spot.address}</p>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm dark:text-gray-300">
                      <p>💰 ₹{spot.pricePerHour}/hour</p>
                      <p>📍 {spot.distance || "N/A"} km</p>
                      <p>🅿 {spot.totalSlots}</p>
                      <p>⭐ {spot.rating || "N/A"}</p>
                    </div>

                    <button
                      onClick={() => navigate("/payment", { state: { spot } })}
                      className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg"
                    >
                      Book Now
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* STAT CARD */
function StatCard({ label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${color} text-white p-6 rounded-2xl shadow-xl`}
    >
      <p className="text-sm">{label}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </motion.div>
  )
}
