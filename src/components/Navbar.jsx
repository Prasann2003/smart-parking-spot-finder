import { useState } from "react"
import { useNavigate } from "react-router-dom"
import MenuDropdown from "./MenuDropdown"
import { FaBars } from "react-icons/fa"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

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
          className="text-2xl text-gray-900 dark:text-white focus:outline-none"
        >
          <FaBars />
        </button>

        {open && <MenuDropdown close={() => setOpen(false)} />}
      </div>
    </nav>
  )
}
