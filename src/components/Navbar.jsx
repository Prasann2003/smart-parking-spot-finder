import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import MenuDropdown from "./MenuDropdown"
import { FaBars } from "react-icons/fa"
import api from "../utils/api"
import { getCurrentUser } from "../utils/auth"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const user = getCurrentUser()

  useEffect(() => {
    const fetchNotifications = async () => {
      // Don't fetch if no user, or if user is ADMIN (since admin notifications aren't implemented yet)
      if (!user || user.role === "ADMIN") return
      try {
        const res = await api.get("/notifications")
        const unread = res.data.filter(n => !n.read).length
        setUnreadCount(unread)
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
      }
    }
    fetchNotifications()
  }, [user])

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        w-full
        flex
        items-center
        justify-between
        px-8
        py-4
        bg-white/95
        dark:bg-gray-900/95
        backdrop-blur-xl
        border-b
        border-gray-200
        dark:border-gray-700
        transition-colors
        duration-300
      "
    >
      {/* LOGO / TITLE */}
      <div
        onClick={() => navigate("/dashboard")}
        className="
          flex 
          items-center 
          gap-2 
          cursor-pointer
          hover:text-indigo-600
          dark:hover:text-indigo-400
          transition
        "
      >
        <h1
          className="
            text-2xl
            font-extrabold
            text-gray-900
            dark:text-white
            tracking-wide
          "
        >
          Smart Parking
        </h1>
      </div>

      {/* HAMBURGER MENU */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="relative text-2xl text-gray-900 dark:text-white focus:outline-none"
        >
          <FaBars />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white dark:border-gray-900"></span>
            </span>
          )}
        </button>

        {open && <MenuDropdown close={() => setOpen(false)} unreadCount={unreadCount} />}
      </div>
    </nav>
  )
}
