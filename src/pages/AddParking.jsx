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
    FaCheckCircle,
    FaTruck
} from "react-icons/fa"

export default function AddParking() {
    const user = getCurrentUser()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        state: "",
        district: "",
        address1: "",
        address2: "",
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
        weekendSurcharge: "",
        monthlyDiscountPercent: "",
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
        if (!formData.name || !formData.address1 || !files.parkingAreaImage || !files.gateImage) {
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
            if (key === "vehicleTypes" || key === "vehicleConfigs" || key === "address1" || key === "address2") {
                // Skip direct append
            } else {
                data.append(key, formData[key])
            }
        })

        const fullAddress = formData.address2 ? `${formData.address1}, ${formData.address2}` : formData.address1
        data.append("address", fullAddress)

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
            await api.post("/parking/add", data, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            toast.success("Application Submitted Successfully!")
            navigate("/dashboard")
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || "Failed to submit application.";
            const validationErrors = err.response?.data?.errors
                ? "\n" + err.response.data.errors.join("\n")
                : "";
            toast.error(message + validationErrors, { duration: 5000, style: { minWidth: '300px' } });
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
            <Navbar />
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto pt-24 pb-12 px-6"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3 text-gray-800 dark:text-white">
                        <FaPlusCircle className="text-emerald-600" /> Add New Parking Spot
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Register a new location to start earning</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-xl space-y-8 border border-gray-100 dark:border-gray-700">

                    {/* LOCATION SECTION */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <FaMapMarkedAlt className="text-indigo-500" /> Location Details
                        </h3>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Parking Name</label>
                                <input name="name" placeholder="E.g. City Center Mall Parking" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white" required />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State</label>
                                    <div className="relative">
                                        <select name="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value, district: "" })} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer dark:text-white" required>
                                            <option value="">Select State</option>
                                            {Object.keys(indiaData).map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">District</label>
                                    <div className="relative">
                                        <select name="district" value={formData.district} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer disabled:opacity-50 dark:text-white" required disabled={!formData.state}>
                                            <option value="">Select District</option>
                                            {formData.state && indiaData[formData.state]?.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address Line 1</label>
                                    <input name="address1" placeholder="House/Flat No, Building Name" value={formData.address1} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address Line 2 (Optional)</label>
                                    <input name="address2" placeholder="Street Name, Area, Landmark" value={formData.address2} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                                <textarea name="description" placeholder="Short description of the parking area..." value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white min-h-[100px]" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pincode</label>
                                    <input name="pincode" placeholder="000000" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Maps Link</label>
                                    <input name="googleMapsLink" placeholder="Paste link here" value={formData.googleMapsLink} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white" />
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                    <FaMapMarkedAlt className="mt-1 flex-shrink-0" />
                                    Provide a Google Maps link above, and we'll automatically fetch the Latitude & Longitude for you! Currently showing: <strong>{formData.latitude || "N/A"}, {formData.longitude || "N/A"}</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* IMAGES SECTION */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <FaImages className="text-purple-500" /> Site Images
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Parking Area <span className="text-red-500">*</span></label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
                                    <input type="file" name="parkingAreaImage" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required accept="image/*" />
                                    <FaImages className="mx-auto text-3xl text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{files.parkingAreaImage?.name || "Click to upload"}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Entry Gate <span className="text-red-500">*</span></label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
                                    <input type="file" name="gateImage" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required accept="image/*" />
                                    <FaImages className="mx-auto text-3xl text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{files.gateImage?.name || "Click to upload"}</p>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Surrounding Area (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
                                    <input type="file" name="surroundingImage" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                    <FaImages className="mx-auto text-3xl text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{files.surroundingImage?.name || "Click to upload"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FEATURES SECTION */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <FaLayerGroup className="text-emerald-500" /> Parking Features
                        </h3>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Allowed Vehicles</label>
                            <div className="flex gap-4 flex-wrap">
                                {["CAR", "BIKE", "BUS", "EV", "TRUCK"].map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={(e) => handleVehicleTypeChange(e, type)}
                                        className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 font-bold ${formData.vehicleTypes.includes(type)
                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg transform scale-105"
                                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-emerald-400"}`}
                                    >
                                        {type === "CAR" && <FaCar />}
                                        {type === "BIKE" && <FaMotorcycle />}
                                        {type === "BUS" && <FaBus />}
                                        {type === "EV" && <FaBolt />}
                                        {type === "TRUCK" && <FaTruck />}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Inputs per Vehicle Type */}
                        {formData.vehicleTypes.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 space-y-4">
                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Capacity & Pricing Configuration</h4>
                                {formData.vehicleTypes.map(type => (
                                    <div key={type} className="grid md:grid-cols-3 gap-4 items-end bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 min-w-[100px] text-lg">
                                            {type}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Capacity (Slots)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.vehicleConfigs[type]?.capacity || ""}
                                                onChange={(e) => handleConfigChange(type, "capacity", e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Price (₹/Hr)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={formData.vehicleConfigs[type]?.price || ""}
                                                onChange={(e) => handleConfigChange(type, "price", e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Parking Type</label>
                                <div className="relative">
                                    <select name="parkingType" value={formData.parkingType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer dark:text-white">
                                        <option value="Public">Public</option>
                                        <option value="Private">Private</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Weekend Surcharge (₹/Hr)</label>
                                    <input type="number" name="weekendSurcharge" placeholder="Extra charge per hour on weekends" value={formData.weekendSurcharge} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white" />
                                    <p className="text-xs text-gray-500 mt-1">Added to the base hourly price during weekends.</p>
                                </div>

                                {formData.monthlyPlan && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Monthly Discount (%)</label>
                                        <input type="number" name="monthlyDiscountPercent" placeholder="E.g. 10 for 10% off" value={formData.monthlyDiscountPercent} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white" max="100" />
                                        <p className="text-xs text-gray-500 mt-1">Discount applied to the 30-day total.</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Checkboxes Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {[
                                { name: "monthlyPlan", label: "Monthly Plan", icon: FaCalendarAlt },
                                { name: "covered", label: "Covered Parking", icon: FaUmbrella },
                                { name: "cctv", label: "CCTV Surveillance", icon: FaVideo },
                                { name: "guard", label: "Security Guard", icon: FaUserShield },
                                { name: "evCharging", label: "EV Charging", icon: FaBolt },
                            ].map(feature => (
                                <label key={feature.name} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <input type="checkbox" name={feature.name} checked={formData[feature.name]} onChange={handleInputChange} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                                    <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                                        <feature.icon className="text-gray-400" /> {feature.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-emerald-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3">
                            <FaCheckCircle className="text-2xl" /> Submit & Add Parking Spot
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
