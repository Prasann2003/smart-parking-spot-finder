import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import indiaData from "../utils/indiaData"
import { getCurrentUser } from "../utils/auth"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"
import ProviderDashboard from "./ProviderDashboard"
import AdminDashboard from "./AdminDashboard"
import ParkingMap from "../components/ParkingMap"

export default function Dashboard() {
  const user = getCurrentUser()
  const navigate = useNavigate()

  if (!user) return null

  /* ROLE BASED RENDER */

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

  return <DriverDashboard user={user} navigate={navigate} />
}

/* =====================================================
   DRIVER DASHBOARD
===================================================== */

function DriverDashboard({ user, navigate }) {
  const [search, setSearch] = useState({ state: "", district: "" })
  const [loading, setLoading] = useState(false)
  const [parkingSpots, setParkingSpots] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState("")
  const [userLocation, setUserLocation] = useState(null)

  const [stats, setStats] = useState({
    nearbySpots: 0,
    activeBookings: 0,
    favorites: 0,
    moneySaved: 0,
  })

  const [applicationStatus, setApplicationStatus] = useState("NONE")

  /* FETCH DASHBOARD DATA */

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const summaryRes = await api.get("/dashboard/summary")
        setStats(summaryRes.data)

        const activityRes = await api.get("/dashboard/activity")

        if (user.role === "USER") {
          try {
            const statusRes = await api.get(
              `/provider/application-status?email=${user.email}`
            )
            setApplicationStatus(statusRes.data.status)
          } catch (e) {
            console.error("Application status fetch failed")
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }

    fetchDashboardData()
  }, [])

  /* SEARCH */

  const handleSearch = async () => {
    if (!search.state || !search.district) return

    setLoading(true)
    setShowResults(true)
    setError("")
    setUserLocation(null)

    try {
      const res = await api.get(
        `/parking/search?state=${search.state}&district=${search.district}`
      )

      setParkingSpots(res.data)

      setStats((prev) => ({
        ...prev,
        nearbySpots: res.data.length,
      }))
    } catch {
      setError("Unable to fetch parking spots.")
      setParkingSpots([])
    }

    setLoading(false)
  }

  /* FIND NEAR ME */

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

          setUserLocation({ lat: latitude, lng: longitude })

          const res = await api.get(
            `/parking/nearby?lat=${latitude}&lng=${longitude}&radius=20`
          )

          setParkingSpots(res.data)

          setStats((prev) => ({
            ...prev,
            nearbySpots: res.data.length,
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
        <div>
          <h1 className="text-4xl font-bold dark:text-white">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Find smart parking in seconds 🚗
          </p>
        </div>

        {/* APPLICATION STATUS */}
        {applicationStatus === "PENDING" && (
          <div className="bg-yellow-100 p-4 rounded">
            Application under review
          </div>
        )}

        {applicationStatus === "REJECTED" && (
          <div className="bg-red-100 p-4 rounded flex justify-between">
            <span>Application rejected</span>
            <button
              onClick={() => navigate("/become-provider")}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Re-Apply
            </button>
          </div>
        )}

        {applicationStatus === "NONE" && (
          <div className="flex justify-end">
            <button
              onClick={() => navigate("/become-provider")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl"
            >
              Become Parking Provider
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
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl"
        >
          📍 Find Parking Near Me
        </button>

        {/* SEARCH */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-bold dark:text-white">
            Search by Location
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <select
              value={search.state}
              onChange={(e) =>
                setSearch({ ...search, state: e.target.value, district: "" })
              }
              className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white"
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
              className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:text-white"
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
          <>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : parkingSpots.length === 0 ? (
              <p>No parking spots found.</p>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  {parkingSpots.map((spot) => (
                    <motion.div
                      key={spot._id || spot.id}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
                    >
                      <h3 className="text-xl font-bold dark:text-white">
                        {spot.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {spot.address}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm dark:text-gray-300">
                        <p>💰 ₹{spot.pricePerHour}/hour</p>
                        <p>🅿 {spot.totalSlots}</p>
                        <p>⭐ {spot.rating || "N/A"}</p>
                      </div>

                      <button
                        onClick={() =>
                          navigate("/payment", { state: { spot } })
                        }
                        className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl"
                      >
                        Book Now
                      </button>
                    </motion.div>
                  ))}
                </div>

                {userLocation && (
                  <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">
                      Map View
                    </h2>

                    <ParkingMap
                      userLocation={userLocation}
                      parkingSpots={parkingSpots}
                    />
                  </div>
                )}
              </>
            )}
          </>
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
