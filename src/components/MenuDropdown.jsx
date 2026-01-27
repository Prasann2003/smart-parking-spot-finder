import { motion } from "framer-motion"
import { logout } from "../utils/auth"
import { useNavigate } from "react-router-dom"

export default function MenuDropdown({ close }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    close()
    navigate("/")
  }

  const menuItems = [
    { label: "Profile", path: "/profile" },
    { label: "My Bookings", path: "/bookings" },
    { label: "Notifications", path: "/notifications" },
    { label: "Settings", path: "/settings" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute right-0 mt-4 w-56 bg-white text-black rounded-xl shadow-xl overflow-hidden z-50"
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            navigate(item.path)
            close()
          }}
          className="w-full text-left px-5 py-3 hover:bg-gray-100 transition"
        >
          {item.label}
        </button>
      ))}

      <button
        onClick={handleLogout}
        className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition"
      >
        Logout
      </button>
    </motion.div>
  )
}
