import axios from "axios"
import toast from "react-hot-toast"

const api = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
})

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
