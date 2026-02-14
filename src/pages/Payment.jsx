import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import api from "../utils/api"
import toast from "react-hot-toast"
import {
  FaCreditCard,
  FaRupeeSign,
  FaCalendarAlt,
  FaClock,
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaWallet,
  FaBus,
  FaBolt
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
  // Initialize selected vehicle type if configs exist
  useEffect(() => {
    const initializeSelection = async () => {
      if (spot && spot.vehicleConfigs && spot.vehicleConfigs.length > 0 && !selectedVehicleType) {
        let preferred = null;
        try {
          const res = await api.get("/users/profile");
          if (res.data && res.data.vehicleType) {
            preferred = res.data.vehicleType;
          }
        } catch (err) {
          console.warn("Could not fetch user preference", err);
        }

        const supportedTypes = spot.vehicleConfigs.map(c => c.vehicleType);

        if (preferred && supportedTypes.includes(preferred)) {
          setSelectedVehicleType(preferred);
        } else {
          setSelectedVehicleType(spot.vehicleConfigs[0].vehicleType);
        }
      }
    }
    initializeSelection();
  }, [spot, selectedVehicleType])

  // Calculate Price & Check Availability
  useEffect(() => {
    if (startTime && endTime && spot && selectedVehicleType) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diffMs = end - start
      const totalHours = diffMs / (1000 * 60 * 60)

      // Find config for price
      let pricePerHour = 0;
      let capacity = 0;
      if (spot.vehicleConfigs) {
        const config = spot.vehicleConfigs.find(c => c.vehicleType === selectedVehicleType);
        pricePerHour = config ? Number(config.pricePerHour) : 0;
        capacity = config ? config.capacity : 0;
      } else {
        pricePerHour = spot.pricePerHour ? Number(spot.pricePerHour) : 0;
        capacity = spot.totalCapacity || 0;
      }

      // Dynamic Price Calculation
      if (totalHours > 0) {
        let finalPrice = 0;

        // Validation: Check if we should apply monthly logic
        const isMonthlyPlanAvailable = spot.monthlyPlan;
        const monthlyDiscountPercent = (isMonthlyPlanAvailable && spot.monthlyDiscountPercent)
          ? Number(spot.monthlyDiscountPercent)
          : 0;

        // Validation: Check weekend surcharge
        const weekendSurcharge = spot.weekendSurcharge ? Number(spot.weekendSurcharge) : 0;

        // Pricing Strategy: 30-Day Blocks
        // We calculate hour by hour to be precise with weekends inside the blocks

        let currentBlockCost = 0;
        let hoursInCurrentBlock = 0;
        const HOURS_IN_30_DAYS = 30 * 24; // 720 hours

        // Iterate through each hour of the booking
        let currentPointer = new Date(start);
        // We use a loop for the number of hours. 
        // Note: For very long duration (years), this loop might be heavy, but for parking (months), it's negligible.
        // Math.ceil to treat partial hour as full hour if needed, but usually we calculate exact or floor. 
        // Current logic uses exact float hours for base, but surcharge is usually per started hour.
        // For consistency with "basePrice = hours * price", we will use the exact duration logic but apply surcharge to "weekend hours".

        // To accurately apply surcharge to specific hours, we need to know how many of the requested hours fall on Sat/Sun.
        // Simplified approach: Iterate hour by hour.

        for (let i = 0; i < Math.ceil(totalHours); i++) {
          // Check if this specific hour is a weekend
          // currentPointer is start + i hours
          const checkTime = new Date(start.getTime() + i * 60 * 60 * 1000);
          const day = checkTime.getDay(); // 0 = Sunday, 6 = Saturday
          const isWeekend = (day === 0 || day === 6);

          // Base price for this hour
          // If it's the last partial hour, we could prorate, but standard parking is usually per hour or part thereof.
          // keeping it simple: full price for the hour. 
          // BUT the original logic was `hours * pricePerHour` (float). 
          // To stick to strict "Option 2", we should accumulate cost.

          let hourlyCost = pricePerHour;
          if (isWeekend) {
            hourlyCost += weekendSurcharge;
          }

          currentBlockCost += hourlyCost;
          hoursInCurrentBlock++;

          // Check if we completed a 30-day block
          if (hoursInCurrentBlock >= HOURS_IN_30_DAYS) {
            // Apply discount to this block
            if (monthlyDiscountPercent > 0) {
              finalPrice += currentBlockCost * (1 - monthlyDiscountPercent / 100);
            } else {
              finalPrice += currentBlockCost;
            }

            // Reset for next block
            currentBlockCost = 0;
            hoursInCurrentBlock = 0;
          }
        }

        // Add remaining unfinished block (no discount)
        finalPrice += currentBlockCost;

        setTotalPrice(Math.round(finalPrice));

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">No Booking Data Found</h2>
          <p className="text-gray-500 mt-2">Please go back and select a parking spot.</p>
          <button onClick={() => navigate("/dashboard")} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">Go to Dashboard</button>
        </div>
      </div>
    )
  }

  const handlePaymentProcess = (method) => {
    setProcessing(true)
    setTimeout(() => {
      setPaymentStatus("SUCCESS")
      setPaymentMethod(method)
      setProcessing(false)
      toast.success(`Payment Successful via ${method}`)
    }, 2000)
  }

  const handleConfirmBooking = async () => {
    if (!startTime || !endTime) {
      toast.error("Please select start and end time")
      return
    }

    setProcessing(true)

    try {
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
      toast.success("Booking Confirmed!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Booking Error", error)
      toast.error(error.response?.data?.message || "Booking failed")
    } finally {
      setProcessing(false)
    }
  }

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'CAR': return <FaCar />;
      case 'BIKE': return <FaMotorcycle />;
      case 'TRUCK': return <FaTruck />;
      case 'EV': return <FaBolt />;
      case 'BUS': return <FaBus />;
      default: return <FaCar />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your booking for {spot.name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - BOOKING FORM */}
          <div className="lg:col-span-2 space-y-6">

            {/* SPOT SUMMARY CARD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative group">
                {spot.imageUrls && spot.imageUrls.length > 0 ? (
                  <img
                    src={spot.imageUrls[0].startsWith('http') || spot.imageUrls[0].startsWith('data:')
                      ? spot.imageUrls[0]
                      : `http://localhost:8080${spot.imageUrls[0]}`}
                    alt={spot.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    draggable="false"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaMapMarkerAlt className="text-4xl" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {spot.vehicleConfigs ? (
                    spot.vehicleConfigs.map(config => (
                      <span key={config.vehicleType} className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-gray-700 flex items-center justify-center">
                        {getVehicleIcon(config.vehicleType)}
                      </span>
                    ))
                  ) : (
                    <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-gray-700">Simple</span>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-gray-900">{spot.name}</h3>
                <p className="text-gray-500 mt-1">{spot.address}</p>
                <div className="flex gap-4 mt-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <FaShieldAlt className="text-green-500" /> Secure
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <FaCheckCircle className="text-blue-500" /> CCTV
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Configuration */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-500" /> Date & Time
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Vehicle Selection */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FaCar className="text-indigo-500" /> Vehicle Type
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {spot.vehicleConfigs && spot.vehicleConfigs.length > 0 ? (
                  spot.vehicleConfigs.map(config => (
                    <button
                      key={config.vehicleType}
                      onClick={() => setSelectedVehicleType(config.vehicleType)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${selectedVehicleType === config.vehicleType
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                        }`}
                    >
                      <div className="text-2xl mb-2">{getVehicleIcon(config.vehicleType)}</div>
                      <div className="font-semibold text-sm">{config.vehicleType}</div>
                      <div className="text-xs opacity-70">₹{config.pricePerHour}/hr</div>

                      {selectedVehicleType === config.vehicleType && (
                        <div className="absolute top-2 right-2 text-indigo-600">
                          <FaCheckCircle />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 border border-gray-200 rounded-xl text-center text-gray-500 col-span-3">
                    Standard Rate: ₹{spot.pricePerHour}/hr
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN - STICKY SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Vehicle Type</span>
                    <span className="font-medium text-gray-900">{selectedVehicleType || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Rate per Hour</span>
                    <span className="font-medium text-gray-900">
                      {selectedVehicleType && spot.vehicleConfigs
                        ? `₹${spot.vehicleConfigs.find(c => c.vehicleType === selectedVehicleType)?.pricePerHour}`
                        : `₹${spot.pricePerHour || 0}`
                      }
                    </span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 my-4"></div>

                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                {/* Availability Status */}
                {checkingAvailability && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></span> Checking availability...
                  </div>
                )}

                {!checkingAvailability && availableSlots !== null && (
                  <div className={`mt-4 p-3 rounded-lg text-sm font-medium text-center ${availableSlots > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {availableSlots > 0 ? `${availableSlots} Slots Available` : "No Slots Available"}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                {paymentStatus !== "SUCCESS" ? (
                  <div className="mt-8 space-y-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Select Payment Method</p>
                    <button
                      onClick={() => handlePaymentProcess("UPI")}
                      disabled={processing || totalPrice <= 0 || availableSlots === 0}
                      className="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium transition disabled:opacity-50"
                    >
                      <FaWallet className="text-orange-500" /> Pay via UPI
                    </button>
                    <button
                      onClick={() => handlePaymentProcess("CARD")}
                      disabled={processing || totalPrice <= 0 || availableSlots === 0}
                      className="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium transition disabled:opacity-50"
                    >
                      <FaCreditCard className="text-blue-500" /> Pay via Card
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={processing}
                    className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {processing ? "Confirming..." : "Confirm Booking"} <FaCheckCircle />
                  </button>
                )}

              </div>

              <div className="bg-indigo-50 rounded-xl p-4 text-xs text-indigo-700 leading-relaxed">
                <p><strong>Note:</strong> Free cancellation up to 15 days before booking time.</p>
              </div>

            </div>
          </div>

        </div>

      </main >
    </div >
  )
}
