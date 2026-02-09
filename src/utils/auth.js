import api from "./api"
import toast from "react-hot-toast"

// 🔹 REGISTER USER
export async function register(data) {
  try {
    // Don't send Authorization header for registration
    delete api.defaults.headers.common["Authorization"]
    const response = await api.post("/auth/register", data)
    toast.success("Registration successful! Please login.")
    return true
  } catch (error) {
    console.error("Registration error", error)
    toast.error(error.response?.data?.message || "Registration failed")
    return false
  }
}


// 🔹 LOGIN USER
export async function login(email, password) {
  try {
    const response = await api.post("/auth/login", { email, password })
    const { token, ...user } = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("currentUser", JSON.stringify(user))

    // Set default auth header for future requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    return true
  } catch (error) {
    console.error("Login error", error)
    // toast handled in component usually, but we accept return generic false
    return false
  }
}

// 🔹 CHECK IF LOGGED IN
export function isLoggedIn() {
  return !!localStorage.getItem("token")
}

// 🔹 LOGOUT
export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("currentUser")
  delete api.defaults.headers.common["Authorization"]
  window.location.href = "/auth"
}

// 🔹 GET CURRENT USER
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"))
}

// Initialize Auth Header on Load
const token = localStorage.getItem("token")
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}
