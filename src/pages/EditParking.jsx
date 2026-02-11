import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { getCurrentUser } from "../utils/auth"
import api, { updateSpot } from "../utils/api"
import toast from "react-hot-toast"
import indiaData from "../utils/indiaData"

export default function EditParking() {
    const user = getCurrentUser()
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        state: "",
        district: "",
        address: "",
        pincode: "",
        googleMapsLink: "",
        latitude: "",
        longitude: "",
        totalCapacity: "",
        pricePerHour: "",
        covered: false,
        cctv: false,
        guard: false,
        evCharging: false,
        vehicleTypes: [],
        parkingType: "Public",
        monthlyPlan: false,
        weekendPricing: "",
    })

    useEffect(() => {
        if (location.state?.spot) {
            const spot = location.state.spot
            setFormData({
                name: spot.name || "",
                description: spot.description || "",
                state: spot.state || "",
                district: spot.district || "",
                address: spot.address || "",
                pincode: spot.pincode || "",
                googleMapsLink: spot.googleMapsLink || "",
                latitude: spot.latitude || "",
                longitude: spot.longitude || "",
                totalCapacity: spot.totalCapacity || "",
                pricePerHour: spot.pricePerHour || "",
                covered: spot.covered || false,
                cctv: spot.cctv || false,
                guard: spot.guard || false,
                evCharging: spot.evCharging || false,
                vehicleTypes: spot.vehicleTypes || [],
                parkingType: spot.parkingType || "Public",
                monthlyPlan: spot.monthlyPlan || false,
                weekendPricing: spot.weekendPricing || "",
            })
        } else {
            // Fetch if not provided in state
            const fetchSpot = async () => {
                try {
                    const res = await api.get(`/provider/view/${id}`)
                    const spot = res.data
                    setFormData({
                        name: spot.name || "",
                        description: spot.description || "",
                        state: spot.state || "",
                        district: spot.district || "",
                        address: spot.address || "",
                        pincode: spot.pincode || "",
                        googleMapsLink: spot.googleMapsLink || "",
                        latitude: spot.latitude || "",
                        longitude: spot.longitude || "",
                        totalCapacity: spot.totalCapacity || "",
                        pricePerHour: spot.pricePerHour || "",
                        covered: spot.covered || false,
                        cctv: spot.cctv || false,
                        guard: spot.guard || false,
                        evCharging: spot.evCharging || false,
                        vehicleTypes: spot.vehicleTypes || [],
                        parkingType: spot.parkingType || "Public",
                        monthlyPlan: spot.monthlyPlan || false,
                        weekendPricing: spot.weekendPricing || "",
                    })
                } catch (err) {
                    console.error("Failed to fetch spot", err)
                    toast.error("Could not load parking spot details")
                    navigate("/dashboard")
                }
            }
            fetchSpot()
        }
    }, [id, location.state, navigate])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.name || !formData.state || !formData.district || !formData.address || !formData.pincode || !formData.pricePerHour || !formData.totalCapacity) {
            toast.error("Please fill all required fields")
            return
        }

        if (formData.vehicleTypes.length === 0) {
            toast.error("Please select at least one vehicle type")
            return
        }

        const payload = {
            ...formData,
            // Ensure numbers are actually numbers
            totalCapacity: Number(formData.totalCapacity),
            pricePerHour: Number(formData.pricePerHour),
            // Optional numerics
            weekendPricing: formData.weekendPricing ? Number(formData.weekendPricing) : null,
            latitude: formData.latitude ? Number(formData.latitude) : null,
            longitude: formData.longitude ? Number(formData.longitude) : null,
        }

        console.log("Sending Payload:", JSON.stringify(payload, null, 2)) // Debug log

        const res = await updateSpot(id, payload)
        if (res) {
            navigate("/dashboard")
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto pt-28 pb-12 px-6">
                <h1 className="text-3xl font-bold mb-8">Edit Parking Spot ✏️</h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Location Details</h3>
                        <input name="name" placeholder="Parking Name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />

                        <textarea name="description" placeholder="Description (Optional)" value={formData.description} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />

                        <div className="grid md:grid-cols-2 gap-4">
                            <select name="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value, district: "" })} className="w-full p-3 border rounded-lg" required>
                                <option value="">Select State</option>
                                {Object.keys(indiaData).map(state => <option key={state} value={state}>{state}</option>)}
                            </select>

                            <select name="district" value={formData.district} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required disabled={!formData.state}>
                                <option value="">Select District</option>
                                {formData.state && indiaData[formData.state]?.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                            </select>
                        </div>

                        <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                        <div className="grid md:grid-cols-2 gap-4">
                            <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                            <input name="googleMapsLink" placeholder="Google Maps Link" value={formData.googleMapsLink} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Parking Features</h3>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Vehicle Types Allowed</label>
                            <div className="flex gap-3 flex-wrap">
                                {["Car", "Bike", "Bus", "EV"].map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            vehicleTypes: prev.vehicleTypes.includes(type)
                                                ? prev.vehicleTypes.filter(t => t !== type)
                                                : [...prev.vehicleTypes, type]
                                        }))}
                                        className={`px-4 py-2 rounded-lg border transition ${formData.vehicleTypes.includes(type) ? "bg-emerald-600 text-white" : "bg-gray-100"}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <select name="parkingType" value={formData.parkingType} onChange={handleInputChange} className="w-full p-3 border rounded-lg">
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                            <input type="number" name="totalCapacity" placeholder="Total Capacity" value={formData.totalCapacity} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="number" name="pricePerHour" placeholder="Price Per Hour (₹)" value={formData.pricePerHour} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
                            <input type="number" name="weekendPricing" placeholder="Special Weekend Price (₹)" value={formData.weekendPricing} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                        </div>

                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="monthlyPlan" checked={formData.monthlyPlan} onChange={handleInputChange} /> Monthly Plan Available
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="covered" checked={formData.covered} onChange={handleInputChange} /> Covered Parking
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="cctv" checked={formData.cctv} onChange={handleInputChange} /> CCTV Surveillance
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="guard" checked={formData.guard} onChange={handleInputChange} /> Security Guard
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="evCharging" checked={formData.evCharging} onChange={handleInputChange} /> EV Charging
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                        Update Parking Spot
                    </button>
                    <button type="button" onClick={() => navigate("/dashboard")} className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 transition">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}
