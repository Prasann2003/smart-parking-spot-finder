import Navbar from "../components/Navbar"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import api from "../utils/api"
import { getCurrentUser } from "../utils/auth"
import { toast } from "react-hot-toast"
import {
  FaUserShield,
  FaPalette,
  FaBell,
  FaCar,
  FaExclamationTriangle,
  FaCog,
  FaLock,
  FaSignOutAlt,
  FaMoon,
  FaPaintBrush,
  FaEnvelope,
  FaSms,
  FaMobileAlt,
  FaDownload,
  FaTrashAlt
} from "react-icons/fa"

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const user = getCurrentUser()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const [settings, setSettings] = useState({
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
    autoBook: false,
    vehicleType: "CAR",
    accentColor: "Indigo",
  })

  // Fetch User Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile")
        if (res.data) {
          setSettings(prev => ({
            ...prev,
            vehicleType: res.data.vehicleType || "CAR"
          }))
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
      }
    }
    fetchProfile()
  }, [])

  const updateProfileSetting = async (key, value) => {
    try {
      // Optimistic Update
      setSettings(prev => ({ ...prev, [key]: value }));

      // API Update
      if (key === 'vehicleType') {
        await api.put("/users/profile", { vehicleType: value });
        toast.success("Preference saved");
      }
    } catch (err) {
      console.error("Failed to update setting", err);
      toast.error("Failed to save preference");
    }
  }

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-24 px-6 space-y-8 pb-12"
      >
        {/* PARKING PAGE HEADER */}
        <div className="border-b border-indigo-200 pb-6">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            <FaCog className="text-gray-600" /> Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your account experience
          </p>
        </div>

        {/* ACCOUNT */}
        <Section title="Account & Security" icon={<FaUserShield className="text-indigo-500" />}>
          <SettingRow label={<span className="flex items-center gap-3"><FaLock className="text-gray-400" /> Change Password</span>}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition"
            >
              Change
            </button>
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-3"><FaSignOutAlt className="text-gray-400" /> Auto Logout After Inactivity</span>}>
            <Toggle
              enabled={settings.autoLogout}
              onClick={() => handleToggle("autoLogout")}
            />
          </SettingRow>
        </Section>

        {/* APPEARANCE */}
        <Section title="Appearance" icon={<FaPalette className="text-purple-500" />}>
          <SettingRow label={<span className="flex items-center gap-3"><FaMoon className="text-gray-400" /> Dark Mode</span>}>
            <Toggle
              enabled={theme === "dark"}
              onClick={toggleTheme}
            />
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-3"><FaPaintBrush className="text-gray-400" /> Accent Color</span>}>
            <div className="relative">
              <select
                value={settings.accentColor}
                onChange={(e) =>
                  setSettings({ ...settings, accentColor: e.target.value })
                }
                className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 appearance-none cursor-pointer"
              >
                <option>Indigo</option>
                <option>Emerald</option>
                <option>Purple</option>
                <option>Pink</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </SettingRow>
        </Section>

        {/* NOTIFICATIONS */}
        <Section title="Notifications" icon={<FaBell className="text-yellow-500" />}>
          <SettingRow label={<span className="flex items-center gap-3"><FaEnvelope className="text-gray-400" /> Email Notifications</span>}>
            <Toggle
              enabled={settings.emailNotif}
              onClick={() => handleToggle("emailNotif")}
            />
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-3"><FaSms className="text-gray-400" /> SMS Alerts</span>}>
            <Toggle
              enabled={settings.smsNotif}
              onClick={() => handleToggle("smsNotif")}
            />
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-3"><FaMobileAlt className="text-gray-400" /> Push Notifications</span>}>
            <Toggle
              enabled={settings.pushNotif}
              onClick={() => handleToggle("pushNotif")}
            />
          </SettingRow>
        </Section>

        {/* PARKING */}
        {/* PARKING PREFERENCES (USER ONLY) */}
        {user?.role === "USER" && (
          <Section title="Parking Preferences" icon={<FaCar className="text-blue-500" />}>
            <SettingRow label={<span className="flex items-center gap-3"><FaCar className="text-gray-400" /> Preferred Vehicle Type</span>}>
              <div className="relative">
                <select
                  value={settings.vehicleType}
                  onChange={(e) => updateProfileSetting('vehicleType', e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 appearance-none cursor-pointer"
                >
                  <option value="CAR">Car</option>
                  <option value="BIKE">Bike</option>
                  <option value="BUS">Bus</option>
                  <option value="TRUCK">Truck</option>
                  <option value="EV">Electric Vehicle</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </SettingRow>

            <SettingRow label={<span className="flex items-center gap-3"><FaCar className="text-gray-400" /> Auto-book Nearest Parking</span>}>
              <Toggle
                enabled={settings.autoBook}
                onClick={() => handleToggle("autoBook")}
              />
            </SettingRow>
          </Section>
        )}

        {/* DANGER */}
        <Section title="Danger Zone" icon={<FaExclamationTriangle className="text-red-500" />}>
          <SettingRow label={<span className="flex items-center gap-3"><FaDownload className="text-gray-400" /> Download My Data</span>}>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition">Download</button>
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-3"><FaTrashAlt className="text-red-400" /> Delete Account</span>}>
            <button className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg transition-colors font-medium">
              Delete Account
            </button>
          </SettingRow>
        </Section>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {showPasswordModal && <ChangePasswordModal close={() => setShowPasswordModal(false)} />}
      </AnimatePresence>
    </div>
  )
}

/* 🔹 CHANGE PASSWORD MODAL */
function ChangePasswordModal({ close }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      })
      toast.success("Password changed successfully!")
      close()
    } catch (err) {
      console.error("Change Password Error:", err.response?.data)
      const errorMsg = err.response?.data?.error || "Failed to change password"
      toast.error(errorMsg)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h3 className="text-2xl font-bold mb-6 dark:text-white">Change Password</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={form.oldPassword}
              onChange={e => setForm({ ...form, oldPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/* 🔹 SECTION */
function Section({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-4 transition-colors duration-300">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
        {icon} {title}
      </h3>
      {children}
    </div>
  )
}

/* 🔹 ROW */
function SettingRow({ label, children }) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-gray-700 dark:text-gray-300 font-medium text-base">{label}</span>
      {children}
    </div>
  )
}

/* 🔹 TOGGLE */
function Toggle({ enabled, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-7 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`w-5 h-5 bg-white rounded-full shadow-md transform ${enabled ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </div>
  )
}
