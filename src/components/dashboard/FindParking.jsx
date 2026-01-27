import { useState } from "react"
import ParkingResults from "./ParkingResults"
import Filters from "./Filters"

export default function FindParking() {
  const [search, setSearch] = useState({
    state: "",
    district: "",
    area: "",
  })

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">
        🔍 Find Parking Spot
      </h2>

      {/* LOCATION INPUT */}
      <div className="grid md:grid-cols-3 gap-6">
        <input
          placeholder="State"
          className="input"
          onChange={(e) =>
            setSearch({ ...search, state: e.target.value })
          }
        />
        <input
          placeholder="District"
          className="input"
          onChange={(e) =>
            setSearch({ ...search, district: e.target.value })
          }
        />
        <input
          placeholder="Area / Landmark (optional)"
          className="input"
          onChange={(e) =>
            setSearch({ ...search, area: e.target.value })
          }
        />
      </div>

      {/* FILTERS */}
      <Filters />

      {/* RESULTS */}
      <ParkingResults search={search} />
    </div>
  )
}
