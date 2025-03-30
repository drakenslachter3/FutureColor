import WeatherService from "../models/WeatherService.js";

export default class WeatherServiceController {
  constructor(defaultLocation) {
    this.weatherService = new WeatherService();
    this.defaultLocation = defaultLocation;
    this.ingredientsPanel = null;
    this.tempHighAlert = false;
  }

  initializeControls() {
    this.ingredientsPanel = document.querySelector(".ingredients-panel");
    this.setupWeatherControls();

    this.weatherService.fetchWeather(this.defaultLocation);

    this.weatherService.onTemperatureAlert = (isHighTemp) => {
      this.tempHighAlert = isHighTemp;
    };
  }

  setupWeatherControls() {
    const weatherSection = document.createElement("div");
    weatherSection.className = "weather-section";
    weatherSection.innerHTML = `
            <h2>Weer Instellignen</h2>
            <div class="form-group">
                <label for="weatherLocation">Locatie:</label>
                <input type="text" id="weatherLocation" value="${this.defaultLocation}">
            </div>
            <button id="updateWeatherButton">Update Weer</button>
        `;

    this.ingredientsPanel.appendChild(document.createElement("hr"));
    this.ingredientsPanel.appendChild(weatherSection);

    document
      .getElementById("updateWeatherButton")
      .addEventListener("click", () => {
        const location = document.getElementById("weatherLocation").value;
        if (!location) {
          return;
        }

        this.weatherService.fetchWeather(location);
      });
  }

  registerMachine(machine) {
    this.weatherService.registerMachine(machine);
  }
}
