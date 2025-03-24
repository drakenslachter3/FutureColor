export default class WeatherService {
  constructor() {
    this.apiKey = "63c07556814ae15df2321d662533ae0a";
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.currentWeather = null;
    this.machines = [];
    this.tempHighAlert = false;
  }

  async fetchWeather(location) {
    try {
      const url = `${this.apiUrl}?q=${location}&units=metric&APPID=${this.apiKey}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`OpenWeather API error: ${response.statusText}`);
      const data = await response.json();

      const temperature = data.main.temp;
      const weatherConditions = data.weather.map((w) => w.main);

      this.currentWeather = {
        temperature: Math.round(temperature),
        rain: weatherConditions.includes("Rain"),
        snow: weatherConditions.includes("Snow"),
        location: `${data.name}, ${data.sys.country}`,
      };

      this.updateMachines();
      this.checkTemperatureAlert();
      this.updateWeatherDisplay();

      return this.currentWeather;
    } catch (error) {
      console.error("Error fetching weather:", error);
      return this.currentWeather;
    }
  }

  registerMachine(machine) {
    this.machines.push(machine);
    machine.updateWeatherMultiplier(this.currentWeather);
  }

  updateMachines() {
    this.machines.forEach((machine) => {
      machine.updateWeatherMultiplier(this.currentWeather);
    });
  }

  checkTemperatureAlert() {
    if (this.currentWeather.temperature > 35) {
      if (!this.tempHighAlert) {
        this.tempHighAlert = true;
        alert(
          `Warning: Temperature is above 35°C (${this.currentWeather.temperature}°C).\nOnly 1 mixing machine can operate at a time!`
        );

        this.limitActiveMachines();
      }
    } else {
      this.tempHighAlert = false;
    }
  }

  limitActiveMachines() {
    if (this.tempHighAlert) {
      let activeMachines = this.machines.filter((machine) => machine.isMixing);

      if (activeMachines.length > 1) {
        for (let i = 1; i < activeMachines.length; i++) {
          activeMachines[i].releasePot();
        }

        alert(
          `Temperature too high! Only the first machine will continue mixing.`
        );
      }
    }
  }

  updateWeatherDisplay() {
    let weatherDisplay = document.getElementById("weatherDisplay");

    if (!weatherDisplay) {
      weatherDisplay = document.createElement("div");
      weatherDisplay.id = "weatherDisplay";
      document.body.appendChild(weatherDisplay);
    }

    let weatherText = `📍 ${this.currentWeather.location}: ${this.currentWeather.temperature}°C`;

    if (this.currentWeather.rain) {
      weatherText += " 🌧️";
    } else if (this.currentWeather.snow) {
      weatherText += " ❄️";
    } else {
      weatherText += " ☀️";
    }

    if (this.tempHighAlert) weatherText += " 🔥 HIGH TEMP ALERT!";

    weatherDisplay.textContent = weatherText;
  }
}
