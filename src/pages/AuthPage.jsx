import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { register, login } from "../utils/auth"

export default function AuthPage() {
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    // ✅ SIGNUP FLOW
    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match ❌")
        return
      }

      register(form)
      toast.success("Account created successfully ✅")
      setIsLogin(true)
      return
    }

    // ✅ LOGIN FLOW
    const success = login(form.email, form.password)

    if (success) {
      toast.success("Login successful 🎉")
      setTimeout(() => navigate("/dashboard"), 700)
    } else {
      toast.error("Invalid credentials ❌")
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* 🌈 LEFT SIDE BRANDING */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 items-center justify-center px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white"
        >
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            Smart Parking
            <br />Spot Finder
          </h1>
          <p className="text-lg text-white/90 max-w-md">
            Park smarter, faster, and stress-free with intelligent
            real-time parking solutions.
          </p>
        </motion.div>
      </div>

      {/* 🔐 RIGHT AUTH FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <motion.form
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md px-10"
        >
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            {isLogin ? "Login" : "Create Account"}
          </h2>

          <p className="text-gray-500 mb-8">
            {isLogin
              ? "Welcome back! Please login to continue."
              : "Create an account to start finding parking spots."}
          </p>

          {/* NAME */}
          {!isLogin && (
            <input
              placeholder="Full Name"
              className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email address"
            className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-indigo-600"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          {!isLogin && (
            <div className="relative mb-6">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
              <span
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-indigo-600"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </span>
            </div>
          )}

          {/* BUTTON */}
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition">
            {isLogin ? "Login" : "Create Account"}
          </button>

          {/* TOGGLE */}
          <p
            className="mt-6 text-center text-sm text-indigo-600 cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "New user? Create an account"
              : "Already have an account? Login"}
          </p>
        </motion.form>
      </div>
    </div>
  )
}
