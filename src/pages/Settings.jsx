import Navbar from "../components/Navbar"
import { motion } from "framer-motion"
import { useState } from "react"

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: false,
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-indigo-100 to-sky-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mt-16 px-6 space-y-12"
      >
        {/* 🌈 PAGE HEADER */}
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            Settings
          </h2>
          <p className="text-gray-600">
            Customize your account experience
          </p>
        </div>

        {/* 🔐 ACCOUNT */}
        <Section title="Account & Security">
          <SettingRow label="Change Password">
            <button className="btn-outline">Change</button>
          </SettingRow>

          <SettingRow label="Auto Logout After Inactivity">
            <Toggle
              enabled={settings.autoLogout}
              onClick={() => handleToggle("autoLogout")}
            />
          </SettingRow>
        </Section>

        {/* 🎨 APPEARANCE */}
        <Section title="Appearance">
          <SettingRow label="Dark Mode">
            <Toggle
              enabled={settings.darkMode}
              onClick={() => handleToggle("darkMode")}
            />
          </SettingRow>

          <SettingRow label="Accent Color">
            <select
              value={settings.accentColor}
              onChange={(e) =>
                setSettings({ ...settings, accentColor: e.target.value })
              }
              className="w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option className="text-gray-800 bg-white">Indigo</option>
              <option className="text-gray-800 bg-white">Emerald</option>
              <option className="text-gray-800 bg-white">Purple</option>
              <option className="text-gray-800 bg-white">Pink</option>
            </select>
          </SettingRow>
        </Section>

        {/* 🔔 NOTIFICATIONS */}
        <Section title="Notifications">
          <SettingRow label="Email Notifications">
            <Toggle
              enabled={settings.emailNotif}
              onClick={() => handleToggle("emailNotif")}
            />
          </SettingRow>

          <SettingRow label="SMS Alerts">
            <Toggle
              enabled={settings.smsNotif}
              onClick={() => handleToggle("smsNotif")}
            />
          </SettingRow>

          <SettingRow label="Push Notifications">
            <Toggle
              enabled={settings.pushNotif}
              onClick={() => handleToggle("pushNotif")}
            />
          </SettingRow>
        </Section>

        {/* 🚗 PARKING */}
        <Section title="Parking Preferences">
          <SettingRow label="Preferred Vehicle Type">
            <select
              value={settings.vehicleType}
              onChange={(e) =>
                setSettings({ ...settings, vehicleType: e.target.value })
              }
              className="w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option className="text-gray-800 bg-white">Car</option>
              <option className="text-gray-800 bg-white">Bike</option>
              <option className="text-gray-800 bg-white">Bus</option>
              <option className="text-gray-800 bg-white">
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

        {/* ⚠️ DANGER */}
        <Section title="Danger Zone">
          <SettingRow label="Download My Data">
            <button className="btn-outline">Download</button>
          </SettingRow>

          <SettingRow label="Delete Account">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              Delete
            </button>
          </SettingRow>
        </Section>
      </motion.div>
    </div>
  )
}

/* 🔹 SECTION */
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h3 className="text-2xl font-semibold text-gray-800">
        {title}
      </h3>
      {children}
    </div>
  )
}

/* 🔹 ROW */
function SettingRow({ label, children }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700 font-medium">{label}</span>
      {children}
    </div>
  )
}

/* 🔹 TOGGLE */
function Toggle({ enabled, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-14 h-7 flex items-center rounded-full cursor-pointer transition ${
        enabled ? "bg-emerald-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </div>
  )
}
