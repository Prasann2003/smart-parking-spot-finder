import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../utils/api"
import Navbar from "../components/Navbar"
import ParkingMap from "../components/ParkingMap"
import { motion } from "framer-motion"
import { FaMapMarkerAlt, FaStar, FaVideo, FaBolt, FaUmbrella, FaRegHeart, FaHeart, FaArrowLeft, FaChevronLeft, FaChevronRight, FaMap, FaTimes, FaShieldAlt } from "react-icons/fa"
import { getCurrentUser } from "../utils/auth"

export default function SearchResults() {
    const location = useLocation()
    const navigate = useNavigate()
    const user = getCurrentUser()

    const [parkingSpots, setParkingSpots] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const pageSize = 10

    const [savedSpotIds, setSavedSpotIds] = useState([])
    const [showMobileMap, setShowMobileMap] = useState(false)

    // Parse URL search params
    const searchParams = new URLSearchParams(location.search)
    const type = searchParams.get("type") // "nearby" OR "location"
    const lat = parseFloat(searchParams.get("lat"))
    const lng = parseFloat(searchParams.get("lng"))
    const radius = searchParams.get("radius") || 20
    const stateParam = searchParams.get("state")
    const districtParam = searchParams.get("district")

    // Filter & Sort Params (extracted from URL)
    const cctv = searchParams.get("cctv") === "true"
    const covered = searchParams.get("covered") === "true"
    const evCharging = searchParams.get("evCharging") === "true"
    const guard = searchParams.get("guard") === "true"
    const sort = searchParams.get("sort") || "id,desc" // default

    // Helper to update URL without losing existing params
    const updateUrlParams = (key, value) => {
        const newParams = new URLSearchParams(location.search)
        if (value === null || value === false || value === "" || value === "id,desc") {
            newParams.delete(key)
        } else {
            newParams.set(key, value)
        }
        // reset to page 0 on any filter/sort change
        newParams.delete("page")
        setCurrentPage(0)
        navigate(`${location.pathname}?${newParams.toString()}`)
    }

    useEffect(() => {
        if (user?.role === "USER") {
            api.get("/user/saved-spots/ids")
                .then(res => setSavedSpotIds(res.data))
                .catch(err => console.error("Failed to fetch saved spots", err))
        }
    }, [user?.role])

    useEffect(() => {
        fetchResults(currentPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, currentPage])

    const fetchResults = async (page) => {
        setLoading(true)
        setError("")

        // Build common filter string
        let filterQuery = `&page=${page}&size=${pageSize}`
        if (cctv) filterQuery += `&cctv=true`
        if (covered) filterQuery += `&covered=true`
        if (evCharging) filterQuery += `&evCharging=true`
        if (guard) filterQuery += `&guard=true`
        if (sort) filterQuery += `&sort=${sort}`

        try {
            let res
            if (type === "nearby" && lat && lng) {
                res = await api.get(`/parking/nearby?lat=${lat}&lng=${lng}&radius=${radius}${filterQuery}`)
            } else if (type === "location" && stateParam && districtParam) {
                res = await api.get(`/parking/search?state=${encodeURIComponent(stateParam)}&district=${encodeURIComponent(districtParam)}${filterQuery}`)
            } else {
                throw new Error("Invalid search parameters")
            }

            // Spring Data Page returns { content, totalPages, totalElements, number, ... }
            setParkingSpots(res.data.content || [])
            setTotalPages(res.data.totalPages || 0)
            setTotalElements(res.data.totalElements || 0)
        } catch (err) {
            console.error(err)
            setError("Unable to fetch parking spots.")
        } finally {
            setLoading(false)
        }
    }

    const handleToggleFavorite = async (e, spotId) => {
        e.stopPropagation()
        if (!user) {
            navigate('/auth')
            return
        }
        try {
            await api.post(`/user/saved-spots/toggle/${spotId}`)
            let isSaving = !savedSpotIds.includes(spotId)
            if (isSaving) {
                setSavedSpotIds(prev => [...prev, spotId])
            } else {
                setSavedSpotIds(prev => prev.filter(id => id !== spotId))
            }
        } catch (err) {
            console.error("Toggle failed", err)
        }
    }

    // Derived Title
    let pageTitle = "Search Results"
    if (type === "nearby") pageTitle = "Spaces near you"
    if (type === "location") pageTitle = `Spaces in ${districtParam}, ${stateParam}`

    return (
        <div className="h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            <div className="flex-none">
                <Navbar />
            </div>

            <div className="flex-1 flex overflow-hidden w-full relative bg-gray-50 dark:bg-gray-900">
                {/* LEFT COLUMN: LIST */}
                <div className={`overflow-y-auto pb-24 px-4 lg:px-8 h-full ${type === 'nearby' && lat && lng ? 'w-full lg:w-[60%] xl:w-[65%]' : 'w-full max-w-screen-2xl mx-auto'}`}>

                    {/* Header & Filter Bar (Sticky) */}
                    <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-50 pb-4 mb-6 pt-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="p-2 bg-white dark:bg-gray-800 text-gray-500 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <FaArrowLeft />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold dark:text-white">{pageTitle}</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {totalElements} spots found
                                    </p>
                                </div>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Sort:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => updateUrlParams("sort", e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer shadow-sm"
                                >
                                    <option value="id,desc">Recommended</option>
                                    <option value="averageRating,desc">Highest Rated</option>
                                </select>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <FilterButton label="Covered" icon={<FaUmbrella />} active={covered} onClick={() => updateUrlParams("covered", !covered)} />
                            <FilterButton label="CCTV" icon={<FaVideo />} active={cctv} onClick={() => updateUrlParams("cctv", !cctv)} />
                            <FilterButton label="EV Charging" icon={<FaBolt />} active={evCharging} onClick={() => updateUrlParams("evCharging", !evCharging)} />
                            <FilterButton label="Guard" icon={<FaShieldAlt />} active={guard} onClick={() => updateUrlParams("guard", !guard)} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center mx-auto max-w-2xl mt-12">
                            {error}
                        </div>
                    ) : parkingSpots.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mx-auto max-w-2xl mt-12">
                            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">No spots found</h2>
                            <p className="text-gray-500 mt-2">Try adjusting your search criteria or searching a different area.</p>
                            <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm">
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={`grid gap-6 ${type === 'nearby' && lat && lng ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'}`}>
                                {parkingSpots.map((spot) => (
                                    <motion.div
                                        key={spot._id || spot.id}
                                        whileHover={{ y: -4 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full cursor-pointer"
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
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Starts From</p>
                                                        <p className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                                            {spot.vehicleConfigs && spot.vehicleConfigs.length > 0
                                                                ? `₹${Math.min(...spot.vehicleConfigs.map(c => c.pricePerHour))}/hr`
                                                                : `₹${spot.pricePerHour || 0}/hr`
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="bg-emerald-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Total Spots</p>
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
                                                    {spot.guard && <span title="Guard" className="text-gray-400 hover:text-yellow-500 transition text-lg"><FaShieldAlt /></span>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* PAGINATION CONTROLS */}
                            {totalPages > 0 && (
                                <div className="mt-10 flex justify-center items-center gap-4 border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 pb-4">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className="p-2.5 bg-white dark:bg-gray-800 text-indigo-600 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                                        Page {currentPage + 1} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className="p-2.5 bg-white dark:bg-gray-800 text-indigo-600 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* RIGHT COLUMN: MAP (Fixed) */}
                {type === 'nearby' && lat && lng && (
                    <div className="hidden lg:block lg:w-[40%] xl:w-[35%] h-full relative z-0 bg-gray-200 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-800 shadow-inner">
                        <ParkingMap
                            userLocation={{ lat, lng }}
                            parkingSpots={parkingSpots}
                        />
                    </div>
                )}
            </div>

            {/* Floating Map Button for Mobile */}
            {type === 'nearby' && lat && lng && (
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <button
                        onClick={() => setShowMobileMap(true)}
                        className="bg-gray-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold hover:scale-105 active:scale-95 transition-all outline-none border-2 border-white dark:border-transparent cursor-pointer"
                    >
                        <FaMap /> <span className="tracking-wide text-sm whitespace-nowrap">Show Map</span>
                    </button>
                </div>
            )}

            {/* Mobile Map Modal */}
            {type === 'nearby' && lat && lng && showMobileMap && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col h-[100dvh]">
                    {/* Header */}
                    <div className="px-4 py-3 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm z-10">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaMap className="text-indigo-600" /> Map View
                        </h2>
                        <button
                            onClick={() => setShowMobileMap(false)}
                            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    {/* Map Space */}
                    <div className="flex-1 relative z-0">
                        <ParkingMap
                            userLocation={{ lat, lng }}
                            parkingSpots={parkingSpots}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper component for filter toggles
function FilterButton({ label, icon, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active
                ? "bg-indigo-600 text-white shadow-md border border-indigo-600"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
        >
            {icon} {label}
        </button>
    )
}
