import Navbar from "../components/Navbar"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import { getCurrentUser } from "../utils/auth"
import toast from "react-hot-toast"
import {
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaCar,
  FaInfoCircle,
  FaStar,
  FaFilter,
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa"
import RatingModal from "../components/RatingModal"

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  // FILTER & SORT STATE
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc") // desc = Newest First
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const openRatingModal = (bookingId) => {
    setSelectedBookingId(bookingId)
    setRatingModalOpen(true)
  }

  const handleRatingSuccess = () => {
    // Refresh to show updated rating status
    fetchBookings()
  }

  const fetchBookings = async () => {
    setLoading(true)
    const user = getCurrentUser()
    if (user?.role !== "USER") {
      navigate("/dashboard")
      return
    }

    try {
      // API call with params
      const res = await api.get("/bookings/my-bookings", {
        params: {
          page,
          size: 10,
          status: filterStatus === "ALL" ? "" : filterStatus,
          sortBy,
          direction: sortDirection
        }
      })
      // Backend returns Page<BookingDTO>
      setBookings(res.data.content)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error(err)
      setError("Unable to load bookings.")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [page, filterStatus, sortBy, sortDirection])

  /* ===============================
     CANCEL BOOKING
  =============================== */
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.patch(`/bookings/${id}/cancel`)
      toast.success("Booking cancelled")
      fetchBookings() // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to cancel booking.")
    }
  }

  const filters = [
    { label: "All", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Upcoming", value: "UPCOMING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 space-y-8 pb-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-indigo-200 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              My Bookings <FaCar className="text-indigo-600" />
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your real-time parking reservations
            </p>
          </div>

          {/* SORT CONTROLS */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [s, d] = e.target.value.split("-")
                  setSortBy(s)
                  setSortDirection(d)
                  setPage(0) // Reset to first page
                }}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="totalPrice-asc">Price: Low to High</option>
                <option value="totalPrice-desc">Price: High to Low</option>
                <option value="startTime-asc">Date: Sooner First</option>
                <option value="startTime-desc">Date: Later First</option>
              </select>
              <FaSortAmountDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => { setFilterStatus(f.value); setPage(0); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterStatus === f.value
                  ? "bg-indigo-600 text-white shadow-md transform scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white/50 rounded-2xl animate-pulse">
            Loading bookings...
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 text-3xl">
              <FaCar />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">No bookings found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Try adjusting your filters or find a new parking spot.
            </p>
            <button onClick={() => navigate("/dashboard")} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              Find Parking
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {bookings.map((booking, index) => {
                const bookingId = booking.id || booking._id
                // Use computedStatus if available, else fallback
                const displayStatus = booking.computedStatus || booking.status

                return (
                  <motion.div
                    key={bookingId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-8 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between mb-6 gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {booking.parkingSpotName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-1">
                            Ref: #{bookingId?.toString().slice(-6).toUpperCase()}
                          </p>
                        </div>
                        <StatusBadge status={displayStatus} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-indigo-500 mb-1">
                            <FaCalendarAlt /> <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Date</span>
                          </div>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{new Date(booking.startTime).toLocaleDateString()}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-blue-500 mb-1">
                            <FaClock /> <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Time</span>
                          </div>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">
                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-500 mb-1">
                            <FaCar /> <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Vehicle</span>
                          </div>
                          <p className="font-semibold text-gray-700 dark:text-gray-200 capitalize">{booking.vehicleType || "Standard"}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-green-600 mb-1">
                            <FaMoneyBillWave /> <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total</span>
                          </div>
                          <p className="font-bold text-lg text-emerald-600">₹{booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row lg:flex-col justify-center items-stretch gap-3 min-w-[160px] lg:border-l lg:border-gray-100 dark:border-gray-700 lg:pl-8">

                      {/* Only show Rate for COMPLETED bookings */}
                      {booking.status === "COMPLETED" && !booking.isRated && (
                        <button
                          onClick={() => openRatingModal(bookingId)}
                          className="px-5 py-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold transition text-sm text-center flex items-center justify-center gap-2"
                        >
                          <FaStar /> Rate Parking
                        </button>
                      )}

                      {booking.isRated && (
                        <div className="px-5 py-3 rounded-xl bg-gray-50 text-gray-500 font-semibold text-sm text-center flex items-center justify-center gap-2">
                          <FaStar className="text-yellow-400" /> Rated
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/booking/${bookingId}`)}
                        className="px-5 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold transition text-sm text-center"
                      >
                        View Receipt
                      </button>

                      {/* Only CONFIRMED bookings can be cancelled */}
                      {booking.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleCancel(bookingId)}
                          className="px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition text-sm text-center"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )
        }

        {/* PAGINATION */}
        {bookings.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>
          </div>
        )}

        {/* Rating Modal */}
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          bookingId={selectedBookingId}
          onSuccess={handleRatingSuccess}
        />
      </motion.div >
    </div >
  )
}

/* STATUS BADGE */
function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-500/20 animate-pulse",
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20",
    CANCELLED: "bg-red-50 text-red-700 border-red-100 ring-red-500/20",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ring-1 ring-inset ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {status}
    </span>
  )
}
