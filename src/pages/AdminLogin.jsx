import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../utils/auth"
import toast from "react-hot-toast"

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    // Call backend API
    const success = await login(email, password)

    if (success) {
      // Check if user is actually admin
      const user = JSON.parse(localStorage.getItem("currentUser"))
      if (user.role === "ADMIN") {
        toast.success("Welcome Admin! 🚀")
        navigate("/dashboard")
      } else {
        toast.error("Access Denied: Not an Admin ❌")
        // Optional: Logout if not admin
        localStorage.removeItem("token")
        localStorage.removeItem("currentUser")
      }
    } else {
      toast.error("Invalid Admin Credentials ❌")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full mb-4 px-4 py-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-3 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          Login as Admin
        </button>
      </div>
    </div>
  )
}
