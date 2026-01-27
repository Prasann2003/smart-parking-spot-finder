import { motion } from "framer-motion"

export default function RoleCard({ title, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className="
        cursor-pointer
        rounded-2xl
        p-10
        text-center
        bg-white/10
        backdrop-blur-xl
        border
        border-white/20
        shadow-2xl
      "
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm opacity-70 mt-2">Continue as {title}</p>
    </motion.div>
  )
}
