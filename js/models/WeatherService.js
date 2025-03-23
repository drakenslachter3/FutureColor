export default class WeatherService {
    constructor() {
        this.currentWeather = {
            temperature: 20,
            rain: false,
            snow: false,
            location: 'Amsterdam'
        };
        this.machines = [];
        this.tempHighAlert = false;
    }
    
    async fetchWeather(location) {
        try {
            // In a real application, this would be an actual API call
            // For the simulation, we'll use a mock API with random weather
            const response = await this.mockWeatherAPI(location);
            this.currentWeather = response;
            
            // Update all registered machines
            this.updateMachines();
            
            // Check temperature high alert
            this.checkTemperatureAlert();
            
            // Update weather display
            this.updateWeatherDisplay();
            
            return response;
        } catch (error) {
            console.error('Error fetching weather:', error);
            return this.currentWeather;
        }
    }
    
    mockWeatherAPI(location) {
        return new Promise((resolve) => {
            // Simulate API delay
            setTimeout(() => {
                // Generate random weather based on location
                const isNorth = location.toLowerCase().includes('amsterdam') || 
                                location.toLowerCase().includes('oslo') || 
                                location.toLowerCase().includes('stockholm');
                
                const isSouth = location.toLowerCase().includes('madrid') || 
                               location.toLowerCase().includes('rome') || 
                               location.toLowerCase().includes('athens');
                
                // Base temperature ranges by region
                let tempMin, tempMax;
                
                if (isNorth) {
                    tempMin = -5;
                    tempMax = 25;
                } else if (isSouth) {
                    tempMin = 10;
                    tempMax = 40;
                } else {
                    tempMin = 0;
                    tempMax = 30;
                }
                
                // Random temperature within range
                const temperature = Math.floor(Math.random() * (tempMax - tempMin + 1)) + tempMin;
                
                // Precipitation chances
                const rainChance = isNorth ? 0.4 : (isSouth ? 0.1 : 0.25);
                const snowChance = temperature < 5 ? 0.3 : 0;
                
                const weather = {
                    temperature: temperature,
                    rain: Math.random() < rainChance,
                    snow: Math.random() < snowChance,
                    location: location
                };
                
                resolve(weather);
            }, 500);
        });
    }
    
    registerMachine(machine) {
        this.machines.push(machine);
        // Update the machine with current weather immediately
        machine.updateWeatherMultiplier(this.currentWeather);
    }
    
    updateMachines() {
        this.machines.forEach(machine => {
            machine.updateWeatherMultiplier(this.currentWeather);
        });
    }
    
    checkTemperatureAlert() {
        // Check if temperature is above 35 degrees
        if (this.currentWeather.temperature > 35) {
            // If we're not already in alert mode, show the alert
            if (!this.tempHighAlert) {
                this.tempHighAlert = true;
                alert(`Warning: Temperature is above 35°C (${this.currentWeather.temperature}°C).\nOnly 1 mixing machine can operate at a time!`);
                
                // Disable excess machines
                this.limitActiveMachines();
            }
        } else {
            // Reset alert state if temperature drops
            this.tempHighAlert = false;
        }
    }
    
    limitActiveMachines() {
        // If temperature is too high, only allow one machine to mix at a time
        if (this.tempHighAlert) {
            let activeMachines = this.machines.filter(machine => machine.isMixing);
            
            // If more than one machine is active, stop all but the first one
            if (activeMachines.length > 1) {
                // Keep the first one running
                for (let i = 1; i < activeMachines.length; i++) {
                    activeMachines[i].releasePot();
                }
                
                alert(`Temperature too high! Only the first machine will continue mixing.`);
            }
        }
    }
    
    updateWeatherDisplay() {
        let weatherDisplay = document.getElementById('weatherDisplay');
        
        if (!weatherDisplay) {
            // Create weather display if it doesn't exist
            weatherDisplay = document.createElement('div');
            weatherDisplay.id = 'weatherDisplay';
            document.body.appendChild(weatherDisplay);
        }
        
        // Update content
        let weatherText = `📍 ${this.currentWeather.location}: ${this.currentWeather.temperature}°C`;
        
        if (this.currentWeather.rain) {
            weatherText += ' 🌧️';
        } else if (this.currentWeather.snow) {
            weatherText += ' ❄️';
        } else {
            weatherText += ' ☀️';
        }
        
        if (this.tempHighAlert) {
            weatherText += ' 🔥 HIGH TEMP ALERT!';
        }
        
        weatherDisplay.textContent = weatherText;
    }
}