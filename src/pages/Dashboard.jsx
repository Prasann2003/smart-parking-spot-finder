import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import indiaData from "../utils/indiaData"
import { getCurrentUser } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import ProviderDashboard from "./ProviderDashboard"
import AdminDashboard from "./AdminDashboard"

export default function Dashboard() {
  const user = getCurrentUser()
  const navigate = useNavigate()

  if (!user) return null

  /* =========================
     ROLE BASED RENDERING
  ========================= */

  if (user.role === "provider") {
    return (
      <>
        <Navbar />
        <ProviderDashboard />
      </>
    )
  }

  if (user.role === "admin") {
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

  /* =========================
     FETCH DASHBOARD SUMMARY
  ========================= */

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const summaryRes = await fetch("http://localhost:5000/api/dashboard/summary")
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json()
          setStats(summaryData)
        }

        const activityRes = await fetch("http://localhost:5000/api/dashboard/activity")
        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setRecentActivity(activityData)
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
      const res = await fetch(
        `http://localhost:5000/api/parking?state=${search.state}&district=${search.district}`
      )

      if (!res.ok) throw new Error("Failed")

      const data = await res.json()

      setParkingSpots(data)
      setStats(prev => ({
        ...prev,
        nearbySpots: data.length,
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

          const res = await fetch(
            `http://localhost:5000/api/parking/nearby?lat=${latitude}&lng=${longitude}&radius=7`
          )

          if (!res.ok) throw new Error()

          const data = await res.json()

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto pt-28 px-6 space-y-16"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome, {user.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Find smart parking in seconds 🚗
            </p>
          </div>

          <button
            onClick={() => navigate("/become-provider")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            🏢 Become Parking Provider
          </button>
        </div>

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
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl"
        >
          📍 Find Parking Near Me (7km)
        </button>

        {/* SEARCH SECTION */}
        <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-bold">Search by Location</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <select
              value={search.state}
              onChange={(e) =>
                setSearch({ ...search, state: e.target.value, district: "" })
              }
              className="px-4 py-3 border rounded-lg"
            >
              <option value="">Select State</option>
              {Object.keys(indiaData).map((state) => (
                <option key={state} value={state}>
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
              className="px-4 py-3 border rounded-lg"
            >
              <option value="">Select District</option>
              {(indiaData[search.state] || []).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
            >
              🔍 Search
            </button>
          </div>
        </div>

        {/* RESULTS */}
        {showResults && (
          <div>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : parkingSpots.length === 0 ? (
              <p>No parking spots found.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {parkingSpots.map((spot) => (
                  <motion.div
                    key={spot.id}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white p-6 rounded-2xl shadow-xl border"
                  >
                    <h3 className="text-xl font-bold">{spot.name}</h3>
                    <p className="text-gray-600">{spot.address}</p>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <p>💰 ₹{spot.pricePerHour}/hour</p>
                      <p>📍 {spot.distance || "N/A"} km</p>
                      <p>🅿 {spot.totalSlots}</p>
                      <p>⭐ {spot.rating || "N/A"}</p>
                    </div>

                    <button
                      onClick={() => navigate("/payment", { state: { spot } })}
                      className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl"
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
