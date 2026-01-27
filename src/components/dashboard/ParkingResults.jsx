import { parkingSpots } from "../../data/parkingData"
import MapView from "./MapView"

export default function ParkingResults({ search }) {
  const results = parkingSpots.filter(
    (p) =>
      p.state.includes(search.state) &&
      p.district.includes(search.district)
  )

  return (
    <div className="mt-10 grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        {results.map((p) => (
          <div
            key={p.id}
            className="bg-gray-50 p-6 rounded-2xl shadow"
          >
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="text-gray-600">{p.area} • {p.distance}</p>

            <p className="mt-2">
              {p.slots === 0 ? "🔴 Full" : p.slots < 5 ? "🟡 Limited" : "🟢 Available"}
              {" "}({p.slots} slots)
            </p>

            <p className="mt-1">₹{p.price}/hour</p>

            <div className="flex gap-3 mt-4">
              <button className="btn">Book</button>
              <button className="btn-outline">⭐ Save</button>
            </div>

            <p className="text-sm mt-3 text-gray-500">
              CCTV: {p.cctv ? "Yes" : "No"} | Guarded: {p.guarded ? "Yes" : "No"} | ⭐ {p.rating}
            </p>
          </div>
        ))}
      </div>

      {/* MAP PLACEHOLDER */}
      <MapView />
    </div>
  )
}
