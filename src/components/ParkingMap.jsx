import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import L from "leaflet"
import { useEffect, memo } from "react"
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

const ParkingMap = memo(function ParkingMap({ userLocation, parkingSpots }) {
  const navigate = useNavigate()

  if (!userLocation || !userLocation.lat || !userLocation.lng) return null

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* 10KM Radius Circle */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={9000}
          pathOptions={{ color: "#4f46e5", fillColor: "#4f46e5", fillOpacity: 0.05, weight: 1, dashArray: "5, 5" }}
        />

        {/* Parking Markers */}
        {parkingSpots && parkingSpots.map((spot) => (
          <Marker
            key={spot.id || spot._id}
            position={[spot.latitude, spot.longitude]}
          >
            <Popup>
              <div className="min-w-[180px] space-y-2 pb-1">
                <h3 className="font-bold text-gray-900 text-sm m-0 leading-tight">{spot.name}</h3>

                <div className="flex items-center gap-1 mt-1 border-b border-gray-100 pb-2">
                  <span className="text-yellow-500 text-xs">★</span>
                  <span className="text-xs font-bold text-gray-700">{spot.averageRating || "New"}</span>
                  <span className="text-xs text-gray-400 mx-1">•</span>
                  <p className="text-indigo-600 font-bold m-0 text-xs">
                    ₹{spot.vehicleConfigs && spot.vehicleConfigs.length > 0
                      ? Math.min(...spot.vehicleConfigs.map(c => c.pricePerHour))
                      : spot.pricePerHour}/hr
                  </p>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-gray-500 font-medium">
                    🅿 {spot.totalSlots || spot.totalCapacity} Slots
                  </span>
                  <div className="flex gap-1 text-[11px]">
                    {spot.covered && <span title="Covered">☂️</span>}
                    {spot.cctv && <span title="CCTV">📹</span>}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/spot/${spot.id || spot._id}`)}
                  className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-md text-xs font-semibold shadow-sm"
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
})

export default ParkingMap
