'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup, Marker, Tooltip, CircleMarker } from 'react-leaflet'
import type { Zone, AdminProfile } from '@/types'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [20, 32], iconAnchor: [10, 32] })

const zoneColors: Record<string, string> = {
  red: '#dc2626',
  yellow: '#d97706',
  green: '#16a34a',
}

interface Props {
  zones: Zone[]
  admins?: AdminProfile[]
  center?: [number, number]
  userLocation?: [number, number]
  showAdmins?: boolean
  height?: string
}

export default function CrowdMap({
  zones,
  admins = [],
  center,
  userLocation,
  showAdmins = false,
  height = '100%',
}: Props) {
  const mapCenter: [number, number] = center ?? [
    zones.reduce((s, z) => s + z.lat, 0) / Math.max(zones.length, 1),
    zones.reduce((s, z) => s + z.lng, 0) / Math.max(zones.length, 1),
  ]

  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon
  }, [])

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {zones.map(zone => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color: zoneColors[zone.status],
              fillColor: zoneColors[zone.status],
              fillOpacity: zone.status === 'red' ? 0.28 : 0.18,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-40">
                <p className="font-semibold text-sm">{zone.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Density: <strong>{zone.density_percent}%</strong>
                </p>
                <p className="text-xs text-gray-600">
                  Count: {zone.current_count} / {zone.capacity}
                </p>
                <p className={`text-xs font-medium mt-1 uppercase ${
                  zone.status === 'red' ? 'text-red-600' :
                  zone.status === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {zone.status === 'red' ? 'Danger' : zone.status === 'yellow' ? 'Moderate' : 'Safe'}
                </p>
              </div>
            </Popup>
            <Tooltip direction="top" permanent={zone.status === 'red'} opacity={0.85}>
              <span className="text-xs font-medium">{zone.name} · {zone.density_percent}%</span>
            </Tooltip>
          </Circle>
        ))}

        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={9}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
          >
            <Tooltip direction="top" permanent opacity={0.9}>
              <span className="text-xs font-medium">You are here</span>
            </Tooltip>
          </CircleMarker>
        )}

        {showAdmins && admins.filter(a => a.gps_lat && a.gps_lng).map(admin => (
          <Marker key={admin.id} position={[admin.gps_lat!, admin.gps_lng!]}>
            <Popup>
              <p className="font-semibold text-sm">{admin.name}</p>
              <p className="text-xs text-gray-500">{admin.zone_name}</p>
              <p className={`text-xs mt-1 ${admin.online ? 'text-green-600' : 'text-gray-400'}`}>
                {admin.online ? 'Online' : 'Offline'}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
