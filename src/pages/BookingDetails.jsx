import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import api from "../utils/api"
import {
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaBolt
} from "react-icons/fa"

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
            <p className="flex items-center gap-2"><strong><FaMapMarkerAlt className="text-red-500" /> Parking:</strong> {booking.parkingSpotName}</p>
            <p className="flex items-center gap-2"><strong><FaClock className="text-gray-500" /> Booked At:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
            <p className="flex items-center gap-2"><strong><FaCalendarAlt className="text-indigo-500" /> Start Time:</strong> {new Date(booking.startTime).toLocaleString()}</p>
            <p className="flex items-center gap-2"><strong><FaCalendarAlt className="text-indigo-500" /> End Time:</strong> {new Date(booking.endTime).toLocaleString()}</p>
            <p className="flex items-center gap-2"><strong><FaMoneyBillWave className="text-green-500" /> Amount Paid:</strong> ₹{booking.totalPrice}</p>
            <p className="flex items-center gap-2"><strong><FaCreditCard className="text-blue-500" /> Payment Method:</strong> {booking.paymentMethod || "N/A"}</p>
            <p className="flex items-center gap-2">
              <strong><FaBolt className="text-yellow-500" /> Status:</strong>
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
