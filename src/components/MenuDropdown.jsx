import { motion } from "framer-motion"
import { logout, getCurrentUser } from "../utils/auth"
import { useNavigate } from "react-router-dom"
import { FaUser, FaListAlt, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa"

export default function MenuDropdown({ close }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    close()
    navigate("/")
  }

  const user = getCurrentUser()

  const menuItems = [
    { label: "Profile", path: "/profile", icon: <FaUser /> },
    ...(user?.role === "USER" ? [{ label: "My Bookings", path: "/bookings", icon: <FaListAlt /> }] : []),
    { label: "Notifications", path: "/notifications", icon: <FaBell /> },
    { label: "Settings", path: "/settings", icon: <FaCog /> },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute right-0 mt-4 w-56 bg-white dark:bg-gray-800 text-black dark:text-gray-200 rounded-xl shadow-xl overflow-hidden z-50 border dark:border-gray-700"
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            navigate(item.path)
            close()
          }}
          className="w-full text-left px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
        >
          <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
          {item.label}
        </button>
      ))}

      <button
        onClick={handleLogout}
        className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3"
      >
        <FaSignOutAlt /> Logout
      </button>
    </motion.div>
  )
}
