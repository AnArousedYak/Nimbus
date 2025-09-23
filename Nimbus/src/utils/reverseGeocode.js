const REV_TIMEOUT_MS = 8000

const fetchWithTimeout = async (url, { timeoutMs, headers }) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal, headers })
    return res
  } finally {
    clearTimeout(timer)
  }
}

const makeLabel = (city, state, zip) => {
  const left = [city, state].filter(Boolean).join(", ")
  const right = zip ? String(zip) : ""
  return [left, right].filter(Boolean).join(" ")
}

const parseNominatim = (json) => {
  const a = json?.address || {}
  const city = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || ""
  const state = a.state || a.region || ""
  const zip = a.postcode || ""
  const country = a.country || ""
  if (!city && !state && !zip && !country) {
    const err = new Error("Nominatim: missing address fields")
    err.code = "NOMINATIM_EMPTY"
    throw err
  }
  return { city, state, zip, country, label: makeLabel(city, state, zip), source: "nominatim" }
}

const parseBigDataCloud = (json) => {
  const city = json.city || json.locality || json.principalSubdivisionLocality || ""
  const state = json.principalSubdivision || ""
  const country = json.countryName || ""
  const zip = json.postcode || json.postCode || ""
  if (!city && !state && !zip && !country) {
    const err = new Error("BigDataCloud: missing address fields")
    err.code = "BDC_EMPTY"
    throw err
  }
  return { city, state, zip, country, label: makeLabel(city, state, zip), source: "bigdatacloud" }
}

const tryNominatim = async (lat, lon) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1&accept-language=en`
    const res = await fetchWithTimeout(url, { timeoutMs: REV_TIMEOUT_MS, headers: { Accept: "application/json" } })
    if (!res.ok) {
      const err = new Error(`Nominatim HTTP ${res.status} ${res.statusText}`)
      err.code = "NOMINATIM_HTTP"
      throw err
    }
    const json = await res.json()
    return parseNominatim(json)
  } catch (err) {
    err && err.message
    return null
  }
}

const fetchBDC = async (lat, lon) => {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
  const res = await fetchWithTimeout(url, { timeoutMs: REV_TIMEOUT_MS, headers: { Accept: "application/json" } })
  if (!res.ok) {
    const err = new Error(`BigDataCloud HTTP ${res.status} ${res.statusText}`)
    err.code = "BDC_HTTP"
    throw err
  }
  const json = await res.json()
  return parseBigDataCloud(json)
}

export async function reverseGeocode(lat, lon) {
  const first = await tryNominatim(lat, lon)
  if (first) return { place: first, error: null }
  try {
    const second = await fetchBDC(lat, lon)
    return { place: second, error: null }
  } catch (error) {
    const code = error?.name === "AbortError" ? "REV_ABORTED" : error?.code || "REV_ERROR"
    const message = error?.name === "AbortError" ? "Lookup aborted." : error?.message || "Reverse geocoding failed."
    return { place: null, error: { code, message } }
  }
}
