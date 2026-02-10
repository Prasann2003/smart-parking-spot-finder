import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../utils/auth"
import api from "../utils/api"
import toast from "react-hot-toast"
import indiaData from "../utils/indiaData"

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

    const handleVehicleTypeChange = (e) => {
        const { value, checked } = e.target
        setFormData((prev) => {
            const currentTypes = prev.vehicleTypes || []
            if (checked) return { ...prev, vehicleTypes: [...currentTypes, value] }
            return { ...prev, vehicleTypes: currentTypes.filter(t => t !== value) }
        })
    }


    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate
        if (!formData.name || !formData.address || !formData.pricePerHour || !files.parkingAreaImage || !files.gateImage) {
            toast.error("Please fill required fields and upload images")
            return
        }

        const data = new FormData()
        Object.keys(formData).forEach(key => {
            if (key === "vehicleTypes") {
                // Append each vehicle type separately or as comma separated if backend expects list
                // DTO expects Set<String>, so appending multiple times with same key works for Spring
                const types = formData.vehicleTypes.length > 0 ? formData.vehicleTypes : ["Car"]
                types.forEach(t => data.append("vehicleTypes", t))
            } else {
                data.append(key, formData[key])
            }
        })

        // Append files
        data.append("parkingAreaImage", files.parkingAreaImage)
        data.append("gateImage", files.gateImage)
        if (files.surroundingImage) data.append("surroundingImage", files.surroundingImage)

        // Ensure numeric types are appended as strings (FormData standard) but Spring converts them

        try {
            await api.post("/parking/add", data, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            toast.success("Parking Spot Added! 🚗")
            navigate("/dashboard")
        } catch (err) {
            console.error(err)
            toast.error("Failed to add parking spot.")
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto pt-28 pb-12 px-6">
                <h1 className="text-3xl font-bold mb-8">Add New Parking Spot 🅿</h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">

                    {/* NO BANK DETAILS HERE - USER IS ALREADY PROVIDER */}

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Location Details</h3>
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
                        <h3 className="text-xl font-semibold">Images</h3>
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

                    <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">
                        Add Parking Spot
                    </button>
                </form>
            </div>
        </div>
    )
}
