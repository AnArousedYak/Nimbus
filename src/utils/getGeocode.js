const GEO_TIMEOUT_MS = 10000

const geolocationErrorToObj = (err) => {
  if (!err || typeof err.code !== "number") {
    return { code: "GEO_UNKNOWN", message: "Unknown geolocation error." }
  }
  switch (err.code) {
    case 1: return { code: "GEO_PERMISSION_DENIED", message: "Permission denied. Enable location access for this site." }
    case 2: return { code: "GEO_POSITION_UNAVAILABLE", message: "Position unavailable. Try moving for better signal." }
    case 3: return { code: "GEO_TIMEOUT", message: "Timed out while acquiring location." }
    default: return { code: `GEO_${err.code}`, message: "Geolocation error occurred." }
  }
}

export async function getGeocode() {
  if (!("geolocation" in navigator)) {
    return { coords: null, error: { code: "GEO_UNSUPPORTED", message: "Geolocation not supported by this browser." } }
  }
  return new Promise((resolve) => {
    let timer = setTimeout(() => {
      resolve({ coords: null, error: { code: "GEO_TIMEOUT", message: "Timed out getting GPS fix." } })
    }, GEO_TIMEOUT_MS)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        resolve({ coords: { lat: pos.coords.latitude, lon: pos.coords.longitude }, error: null })
      },
      (err) => {
        clearTimeout(timer)
        resolve({ coords: null, error: geolocationErrorToObj(err) })
      },
      { enableHighAccuracy: true, timeout: GEO_TIMEOUT_MS }
    )
  })
}
