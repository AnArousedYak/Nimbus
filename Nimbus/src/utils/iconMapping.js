export const WMO_ICON_MAP = {
  0: { day: "wi:day-sunny", night: "wi:night-clear" },
  1: { day: "wi:day-sunny-overcast", night: "wi:night-partly-cloudy" },
  2: { day: "wi:day-cloudy", night: "wi:night-alt-cloudy" },
  3: { day: "wi:cloudy", night: "wi:cloudy" },
  45: { day: "wi:fog", night: "wi:fog" },
  48: { day: "wi:fog", night: "wi:fog" },
  51: { day: "wi:sprinkle", night: "wi:sprinkle" },
  53: { day: "wi:sprinkle", night: "wi:sprinkle" },
  55: { day: "wi:sprinkle", night: "wi:sprinkle" },
  56: { day: "wi:rain-mix", night: "wi:rain-mix" },
  57: { day: "wi:rain-mix", night: "wi:rain-mix" },
  61: { day: "wi:rain", night: "wi:rain" },
  63: { day: "wi:rain", night: "wi:rain" },
  65: { day: "wi:rain", night: "wi:rain" },
  66: { day: "wi:rain-mix", night: "wi:rain-mix" },
  67: { day: "wi:rain-mix", night: "wi:rain-mix" },
  71: { day: "wi:snow", night: "wi:snow" },
  73: { day: "wi:snow", night: "wi:snow" },
  75: { day: "wi:snow", night: "wi:snow" },
  77: { day: "wi:sleet", night: "wi:sleet" },
  80: { day: "wi:showers", night: "wi:showers" },
  81: { day: "wi:showers", night: "wi:showers" },
  82: { day: "wi:showers", night: "wi:showers" },
  85: { day: "wi:snow", night: "wi:snow" },
  86: { day: "wi:snow", night: "wi:snow" },
  95: { day: "wi:thunderstorm", night: "wi:thunderstorm" },
  96: { day: "wi:storm-showers", night: "wi:storm-showers" },
  99: { day: "wi:storm-showers", night: "wi:storm-showers" },
};

export function iconForWmo(code, isDay = true) {
  const entry = WMO_ICON_MAP[Number(code)];
  if (!entry) return isDay ? "wi:day-cloudy-high" : "wi:night-alt-cloudy-high";
  return isDay ? entry.day : entry.night;
}
