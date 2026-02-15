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
import {
  FaCar,
  FaRocket,
  FaMapMarkerAlt,
  FaSearch,
  FaClock,
  FaTimesCircle,
  FaMoneyBillWave,
  FaParking,
  FaStar,
  FaVideo,
  FaShieldAlt,
  FaBolt,
  FaUmbrella,
  FaTimes,
  FaImages,
  FaInfoCircle,
  FaCalendarAlt,
  FaCheckCircle,
  FaHeart,
  FaRegHeart
} from "react-icons/fa"

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
  const [rejectionReason, setRejectionReason] = useState("")
  const [daysLeft, setDaysLeft] = useState(0)

  const [savedSpotIds, setSavedSpotIds] = useState([]) // [NEW] Track saved spots

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
            if (statusRes.data.status === "REJECTED") {
              setRejectionReason(statusRes.data.rejectionReason)
              if (statusRes.data.daysLeft) {
                setDaysLeft(parseInt(statusRes.data.daysLeft))
              }
            }
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

  // [NEW] Fetch Saved Spots IDs
  useEffect(() => {
    if (user.role === "USER") {
      api.get("/user/saved-spots/ids")
        .then(res => setSavedSpotIds(res.data))
        .catch(err => console.error("Failed to fetch saved spots", err))

      api.get("/user/saved-spots/count")
        .then(res => setStats(prev => ({ ...prev, favorites: res.data.count })))
        .catch(err => console.error("Failed to fetch saved count", err))
    }
  }, [])

  const handleToggleFavorite = async (e, spotId) => {
    e.stopPropagation()
    try {
      await api.post(`/user/saved-spots/toggle/${spotId}`)

      let isSaving = !savedSpotIds.includes(spotId)

      if (isSaving) {
        setSavedSpotIds(prev => [...prev, spotId])
        setStats(prev => ({ ...prev, favorites: prev.favorites + 1 }))
      } else {
        setSavedSpotIds(prev => prev.filter(id => id !== spotId))
        setStats(prev => ({ ...prev, favorites: Math.max(0, prev.favorites - 1) }))
      }
    } catch (err) {
      console.error("Toggle failed", err)
    }
  }

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
        className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 space-y-10 pb-12"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold dark:text-white">
              Welcome, {user.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              Find smart parking in seconds <FaCar className="text-indigo-600" />
            </p>
          </div>
          {/* Optional: Add a subtle date/time or secondary action here if needed in future */}
        </div>

        {/* APPLICATION STATUS */}
        {applicationStatus === "PENDING" && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 flex items-center gap-3 shadow-sm">
            <FaClock className="text-yellow-600 text-xl" />
            <div>
              <strong>Application Status: Under Review.</strong> We are checking your details.
            </div>
          </div>
        )}

        {applicationStatus === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
            <div>
              <h3 className="text-red-800 font-bold text-lg mb-1 flex items-center gap-2">
                <FaTimesCircle /> Application Rejected
              </h3>
              {rejectionReason && (
                <p className="text-red-700 mt-1 text-sm bg-red-100/50 p-2 rounded">
                  <strong>Reason:</strong> {rejectionReason}
                </p>
              )}
              {daysLeft > 0 && (
                <p className="text-orange-700 mt-2 font-semibold flex items-center gap-2 text-sm">
                  <FaClock /> Re-apply in {daysLeft} days.
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/become-provider")}
              disabled={daysLeft > 0}
              className={`px-6 py-2.5 text-white rounded-xl shadow-md transition-all font-medium ${daysLeft > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
                }`}
            >
              {daysLeft > 0 ? `Wait ${daysLeft} Days` : "Re-Apply Now"}
            </button>
          </div>
        )}

        {applicationStatus === "NONE" && (
          <div className="bg-indigo-50 dark:bg-gray-800/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">Monetize your space</h3>
              <p className="text-indigo-700 dark:text-indigo-400 text-sm">Earn money by renting out your unused parking spot.</p>
            </div>
            <button
              onClick={() => navigate("/become-provider")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
            >
              <FaRocket /> Become a Provider
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Nearby Spots" value={stats.nearbySpots} color="bg-emerald-500" icon={<FaMapMarkerAlt className="opacity-80" />} />
          <StatCard label="Active Bookings" value={stats.activeBookings} color="bg-indigo-500" icon={<FaClock className="opacity-80" />} />
          <StatCard
            label="Favorites"
            value={stats.favorites}
            color="bg-pink-500"
            icon={<FaStar className="opacity-80" />}
            onClick={() => navigate('/saved-spots')}
            className="cursor-pointer hover:shadow-xl transition-transform transform hover:scale-105"
          />
          <StatCard label="Money Saved" value={`₹${stats.moneySaved}`} color="bg-purple-500" icon={<FaMoneyBillWave className="opacity-80" />} />
        </div>

        {/* UNIFIED SEARCH SECTION */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                <FaSearch className="text-indigo-500" /> Find Parking
              </h2>
              <p className="text-gray-500 text-sm mt-1">Search by location or use auto-detection</p>
            </div>

            <button
              onClick={handleFindNearMe}
              className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-2 transition-colors font-medium"
            >
              <FaMapMarkerAlt className="text-indigo-600" /> Use Current Location
            </button>
          </div>

          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">State</label>
              <select
                value={search.state}
                onChange={(e) =>
                  setSearch({ ...search, state: e.target.value, district: "" })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-shadow"
              >
                <option value="">Select State</option>
                {Object.keys(indiaData).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">District</label>
              <select
                value={search.district}
                disabled={!search.state}
                onChange={(e) =>
                  setSearch({ ...search, district: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-shadow disabled:opacity-50"
              >
                <option value="">Select District</option>
                {(indiaData[search.state] || []).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                onClick={handleSearch}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg transition-all font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        {showResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <FaMapMarkerAlt className="text-emerald-500" />
                {parkingSpots.length} Spots Found
              </h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500 bg-white/50 rounded-2xl animate-pulse">
                Looking for parking spots...
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                {error}
              </div>
            ) : parkingSpots.length === 0 ? (
              <div className="p-12 text-center bg-white/50 rounded-2xl">
                <p className="text-gray-500 text-lg">No parking spots found in this area.</p>
                <button onClick={handleFindNearMe} className="mt-4 text-indigo-600 hover:underline">Try searching nearby?</button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parkingSpots.map((spot) => (
                    <motion.div
                      key={spot._id || spot.id}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full cursor-pointer"
                      onClick={() => navigate(`/spot/${spot._id || spot.id}`)}
                    >
                      <div className="h-48 w-full overflow-hidden relative group">
                        <img
                          src={spot.imageUrls?.[0] ? `http://localhost:8080${spot.imageUrls[0]}` : "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={spot.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={(e) => handleToggleFavorite(e, spot._id || spot.id)}
                            className="bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:scale-110 transition z-10"
                          >
                            {savedSpotIds.includes(spot._id || spot.id) ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart className="text-gray-400 hover:text-red-500" />
                            )}
                          </button>
                          <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1 h-8">
                            <FaStar className="text-yellow-500" /> {spot.averageRating ? spot.averageRating : "New"}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold dark:text-white line-clamp-1" title={spot.name}>
                            {spot.name}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2" title={spot.address}>
                            <FaMapMarkerAlt className="inline-block mr-1 text-gray-400" /> {spot.address}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-indigo-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Starts From</p>
                              <p className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                {spot.vehicleConfigs && spot.vehicleConfigs.length > 0
                                  ? `₹${Math.min(...spot.vehicleConfigs.map(c => c.pricePerHour))}/hr`
                                  : `₹${spot.pricePerHour || 0}/hr`
                                }
                              </p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Total Spots</p>
                              <p className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                                {spot.totalSlots || spot.totalCapacity}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center gap-2 text-xs text-gray-500">
                          <div className="flex gap-2 text-lg">
                            {spot.cctv && <span title="CCTV" className="text-gray-400 hover:text-indigo-500 transition"><FaVideo /></span>}
                            {spot.evCharging && <span title="EV Charging" className="text-gray-400 hover:text-green-500 transition"><FaBolt /></span>}
                            {spot.covered && <span title="Covered" className="text-gray-400 hover:text-blue-500 transition"><FaUmbrella /></span>}
                          </div>
                          <button
                            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {userLocation && (
                  <div className="mt-12 bg-white p-4 rounded-3xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4 px-2">Map View</h2>
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                      <ParkingMap
                        userLocation={userLocation}
                        parkingSpots={parkingSpots}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}



      </motion.div>
    </div>
  )
}



/* STAT CARD */

function StatCard({ label, value, color, icon, onClick, className }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`${color} text-white p-6 rounded-2xl shadow-lg relative overflow-hidden h-full min-h-[140px] flex flex-col justify-between ${className}`}
    >
      <div className="flast absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 pointer-events-none">
        {icon}
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90 uppercase tracking-wide">{label}</p>
        <h3 className="text-3xl font-bold mt-2 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  )
}
