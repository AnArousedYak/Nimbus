import "./Body.css";
import DailyForecast from "../Features/Forecast/DailyForecast";

export default function Body() {
  return (
    <section className="main">
      <div className="main__center">
        <DailyForecast />
      </div>
    </section>
  );
}
