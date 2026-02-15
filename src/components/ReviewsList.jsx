import { useState, useEffect } from "react"
import api from "../utils/api"
import { FaStar } from "react-icons/fa"

export default function ReviewsList({ spotId, limit }) {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await api.get(`/ratings/spot/${spotId}`)
                console.log("🔍 Reviews Response for spot", spotId, ":", res.data)
                setReviews(res.data)
            } catch (err) {
                console.error("Failed to fetch reviews", err)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [spotId])

    if (loading) return <div className="text-center py-4 text-gray-500">Loading reviews...</div>

    if (reviews.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet.</p>
                <p className="text-sm text-gray-400">Be the first to rate this spot!</p>
            </div>
        )
    }

    const displayReviews = limit ? reviews.slice(0, limit) : reviews;

    return (
        <div className="space-y-4">
            {displayReviews.map((review) => (
                <div key={review.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{review.userName || "User"}</p>
                            <div className="flex text-yellow-500 text-xs mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < review.ratingValue ? "" : "text-gray-300 dark:text-gray-600"} />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{review.reviewComment}"</p>
                </div>
            ))}
        </div>
    )
}
