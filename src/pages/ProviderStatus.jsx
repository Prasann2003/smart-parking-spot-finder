import { useEffect, useState } from "react"
import api from "../utils/api"
import Navbar from "../components/Navbar"

export default function ProviderStatus() {
  const [status, setStatus] = useState("Loading...")

  useEffect(() => {
    api.get("/provider/status")
      .then(res => setStatus(res.data.status))
      .catch(() => setStatus("Error fetching status"))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-28 text-center">
        <h2 className="text-3xl font-bold">
          Application Status
        </h2>

        <div className={`mt-6 text-xl font-semibold ${
          status === "Approved"
            ? "text-green-600"
            : status === "Rejected"
            ? "text-red-600"
            : "text-yellow-600"
        }`}>
          {status}
        </div>
      </div>
    </div>
  )
}
