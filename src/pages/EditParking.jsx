import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { getCurrentUser } from "../utils/auth"
import api, { updateSpot } from "../utils/api"
import toast from "react-hot-toast"
import indiaData from "../utils/indiaData"
import {
    FaEdit,
    FaMapMarkedAlt,
    FaLayerGroup,
    FaCar,
    FaMotorcycle,
    FaBus,
    FaBolt,
    FaCalendarAlt,
    FaUmbrella,
    FaVideo,
    FaUserShield,
    FaTimes,
    FaSave
} from "react-icons/fa"

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
        // totalCapacity: "", // Removed
        // pricePerHour: "", // Removed
        covered: false,
        cctv: false,
        guard: false,
        evCharging: false,
        vehicleTypes: [],
        vehicleConfigs: {}, // { Car: { capacity: 10, price: 50 }, ... }
        parkingType: "Public",
        monthlyPlan: false,
        weekendSurcharge: "",
        monthlyDiscountPercent: "",
    })

    useEffect(() => {
        const populateData = (spot) => {
            // Map list of configs to object for UI state
            const configsMap = {};
            const types = [];

            if (spot.vehicleConfigs) {
                spot.vehicleConfigs.forEach(c => {
                    types.push(c.vehicleType);
                    configsMap[c.vehicleType] = {
                        capacity: c.capacity,
                        price: c.pricePerHour
                    };
                });
            } else if (spot.vehicleTypes) {
                // Fallback for old data if any
                spot.vehicleTypes.forEach(t => {
                    types.push(t);
                    configsMap[t] = {
                        capacity: spot.totalCapacity || "",
                        price: spot.pricePerHour || ""
                    };
                });
            }

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
                // totalCapacity: spot.totalCapacity || "",
                // pricePerHour: spot.pricePerHour || "",
                covered: spot.covered || false,
                cctv: spot.cctv || false,
                guard: spot.guard || false,
                evCharging: spot.evCharging || false,
                vehicleTypes: types,
                vehicleConfigs: configsMap,
                parkingType: spot.parkingType || "Public",
                monthlyPlan: spot.monthlyPlan || false,
                weekendSurcharge: spot.weekendSurcharge || "",
                monthlyDiscountPercent: spot.monthlyDiscountPercent || "",
            })
        }

        if (location.state?.spot) {
            populateData(location.state.spot)
        } else {
            // Fetch if not provided in state
            const fetchSpot = async () => {
                try {
                    const res = await api.get(`/provider/view/${id}`)
                    populateData(res.data)
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

    const handleVehicleTypeChange = (e, type) => {
        setFormData((prev) => {
            const isSelected = prev.vehicleTypes.includes(type)
            const newTypes = isSelected
                ? prev.vehicleTypes.filter(t => t !== type)
                : [...prev.vehicleTypes, type]

            const newConfigs = { ...prev.vehicleConfigs }
            if (!isSelected) {
                // Initialize default
                newConfigs[type] = { capacity: "", price: "" }
            } else {
                delete newConfigs[type]
            }

            return { ...prev, vehicleTypes: newTypes, vehicleConfigs: newConfigs }
        })
    }

    const handleConfigChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            vehicleConfigs: {
                ...prev.vehicleConfigs,
                [type]: {
                    ...prev.vehicleConfigs[type],
                    [field]: value
                }
            }
        }))
    }

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return;

        // Validation
        if (!formData.name || !formData.state || !formData.district || !formData.address || !formData.pincode) {
            toast.error("Please fill all required fields")
            return
        }

        if (formData.vehicleTypes.length === 0) {
            toast.error("Please select at least one vehicle type")
            return
        }

        // Validate Configs
        for (const type of formData.vehicleTypes) {
            const config = formData.vehicleConfigs[type];
            if (!config || !config.capacity || !config.price) {
                toast.error(`Please enter capacity and price for ${type}`);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // Map configs map back to list
            const vehicleConfigsList = formData.vehicleTypes.map(type => ({
                vehicleType: type,
                capacity: Number(formData.vehicleConfigs[type].capacity),
                pricePerHour: Number(formData.vehicleConfigs[type].price)
            }));

            const payload = {
                ...formData,
                // Remove flat fields
                totalCapacity: undefined,
                pricePerHour: undefined,
                // Add list
                vehicleConfigs: vehicleConfigsList,

                // Ensure numbers
                weekendSurcharge: formData.weekendSurcharge ? Number(formData.weekendSurcharge) : null,
                monthlyDiscountPercent: formData.monthlyDiscountPercent ? Number(formData.monthlyDiscountPercent) : null,
                latitude: formData.latitude ? Number(formData.latitude) : null,
                longitude: formData.longitude ? Number(formData.longitude) : null,
            }

            // Remove the internal map from payload if not needed by backend (it is ignored if unknown property usually, but cleaner to remove)
            delete payload.vehicleConfigsMap;

            console.log("Sending Payload:", JSON.stringify(payload, null, 2)) // Debug log

            const res = await updateSpot(id, payload)
            if (res) {
                toast.success("Parking spot updated successfully!");
                navigate("/dashboard")
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update parking spot. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto pt-28 pb-12 px-6">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <FaEdit className="text-indigo-600" /> Edit Parking Spot
                </h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaMapMarkedAlt className="text-gray-500" /> Location Details
                        </h3>
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
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaLayerGroup className="text-gray-500" /> Parking Features
                        </h3>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Select Vehicle Types Allowed</label>
                            <div className="flex gap-3 flex-wrap mb-4">
                                {["CAR", "BIKE", "BUS", "EV"].map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={(e) => handleVehicleTypeChange(e, type)}
                                        className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${formData.vehicleTypes.includes(type) ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
                                    >
                                        {type === "CAR" && <FaCar />}
                                        {type === "BIKE" && <FaMotorcycle />}
                                        {type === "BUS" && <FaBus />}
                                        {type === "EV" && <FaBolt />}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Inputs per Vehicle Type */}
                        {formData.vehicleTypes.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border">
                                <h4 className="font-medium text-gray-700">Capacity & Pricing details</h4>
                                {formData.vehicleTypes.map(type => (
                                    <div key={type} className="grid md:grid-cols-3 gap-4 items-end bg-white p-3 rounded shadow-sm">
                                        <div className="font-bold text-indigo-700 flex items-center gap-2 min-w-[80px]">
                                            {type}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Capacity</label>
                                            <input
                                                type="number"
                                                placeholder="Slots"
                                                value={formData.vehicleConfigs[type]?.capacity || ""}
                                                onChange={(e) => handleConfigChange(type, "capacity", e.target.value)}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Price/Hr (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="₹"
                                                value={formData.vehicleConfigs[type]?.price || ""}
                                                onChange={(e) => handleConfigChange(type, "price", e.target.value)}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <select name="parkingType" value={formData.parkingType} onChange={handleInputChange} className="w-full p-3 border rounded-lg">
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                            <input type="number" name="weekendSurcharge" placeholder="Weekend Surcharge (₹/Hr)" value={formData.weekendSurcharge} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                        </div>

                        {formData.monthlyPlan && (
                            <div className="mt-4">
                                <label className="block text-sm font-semibold mb-2">Monthly Plan Settings</label>
                                <input type="number" name="monthlyDiscountPercent" placeholder="Monthly Discount (%)" value={formData.monthlyDiscountPercent} onChange={handleInputChange} className="w-full p-3 border rounded-lg" max="100" />
                                <p className="text-xs text-gray-500 mt-1">Percentage discount applied to the 30-day total price.</p>
                            </div>
                        )}

                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="monthlyPlan" checked={formData.monthlyPlan} onChange={handleInputChange} className="w-5 h-5 rounded text-indigo-600" />
                                <FaCalendarAlt className="text-gray-500" /> Monthly Plan Available
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="covered" checked={formData.covered} onChange={handleInputChange} className="w-5 h-5 rounded text-indigo-600" />
                                <FaUmbrella className="text-gray-500" /> Covered Parking
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="cctv" checked={formData.cctv} onChange={handleInputChange} className="w-5 h-5 rounded text-indigo-600" />
                                <FaVideo className="text-gray-500" /> CCTV Surveillance
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="guard" checked={formData.guard} onChange={handleInputChange} className="w-5 h-5 rounded text-indigo-600" />
                                <FaUserShield className="text-gray-500" /> Security Guard
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="evCharging" checked={formData.evCharging} onChange={handleInputChange} className="w-5 h-5 rounded text-indigo-600" />
                                <FaBolt className="text-gray-500" /> EV Charging
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 
                        ${isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : (
                            <>
                                <FaSave /> Update Parking Spot
                            </>
                        )}
                    </button>
                    <button type="button" onClick={() => navigate("/dashboard")} disabled={isSubmitting} className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 transition flex items-center justify-center gap-2">
                        <FaTimes /> Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}
