// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const colorType = document.getElementById('colorType');
    const rgbControls = document.getElementById('rgbControls');
    const hslControls = document.getElementById('hslControls');
    
    // Toggle color controls based on selection
    colorType.addEventListener('change', () => {
        if (colorType.value === 'rgb') {
            rgbControls.style.display = 'block';
            hslControls.style.display = 'none';
        } else {
            rgbControls.style.display = 'none';
            hslControls.style.display = 'block';
        }
    });
    
    // Update slider values
    ['red', 'green', 'blue', 'hue', 'saturation', 'lightness'].forEach(id => {
        const slider = document.getElementById(id);
        const valueElement = document.getElementById(id + 'Value');
        
        slider.addEventListener('input', () => {
            valueElement.textContent = slider.value;
        });
    });
    
    // Handle form submission
    const ingredientForm = document.getElementById('ingredientForm');
    ingredientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mixTime = parseInt(document.getElementById('mixTime').value);
        const mixSpeed = document.getElementById('mixSpeed').value;
        const structure = document.getElementById('structure').value;
        
        let color;
        if (colorType.value === 'rgb') {
            color = {
                r: parseInt(document.getElementById('red').value),
                g: parseInt(document.getElementById('green').value),
                b: parseInt(document.getElementById('blue').value)
            };
        } else {
            color = {
                h: parseInt(document.getElementById('hue').value),
                s: parseInt(document.getElementById('saturation').value),
                l: parseInt(document.getElementById('lightness').value)
            };
        }
        
        const ingredient = new Ingredient(mixTime, mixSpeed, color, structure);
        ingredient.render();
    });
});

// Add create pot button and functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add a button to create new pots
    const ingredientsPanel = document.querySelector('.ingredients-panel');
    
    const createPotButton = document.createElement('button');
    createPotButton.id = 'createPotButton';
    createPotButton.textContent = 'Create New Pot';
    createPotButton.style.marginTop = '1rem';
    
    ingredientsPanel.appendChild(createPotButton);
    
    // Event listener for pot creation
    createPotButton.addEventListener('click', () => {
        const pot = new Pot();
        pot.render();
    });
});

// Weather service to simulate weather conditions


// Add mixing machine creation functionality
document.addEventListener('DOMContentLoaded', () => {
    const ingredientsPanel = document.querySelector('.ingredients-panel');
    
    // Add a section for creating mixing machines
    const machineSection = document.createElement('div');
    machineSection.className = 'machine-section';
    machineSection.innerHTML = `
        <h2>Create Mixing Machine</h2>
        <div class="form-group">
            <label for="machineMixSpeed">Mix Speed:</label>
            <select id="machineMixSpeed">
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
            </select>
        </div>
        <div class="form-group">
            <label for="machineMixTime">Mix Time (ms):</label>
            <input type="number" id="machineMixTime" min="1000" step="500" value="3000">
        </div>
        <button id="createMachineButton">Create Mixing Machine</button>
    `;
    
    // Add weather control
    const weatherSection = document.createElement('div');
    weatherSection.className = 'weather-section';
    weatherSection.innerHTML = `
        <h2>Weather Control</h2>
        <div class="form-group">
            <label for="weatherLocation">Location:</label>
            <input type="text" id="weatherLocation" value="Amsterdam">
        </div>
        <button id="updateWeatherButton">Update Weather</button>
    `;
    
    // Add hall selector
    const hallSection = document.createElement('div');
    hallSection.className = 'hall-section';
    hallSection.innerHTML = `
        <h2>Mixing Halls</h2>
        <div class="hall-buttons">
            <button id="hall1Button" class="hall-button active">Hall 1</button>
            <button id="hall2Button" class="hall-button">Hall 2</button>
        </div>
    `;
    
    ingredientsPanel.appendChild(document.createElement('hr'));
    ingredientsPanel.appendChild(machineSection);
    ingredientsPanel.appendChild(document.createElement('hr'));
    ingredientsPanel.appendChild(weatherSection);
    ingredientsPanel.appendChild(document.createElement('hr'));
    ingredientsPanel.appendChild(hallSection);
    
    // Initialize weather service
    const weatherService = new WeatherService();
    weatherService.fetchWeather('Amsterdam');
    
    // Initialize halls
    const halls = {
        hall1: {
            element: document.getElementById('workspace'),
            machines: []
        },
        hall2: {
            element: null,
            machines: []
        }
    };
    
    // Create hall 2 (initially hidden)
    const hall2 = document.createElement('div');
    hall2.id = 'workspace2';
    hall2.className = 'workspace';
    hall2.style.display = 'none';
    document.querySelector('.container').appendChild(hall2);
    halls.hall2.element = hall2;
    
    // Event listener for machine creation
    document.getElementById('createMachineButton').addEventListener('click', () => {
        const mixSpeed = document.getElementById('machineMixSpeed').value;
        const mixTime = parseInt(document.getElementById('machineMixTime').value);
        
        // Determine current active hall
        const activeHallId = document.querySelector('.hall-button.active').id;
        const currentHall = activeHallId === 'hall1Button' ? 'hall1' : 'hall2';
        
        // Check temperature limit
        if (weatherService.tempHighAlert) {
            // Count active machines in this hall
            const activeMachines = halls[currentHall].machines.filter(m => m.isMixing);
            if (activeMachines.length > 0) {
                alert('Temperature is too high! Only one machine can operate at a time.');
                return;
            }
        }
        
        // Create the machine
        const machine = new MixingMachine(mixSpeed, mixTime);
        
        // Store original render method
        const originalRender = machine.render;
        
        // Override render to use the current hall
        machine.render = function() {
            // Save original workspace
            const originalWorkspace = document.getElementById('workspace');
            
            // Temporarily set the workspace ID to the current hall
            const activeHall = halls[currentHall].element;
            
            // Call original render with the current hall as workspace
            this.element = originalRender.call(this);
            
            return this.element;
        };
        
        // Render the machine
        machine.render();
        
        // Register with weather service
        weatherService.registerMachine(machine);
        
        // Add to hall collection
        halls[currentHall].machines.push(machine);
    });
    
    // Event listener for weather updates
    document.getElementById('updateWeatherButton').addEventListener('click', () => {
        const location = document.getElementById('weatherLocation').value;
        if (!location) return;
        
        weatherService.fetchWeather(location);
    });
    
    // Event listeners for hall switching
    document.getElementById('hall1Button').addEventListener('click', () => {
        switchHall('hall1');
    });
    
    document.getElementById('hall2Button').addEventListener('click', () => {
        switchHall('hall2');
    });
    
    function switchHall(hallId) {
        // Update buttons
        document.querySelectorAll('.hall-button').forEach(button => {
            button.classList.remove('active');
        });
        
        const buttonId = hallId === 'hall1' ? 'hall1Button' : 'hall2Button';
        document.getElementById(buttonId).classList.add('active');
        
        // Hide/show halls
        halls.hall1.element.style.display = hallId === 'hall1' ? 'block' : 'none';
        halls.hall2.element.style.display = hallId === 'hall2' ? 'block' : 'none';
    }
}); 