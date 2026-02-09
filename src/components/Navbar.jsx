import { useState } from "react"
import { useNavigate } from "react-router-dom"
import MenuDropdown from "./MenuDropdown"

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
      {/* 🅿️ LOGO / TITLE */}
      <h1
        onClick={() => navigate("/dashboard")}
        className="
          text-2xl
          font-extrabold
          text-gray-900
          dark:text-white
          tracking-wide
          cursor-pointer
          hover:text-indigo-600
          dark:hover:text-indigo-400
          transition
        "
      >
        Smart Parking
      </h1>

      {/* ☰ HAMBURGER MENU */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-col gap-1.5 focus:outline-none"
        >
          <span className="w-7 h-0.5 bg-gray-900 dark:bg-white transition-colors duration-300"></span>
          <span className="w-7 h-0.5 bg-gray-900 dark:bg-white transition-colors duration-300"></span>
          <span className="w-7 h-0.5 bg-gray-900 dark:bg-white transition-colors duration-300"></span>
        </button>

        {open && <MenuDropdown close={() => setOpen(false)} />}
      </div>
    </nav>
  )
}
