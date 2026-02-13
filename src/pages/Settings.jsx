import Navbar from "../components/Navbar"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useTheme } from "../context/ThemeContext"
import api from "../utils/api"
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
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const [settings, setSettings] = useState({
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
    autoBook: false,
    vehicleType: "Car",
    accentColor: "Indigo",
  })

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-pink-100 via-indigo-100 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-28 px-6 space-y-12 pb-12"
      >
        {/* PARKING PAGE HEADER */}
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            <FaCog /> Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your account experience
          </p>
        </div>

        {/* ACCOUNT */}
        <Section title="Account & Security" icon={<FaUserShield className="text-indigo-500" />}>
          <SettingRow label={<span className="flex items-center gap-2"><FaLock /> Change Password</span>}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-outline dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Change
            </button>
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-2"><FaSignOutAlt /> Auto Logout After Inactivity</span>}>
            <Toggle
              enabled={settings.autoLogout}
              onClick={() => handleToggle("autoLogout")}
            />
          </SettingRow>
        </Section>

        {/* APPEARANCE */}
        <Section title="Appearance" icon={<FaPalette className="text-purple-500" />}>
          <SettingRow label={<span className="flex items-center gap-2"><FaMoon /> Dark Mode</span>}>
            <Toggle
              enabled={theme === "dark"}
              onClick={toggleTheme}
            />
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-2"><FaPaintBrush /> Accent Color</span>}>
            <select
              value={settings.accentColor}
              onChange={(e) =>
                setSettings({ ...settings, accentColor: e.target.value })
              }
              className="w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">Indigo</option>
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">Emerald</option>
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">Purple</option>
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">Pink</option>
            </select>
          </SettingRow>
        </Section>

        {/* NOTIFICATIONS */}
        <Section title="Notifications" icon={<FaBell className="text-yellow-500" />}>
          <SettingRow label={<span className="flex items-center gap-2"><FaEnvelope /> Email Notifications</span>}>
            <Toggle
              enabled={settings.emailNotif}
              onClick={() => handleToggle("emailNotif")}
            />
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-2"><FaSms /> SMS Alerts</span>}>
            <Toggle
              enabled={settings.smsNotif}
              onClick={() => handleToggle("smsNotif")}
            />
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-2"><FaMobileAlt /> Push Notifications</span>}>
            <Toggle
              enabled={settings.pushNotif}
              onClick={() => handleToggle("pushNotif")}
            />
          </SettingRow>
        </Section>

        {/* PARKING */}
        <Section title="Parking Preferences" icon={<FaCar className="text-blue-500" />}>
          <SettingRow label="Preferred Vehicle Type">
            <select
              value={settings.vehicleType}
              onChange={(e) =>
                setSettings({ ...settings, vehicleType: e.target.value })
              }
              className="w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">Car</option>
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">Bike</option>
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">Bus</option>
              <option className="text-gray-800 bg-white dark:bg-gray-700 dark:text-gray-200">
                Electric Vehicle
              </option>
            </select>
          </SettingRow>

          <SettingRow label="Auto-book Nearest Parking">
            <Toggle
              enabled={settings.autoBook}
              onClick={() => handleToggle("autoBook")}
            />
          </SettingRow>
        </Section>

        {/* DANGER */}
        <Section title="Danger Zone" icon={<FaExclamationTriangle className="text-red-500" />}>
          <SettingRow label={<span className="flex items-center gap-2"><FaDownload /> Download My Data</span>}>
            <button className="btn-outline dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Download</button>
          </SettingRow>

          <SettingRow label={<span className="flex items-center gap-2"><FaTrashAlt /> Delete Account</span>}>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              Delete
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h3 className="text-2xl font-bold mb-6 dark:text-white">Change Password</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={form.oldPassword}
              onChange={e => setForm({ ...form, oldPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
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
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4 transition-colors duration-300">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  )
}

/* 🔹 ROW */
function SettingRow({ label, children }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{label}</span>
      {children}
    </div>
  )
}

/* 🔹 TOGGLE */
function Toggle({ enabled, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-14 h-8 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`w-6 h-6 bg-white rounded-full shadow-md transform ${enabled ? "translate-x-7" : "translate-x-1"
          }`}
      />
    </div>
  )
}
