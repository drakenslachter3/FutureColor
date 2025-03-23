import DraggableUtil from "../utils/DraggableUtils.js";

export default class MixingMachine {
    constructor(mixSpeed, mixTime) {
        this.mixSpeed = mixSpeed;
        this.mixTime = mixTime;
        this.pot = null;
        this.isMixing = false;
        this.element = null;
        this.id = 'machine_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        this.weatherMultiplier = 1; // Default multiplier for mix time
    }
    
    render() {
        const element = document.createElement('div');
        element.id = this.id;
        element.className = 'mixing-machine';
        
        // Position randomly in the workspace
        const workspace = document.getElementById('workspace');
        const workspaceRect = workspace.getBoundingClientRect();
        const maxX = workspaceRect.width - 150; // Subtract machine width
        const maxY = workspaceRect.height - 150; // Subtract machine height
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        element.style.left = randomX + 'px';
        element.style.top = randomY + 'px';
        
        // Create the machine appearance
        const machineLabel = document.createElement('div');
        machineLabel.className = 'machine-label';
        machineLabel.textContent = `Mixer (${this.mixSpeed} - ${this.mixTime}ms)`;
        element.appendChild(machineLabel);
        
        // Create input slot
        const inputSlot = document.createElement('div');
        inputSlot.className = 'machine-input-slot';
        inputSlot.textContent = 'Drop Pot Here';
        element.appendChild(inputSlot);
        
        // Create mixing chamber
        const mixingChamber = document.createElement('div');
        mixingChamber.className = 'machine-mixing-chamber';
        element.appendChild(mixingChamber);
        
        // Create output slot
        const outputSlot = document.createElement('div');
        outputSlot.className = 'machine-output-slot';
        outputSlot.textContent = 'Output';
        element.appendChild(outputSlot);
        
        // Make draggable
        this.makeDraggable(element);
        
        // Set up as dropzone for pots
        this.setupDropZone(element);
        
        this.element = element;
        workspace.appendChild(element);
        return element;
    }
    
    makeDraggable(element) {
        DraggableUtil.makeDraggable(element, {
            shouldDrag: (e) => {
                return !this.isMixing && 
                       !e.target.classList.contains('machine-input-slot') &&
                       !e.target.classList.contains('machine-output-slot');
            }
        });
    }
    
    setupDropZone(element) {
        // Variables to store drag state
        let draggedPot = null;
        
        // Find the input slot specifically
        const inputSlot = element.querySelector('.machine-input-slot');
        
        // Event listeners to handle dragging pots over a machine
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('pot') || 
                e.target.closest('.pot')) {
                draggedPot = e.target.closest('.pot');
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!draggedPot) return;
            
            // Check if dropping on this machine's input slot
            const inputRect = inputSlot.getBoundingClientRect();
            if (
                e.clientX >= inputRect.left &&
                e.clientX <= inputRect.right &&
                e.clientY >= inputRect.top &&
                e.clientY <= inputRect.bottom
            ) {
                this.tryAddPot(draggedPot);
            }
            
