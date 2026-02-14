import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaStar, FaArrowLeft, FaSortAmountDown, FaFilter, FaUserCircle, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa'
import api from '../utils/api'

export default function ReviewsPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    // State
    const [spot, setSpot] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] })

    // Pagination & Sorting
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pageSize] = useState(10)
    const [sortBy, setSortBy] = useState("createdAt")
    const [direction, setDirection] = useState("desc")
    const [showSortMenu, setShowSortMenu] = useState(false)

    useEffect(() => {
        fetchData()
    }, [id, page, sortBy, direction])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Parallel fetch: Spot Details + Paginated Reviews
            const [spotRes, reviewsRes] = await Promise.all([
                api.get(`/parking/${id}`),
                api.get(`/ratings/spot/${id}/paged?page=${page}&size=${pageSize}&sortBy=${sortBy}&direction=${direction}`)
            ])

            setSpot(spotRes.data)
            setReviews(reviewsRes.data.content)
            setTotalPages(reviewsRes.data.totalPages)

            // Stats logic...
            setStats({
                average: spotRes.data.averageRating || 0,
                total: spotRes.data.totalReviews || 0,
                // Distribution would usually come from a specific endpoint
                distribution: [0, 0, 0, 0, 0]
            })

        } catch (err) {
            console.error("Failed to load reviews data", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSortChange = (newSortBy, newDirection) => {
        setSortBy(newSortBy)
        setDirection(newDirection)
        setShowSortMenu(false)
        setPage(0) // Reset to first page on sort change
    }

    if (loading && !spot) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* HERO HEADER */}
            <div className="bg-indigo-600 text-white pt-10 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-indigo-100 hover:text-white mb-6 transition-colors"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold mb-2">{spot?.name}</h1>
                    <p className="text-indigo-200 text-lg">{spot?.address}</p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">

                    {/* STATS OVERVIEW */}
                    <div className="flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-700 pb-10 mb-10">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-4">Overall Rating</h2>
                            <div className="text-7xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                {stats.average.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-yellow-400 text-3xl mb-4">
                                <Stars rating={stats.average} />
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 font-medium">
                                based on <span className="font-bold text-gray-800 dark:text-gray-200">{stats.total}</span> reviews
                            </div>
                        </div>
                    </div>

                    {/* FILTERS & LIST */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            User Reviews <span className="bg-gray-100 text-gray-600 text-sm py-0.5 px-2.5 rounded-full">{stats.total}</span>
                        </h2>

                        <div className="relative z-20">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 transition shadow-sm"
                            >
                                <FaSortAmountDown className="text-indigo-500" />
                                <span className="text-gray-500 font-normal">Sort by:</span>
                                {sortBy === 'createdAt' ? 'Date' : 'Rating'}
                                <span className="text-xs text-gray-400">({direction === 'desc' ? (sortBy === 'createdAt' ? 'Newest' : 'Highest') : (sortBy === 'createdAt' ? 'Oldest' : 'Lowest')})</span>
                            </button>

                            {showSortMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden ring-1 ring-black/5">
                                    <div className="p-1">
                                        <button
                                            onClick={() => handleSortChange('createdAt', 'desc')}
                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg flex justify-between items-center ${sortBy === 'createdAt' && direction === 'desc' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            Newest First
                                            {sortBy === 'createdAt' && direction === 'desc' && <FaCheckCircle className="text-indigo-500" />}
                                        </button>
                                        <button
                                            onClick={() => handleSortChange('createdAt', 'asc')}
                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg flex justify-between items-center ${sortBy === 'createdAt' && direction === 'asc' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            Oldest First
                                            {sortBy === 'createdAt' && direction === 'asc' && <FaCheckCircle className="text-indigo-500" />}
                                        </button>
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <button
                                            onClick={() => handleSortChange('ratingValue', 'desc')}
                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg flex justify-between items-center ${sortBy === 'ratingValue' && direction === 'desc' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            Highest Rated
                                            {sortBy === 'ratingValue' && direction === 'desc' && <FaCheckCircle className="text-indigo-500" />}
                                        </button>
                                        <button
                                            onClick={() => handleSortChange('ratingValue', 'asc')}
                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg flex justify-between items-center ${sortBy === 'ratingValue' && direction === 'asc' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            Lowest Rated
                                            {sortBy === 'ratingValue' && direction === 'asc' && <FaCheckCircle className="text-indigo-500" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    key={review.id}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold shadow-inner">
                                            {review.userName ? review.userName.charAt(0).toUpperCase() : <FaUserCircle />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                                        {review.userName || "SmartParker User"}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex text-yellow-400 text-sm">
                                                            <Stars rating={review.ratingValue} />
                                                        </div>
                                                        <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                            {review.ratingValue}.0
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <FaQuoteLeft className="absolute -top-1 -left-2 text-gray-100 text-2xl -z-10" />
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm pl-0 pt-1">
                                                    {review.reviewComment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <FaStar className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-400">No reviews found</h3>
                                <p className="text-gray-400 text-sm">Be the first to rate this spot!</p>
                            </div>
                        )}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-10 gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 bg-gray-50 rounded-lg font-mono">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

function Stars({ rating }) {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(rating) ? "" : "text-gray-300"} />
            ))}
        </>
    )
}
