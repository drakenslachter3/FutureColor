export default class HallController {
    constructor() {
        this.halls = {
            hall1: {
                element: null
            },
            hall2: {
                element: null
            }
        };
        this.mixingMachineController = null;
        this.ingredientsPanel = null;
    }
    
    registerMixingMachineController(mixingMachineController) {
        this.mixingMachineController = mixingMachineController;
    }
    
    initializeHalls() {
        this.ingredientsPanel = document.querySelector('.ingredients-panel');
        this.halls.hall1.element = document.getElementById('workspace');
        
        // Create Hall 2
        this.createHall2();
        
        // Add hall selector UI
        this.setupHallControls();
    }
    
    createHall2() {
        // Create hall 2 (initially hidden)
        const hall2 = document.createElement('div');
        hall2.id = 'workspace2';
        hall2.className = 'workspace';
        hall2.style.display = 'none';
        document.querySelector('.container').appendChild(hall2);
        this.halls.hall2.element = hall2;
    }
    
    setupHallControls() {
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
        
        this.ingredientsPanel.appendChild(document.createElement('hr'));
        this.ingredientsPanel.appendChild(hallSection);
        
        // Event listeners for hall switching
        document.getElementById('hall1Button').addEventListener('click', () => {
            this.switchHall('hall1');
        });
        
        document.getElementById('hall2Button').addEventListener('click', () => {
            this.switchHall('hall2');
        });
    }
    
    switchHall(hallId) {
        // Update buttons
        document.querySelectorAll('.hall-button').forEach(button => {
            button.classList.remove('active');
        });
        
        const buttonId = hallId === 'hall1' ? 'hall1Button' : 'hall2Button';
        document.getElementById(buttonId).classList.add('active');
        
        // Hide/show halls
        this.halls.hall1.element.style.display = hallId === 'hall1' ? 'block' : 'none';
        this.halls.hall2.element.style.display = hallId === 'hall2' ? 'block' : 'none';
        
        // Update current hall in MixingMachineController
        if (this.mixingMachineController) {
            this.mixingMachineController.setCurrentHall(hallId);
        }
    }
}
