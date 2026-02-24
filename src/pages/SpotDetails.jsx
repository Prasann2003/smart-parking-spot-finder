import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import AmenityTag from "../components/AmenityTag"
import ReviewsList from "../components/ReviewsList"
import api from "../utils/api"
import {
    FaMapMarkerAlt,
    FaCar,
    FaVideo,
    FaStar,
    FaParking,
    FaShieldAlt,
    FaUmbrella,
    FaBolt,
    FaMoneyBillWave,
    FaArrowLeft,
    FaHeart,
    FaRegHeart,
    FaMotorcycle,
    FaBus,
    FaTruck
} from "react-icons/fa"

export default function SpotDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [spot, setSpot] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isSaved, setIsSaved] = useState(false)

    useEffect(() => {
        const fetchSpotDetails = async () => {
            try {
                const res = await api.get(`/parking/${id}`)
                setSpot(res.data)
            } catch (err) {
                console.error("Failed to fetch spot details", err)
                setError("Parking spot not found or failed to load.")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchSpotDetails()
        }
    }, [id])

    // Check if saved
    useEffect(() => {
        if (id) {
            api.get("/user/saved-spots/ids")
                .then(res => {
                    if (res.data.includes(parseInt(id)) || res.data.includes(id)) {
                        setIsSaved(true)
                    }
                })
                .catch(err => console.error(err))
        }
    }, [id])

    const toggleSave = async () => {
        try {
            await api.post(`/user/saved-spots/toggle/${id}`)
            setIsSaved(!isSaved)
        } catch (err) {
            console.error(err)
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

    if (error || !spot) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops!</h2>
                <p className="text-red-500 mb-6">{error || "Spot not found."}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    )

    const images = spot.imageUrls || []
    const displayImages = [
        images[0] ? `http://localhost:8080${images[0]}` : null,
        images[1] ? `http://localhost:8080${images[1]}` : null,
        images[2] ? `http://localhost:8080${images[2]}` : null
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6">
                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
                >
                    <FaArrowLeft /> Back to Search
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

                    {/* 1. IMAGE GALLERY SECTION */}
                    <div className="h-64 md:h-[500px] w-full grid grid-cols-4 grid-rows-2 gap-2 p-2 bg-gray-100 dark:bg-gray-900">
                        <div className="col-span-4 md:col-span-2 row-span-2 relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 group">
                            {displayImages[0] ? (
                                <img src={displayImages[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <FaMapMarkerAlt className="text-5xl mb-3 opacity-50" />
                                    <span className="text-sm font-medium">Main View</span>
                                </div>
                            )}
                        </div>
                        <div className="col-span-2 md:col-span-1 row-span-2 flex flex-col gap-2">
                            <div className="h-full relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 group">
                                {displayImages[1] ? (
                                    <img src={displayImages[1]} alt="Side" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <FaCar className="text-3xl mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Side View</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 row-span-2 flex flex-col gap-2">
                            <div className="h-full relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 group">
                                {displayImages[2] ? (
                                    <img src={displayImages[2]} alt="Surroundings" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <FaVideo className="text-3xl mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Surroundings</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">

                            {/* LEFT COLUMN: DETAILS (65%) */}
                            <div className="flex-1 space-y-10">

                                {/* HEADER */}
                                <div className="border-b border-gray-100 dark:border-gray-700 pb-8">
                                    <div>
                                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3 flex justify-between items-center">
                                            {spot.name}
                                            <button
                                                onClick={toggleSave}
                                                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                {isSaved ? <FaHeart className="text-red-500 text-3xl" /> : <FaRegHeart className="text-gray-400 text-3xl" />}
                                            </button>
                                        </h1>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg flex items-start gap-2">
                                            <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                                            {spot.address}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-6">
                                        <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 rounded-full text-sm font-bold flex items-center gap-2">
                                            <FaParking /> {spot.parkingType}
                                        </span>
                                        {spot.averageRating > 0 && (
                                            <span className="px-4 py-1.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border border-yellow-100 dark:border-yellow-800/50 rounded-full text-sm font-bold flex items-center gap-2">
                                                <FaStar className="text-yellow-500" /> {spot.averageRating} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({spot.totalReviews} reviews)</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-8 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-indigo-500" /> About this Spot
                                    </h3>
                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {spot.description ? spot.description : "N/A - No description provided by the owner."}
                                    </div>
                                </div>

                                {/* AMENITIES */}
                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                                        <FaShieldAlt className="text-indigo-500" /> Amenities
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <AmenityTag active={spot.cctv} label="CCTV" icon={<FaVideo />} />
                                        <AmenityTag active={spot.covered} label="Covered" icon={<FaUmbrella />} />
                                        <AmenityTag active={spot.guard} label="Guard" icon={<FaShieldAlt />} />
                                        <AmenityTag active={spot.evCharging} label="EV Charge" icon={<FaBolt />} />
                                    </div>
                                </div>

                                {/* PRICING TABLE */}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                                        <FaMoneyBillWave className="text-emerald-500" /> Vehicle Pricing
                                    </h3>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left bg-white dark:bg-gray-800">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className="px-6 py-4">Vehicle</th>
                                                    <th className="px-6 py-4">Capacity</th>
                                                    <th className="px-6 py-4">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {spot.vehicleConfigs && spot.vehicleConfigs.length > 0 ? (
                                                    spot.vehicleConfigs.map((config, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                            <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
                                                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                                                                    {config.vehicleType === "BIKE" && <FaMotorcycle />}
                                                                    {config.vehicleType === "CAR" && <FaCar />}
                                                                    {config.vehicleType === "EV" && <FaBolt />}
                                                                    {config.vehicleType === "BUS" && <FaBus />}
                                                                    {config.vehicleType === "TRUCK" && <FaTruck />}
                                                                    {!["BIKE", "CAR", "EV", "BUS", "TRUCK"].includes(config.vehicleType) && <FaCar />}
                                                                </div>
                                                                {config.vehicleType}
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">{config.capacity} slots</td>
                                                            <td className="px-6 py-4 font-bold text-emerald-600 text-lg">₹{config.pricePerHour}<span className="text-sm font-normal text-gray-400">/hr</span></td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td className="px-6 py-4 font-semibold text-gray-700">Standard</td>
                                                        <td className="px-6 py-4 text-gray-600">{spot.totalCapacity} slots</td>
                                                        <td className="px-6 py-4 font-bold text-emerald-600">₹{spot.pricePerHour}/hr</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* REVIEWS SECTION */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <FaStar className="text-yellow-500" /> Recent Reviews
                                        </h3>
                                        {spot.totalReviews > 3 && (
                                            <button
                                                onClick={() => navigate(`/spot/${spot.id}/reviews`)}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-bold text-sm"
                                            >
                                                View All ({spot.totalReviews})
                                            </button>
                                        )}
                                    </div>
                                    <ReviewsList spotId={spot.id} limit={3} />
                                </div>

                            </div>

                            {/* RIGHT COLUMN: BOOKING FORM (35%) */}
                            <div className="lg:w-96 flex-shrink-0">
                                <div className="sticky top-28 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                                    <div className="mb-8">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Price Starts From</span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white">
                                                ₹{spot.vehicleConfigs && spot.vehicleConfigs.length > 0
                                                    ? Math.min(...spot.vehicleConfigs.map(c => c.pricePerHour))
                                                    : spot.pricePerHour || 0
                                                }
                                            </span>
                                            <span className="text-gray-500 font-medium text-lg">/ hour</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate("/payment", { state: { spot } })}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        Book This Spot
                                    </button>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <FaShieldAlt className="text-green-500 mt-1 flex-shrink-0" />
                                            <span>Free cancellation up to <strong>24 hours</strong> before booking</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <FaBolt className="text-yellow-500 mt-1 flex-shrink-0" />
                                            <span>Instant confirmation</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
