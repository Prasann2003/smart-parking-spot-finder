import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import api from "../utils/api"

export default function BookingDetails() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`)
        setBooking(res.data)
      } catch (err) {
        console.error("Failed to fetch booking", err)
        setBooking(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!booking) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center h-screen text-red-500">Booking not found</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-28 px-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 dark:text-white">
            Booking Details #{booking.id}
          </h2>

          <div className="space-y-4 text-lg dark:text-gray-300">
            <p><strong>📍 Parking:</strong> {booking.parkingSpotName}</p>
            <p><strong>🕒 Booked At:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
            <p><strong>📅 Start Time:</strong> {new Date(booking.startTime).toLocaleString()}</p>
            <p><strong>📅 End Time:</strong> {new Date(booking.endTime).toLocaleString()}</p>
            <p><strong>💰 Amount Paid:</strong> ₹{booking.totalPrice}</p>
            <p><strong>💳 Payment Method:</strong> {booking.paymentMethod || "N/A"}</p>
            <p>
              <strong>⚡ Status:</strong>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                {booking.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
