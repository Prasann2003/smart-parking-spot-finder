import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaTimes } from 'react-icons/fa'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function RatingModal({ isOpen, onClose, bookingId, onSuccess }) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error("Please select a star rating")
            return
        }

        setSubmitting(true)
        try {
            await api.post("/ratings", { // Assuming controller is at /api/ratings
                bookingId: bookingId,
                ratingValue: rating,
                reviewComment: comment
            })
            toast.success("Rating submitted!")
            onSuccess()
            onClose()
        } catch (err) {
            console.error(err)
            toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to submit rating")
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rate your Experience</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="text-3xl focus:outline-none transition-colors"
                                >
                                    <FaStar
                                        className={
                                            star <= (hover || rating)
                                                ? "text-yellow-400"
                                                : "text-gray-300 dark:text-gray-600"
                                        }
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32 mb-6"
                            placeholder="Share your feedback (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting..." : "Submit Rating"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
