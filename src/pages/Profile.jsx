import indiaData from "../utils/indiaData"
import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getCurrentUser } from "../utils/auth"

export default function Profile() {
  const user = getCurrentUser()

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    address1: "",
    address2: "",
    state: "",
    district: "",
    pincode: "",
  })

  // 🔹 Load logged-in user data
  useEffect(() => {
    if (user) {
      const savedProfile =
        JSON.parse(localStorage.getItem(`profile_${user.email}`)) || {}

      setProfile({
        name: savedProfile.name || user.name || "",
        email: user.email || "",
        role: user.role || "driver",
        phone: savedProfile.phone || "",
        address1: savedProfile.address1 || "",
        address2: savedProfile.address2 || "",
        state: savedProfile.state || "",
        district: savedProfile.district || "",
        pincode: savedProfile.pincode || "",
      })
    }
  }, [user])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleStateChange = (e) => {
    setProfile({
      ...profile,
      state: e.target.value,
      district: "",
    })
  }

  const handleSave = () => {
    // Save profile separately per user
    localStorage.setItem(
      `profile_${profile.email}`,
      JSON.stringify(profile)
    )

    alert("Profile updated successfully ✅")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mt-12 px-6"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-10 text-white">
            <h2 className="text-4xl font-extrabold mb-2">
              My Profile
            </h2>
            <p className="text-white/90">
              Manage your personal and address details
            </p>
          </div>

          {/* BODY */}
          <div className="p-10 grid md:grid-cols-2 gap-8">

            {/* AVATAR + ROLE */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                {profile.name?.charAt(0)}
              </div>

              {/* ✅ ROLE DISPLAY */}
              <p className="mt-4 text-sm font-semibold">
                {profile.role === "provider" ? (
                  <span className="text-emerald-600">
                    🏢 Parking Provider
                  </span>
                ) : profile.role === "admin" ? (
                  <span className="text-red-600">
                    🛠 Admin
                  </span>
                ) : (
                  <span className="text-indigo-600">
                    🚗 Driver
                  </span>
                )}
              </p>
            </div>

            {/* FORM */}
            <div className="space-y-5">

              {/* NAME (Editable) */}
              <Input
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />

              {/* EMAIL (Read Only) */}
              <Input
                label="Email"
                value={profile.email}
                disabled
              />

              <Input
                label="Phone Number"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="e.g. +91 1234567899"
              />

              <Input
                label="Address Line 1"
                name="address1"
                value={profile.address1}
                onChange={handleChange}
                placeholder="House no, Street, Area"
              />

              <Input
                label="Address Line 2"
                name="address2"
                value={profile.address2}
                onChange={handleChange}
                placeholder="Landmark, Apartment, Floor (optional)"
              />

              {/* STATE */}
              <Select
                label="State"
                value={profile.state}
                onChange={handleStateChange}
                options={Object.keys(indiaData)}
              />

              {/* DISTRICT */}
              <Select
                label="District"
                name="district"
                value={profile.district}
                onChange={handleChange}
                options={indiaData[profile.state] || []}
                disabled={!profile.state}
              />

              <Input
                label="Pincode"
                name="pincode"
                value={profile.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
              />

            </div>
          </div>

          {/* FOOTER */}
          <div className="p-8 bg-gray-50 flex justify-end">
            <button
              onClick={handleSave}
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
            >
              Save Changes
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}

/* 🔧 INPUT COMPONENT */
function Input({ label, name, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-gray-600 text-sm mb-1">
        {label}
      </label>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg border ${
          disabled
            ? "bg-gray-100 text-gray-500"
            : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
        }`}
      />
    </div>
  )
}

/* 🔽 SELECT COMPONENT */
function Select({ label, value, onChange, options, name, disabled }) {
  return (
    <div>
      <label className="block text-gray-600 text-sm mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
