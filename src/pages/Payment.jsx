import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import api from "../utils/api"
import toast from "react-hot-toast"
import {
  FaCreditCard,
  FaRupeeSign,
  FaParking,
  FaCheckCircle,
  FaMinusCircle,
  FaStar,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa"

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()

  const spot = location.state?.spot

  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState("PENDING") // PENDING, SUCCESS

  const [selectedVehicleType, setSelectedVehicleType] = useState(null)

  const [availableSlots, setAvailableSlots] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Initialize selected vehicle type if configs exist
  useEffect(() => {
    if (spot && spot.vehicleConfigs && spot.vehicleConfigs.length > 0 && !selectedVehicleType) {
      setSelectedVehicleType(spot.vehicleConfigs[0].vehicleType)
    }
  }, [spot, selectedVehicleType])

  // Calculate Price & Check Availability
  useEffect(() => {
    if (startTime && endTime && spot && selectedVehicleType) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const hours = (end - start) / (1000 * 60 * 60)

      // Find config for price
      let pricePerHour = 0;
      if (spot.vehicleConfigs) {
        const config = spot.vehicleConfigs.find(c => c.vehicleType === selectedVehicleType);
        pricePerHour = config ? config.pricePerHour : 0;
      } else {
        pricePerHour = spot.pricePerHour || 0;
      }

      if (hours > 0) {
        setTotalPrice(Math.round(hours * pricePerHour))

        // Check Availability
        const checkAvailability = async () => {
          setCheckingAvailability(true)
          try {
            const formattedStart = startTime.replace("T", " ") + ":00"
            const formattedEnd = endTime.replace("T", " ") + ":00"

            const res = await api.get(`/bookings/check-availability?parkingSpotId=${spot.id}&startTime=${formattedStart}&endTime=${formattedEnd}&vehicleType=${selectedVehicleType}`)
            setAvailableSlots(res.data)
          } catch (err) {
            console.error("Availability check failed", err)
            setAvailableSlots(0) // Assume 0 on error
          } finally {
            setCheckingAvailability(false)
          }
        }
        checkAvailability()

      } else {
        setTotalPrice(0)
        setAvailableSlots(null)
      }
    }
  }, [startTime, endTime, spot, selectedVehicleType])

  if (!spot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No parking data found.</p>
      </div>
    )
  }

  const handlePayment = async () => {
    if (!startTime || !endTime) {
      toast.error("Please select start and end time")
      return
    }

    setProcessing(true)

    try {
      // Format date to match backend expectation: "yyyy-MM-dd HH:mm:ss"
      // Input gives "yyyy-MM-ddThh:mm"
      const formattedStart = startTime.replace("T", " ") + ":00"
      const formattedEnd = endTime.replace("T", " ") + ":00"

      const payload = {
        parkingSpotId: spot.id,
        startTime: formattedStart,
        endTime: formattedEnd,
        paymentMethod: paymentMethod,
        vehicleType: selectedVehicleType
      }

      await api.post("/bookings/create", payload)
      toast.success("Booking Successful!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Booking Error", error)
      toast.error(error.response?.data?.message || "Booking failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto pt-28 px-6"
      >
        <div className="bg-white p-10 rounded-3xl shadow-2xl">

          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <FaCreditCard className="text-indigo-600" /> Complete Your Booking
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            {/* LEFT: DETAILS */}
            <div>
              {/* PARKING SUMMARY */}
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-semibold">
                  {spot.name}
                </h3>
                <p className="text-gray-600">{spot.address}</p>

                {/* Vehicle Selector */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">Select Vehicle Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {spot.vehicleConfigs && spot.vehicleConfigs.map(config => (
                      <button
                        key={config.vehicleType}
                        onClick={() => setSelectedVehicleType(config.vehicleType)}
                        className={`px-3 py-1 rounded border text-sm ${selectedVehicleType === config.vehicleType ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                      >
                        {config.vehicleType} (₹{config.pricePerHour}/hr)
                      </button>
                    ))}
                    {(!spot.vehicleConfigs || spot.vehicleConfigs.length === 0) && (
                      <span className="text-sm text-gray-500">Standard (₹{spot.pricePerHour}/hr)</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="flex items-center gap-2">
                    {/* Price is shown in selector or calculated below */}
                  </p>
                  {/* <p className="flex items-center gap-2"><FaParking className="text-blue-600" /> Total Capacity: {spot.totalCapacity}</p> */}
                  {availableSlots !== null && (
                    <p className={`font-bold flex items-center gap-2 ${availableSlots > 0 ? "text-green-600" : "text-red-500"}`}>
                      Authorization Status: {availableSlots > 0 ? <><FaCheckCircle /> {availableSlots} Slots Available</> : <><FaMinusCircle /> Fully Booked</>}
                    </p>
                  )}
                  <p className="flex items-center gap-2"><FaStar className="text-yellow-400" /> Rating: {spot.rating || "N/A"}</p>
                </div>
              </div>

              {/* TIME SELECTION */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 flex items-center gap-2"><FaCalendarAlt /> Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border p-3 rounded-lg"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 flex items-center gap-2"><FaClock /> End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border p-3 rounded-lg"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: PAYMENT */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FaFileInvoiceDollar /> Payment Summary</h3>
                <div className="flex justify-between text-lg mb-2">
                  <span>Rate</span>
                  <span>
                    {selectedVehicleType && spot.vehicleConfigs
                      ? `₹${spot.vehicleConfigs.find(c => c.vehicleType === selectedVehicleType)?.pricePerHour}/hr`
                      : `₹${spot.pricePerHour || 0}/hr`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-xl font-extrabold border-t pt-4">
                  <span>Total Amount</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <button
                  onClick={() => {
                    setProcessing(true);
                    setTimeout(() => {
                      setPaymentStatus("SUCCESS");
                      setPaymentMethod("UPI");
                      setProcessing(false);
                      toast.success("Payment Received via UPI");
                    }, 2000);
                  }}
                  disabled={availableSlots === 0 || checkingAvailability || paymentStatus === "SUCCESS"}
                  className={`w-full py-3 text-white rounded-xl hover:bg-opacity-90 disabled:bg-gray-400 flex items-center justify-center gap-2 ${paymentMethod === 'UPI' ? 'bg-green-600' : 'bg-indigo-600'}`}>
                  {paymentMethod === 'UPI' ? <><FaCheckCircle /> Paid via UPI</> : 'Pay via UPI'}
                </button>

                <button
                  onClick={() => {
                    setProcessing(true);
                    setTimeout(() => {
                      setPaymentStatus("SUCCESS");
                      setPaymentMethod("CARD");
                      setProcessing(false);
                      toast.success("Payment Received via Card");
                    }, 2000);
                  }}
                  disabled={availableSlots === 0 || checkingAvailability || paymentStatus === "SUCCESS"}
                  className={`w-full py-3 text-white rounded-xl hover:bg-opacity-90 disabled:bg-gray-400 flex items-center justify-center gap-2 ${paymentMethod === 'CARD' ? 'bg-green-600' : 'bg-emerald-600'}`}>
                  {paymentMethod === 'CARD' ? <><FaCheckCircle /> Paid via Card</> : 'Pay via Card'}
                </button>

                <button
                  onClick={handlePayment}
                  disabled={processing || totalPrice <= 0 || availableSlots === 0 || checkingAvailability || paymentStatus !== "SUCCESS"}
                  className="mt-4 w-full py-4 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {checkingAvailability ? "Checking..." :
                    availableSlots === 0 ? "Unavailable 🚫" :
                      processing ? "Processing..." :
                        paymentStatus === "SUCCESS" ? "Confirm Booking (Paid)" : "Completing Payment..."}
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
