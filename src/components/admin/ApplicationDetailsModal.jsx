import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaParking,
    FaCar,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaUniversity
} from "react-icons/fa"
import toast from "react-hot-toast"
import api from "../../utils/api"

export default function ApplicationDetailsModal({ applicationId, onClose }) {
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
