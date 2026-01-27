import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const roles = [
  {
    title: "Driver",
    description: "Find and book parking spots easily",
    route: "/auth/driver",
    gradient: "from-emerald-400 to-emerald-600",
    icon: "🚗",
  },
  {
    title: "Parking Provider",
    description: "Manage and monitor parking spaces",
    route: "/auth/parking",
    gradient: "from-sky-400 to-blue-600",
    icon: "🅿️",
  },
  {
    title: "Admin",
    description: "Control system and analytics",
    route: "/auth/admin",
    gradient: "from-purple-400 to-pink-600",
    icon: "🛡️",
  },
]

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-6">

      <div className="max-w-6xl w-full">

        {/* 🔥 HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-white/90">
            Select how you want to use Smart Parking Spot Finder
          </p>
        </motion.div>

        {/* 🚀 ROLE CARDS */}
        <div className="grid md:grid-cols-3 gap-10">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -12, scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(role.route)}
              className={`
                cursor-pointer
                rounded-3xl
                p-10
                text-center
                shadow-2xl
                bg-gradient-to-br ${role.gradient}
              `}
            >
              <div className="text-6xl mb-6">{role.icon}</div>

              <h2 className="text-2xl font-bold mb-3">
                {role.title}
              </h2>

              <p className="text-white/90">
                {role.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
