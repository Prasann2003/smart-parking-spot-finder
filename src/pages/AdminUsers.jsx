import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import api from "../utils/api"
import toast from "react-hot-toast"
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaUserShield,
    FaIdBadge,
    FaChevronLeft,
    FaChevronRight,
    FaArrowLeft
} from "react-icons/fa"
import { useLocation, useNavigate } from "react-router-dom"

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [totalElements, setTotalElements] = useState(0)

    const size = 10
    const navigate = useNavigate()
    const location = useLocation()

    // Parse role from query params
    const queryParams = new URLSearchParams(location.search)
    const roleFilter = queryParams.get("role") || ""

    useEffect(() => {
        fetchUsers(page, roleFilter)
    }, [page, roleFilter])

    const fetchUsers = async (pageNumber, role) => {
        setLoading(true)
        setError("")
        try {
            let url = `/admin/users?page=${pageNumber}&size=${size}`
            if (role) {
                url += `&role=${role}`
            }
            const res = await api.get(url)
            setUsers(res.data.content || [])
            setTotalPages(res.data.totalPages || 1)
            setTotalElements(res.data.totalElements || 0)
        } catch (err) {
            console.error("Admin Users Error:", err)
            setError("Failed to load users.")
            toast.error("Failed to load users.")
        }
        setLoading(false)
    }

    const handlePrevPage = () => {
        if (page > 0) setPage((prev) => prev - 1)
    }

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage((prev) => prev + 1)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                {/* HEADER */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="text-gray-400 hover:text-indigo-600 mb-2 flex flex-row items-center gap-2 transition"
                        >
                            <FaArrowLeft /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
                            <FaUserShield className="text-indigo-600" />
                            Manage Users
                        </h1>
                        <p className="text-gray-500 mt-1">
                            View and monitor all registered users on the platform.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setPage(0);
                                navigate(e.target.value ? `/admin/users?role=${e.target.value}` : "/admin/users");
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Roles</option>
                            <option value="USER">User</option>
                            <option value="PROVIDER">Provider</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 whitespace-nowrap">
                            <span className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                                Total Users: {totalElements}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 animate-pulse">
                            Loading users...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">
                            {error}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No users found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold tracking-wider">
                                        <th className="p-4 px-6 whitespace-nowrap">ID</th>
                                        <th className="p-4 px-6 whitespace-nowrap">User</th>
                                        <th className="p-4 px-6 whitespace-nowrap">Role</th>
                                        <th className="p-4 px-6 whitespace-nowrap">Joined Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                                            className="group transition-colors"
                                        >
                                            <td className="p-4 px-6 font-mono text-gray-500 text-sm">
                                                #{user.id}
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-gray-900 flex items-center gap-2">
                                                        <FaUser className="text-gray-400" /> {user.name}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center gap-2">
                                                        <FaEnvelope className="text-gray-400" /> {user.email}
                                                    </span>
                                                    {user.phoneNumber && (
                                                        <span className="text-sm text-gray-500 flex items-center gap-2">
                                                            <FaPhone className="text-gray-400" /> {user.phoneNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 px-6">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1 w-max ${user.role === "ADMIN"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : user.role === "PROVIDER"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-blue-100 text-blue-700"
                                                        }`}
                                                >
                                                    <FaIdBadge /> {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6 text-gray-500 text-sm whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                    {user.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString()
                                                        : "N/A"}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}
                    {!loading && !error && users.length > 0 && (
                        <div className="flex items-center justify-between p-4 px-6 border-t border-gray-100 bg-gray-50">
                            <p className="text-sm text-gray-500">
                                Showing page <span className="font-bold">{page + 1}</span> of{" "}
                                <span className="font-bold">{totalPages}</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 0}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                >
                                    <FaChevronLeft /> Prev
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page >= totalPages - 1}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                >
                                    Next <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
