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

// 🔹 GET USER PROFILE
export async function getProfile() {
  try {
    const response = await api.get("/users/profile")
    return response.data
  } catch (error) {
    console.error("Fetch profile error", error)
    return null
  }
}

// 🔹 UPDATE USER PROFILE
export async function updateProfile(data) {
  try {
    const response = await api.put("/users/profile", data)
    toast.success("Profile updated successfully ✅")

    // Update local storage user if needed, but better to rely on API
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }

    return response.data
  } catch (error) {
    console.error("Update profile error", error)
    toast.error(error.response?.data?.message || "Update failed")
    return null
  }
}

// 🔹 FORGOT PASSWORD - SEND OTP
export async function forgotPassword(email) {
  try {
    delete api.defaults.headers.common["Authorization"]
    await api.post("/auth/forgot-password", { email })
    toast.success("OTP sent to your email 📧")
    return true
  } catch (error) {
    console.error("Forgot password error", error)
    toast.error(error.response?.data?.message || "Failed to send OTP")
    return false
  }
}

// 🔹 VERIFY OTP
export async function verifyOtp(email, otp) {
  try {
    delete api.defaults.headers.common["Authorization"]
    await api.post("/auth/verify-otp", { email, otp })
    toast.success("OTP verified successfully ✅")
    return true
  } catch (error) {
    console.error("Verify OTP error", error)
    toast.error(error.response?.data?.message || "Invalid OTP")
    return false
  }
}

// 🔹 RESET PASSWORD
export async function resetPassword(email, otp, newPassword) {
  try {
    delete api.defaults.headers.common["Authorization"]
    await api.post("/auth/reset-password", { email, otp, newPassword })
    toast.success("Password reset successfully 🎉")
    return true
  } catch (error) {
    console.error("Reset password error", error)
    toast.error(error.response?.data?.message || "Failed to reset password")
    return false
  }
}

// Initialize Auth Header on Load
const token = localStorage.getItem("token")
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}
