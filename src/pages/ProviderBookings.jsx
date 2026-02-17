import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { getCurrentUser } from "../utils/auth"
import api from "../utils/api"
import {
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaCar,
    FaUser,
    FaMoneyBillWave,
    FaChevronLeft,
    FaChevronRight,
    FaParking,
    FaClock
} from "react-icons/fa"

export default function ProviderBookings() {
    const user = getCurrentUser()
    const [bookings, setBookings] = useState([])
    const [parkings, setParkings] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalElements, setTotalElements] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Filters
    const [page, setPage] = useState(0)
    const [selectedSpot, setSelectedSpot] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("")

    useEffect(() => {
        fetchParkings()
    }, [])

    useEffect(() => {
        fetchBookings()
    }, [page, selectedSpot, selectedStatus])

    const fetchParkings = async () => {
        try {
            const res = await api.get(`/provider/parkings?email=${user.email}`)
            setParkings(res.data)
        } catch (err) {
            console.error("Failed to fetch parkings", err)
        }
    }

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const params = {
                email: user.email,
                page: page,
                size: 10,
            }
            if (selectedSpot) params.spotId = selectedSpot
            if (selectedStatus) params.status = selectedStatus

            const res = await api.get("/provider/bookings-paginated", { params })
            setBookings(res.data.content)
            setTotalElements(res.data.totalElements)
            setTotalPages(res.data.totalPages)
        } catch (err) {
            console.error("Failed to fetch bookings", err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "CONFIRMED": return "bg-emerald-100 text-emerald-700 border-emerald-200"
            case "COMPLETED": return "bg-blue-100 text-blue-700 border-blue-200"
            case "CANCELLED": return "bg-red-100 text-red-700 border-red-200"
            default: return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto pt-24 px-4 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
                        <p className="text-gray-500 mt-1">Manage and track all your parking reservations</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                            <span className="text-sm text-gray-500 block text-xs uppercase font-bold">Total Bookings</span>
                            <span className="font-bold text-xl text-indigo-600">{totalElements}</span>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <FaFilter /> Filters:
                    </div>

                    <select
                        value={selectedSpot}
                        onChange={(e) => { setSelectedSpot(e.target.value); setPage(0) }}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Parking Spots</option>
                        {parkings.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setPage(0) }}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No bookings found matching filters.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                        <th className="p-4 font-semibold">Booking ID</th>
                                        <th className="p-4 font-semibold">Parking Spot</th>
                                        <th className="p-4 font-semibold">Customer</th>
                                        <th className="p-4 font-semibold">Date & Time</th>
                                        <th className="p-4 font-semibold">Amount</th>
                                        <th className="p-4 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-sm font-mono text-gray-500">#{booking.id}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{booking.parkingSpotName}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FaCar className="text-gray-400" /> {booking.vehicleType}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                        {booking.userName?.charAt(0)}
                                                    </div>
                                                    <span className="text-gray-700 font-medium">{booking.userName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <FaCalendarAlt className="text-gray-400" /> {new Date(booking.startTime).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs mt-1 text-gray-500">
                                                    <FaClock className="text-gray-300" />
                                                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                    {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-800">
                                                ₹{booking.providerEarnings ? booking.providerEarnings.toFixed(2) : booking.totalPrice}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
                        >
                            <FaChevronLeft /> Previous
                        </button>
                        <span className="text-sm text-gray-600 font-medium">
                            Page {page + 1} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
                        >
                            Next <FaChevronRight />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
