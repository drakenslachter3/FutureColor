import WeatherService from "../models/WeatherService.js";

export default class WeatherController {
    constructor(defaultLocation = 'Amsterdam') {
        this.weatherService = new WeatherService();
        this.defaultLocation = defaultLocation;
        this.ingredientsPanel = null;
        this.tempHighAlert = false;
    }
    
    initializeControls() {
        this.ingredientsPanel = document.querySelector('.ingredients-panel');
        this.setupWeatherControls();
        
        // Initialize weather service with default location
        this.weatherService.fetchWeather(this.defaultLocation);
        
        // Subscribe to weather alerts
        this.weatherService.onTemperatureAlert = (isHighTemp) => {
            this.tempHighAlert = isHighTemp;
        };
    }
    
    setupWeatherControls() {
        // Add weather control
        const weatherSection = document.createElement('div');
        weatherSection.className = 'weather-section';
        weatherSection.innerHTML = `
            <h2>Weather Control</h2>
            <div class="form-group">
                <label for="weatherLocation">Location:</label>
                <input type="text" id="weatherLocation" value="${this.defaultLocation}">
            </div>
            <button id="updateWeatherButton">Update Weather</button>
        `;
        
        this.ingredientsPanel.appendChild(document.createElement('hr'));
        this.ingredientsPanel.appendChild(weatherSection);
        
        // Event listener for weather updates
        document.getElementById('updateWeatherButton').addEventListener('click', () => {
            const location = document.getElementById('weatherLocation').value;
            if (!location) return;
            
            this.weatherService.fetchWeather(location);
        });
    }
    
    registerMachine(machine) {
        this.weatherService.registerMachine(machine);
    }
}
