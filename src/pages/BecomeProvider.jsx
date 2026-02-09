import { useState } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import indiaData from "../utils/indiaData"
import api from "../utils/api"
import toast from "react-hot-toast"

export default function BecomeProvider() {
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
    capacity: "",
    vehicleTypes: [],
    parkingType: "Covered",
    cctv: false,
    guard: false,
    evCharging: false,
    pricePerHour: "",
    monthlyPlan: false,
    weekendPricing: "",
    bankAccount: "",
    upi: "",
    gst: "",
    pan: "",
    declaration: false,
  })

  const [images, setImages] = useState({
    parkingArea: null,
    entryGate: null,
    surrounding: null
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = (e, key) => {
    setImages(prev => ({ ...prev, [key]: e.target.files[0] }))
  }

  const handleVehicleChange = (type) => {
    setForm((prev) => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter((v) => v !== type)
        : [...prev.vehicleTypes, type],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.declaration) {
      toast.error("Please accept legal declaration")
      return
    }

    if (!images.parkingArea || !images.entryGate) {
      toast.error("Please upload required images (Parking Area & Entry Gate)")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()

      // 1. Owner & Basic Info
      formData.append("ownerName", form.name)
      formData.append("phoneNumber", form.phone)
      formData.append("governmentId", form.governmentId)

      // 2. Bank & Compliance
      formData.append("bankAccount", form.bankAccount)
      formData.append("upiId", form.upi)
      formData.append("gstNumber", form.gst)
      formData.append("panNumber", form.pan)

      // 3. Location
      formData.append("state", form.state)
      formData.append("district", form.district)
      formData.append("address", `${form.address1}${form.address2 ? ", " + form.address2 : ""}`)
      formData.append("pincode", form.pincode)
      formData.append("googleMapsLink", form.mapsLink)

      // 4. Parking Details
      formData.append("name", `${form.name}'s Parking`)
      formData.append("description", "Safe and secure parking space.")
      formData.append("totalCapacity", form.capacity)
      formData.append("pricePerHour", form.pricePerHour)
      formData.append("weekendPricing", form.weekendPricing || 0)
      formData.append("monthlyPlan", form.monthlyPlan)

      formData.append("parkingType", form.parkingType)
      formData.append("covered", form.parkingType === "Covered")

      formData.append("cctv", form.cctv)
      formData.append("guard", form.guard)
      formData.append("evCharging", form.evCharging)

      // 5. Vehicle Types (Set<String>)
      form.vehicleTypes.forEach(type => {
        formData.append("vehicleTypes", type)
      })

      // 6. Images
      if (images.parkingArea) formData.append("parkingAreaImage", images.parkingArea)
      if (images.entryGate) formData.append("entryGateImage", images.entryGate)
      if (images.surrounding) formData.append("surroundingAreaImage", images.surrounding)

      // Submit
      const res = await api.post("/provider/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (res.data?.message) {
        toast.success(res.data.message)
      } else {
        toast.success("Application submitted successfully! 🚀")
      }

    } catch (error) {
      console.error("Submission Error:", error)
      toast.error(error.response?.data?.message || "Failed to submit application.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-6 py-12"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-10 text-white">
            <h2 className="text-4xl font-extrabold">
              Become a Parking Provider
            </h2>
            <p className="text-white/90 mt-2">
              Fill the form below to apply for listing your parking space
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-12">

            {/* =================== PERSONAL INFO =================== */}
            <Section title="👤 Owner Information">
              <Input label="Full Name" name="name" onChange={handleChange} />
              <Input label="Phone Number" name="phone" onChange={handleChange} />
              <Input label="Email" name="email" onChange={handleChange} />
              <Input label="Government ID Number" name="governmentId" onChange={handleChange} />
            </Section>

            {/* =================== LOCATION =================== */}
            <Section title="📍 Parking Location Details">
              <Select
                label="State"
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value, district: "" })
                }
                options={Object.keys(indiaData)}
              />

              <Select
                label="District"
                value={form.district}
                onChange={(e) =>
                  setForm({ ...form, district: e.target.value })
                }
                options={indiaData[form.state] || []}
                disabled={!form.state}
              />

              <Input label="Address Line 1" name="address1" onChange={handleChange} />
              <Input label="Address Line 2" name="address2" onChange={handleChange} />
              <Input label="Pincode" name="pincode" onChange={handleChange} />
              <Input label="Google Maps Link (optional)" name="mapsLink" onChange={handleChange} />
            </Section>

            {/* =================== PARKING DETAILS =================== */}
            <Section title="🚗 Parking Space Details">
              <Input label="Total Parking Capacity" name="capacity" type="number" onChange={handleChange} />

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Vehicle Types Allowed
                </label>
                <div className="flex gap-4 flex-wrap">
                  {["Car", "Bike", "Bus", "EV"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => handleVehicleChange(type)}
                      className={`px-4 py-2 rounded-lg border transition ${form.vehicleTypes.includes(type)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Parking Type"
                value={form.parkingType}
                onChange={(e) =>
                  setForm({ ...form, parkingType: e.target.value })
                }
                options={["Covered", "Open"]}
              />

              <Checkbox label="CCTV Available" name="cctv" onChange={handleChange} />
              <Checkbox label="Security Guard Available" name="guard" onChange={handleChange} />
              <Checkbox label="EV Charging Available" name="evCharging" onChange={handleChange} />
            </Section>

            {/* =================== PRICING =================== */}
            <Section title="💰 Pricing Details">
              <Input label="Price Per Hour (₹)" name="pricePerHour" type="number" onChange={handleChange} />
              <Checkbox label="Monthly Plan Available" name="monthlyPlan" onChange={handleChange} />
              <Input label="Special Weekend Pricing (optional)" name="weekendPricing" type="number" onChange={handleChange} />
            </Section>

            {/* =================== IMAGES =================== */}
            <Section title="🖼️ Parking Area Images">
              <FileInput label="Upload Parking Area Image" onChange={(e) => handleFileChange(e, "parkingArea")} />
              <FileInput label="Upload Entry Gate Image" onChange={(e) => handleFileChange(e, "entryGate")} />
              <FileInput label="Upload Surrounding Area (optional)" onChange={(e) => handleFileChange(e, "surrounding")} />
            </Section>

            {/* =================== PAYMENT =================== */}
            <Section title="🏦 Payment & Legal Details">
              <Input label="Bank Account Number" name="bankAccount" onChange={handleChange} />
              <Input label="UPI ID" name="upi" onChange={handleChange} />
              <Input label="GST Number (optional)" name="gst" onChange={handleChange} />
              <Input label="PAN Number" name="pan" onChange={handleChange} />

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  name="declaration"
                  onChange={handleChange}
                />
                <label>
                  I confirm that I have legal rights to list this parking space.
                </label>
              </div>
            </Section>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition disabled:bg-gray-400"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-bold text-indigo-700">
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {children}
      </div>
    </motion.div>
  )
}

function Input({ label, name, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}

function Select({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function Checkbox({ label, name, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" name={name} onChange={onChange} />
      <label>{label}</label>
    </div>
  )
}

function FileInput({ label, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">
        {label}
      </label>
      <input type="file" onChange={onChange} className="w-full" />
    </div>
  )
}
