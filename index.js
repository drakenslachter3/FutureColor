// Ingredient class
class Ingredient {
    constructor(mixTime, mixSpeed, color, structure) {
        this.mixTime = mixTime;
        this.mixSpeed = mixSpeed;
        this.color = color;
        this.structure = structure;
        this.element = null;
        this.id = 'ingredient_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    render() {
        const element = document.createElement('div');
        element.id = this.id;
        element.className = 'ingredient';
        element.dataset.mixTime = this.mixTime;
        element.dataset.mixSpeed = this.mixSpeed;
        element.dataset.structure = this.structure;
        
        // Position randomly in the workspace
        const workspace = document.getElementById('workspace');
        const workspaceRect = workspace.getBoundingClientRect();
        const maxX = workspaceRect.width - 60; // Subtract ingredient width
        const maxY = workspaceRect.height - 60; // Subtract ingredient height
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        element.style.left = randomX + 'px';
        element.style.top = randomY + 'px';
        
        // Set background color
        if (typeof this.color === 'object' && this.color.r !== undefined) {
            // RGB color
            element.style.backgroundColor = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
            element.textContent = `R:${this.color.r} G:${this.color.g} B:${this.color.b}`;
        } else if (typeof this.color === 'object' && this.color.h !== undefined) {
            // HSL color
            element.style.backgroundColor = `hsl(${this.color.h}, ${this.color.s}%, ${this.color.l}%)`;
            element.textContent = `H:${this.color.h} S:${this.color.s} L:${this.color.l}`;
        }
        
        // Apply visual structure
        this.applyStructure(element);
        
        // Make draggable
        this.makeDraggable(element);
        
        this.element = element;
        workspace.appendChild(element);
        return element;
    }
    
