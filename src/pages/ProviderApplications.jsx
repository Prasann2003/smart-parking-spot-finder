import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import RejectionModal from "../components/admin/RejectionModal"
import ApplicationDetailsModal from "../components/admin/ApplicationDetailsModal"
import api from "../utils/api"
import toast from "react-hot-toast"
import {
    FaSearch,
    FaFilter,
    FaCheck,
    FaTimes,
    FaEye,
    FaChevronLeft,
    FaChevronRight,
    FaUser,
    FaMapMarkerAlt,
    FaParking,
    FaList,
    FaArrowLeft
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"

export default function ProviderApplications() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalElements, setTotalElements] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const navigate = useNavigate()

    // Filters
    const [page, setPage] = useState(0)
    const [statusFilter, setStatusFilter] = useState("PENDING") // Default to Pending

    // Modals
    const [selectedApp, setSelectedApp] = useState(null)
    const [rejectId, setRejectId] = useState(null)

    useEffect(() => {
        fetchApplications()
    }, [page, statusFilter])

    const fetchApplications = async () => {
        setLoading(true)
        try {
            const params = {
                page: page,
                size: 10,
                status: statusFilter
            }
            const res = await api.get("/admin/provider-applications-paginated", { params })
            setApplications(res.data.content)
            setTotalElements(res.data.totalElements)
            setTotalPages(res.data.totalPages)
        } catch (err) {
            console.error("Failed to fetch applications", err)
            toast.error("Failed to load applications")
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id, action, reason = null) => {
        if (action === "reject" && !reason) {
            setRejectId(id)
            return
        }

        try {
            await api.post(`/admin/provider/${id}/${action}`, { reason })
            toast.success(`Application ${action}ed`)

            // Refresh list
            fetchApplications()

            setRejectId(null)
        } catch (err) {
            console.error("Action failed", err)
            toast.error("Action failed")
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "APPROVED": return "bg-emerald-100 text-emerald-700 border-emerald-200"
            case "REJECTED": return "bg-red-100 text-red-700 border-red-200"
            case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200"
            default: return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto pt-24 px-4 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-1 flex-shrink-0 p-2 hover:bg-gray-200 rounded-full transition"
                            title="Back to Admin Dashboard"
                        >
                            <FaArrowLeft className="text-gray-600 text-xl" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <FaList className="text-indigo-600" /> Provider Applications
                            </h1>
                            <p className="text-gray-500 mt-1">Review and manage provider verification requests</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                            <span className="text-xs font-bold text-gray-500 uppercase block">Total</span>
                            <span className="text-xl font-bold text-indigo-600">{totalElements}</span>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <FaFilter /> Filter Status:
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[150px]"
                    >
                        <option value="ALL">All Applications</option>
                        <option value="PENDING">Pending Only</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    <button
                        onClick={fetchApplications}
                        className="ml-auto px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition"
                    >
                        Refresh List
                    </button>
                </div>

                {/* LIST / TABLE */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading applications...</div>
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-100 rounded-full text-gray-400 text-3xl">
                                <FaList />
                            </div>
                            <p>No applications found matching the current checks.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                        <th className="p-4 font-semibold">ID</th>
                                        <th className="p-4 font-semibold">Applicant</th>
                                        <th className="p-4 font-semibold">Parking Spot</th>
                                        <th className="p-4 font-semibold">Details</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-sm font-mono text-gray-500">#{app.id}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{app.user.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FaUser className="text-gray-400" /> {app.user.phoneNumber}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{app.parkingSpot.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[200px]">
                                                    <FaMapMarkerAlt className="text-red-400" /> {app.parkingSpot.address}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className="flex gap-4">
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase block">Capacity</span>
                                                        <span className="font-medium">{app.parkingSpot.totalCapacity}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase block">Price</span>
                                                        <span className="font-medium text-emerald-600">₹{app.parkingSpot.pricePerHour}/hr</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedApp(app.id)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <FaEye size={18} />
                                                    </button>
                                                    {app.status === "PENDING" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleAction(app.id, "approve")}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                                title="Approve"
                                                            >
                                                                <FaCheck size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(app.id, "reject")}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Reject"
                                                            >
                                                                <FaTimes size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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

            {/* MODALS */}
            {selectedApp && (
                <ApplicationDetailsModal
                    applicationId={selectedApp}
                    onClose={() => setSelectedApp(null)}
                />
            )}

            {rejectId && (
                <RejectionModal
                    isOpen={!!rejectId}
                    onClose={() => setRejectId(null)}
                    onSubmit={(reason) => handleAction(rejectId, "reject", reason)}
                />
            )}
        </div>
    )
}
