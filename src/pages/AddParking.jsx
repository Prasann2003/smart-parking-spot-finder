import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../utils/auth"
import api from "../utils/api"
import toast from "react-hot-toast"
import indiaData from "../utils/indiaData"
import {
    FaPlusCircle,
    FaMapMarkedAlt,
    FaImages,
    FaLayerGroup,
    FaCar,
    FaMotorcycle,
    FaBus,
    FaBolt,
    FaCalendarAlt,
    FaUmbrella,
    FaVideo,
    FaUserShield,
    FaCheckCircle
} from "react-icons/fa"

export default function AddParking() {
    const user = getCurrentUser()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        state: "",
        district: "",
        address: "",
        pincode: "",
        googleMapsLink: "",
        latitude: "",
        longitude: "",
        covered: false,
        cctv: false,
        guard: false,
        evCharging: false,
        vehicleTypes: [],
        vehicleConfigs: {}, // { Car: { capacity: "", price: "" } }
        parkingType: "Public",
        monthlyPlan: false,
        weekendPricing: "",
        imageUrls: [],
    })

    // Reusing file upload logic if needed, simplified for now

    const [files, setFiles] = useState({
        parkingAreaImage: null,
        gateImage: null,
        surroundingImage: null
    })

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] })
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleVehicleTypeChange = (e, type) => {
        // e might be virtual if called from button click directly
        setFormData((prev) => {
            const isSelected = prev.vehicleTypes.includes(type)
            const newTypes = isSelected
                ? prev.vehicleTypes.filter(t => t !== type)
                : [...prev.vehicleTypes, type]

            const newConfigs = { ...prev.vehicleConfigs }
            if (!isSelected) {
                // Initialize default config if selecting
                let defaultCap = ""
                let defaultPrice = ""
                // Optional defaults
                // if (type === "BIKE") { defaultCap = "20"; defaultPrice = "20"; }
                newConfigs[type] = { capacity: defaultCap, price: defaultPrice }
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


    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate
        if (!formData.name || !formData.address || !files.parkingAreaImage || !files.gateImage) {
            toast.error("Please fill required fields and upload images")
            return
        }

        if (formData.vehicleTypes.length === 0) {
            toast.error("Please select at least one vehicle type")
            return
        }

        // Validate config details
        for (const type of formData.vehicleTypes) {
            const config = formData.vehicleConfigs[type]
            if (!config || !config.capacity || !config.price) {
                toast.error(`Please enter capacity and price for ${type}`)
                return
            }
        }

        const data = new FormData()
        Object.keys(formData).forEach(key => {
            if (key === "vehicleTypes" || key === "vehicleConfigs") {
                // Skip direct append
            } else {
                data.append(key, formData[key])
            }
        })

        // Append vehicleConfigs with indexed keys
        formData.vehicleTypes.forEach((type, index) => {
            const config = formData.vehicleConfigs[type]
            data.append(`vehicleConfigs[${index}].vehicleType`, type)
            data.append(`vehicleConfigs[${index}].capacity`, config.capacity)
            data.append(`vehicleConfigs[${index}].pricePerHour`, config.price)
        })

        // Append files
        data.append("parkingAreaImage", files.parkingAreaImage)
        data.append("gateImage", files.gateImage)
        if (files.surroundingImage) data.append("surroundingImage", files.surroundingImage)

        try {
            await api.post("/provider/add", data, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            toast.success("Application Submitted Successfully!")
            navigate("/dashboard")
        } catch (err) {
            console.error(err)
            toast.error("Failed to submit application.")
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto pt-28 pb-12 px-6">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <FaPlusCircle className="text-emerald-600" /> Add New Parking Spot
                </h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">

                    {/* NO BANK DETAILS HERE - USER IS ALREADY PROVIDER */}

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaMapMarkedAlt className="text-gray-500" /> Location Details
                        </h3>
                        <input name="name" placeholder="Parking Name (e.g. City Center Mall)" value={formData.name} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />

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
                        <div className="grid md:grid-cols-2 gap-4">
                            <input name="latitude" placeholder="Latitude (e.g. 12.9716)" value={formData.latitude} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                            <input name="longitude" placeholder="Longitude (e.g. 77.5946)" value={formData.longitude} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                        </div>
                        <p className="text-xs text-gray-500">Provide Google Maps Link OR Latitude/Longitude for map pinpointing.</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FaImages className="text-gray-500" /> Images
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Parking Area *</label>
                                <input type="file" name="parkingAreaImage" onChange={handleFileChange} className="w-full p-2 border rounded" required accept="image/*" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Entry Gate *</label>
                                <input type="file" name="gateImage" onChange={handleFileChange} className="w-full p-2 border rounded" required accept="image/*" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Surrounding Area (Optional)</label>
                                <input type="file" name="surroundingImage" onChange={handleFileChange} className="w-full p-2 border rounded" accept="image/*" />
                            </div>
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
                                        className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${formData.vehicleTypes.includes(type) ? "bg-emerald-600 text-white" : "bg-gray-100"}`}
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
                                        <div className="font-bold text-emerald-700 flex items-center gap-2 min-w-[80px]">
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
                            <input type="number" name="weekendPricing" placeholder="Special Weekend Price (Optional Base)" value={formData.weekendPricing} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                        </div>

                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="monthlyPlan" checked={formData.monthlyPlan} onChange={handleInputChange} className="w-5 h-5 rounded text-emerald-600" />
                                <FaCalendarAlt className="text-gray-500" /> Monthly Plan Available
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="covered" checked={formData.covered} onChange={handleInputChange} className="w-5 h-5 rounded text-emerald-600" />
                                <FaUmbrella className="text-gray-500" /> Covered Parking
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="cctv" checked={formData.cctv} onChange={handleInputChange} className="w-5 h-5 rounded text-emerald-600" />
                                <FaVideo className="text-gray-500" /> CCTV Surveillance
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="guard" checked={formData.guard} onChange={handleInputChange} className="w-5 h-5 rounded text-emerald-600" />
                                <FaUserShield className="text-gray-500" /> Security Guard
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="evCharging" checked={formData.evCharging} onChange={handleInputChange} className="w-5 h-5 rounded text-emerald-600" />
                                <FaBolt className="text-gray-500" /> EV Charging
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                        <FaCheckCircle /> Add Parking Spot
                    </button>
                </form>
            </div>
        </div>
    )
}
