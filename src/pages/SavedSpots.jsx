import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import api from "../utils/api"
import {
    FaMapMarkerAlt,
    FaStar,
    FaRegHeart,
    FaHeart,
    FaArrowLeft,
    FaSadTear
} from "react-icons/fa"

export default function SavedSpots() {
    const navigate = useNavigate()
    const [savedSpots, setSavedSpots] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSavedSpots()
    }, [])

    const fetchSavedSpots = async () => {
        try {
            const res = await api.get("/user/saved-spots")
            setSavedSpots(res.data)
        } catch (err) {
            console.error("Failed to fetch saved spots", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnsave = async (e, spotId) => {
        e.stopPropagation() // Prevent card click
        try {
            await api.post(`/user/saved-spots/toggle/${spotId}`)
            // Optimistically remove from list
            setSavedSpots(prev => prev.filter(spot => (spot.id || spot._id) !== spotId))
        } catch (err) {
            console.error("Failed to unsave spot", err)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
                    >
                        <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Saved Parking Spots
                    </h1>
                </div>

                {savedSpots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FaSadTear className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
                        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">No saved spots yet</h2>
                        <p className="text-gray-500 mt-2">Mark your favorite spots to access them quickly here.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                        >
                            Find Spots
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedSpots.map((spot) => (
                            <motion.div
                                key={spot.id || spot._id}
                                whileHover={{ y: -5 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col cursor-pointer group"
                                onClick={() => navigate(`/spot/${spot.id || spot._id}`)}
                            >
                                <div className="h-48 w-full overflow-hidden relative">
                                    <img
                                        src={spot.imageUrls?.[0] ? `http://localhost:8080${spot.imageUrls[0]}` : "https://via.placeholder.com/400x300?text=No+Image"}
                                        alt={spot.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <button
                                        onClick={(e) => handleUnsave(e, spot.id || spot._id)}
                                        className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-red-500 shadow-md hover:scale-110 transition z-10"
                                        title="Remove from Saved"
                                    >
                                        <FaHeart />
                                    </button>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold dark:text-white line-clamp-1">{spot.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                                        <FaMapMarkerAlt className="inline-block mr-1 text-gray-400" /> {spot.address}
                                    </p>

                                    <div className="mt-4 flex justify-between items-center">
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                            <FaStar /> {spot.averageRating || "New"}
                                        </div>
                                        <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                                            {spot.vehicleConfigs && spot.vehicleConfigs.length > 0
                                                ? `₹${Math.min(...spot.vehicleConfigs.map(c => c.pricePerHour))}/hr`
                                                : `₹${spot.pricePerHour || 0}/hr`
                                            }
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