            draggedPot = null;
        });
    }
    
    tryAddPot(potElement) {
        // Check if we're already mixing
        if (this.isMixing) {
            alert('This machine is currently mixing!');
            return;
        }
        
        // Check if the pot already has a pot
        if (this.pot) {
            alert('This machine already has a pot! Remove it first.');
            return;
        }
        
        // Get the mix speed from the pot
        const potMixSpeed = potElement.dataset.mixSpeed;
        
        // Check if pot is empty
        if (!potMixSpeed) {
            alert('This pot is empty!');
            return;
        }
        
        // Check if pot mix speed matches machine mix speed
        if (potMixSpeed !== this.mixSpeed) {
            alert(`This machine can only mix pots with ${this.mixSpeed} speed!`);
            return;
        }
        
        // Add pot to the machine
        this.pot = {
            element: potElement,
            // Find the pot object by ID
            id: potElement.id
        };
        
        // Move pot to input slot visually
        const inputSlot = this.element.querySelector('.machine-input-slot');
        const inputRect = inputSlot.getBoundingClientRect();
        const workspaceRect = document.getElementById('workspace').getBoundingClientRect();
        
        // Calculate position to center in input slot
        const newX = inputRect.left - workspaceRect.left + (inputRect.width - potElement.offsetWidth) / 2;
        const newY = inputRect.top - workspaceRect.top + (inputRect.height - potElement.offsetHeight) / 2;
        
        potElement.style.left = newX + 'px';
        potElement.style.top = newY + 'px';
        potElement.style.zIndex = 1; // Under the machine
        
        // Hide the input slot text
        inputSlot.textContent = '';
        
        // Start mixing process
        this.startMixing();
    }
    
    startMixing() {
        if (!this.pot) return;
        
        this.isMixing = true;
        
        // Get the pot object
        const potElement = this.pot.element;
        
        // Find all ingredients in this pot
        const ingredients = this.getPotIngredients(potElement);
        
        if (ingredients.length === 0) {
            alert('This pot has no ingredients to mix!');
            this.releasePot();
            return;
        }
        
        // Find the max mix time among ingredients
        let maxMixTime = 0;
        ingredients.forEach(ingredient => {
            maxMixTime = Math.max(maxMixTime, ingredient.mixTime);
        });
        
        // Apply weather multiplier to mix time
        const adjustedMixTime = maxMixTime * this.weatherMultiplier;
        
        // Update machine state visually
        this.element.classList.add('mixing');
        const mixingChamber = this.element.querySelector('.machine-mixing-chamber');
        mixingChamber.innerHTML = '<div class="mixing-animation"></div>';
        mixingChamber.firstChild.style.animationDuration = (adjustedMixTime / 1000) + 's';
        
        // Create a progress indicator
        const progressBar = document.createElement('div');
        progressBar.className = 'mixing-progress';
        progressBar.innerHTML = '<div class="mixing-progress-bar"></div>';
        mixingChamber.appendChild(progressBar);
        
        const progressBarInner = progressBar.querySelector('.mixing-progress-bar');
        progressBarInner.style.transition = `width ${adjustedMixTime}ms linear`;
        
        // Start the animation
        setTimeout(() => {
            progressBarInner.style.width = '100%';
        }, 50);
        
        // When mixing is complete, move pot to output
        setTimeout(() => {
            this.completeMixing();
        }, adjustedMixTime);
    }
    
    completeMixing() {
        // Update machine state
        this.isMixing = false;
        this.element.classList.remove('mixing');
        
        // Get the mixing chamber and clear it
        const mixingChamber = this.element.querySelector('.machine-mixing-chamber');
        mixingChamber.innerHTML = '';
        
        // Get the input slot and output slot
        const inputSlot = this.element.querySelector('.machine-input-slot');
        const outputSlot = this.element.querySelector('.machine-output-slot');
        
        // Show the input slot text again
        inputSlot.textContent = 'Drop Pot Here';
        
        // Move pot to output slot
        const potElement = this.pot.element;
        const outputRect = outputSlot.getBoundingClientRect();
        const workspaceRect = document.getElementById('workspace').getBoundingClientRect();
        
        // Calculate position to center in output slot
        const newX = outputRect.left - workspaceRect.left + (outputRect.width - potElement.offsetWidth) / 2;
        const newY = outputRect.top - workspaceRect.top + (outputRect.height - potElement.offsetHeight) / 2;
        
        potElement.style.left = newX + 'px';
        potElement.style.top = newY + 'px';
        potElement.style.zIndex = 5; // Above the machine
        
        // Add mixed class to pot
        potElement.classList.add('mixed');
        
        // Release pot from machine
        this.pot = null;
    }
    
    releasePot() {
        if (!this.pot) return;
        
        // Release pot from machine
        const inputSlot = this.element.querySelector('.machine-input-slot');
        inputSlot.textContent = 'Drop Pot Here';
        
        this.pot = null;
        this.isMixing = false;
    }
    
    getPotIngredients(potElement) {
        // This is a helper method to get all ingredients in a pot
        // In a real application, you'd probably have a reference to the Pot object
        // For now, we'll parse the DOM to gather this information
        
        const ingredients = [];
        
        // Get ingredient elements in pot
        const ingredientElements = potElement.querySelectorAll('.ingredient-in-pot');
        
        ingredientElements.forEach(element => {
            // Get background color
            const bgColor = element.style.backgroundColor;
            
            // Extract data from pot label
            const potLabel = potElement.querySelector('.pot-label');
            const labelText = potLabel.textContent;
            const mixSpeedMatch = labelText.match(/\((.*?)\s*-/);
            const mixSpeed = mixSpeedMatch ? mixSpeedMatch[1] : 'medium';
            
            // Create an ingredient object
            const ingredient = {
                mixSpeed: mixSpeed,
                mixTime: this.mixTime, // Default to machine mix time as a fallback
                color: this.extractColor(bgColor)
            };
            
            ingredients.push(ingredient);
        });
        
        return ingredients;
    }
    
    extractColor(colorString) {
        // Parse RGB or RGBA color strings
        if (colorString.startsWith('rgb')) {
            const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        }
        
        // Parse HSL color strings
        if (colorString.startsWith('hsl')) {
            const match = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                return {
                    h: parseInt(match[1]),
                    s: parseInt(match[2]),
                    l: parseInt(match[3])
                };
            }
        }
        
        // Default to black
        return { r: 0, g: 0, b: 0 };
    }
    
    // Update the weather multiplier
    updateWeatherMultiplier(weather) {
        // Reset to default
        this.weatherMultiplier = 1;
        
        // Apply weather-specific adjustments
        if (weather.rain || weather.snow) {
            this.weatherMultiplier *= 1.1; // 10% more mix time
        }
        
        if (weather.temperature < 10) {
            this.weatherMultiplier *= 1.15; // 15% longer mixing
        }
        
        // Update the machine label to reflect changes
        const machineLabel = this.element.querySelector('.machine-label');
        let weatherInfo = '';
        
        if (this.weatherMultiplier !== 1) {
            weatherInfo = ` (Weather: ${(this.weatherMultiplier * 100).toFixed(0)}%)`;
        }
        
        machineLabel.textContent = `Mixer (${this.mixSpeed} - ${this.mixTime}ms)${weatherInfo}`;
    }
}