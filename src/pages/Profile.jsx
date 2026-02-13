import indiaData from "../utils/indiaData"
import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getCurrentUser, getProfile, updateProfile } from "../utils/auth"
import { FaBuilding, FaUserShield, FaCar, FaUserCircle } from "react-icons/fa"

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

  // 🔹 Load logged-in user data from Backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const data = await getProfile()
          // Fallback to localStorage user role if data.role is missing
          const backendRole = data?.role || user?.role || "user"

          setProfile({
            name: data?.name || user?.name || "",
            email: data?.email || user?.email || "",
            role: backendRole.charAt(0).toUpperCase() + backendRole.slice(1).toLowerCase(),
            phone: data?.phoneNumber || "",
            address1: data?.address1 || "",
            address2: data?.address2 || "",
            state: data?.state || "",
            district: data?.district || "",
            pincode: data?.pincode || "",
          })
        } catch (error) {
          console.error("Failed to fetch profile", error)
        }
      }
    }
    fetchUserData()
  }, [user?.email])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleStateChange = (e) => {
    console.log("State selected:", e.target.value)
    console.log("Districts available:", indiaData[e.target.value])
    setProfile({
      ...profile,
      state: e.target.value,
      district: "",
    })
  }

  const handleSave = async () => {
    await updateProfile(profile)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto pt-24 px-6 pb-12"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10">
              <FaUserCircle className="text-9xl" />
            </div>
            <h2 className="text-4xl font-bold mb-2 flex items-center gap-3 relative z-10">
              My Profile
            </h2>
            <p className="text-indigo-100 relative z-10 text-lg">
              Manage your personal information and address
            </p>
          </div>

          {/* BODY */}
          <div className="p-8 md:p-12 grid md:grid-cols-12 gap-12">

            {/* AVATAR + ROLE */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 pb-8 md:pb-0 md:pr-8">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-6xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-700">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md text-gray-500 cursor-pointer hover:text-indigo-600 transition">
                  <FaUserCircle />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{profile.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 rounded-2xl w-full">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Current Role</p>
                <div className="flex justify-center">
                  {profile.role === "provider" ? (
                    <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm">
                      <FaBuilding /> Parking Provider
                    </span>
                  ) : profile.role === "admin" ? (
                    <span className="text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm">
                      <FaUserShield /> Admin
                    </span>
                  ) : (
                    <span className="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm">
                      <FaCar /> Driver
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="md:col-span-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+91"
                />
              </div>

              <Input
                label="Email Address"
                value={profile.email}
                disabled
                note="Email cannot be changed"
              />

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Address Details</h4>

                <div className="space-y-4">
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
                    placeholder="Landmark, Apartment (Optional)"
                  />

                  <div className="grid md:grid-cols-3 gap-6">
                    <Select
                      label="State"
                      value={profile.state}
                      onChange={handleStateChange}
                      options={Object.keys(indiaData)}
                    />

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
                      placeholder="000000"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1"
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* 🔧 INPUT COMPONENT */
function Input({ label, name, value, onChange, placeholder, disabled, note }) {
  return (
    <div>
      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 ml-1">
        {label}
      </label>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border transition-all ${disabled
          ? "bg-gray-100 dark:bg-gray-700 text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed"
          : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
          }`}
      />
      {note && <p className="text-xs text-gray-400 mt-1 ml-1">{note}</p>}
    </div>
  )
}

/* 🔽 SELECT COMPONENT */
function Select({ label, value, onChange, options, name, disabled }) {
  return (
    <div>
      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl border appearance-none transition-all ${disabled
            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600"
            : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-700 dark:text-white cursor-pointer"
            }`}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {!disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
          </div>
        )}
      </div>
    </div>
  )
}
