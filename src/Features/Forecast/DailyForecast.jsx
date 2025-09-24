import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { getGeocode } from "../../utils/getGeocode";
import { reverseGeocode } from "../../utils/reverseGeocode";
import { getCurrentWeather } from "../../utils/getDailyWeather";
import { iconForWmo } from "../../utils/iconMapping";

export default function DailyForecast() {
  const [coordinates, setCoordinates] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);

  // Acquire coordinates
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const { coords, error } = await getGeocode();
      if (cancelled) return;
      if (error) {
        setErrorInfo(error);
        setIsLoading(false);
        return;
      }
      setCoordinates(coords);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reverse geocode and fetch weather
  useEffect(() => {
    if (!coordinates) return;
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);

        const geocodeResult = await reverseGeocode(
          coordinates.lat,
          coordinates.lon
        );
        const weatherResult = await getCurrentWeather(
          coordinates.lat,
          coordinates.lon
        );

        if (cancelled) return;

        if (weatherResult?.error) {
          throw new Error(weatherResult.error.message || "Weather error");
        }

        setLocationInfo(geocodeResult.place);
        setCurrentWeather(weatherResult);
        setErrorInfo(null);
      } catch (error) {
        setErrorInfo({
          message: error.message || "Failed to load weather.",
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coordinates]);

  const iconName = useMemo(
    () => iconForWmo(currentWeather?.weatherCode, currentWeather?.isDay),
    [currentWeather?.weatherCode, currentWeather?.isDay]
  );

  return (
    <main className="main">
      <div className="main__center">
        {/* Location card */}
        <section className="location">
          <div className="location-card">
            <h2>Location</h2>
            <ul className="location-list">
              <li>
                <span className="label">City</span>
                <span className="value">{locationInfo?.city ?? "—"}</span>
              </li>
              <li>
                <span className="label">State</span>
                <span className="value">{locationInfo?.state ?? "—"}</span>
              </li>
              <li>
                <span className="label">Latitude / Longitude</span>
                <span className="value">
                  {coordinates
                    ? `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(
                        4
                      )}`
                    : "—"}
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Weather card */}
        <section className="weather">
          <div className="weather-card">
            <h2>Weather</h2>

            {isLoading && (
              <div className="weather-description">Loading…</div>
            )}

            {errorInfo && !isLoading && (
              <div
                className="weather-description"
                style={{ color: "var(--danger)" }}
              >
                {errorInfo.message || "Something went wrong."}
              </div>
            )}

            {!isLoading && !errorInfo && currentWeather && (
              <>
                <div className="weather-header">
                  <div className="weather-location">
                    <span className="weather-city">
                      {locationInfo?.label ?? "—"}
                    </span>
                    <span className="weather-state">
                      {currentWeather.description ?? "—"}
                    </span>
                  </div>

                  <div className="weather-temperature">
                    <span className="weather-temperature-value">
                      {currentWeather.temp != null
                        ? Math.round(currentWeather.temp)
                        : "—"}
                      °F
                    </span>
                    <span className="weather-description">
                      Feels like{" "}
                      {currentWeather.feelsLike != null
                        ? Math.round(currentWeather.feelsLike)
                        : "—"}
                      °F
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 8,
                  }}
                >
                  <Icon icon={iconName} width={64} height={64} />
                </div>

                <div className="weather-details">
                  <div className="weather-detail-row">
                    <span className="label">Humidity</span>
                    <span className="value">
                      {currentWeather.humidity ?? "—"}%
                    </span>
                  </div>
                  <div className="weather-detail-row">
                    <span className="label">Wind</span>
                    <span className="value">
                      {currentWeather.windSpeed ?? "—"} mph @{" "}
                      {currentWeather.windDir ?? "—"}°
                    </span>
                  </div>
                  <div className="weather-detail-row">
                    <span className="label">Pressure</span>
                    <span className="value">
                      {currentWeather.pressureMsl ?? "—"} hPa
                    </span>
                  </div>
                  <div className="weather-detail-row">
                    <span className="label">Cloud cover</span>
                    <span className="value">
                      {currentWeather.cloudCover ?? "—"}%
                    </span>
                  </div>
                  <div className="weather-detail-row">
                    <span className="label">Precipitation</span>
                    <span className="value">
                      {currentWeather.precip ?? "—"} in
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
