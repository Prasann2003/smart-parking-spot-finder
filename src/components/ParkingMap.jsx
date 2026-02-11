import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import L from "leaflet"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

export default function ParkingMap({ userLocation, parkingSpots }) {
  const navigate = useNavigate()

  if (!userLocation) return null

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 10KM Radius Circle */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={10000}
          pathOptions={{ color: "blue" }}
        />

        {/* Parking Markers */}
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
          >
            <Popup>
              <div className="space-y-2">
                <h3 className="font-bold">{spot.name}</h3>
                <p>₹{spot.pricePerHour}/hour</p>
                <p className="text-sm text-gray-600">
                  🅿 {spot.totalSlots || spot.totalCapacity} Slots
                </p>

                <button
                  onClick={() =>
                    navigate("/payment", { state: { spot } })
                  }
                  className="w-full mt-2 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Book Now
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
