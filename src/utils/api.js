import axios from "axios"
import toast from "react-hot-toast"

const api = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
})

// Request interceptor to add the auth token header to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

// 🔹 TOGGLE SPOT STATUS
export const toggleStatus = async (id, status) => {
  try {
    const response = await api.put(`/provider/toggle-status/${id}?status=${status}`)
    toast.success("Status updated successfully ✅")
    return true
  } catch (error) {
    console.error("Toggle status error", error)
    toast.error("Failed to update status")
    return false
  }
}

// 🔹 UPDATE PARKING SPOT
export const updateSpot = async (id, data) => {
  try {
    const response = await api.put(`/provider/update/${id}`, data)
    toast.success("Parking spot updated successfully ✅")
    return response.data
  } catch (error) {
    console.error("Update spot error", error)
    if (error.response && error.response.data) {
      console.error("Backend Error Details:", error.response.data)
      toast.error(`Error: ${JSON.stringify(error.response.data)}`)
    } else {
      toast.error("Failed to update spot")
    }
    return null
  }
}
