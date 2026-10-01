// make a placeholder so that we can add the map functionality.
import { useEffect } from 'react'

import {
  MapContainer, TileLayer, useMap
} from 'react-leaflet'

// dynamic
function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(positions, { padding: [50, 50] })
  }, [map, positions])
  return null
}


export default function TripMap(
  { startLocation, endLocation,
    endCoordinates, startCoordinates
  }) {
  // if I don't have startLocation or end location let's
  // put a placeholder.
  if (!startCoordinates || !endCoordinates) {
    return <div className="card bg-base-200 shadow-sm">
      <div className="card-body items-center justify-center min-h-48 text-base-content/40 text-sm">
        route map — {startLocation} → {endLocation}
      </div>
    </div>
  }
  // positions start and end points
  const positions = [
    [startCoordinates.lat, startCoordinates.lng],
    [endCoordinates.lat, endCoordinates.lng]
  ]
  // center of the map based on the points.
  const center = [
    (startCoordinates.lat + endCoordinates.lat) / 2,
    (startCoordinates.lng + endCoordinates.lng) / 2
  ]

  return <div
    className="rounded-box overflow-hidden shadow-sm"
    style={{ height: '300px' }}
  >
    <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />
    </MapContainer>
  </div>

}