    applyStructure(element) {
        switch (this.structure) {
            case 'grain':
                element.style.borderRadius = '30%';
                element.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
                break;
            case 'coarse':
                element.style.borderRadius = '15%';
                element.style.boxShadow = 'inset 0 0 15px rgba(0,0,0,0.7)';
                break;
            case 'smooth':
                element.style.borderRadius = '50%';
                element.style.boxShadow = 'inset 0 0 5px rgba(0,0,0,0.3)';
                break;
            case 'slimy':
                element.style.borderRadius = '40%';
                element.style.boxShadow = '0 0 10px rgba(0,255,0,0.5)';
                // Add wavy border effect for slimy
                element.style.animation = 'slime 3s infinite alternate';
                if (!document.getElementById('slimeAnimation')) {
                    const style = document.createElement('style');
                    style.id = 'slimeAnimation';
                    style.textContent = `
                        @keyframes slime {
                            0% { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
                            100% { border-radius: 40% 60% 70% 30% / 50% 60% 30% 60%; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                break;
        }
    }
    
    makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            element.style.zIndex = 1000; // Bring to front
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const workspace = document.getElementById('workspace');
            const workspaceRect = workspace.getBoundingClientRect();
            
            // Calculate new position within bounds of workspace
            let newX = e.clientX - workspaceRect.left - offsetX;
            let newY = e.clientY - workspaceRect.top - offsetY;
            
            // Constrain to workspace boundaries
            newX = Math.max(0, Math.min(newX, workspaceRect.width - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, workspaceRect.height - element.offsetHeight));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = 1; // Reset z-index
            }
        });
    }
}

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

// Pot class
class Pot {
    constructor() {
        this.ingredients = [];
        this.mixSpeed = null; // Will be set based on first ingredient added
        this.element = null;
        this.id = 'pot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    render() {
        const element = document.createElement('div');
        element.id = this.id;
        element.className = 'pot';
        
        // Position randomly in the workspace
        const workspace = document.getElementById('workspace');
        const workspaceRect = workspace.getBoundingClientRect();
        const maxX = workspaceRect.width - 100; // Subtract pot width
        const maxY = workspaceRect.height - 100; // Subtract pot height
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        element.style.left = randomX + 'px';
        element.style.top = randomY + 'px';
        
        // Create the pot appearance
        const potLabel = document.createElement('div');
        potLabel.className = 'pot-label';
        potLabel.textContent = 'Empty Pot';
        element.appendChild(potLabel);
        
        // Make draggable
        this.makeDraggable(element);
        
        // Set up as dropzone for ingredients
        this.setupDropZone(element);
        
        this.element = element;
        workspace.appendChild(element);
        return element;
    }
    
    makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', (e) => {
            // Prevent dragging when clicking on an ingredient inside the pot
            if (e.target.classList.contains('ingredient-in-pot')) {
                return;
            }
            
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            element.style.zIndex = 1000; // Bring to front
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const workspace = document.getElementById('workspace');
            const workspaceRect = workspace.getBoundingClientRect();
            
            // Calculate new position within bounds of workspace
            let newX = e.clientX - workspaceRect.left - offsetX;
            let newY = e.clientY - workspaceRect.top - offsetY;
            
            // Constrain to workspace boundaries
            newX = Math.max(0, Math.min(newX, workspaceRect.width - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, workspaceRect.height - element.offsetHeight));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = 1; // Reset z-index
            }
        });
    }
    
    setupDropZone(element) {
        // Variables to store drag state
        let draggedIngredient = null;
        
        // Event listeners to handle dragging ingredients over a pot
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('ingredient')) {
                draggedIngredient = e.target;
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!draggedIngredient) return;
            
            // Check if dropping on this pot
            const potRect = element.getBoundingClientRect();
            if (
                e.clientX >= potRect.left &&
                e.clientX <= potRect.right &&
                e.clientY >= potRect.top &&
                e.clientY <= potRect.bottom
            ) {
                this.tryAddIngredient(draggedIngredient);
            }
            
            draggedIngredient = null;
        });
    }
    
    tryAddIngredient(ingredientElement) {
        const mixSpeed = ingredientElement.dataset.mixSpeed;
        
        // If pot is empty, set the mix speed
        if (this.ingredients.length === 0) {
            this.mixSpeed = mixSpeed;
            this.element.dataset.mixSpeed = mixSpeed;
            this.updatePotLabel();
        } 
        // If pot has ingredients, check if mix speed matches
        else if (mixSpeed !== this.mixSpeed) {
            alert('Only ingredients with the same mix speed can be added to a pot!');
            return;
        }
        
        // Add ingredient to the pot
        // Create an object to store ingredient data
        const ingredientData = {
            id: ingredientElement.id,
            mixTime: parseInt(ingredientElement.dataset.mixTime),
            mixSpeed: ingredientElement.dataset.mixSpeed,
            structure: ingredientElement.dataset.structure,
            color: this.extractColor(ingredientElement)
        };
        
        this.ingredients.push(ingredientData);
        
        // Remove original ingredient from workspace
        ingredientElement.remove();
        
        // Add visual representation to pot
        this.renderIngredientsInPot();
        this.updatePotLabel();
        this.updatePotColor();
    }
    
    renderIngredientsInPot() {
        // Clear existing ingredient visuals
        const existingIngredients = this.element.querySelectorAll('.ingredient-in-pot');
        existingIngredients.forEach(el => el.remove());
        
        // Create a container for ingredients if it doesn't exist
        let ingredientsContainer = this.element.querySelector('.pot-ingredients');
        if (!ingredientsContainer) {
            ingredientsContainer = document.createElement('div');
            ingredientsContainer.className = 'pot-ingredients';
            this.element.appendChild(ingredientsContainer);
        } else {
            ingredientsContainer.innerHTML = '';
        }
        
        // Add each ingredient as a small visual element
        this.ingredients.forEach((ingredient, index) => {
            const ingredientEl = document.createElement('div');
            ingredientEl.className = 'ingredient-in-pot';
            ingredientEl.style.backgroundColor = this.getColorString(ingredient.color);
            
            // Position in a circle around the center of the pot
            const angle = (index / this.ingredients.length) * 2 * Math.PI;
            const radius = 30; // Distance from center
            const x = 50 + radius * Math.cos(angle) - 10; // Center at 50,50; ingredient is 20x20
            const y = 50 + radius * Math.sin(angle) - 10;
            
            ingredientEl.style.left = x + 'px';
            ingredientEl.style.top = y + 'px';
            
            ingredientsContainer.appendChild(ingredientEl);
        });
    }
    
    updatePotLabel() {
        const label = this.element.querySelector('.pot-label');
        if (this.ingredients.length === 0) {
            label.textContent = 'Empty Pot';
        } else {
            label.textContent = `Pot (${this.mixSpeed} - ${this.ingredients.length} ingredients)`;
        }
    }
    
    updatePotColor() {
        // If no ingredients, keep default appearance
        if (this.ingredients.length === 0) return;
        
        // Simple color mixing - average RGB values
        let red = 0, green = 0, blue = 0;
        
        this.ingredients.forEach(ingredient => {
            const color = ingredient.color;
            // If RGB
            if (color.r !== undefined) {
                red += color.r;
                green += color.g;
                blue += color.b;
            } 
            // If HSL, convert to RGB first
            else if (color.h !== undefined) {
                const rgb = this.hslToRgb(color.h, color.s, color.l);
                red += rgb.r;
                green += rgb.g;
                blue += rgb.b;
            }
        });
        
        // Average the colors
        red = Math.round(red / this.ingredients.length);
        green = Math.round(green / this.ingredients.length);
        blue = Math.round(blue / this.ingredients.length);
        
        // Apply to pot, but with transparency to show it's a liquid
        this.element.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, 0.7)`;
    }
    
    extractColor(element) {
        // Extract RGB or HSL from the element background or content
        const bgColor = element.style.backgroundColor;
        
        // If the color is in RGB format
        if (bgColor.startsWith('rgb')) {
            const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        }
        
        // If the color is in HSL format
        if (bgColor.startsWith('hsl')) {
            const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                return {
                    h: parseInt(match[1]),
                    s: parseInt(match[2]),
                    l: parseInt(match[3])
                };
            }
        }
        
        // Fallback: parse from text content
        const text = element.textContent.trim();
        if (text.startsWith('R:')) {
            const rgbValues = text.match(/R:(\d+) G:(\d+) B:(\d+)/);
            if (rgbValues) {
                return {
                    r: parseInt(rgbValues[1]),
                    g: parseInt(rgbValues[2]),
                    b: parseInt(rgbValues[3])
                };
            }
        } else if (text.startsWith('H:')) {
            const hslValues = text.match(/H:(\d+) S:(\d+) L:(\d+)/);
            if (hslValues) {
                return {
                    h: parseInt(hslValues[1]),
                    s: parseInt(hslValues[2]),
                    l: parseInt(hslValues[3])
                };
            }
        }
        
        // Default to black if all else fails
        return { r: 0, g: 0, b: 0 };
    }
    
    getColorString(color) {
        if (color.r !== undefined) {
            return `rgb(${color.r}, ${color.g}, ${color.b})`;
        } else if (color.h !== undefined) {
            return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
        }
        return 'black'; // Fallback
    }
    
    // Helper function to convert HSL to RGB
    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (0 <= h && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (60 <= h && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (120 <= h && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (180 <= h && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (240 <= h && h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }
}

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

// MixingMachine class
class MixingMachine {
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
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', (e) => {
            // Don't drag if we're mixing or clicking on a specific element
            if (this.isMixing || e.target.classList.contains('machine-input-slot') || 
                e.target.classList.contains('machine-output-slot')) {
                return;
            }
            
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            element.style.zIndex = 1000; // Bring to front
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const workspace = document.getElementById('workspace');
            const workspaceRect = workspace.getBoundingClientRect();
            
            // Calculate new position within bounds of workspace
            let newX = e.clientX - workspaceRect.left - offsetX;
            let newY = e.clientY - workspaceRect.top - offsetY;
            
            // Constrain to workspace boundaries
            newX = Math.max(0, Math.min(newX, workspaceRect.width - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, workspaceRect.height - element.offsetHeight));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = 1; // Reset z-index
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

// Weather service to simulate weather conditions
class WeatherService {
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