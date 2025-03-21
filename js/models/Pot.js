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