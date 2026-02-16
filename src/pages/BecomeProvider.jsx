import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import indiaData from "../utils/indiaData"
import api from "../utils/api"
import toast from "react-hot-toast"
import { isLoggedIn, getCurrentUser } from "../utils/auth"
import {
  FaUser,
  FaMapMarkedAlt,
  FaCar,
  FaMotorcycle,
  FaBus,
  FaBolt,
  FaMoneyBillWave,
  FaImages,
  FaUniversity,
  FaCheckCircle,
  FaRocket,
  FaShieldAlt,
  FaIdCard,
  FaTruck,
  FaTrash,
  FaExternalLinkAlt
} from "react-icons/fa"

export default function BecomeProvider() {
  const navigate = useNavigate()

  // 🔒 Auth Check
  useEffect(() => {
    if (!isLoggedIn()) {
      toast.error("Please login to become a provider")
      navigate("/auth")
    }
  }, [navigate])

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    governmentId: "",
    state: "",
    district: "",
    address1: "",
    address2: "",
    pincode: "",
    mapsLink: "",
    vehicleTypes: [],
    vehicleConfigs: {}, // { CAR: { capacity: "", price: "" } }
    parkingType: "Covered",
    cctv: false,
    guard: false,
    evCharging: false,
    monthlyPlan: false,
    weekendSurcharge: "",
    monthlyDiscountPercent: "",
    bankAccount: "",
    upi: "",
    gst: "",
    pan: "",
    declaration: false,
  })

  // Pre-fill user data
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phoneNumber || ""
      }))
    }
  }, [])

  const [images, setImages] = useState({
    parkingArea: { file: null, preview: null },
    entryGate: { file: null, preview: null },
    surrounding: { file: null, preview: null }
  })

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = (e, key) => {
    const file = e.target.files[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setImages(prev => ({
        ...prev,
        [key]: { file, preview: previewUrl }
      }))
    }
  }

  const handleRemoveFile = (key) => {
    setImages(prev => {
      if (prev[key].preview) {
        URL.revokeObjectURL(prev[key].preview) // Cleanup memory
      }
      return { ...prev, [key]: { file: null, preview: null } }
    })
  }

  const handleVehicleTypeChange = (type) => {
    setForm((prev) => {
      const isSelected = prev.vehicleTypes.includes(type)
      const newTypes = isSelected
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type]

      const newConfigs = { ...prev.vehicleConfigs }
      if (!isSelected) {
        newConfigs[type] = { capacity: "", price: "" }
      } else {
        delete newConfigs[type]
      }

      return { ...prev, vehicleTypes: newTypes, vehicleConfigs: newConfigs }
    })
  }

  const handleConfigChange = (type, field, value) => {
    setForm(prev => ({
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
    setLoading(true)

    try {
      if (!form.declaration) {
        toast.error("Please accept the declaration.")
        setLoading(false)
        return
      }

      const formData = new FormData()

      // Simple Fields
      formData.append("name", form.name)
      formData.append("phoneNumber", form.phone) // Mapped to phoneNumber
      formData.append("email", form.email)
      formData.append("governmentId", form.governmentId) // Check if DTO has this
      formData.append("state", form.state)
      formData.append("district", form.district)
      // Address string logic? DTO has 'address'. Form has address1, address2
      const fullAddress = `${form.address1}, ${form.address2}`
      formData.append("address", fullAddress)
      formData.append("pincode", form.pincode)
      if (form.mapsLink) formData.append("googleMapsLink", form.mapsLink)

      formData.append("parkingType", form.parkingType)
      // Derive 'covered' from parkingType
      const isCovered = ["Covered", "Basement"].includes(form.parkingType);
      formData.append("covered", isCovered);

      formData.append("cctv", form.cctv)
      formData.append("guard", form.guard)
      formData.append("evCharging", form.evCharging)
      formData.append("monthlyPlan", form.monthlyPlan)

      // Handle Optionals and Formatting
      if (form.weekendSurcharge) formData.append("weekendSurcharge", parseFloat(form.weekendSurcharge) || 0)
      if (form.monthlyDiscountPercent) formData.append("monthlyDiscountPercent", parseFloat(form.monthlyDiscountPercent) || 0)

      formData.append("bankAccount", form.bankAccount || "")
      formData.append("upiId", form.upi || "")
      if (form.gst) formData.append("gstNumber", form.gst)
      formData.append("panNumber", form.pan || "")

      // Vehicle Configs (List)
      const vehicleConfigsList = form.vehicleTypes.map(type => ({
        vehicleType: type,
        capacity: parseInt(form.vehicleConfigs[type]?.capacity || "0"),
        pricePerHour: parseFloat(form.vehicleConfigs[type]?.price || "0")
      }));

      vehicleConfigsList.forEach((config, index) => {
        formData.append(`vehicleConfigs[${index}].vehicleType`, config.vehicleType);
        formData.append(`vehicleConfigs[${index}].capacity`, config.capacity);
        formData.append(`vehicleConfigs[${index}].pricePerHour`, config.pricePerHour);
      });

      // Files
      if (images.parkingArea.file) formData.append("parkingAreaImage", images.parkingArea.file)
      if (images.entryGate.file) formData.append("entryGateImage", images.entryGate.file)
      if (images.surrounding.file) formData.append("surroundingAreaImage", images.surrounding.file)

      await api.post("/provider/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Application Submitted Successfully!")
      navigate("/dashboard")
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || "Submission failed";
      const validationErrors = error.response?.data?.errors
        ? "\n" + error.response.data.errors.join("\n")
        : "";
      toast.error(message + validationErrors, { duration: 5000, style: { minWidth: '300px' } });
    } finally {
      setLoading(false)
    }
  }

  const isVehicleSelected = (type) => form.vehicleTypes.includes(type)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto pt-28 px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            Become a Parking Partner
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monetize your empty space. Join our network of secure, intelligent parking spots and start earning today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">

          {/* STEP PROGRESS */}
          <div className="flex justify-between items-center mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-10 rounded-full"></div>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]" : "bg-gray-800 text-gray-400 border border-gray-600"
                  }`}
              >
                {s}
              </div>
            ))}
          </div>

          {/* STEP 1: PERSONAL & LOCATION */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
                <FaUser /> Personal & Location Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                <InputGroup label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                <InputGroup label="Email Address" name="email" value={form.email} onChange={handleChange} type="email" placeholder="john@example.com" />
                <InputGroup label="Government ID (Aadhaar/Voter ID)" name="governmentId" value={form.governmentId} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" icon={<FaIdCard />} />
              </div>

              <div className="border-t border-gray-700 pt-8">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-300">
                  <FaMapMarkedAlt /> Address
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                    >
                      <option value="">Select State</option>
                      {Object.keys(indiaData).map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">District</label>
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                    >
                      <option value="">Select District</option>
                      {form.state && indiaData[form.state]?.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  <InputGroup label="Address Line 1" name="address1" value={form.address1} onChange={handleChange} placeholder="Street, Sector..." />
                  <InputGroup label="Address Line 2" name="address2" value={form.address2} onChange={handleChange} placeholder="Landmark..." />
                  <InputGroup label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="110001" />
                  <div className="relative">
                    <InputGroup label="Google Maps Link" name="mapsLink" value={form.mapsLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." />
                    {form.mapsLink && (
                      <a
                        href={form.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-9 right-3 text-cyan-500 hover:text-cyan-400 p-2"
                        title="Test Map Link"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition shadow-lg shadow-cyan-500/20">Next Step</button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PARKING DETAILS & PRICING */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
                <FaCar /> Parking Configuration
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-4">Supported Vehicles</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { type: "CAR", icon: <FaCar /> },
                    { type: "BIKE", icon: <FaMotorcycle /> },
                    { type: "EV", icon: <FaBolt /> },
                    { type: "BUS", icon: <FaBus /> },
                    { type: "TRUCK", icon: <FaTruck /> }
                  ].map(({ type, icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleVehicleTypeChange(type)}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${isVehicleSelected(type)
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10 scale-105"
                        : "bg-gray-900/50 border-gray-700 text-gray-500 hover:border-gray-500 hover:bg-gray-800"
                        }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="font-bold">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.vehicleTypes.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 bg-gray-900/30 p-6 rounded-2xl border border-white/5">
                  {form.vehicleTypes.map(type => (
                    <div key={type} className="space-y-3">
                      <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                        {type === 'CAR' ? <FaCar /> : type === 'BIKE' ? <FaMotorcycle /> : type === 'EV' ? <FaBolt /> : <FaBus />} {type} Settings
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup
                          label="Capacity"
                          type="number"
                          value={form.vehicleConfigs[type]?.capacity || ""}
                          onChange={(e) => handleConfigChange(type, 'capacity', e.target.value)}
                          placeholder="Ex: 5"
                        />
                        <InputGroup
                          label="Price/Hr (₹)"
                          type="number"
                          value={form.vehicleConfigs[type]?.price || ""}
                          onChange={(e) => handleConfigChange(type, 'price', e.target.value)}
                          placeholder="Ex: 50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Parking Type</label>
                  <select
                    name="parkingType"
                    value={form.parkingType}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                  >
                    <option value="Covered">Covered (Safe from rain/sun)</option>
                    <option value="Open">Open Area</option>
                    <option value="Basement">Basement</option>
                  </select>
                </div>
                <InputGroup label="Weekend Surcharge (₹/Hr Optional)" name="weekendSurcharge" value={form.weekendSurcharge} onChange={handleChange} placeholder="Ex: 20 (Added to base price)" />
                {form.monthlyPlan && (
                  <InputGroup label="Monthly Discount (%)" name="monthlyDiscountPercent" value={form.monthlyDiscountPercent} onChange={handleChange} placeholder="Ex: 10" type="number" />
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { name: "cctv", label: "CCTV", icon: <FaShieldAlt /> },
                  { name: "guard", label: "Security Guard", icon: <FaUser /> },
                  { name: "evCharging", label: "EV Charging", icon: <FaBolt /> },
                  { name: "monthlyPlan", label: "Monthly Pass", icon: <FaMoneyBillWave /> },
                ].map(({ name, label, icon }) => (
                  <label key={name} className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer border transition-all ${form[name] ? "bg-green-500/20 border-green-500 text-green-400" : "bg-gray-800 border-gray-600 text-gray-400"
                    }`}>
                    <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="hidden" />
                    {icon} {label} {form[name] && <FaCheckCircle />}
                  </label>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition">Back</button>
                <button type="button" onClick={() => setStep(3)} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition shadow-lg shadow-cyan-500/20">Next Step</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FINANCIALS & DOCUMENTS */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
                <FaUniversity /> Bank & Documents
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Bank Account Number" name="bankAccount" value={form.bankAccount} onChange={handleChange} placeholder="xxxxxxxxxxxx" />
                <InputGroup label="UPI ID" name="upi" value={form.upi} onChange={handleChange} placeholder="phone@upi" />
                <InputGroup label="GST Number (Optional)" name="gst" value={form.gst} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                <InputGroup label="PAN Number" name="pan" value={form.pan} onChange={handleChange} placeholder="ABCDE1234F" />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-300">
                  <FaImages /> Site Photos
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <FileInput
                    label="Parking Area"
                    onChange={(e) => handleFileChange(e, 'parkingArea')}
                    preview={images.parkingArea.preview}
                    onRemove={() => handleRemoveFile('parkingArea')}
                  />
                  <FileInput
                    label="Entry Gate"
                    onChange={(e) => handleFileChange(e, 'entryGate')}
                    preview={images.entryGate.preview}
                    onRemove={() => handleRemoveFile('entryGate')}
                  />
                  <FileInput
                    label="Surroundings"
                    onChange={(e) => handleFileChange(e, 'surrounding')}
                    preview={images.surrounding.preview}
                    onRemove={() => handleRemoveFile('surrounding')}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition">Back</button>
                <button type="button" onClick={() => setStep(4)} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition shadow-lg shadow-cyan-500/20">Review & Submit</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
                <FaCheckCircle /> Review Application
              </h2>

              <div className="bg-gray-900/50 p-6 rounded-2xl space-y-4 text-gray-300">
                <p><strong className="text-white">Name:</strong> {form.name}</p>
                <p><strong className="text-white">Location:</strong> {form.address1}, {form.district}, {form.state}</p>
                <p><strong className="text-white">Vehicles:</strong> {form.vehicleTypes.join(", ")}</p>
                <p><strong className="text-white">Capacity:</strong> {Object.values(form.vehicleConfigs).reduce((acc, curr) => acc + (parseInt(curr.capacity) || 0), 0)} Total Slots</p>
              </div>

              <label className="flex items-start gap-3 p-4 border border-gray-600 rounded-xl cursor-pointer hover:bg-gray-800/50 transition">
                <input type="checkbox" name="declaration" checked={form.declaration} onChange={handleChange} className="mt-1 w-5 h-5 text-cyan-500 rounded" />
                <span className="text-sm text-gray-400">
                  I hereby declare that the information provided is true and I own/have permission to lease this property for parking purposes. I agree to the terms and conditions.
                </span>
              </label>

              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(3)} className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition">Back</button>
                <button
                  type="submit"
                  disabled={loading || !form.declaration}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? "Submitting..." : "Submit Application"} <FaRocket />
                </button>
              </div>
            </motion.div>
          )}


        </form>
      </div>
    </div>
  )
}

function InputGroup({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <input
        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white placeholder-gray-600"
        {...props}
      />
    </div>
  )
}

function FileInput({ label, onChange, preview, onRemove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-600 group h-40">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-cyan-500 transition group cursor-pointer h-40 flex flex-col items-center justify-center">
          <input type="file" onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          <FaImages className="text-3xl text-gray-600 group-hover:text-cyan-500 mb-2 transition" />
          <p className="text-xs text-gray-500">Tap to upload</p>
        </div>
      )}
    </div>
  )
}
