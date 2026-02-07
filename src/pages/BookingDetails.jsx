import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"

export default function BookingDetails() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/bookings/${id}`
        )

        if (!res.ok) throw new Error()

        const data = await res.json()
        setBooking(data)
      } catch {
        setBooking(null)
      }

      setLoading(false)
    }

    fetchBooking()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-28 px-6">
        {loading ? (
          <p>Loading booking details...</p>
        ) : !booking ? (
          <p className="text-red-500">Booking not found.</p>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6">
              Booking Details
            </h2>

            <p><strong>Parking:</strong> {booking.placeName}</p>
            <p><strong>Date:</strong> {booking.date}</p>
            <p><strong>Time:</strong> {booking.time}</p>
            <p><strong>Vehicle:</strong> {booking.vehicleType}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Amount Paid:</strong> ₹{booking.amount}</p>
          </div>
        )}
      </div>
    </div>
  )
}
