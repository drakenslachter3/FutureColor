export default class WeatherService {
  //Weathermap API
  constructor() {
    this.apiKey = "63c07556814ae15df2321d662533ae0a";
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.currentWeather = null;
    this.machines = [];
    this.tempHighAlert = false;
  }

  async fetchWeather(location) {
    //Fetched het weer 
    try {
      const url = `${this.apiUrl}?q=${location}&units=metric&APPID=${this.apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.statusText}`);
      }
      const data = await response.json();

      const temperature = data.main.temp;
      const weatherConditions = data.weather.map((w) => w.main);

      this.currentWeather = {
        temperature: Math.round(temperature),
        rain: weatherConditions.includes("Rain"),
        snow: weatherConditions.includes("Snow"),
        location: `${data.name}, ${data.sys.country}`,
      };

      //Updated de rest van de app
      this.updateMachines();
      this.checkTemperatureAlert();
      this.updateWeatherDisplay();

      return this.currentWeather;
    } catch (error) {
      console.error("Fout met weer ophahlen:", error);
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
          `Waarschuwing: Temperatuur is boven de 35°C (${this.currentWeather.temperature}°C).\nEr kan maaar 1 machine tegelijk mixen!`
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
          `Het is warm! Alleen 1 machine kan blijven mixen.`
        );
      }
    }
  }
  
  updateWeatherDisplay() {
    //Update het weer display rechtsboven
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

    if (this.tempHighAlert) {
      weatherText += " 🔥 HEEL WARM!";
    }

    weatherDisplay.textContent = weatherText;
  }
}
