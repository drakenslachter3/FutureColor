import MixingMachine from "../models/MixingMachine.js";

export default class MixingMachineController {
    constructor(weatherController) {
        this.ingredientsPanel = null;
        this.weatherController = weatherController;
        this.machines = [];
        this.currentHallId = 'hall1';
    }
    
    initializeControls() {
        this.ingredientsPanel = document.querySelector('.ingredients-panel');
        this.setupMachineControls();
    }
    
    setupMachineControls() {
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
        
        this.ingredientsPanel.appendChild(document.createElement('hr'));
        this.ingredientsPanel.appendChild(machineSection);
        
        // Event listener for machine creation
        document.getElementById('createMachineButton').addEventListener('click', () => {
            this.createMachine();
        });
    }
    
    createMachine() {
        const mixSpeed = document.getElementById('machineMixSpeed').value;
        const mixTime = parseInt(document.getElementById('machineMixTime').value);
        
        // Check temperature limit
        if (this.weatherController.tempHighAlert) {
            // Count active machines in this hall
            const activeMachines = this.getMachinesInCurrentHall().filter(m => m.isMixing);
            if (activeMachines.length > 0) {
                alert('Temperature is too high! Only one machine can operate at a time.');
                return;
            }
        }
        
        // Create the machine
        const machine = new MixingMachine(mixSpeed, mixTime);
        
        // Override render to use the current hall
        const originalRender = machine.render;
        machine.render = () => {
            // Get the current hall element
            const hallElement = document.getElementById(this.currentHallId === 'hall1' ? 'workspace' : 'workspace2');
            
            // Call original render with the current hall as workspace
            this.element = originalRender.call(machine);
            
            return this.element;
        };
        
        // Render the machine
        machine.render();
        
        // Register with weather service
        this.weatherController.registerMachine(machine);
        
        // Add to machines collection
        this.machines.push({
            machine: machine,
            hallId: this.currentHallId
        });
    }
    
    setCurrentHall(hallId) {
        this.currentHallId = hallId;
    }
    
    getMachinesInCurrentHall() {
        return this.machines
            .filter(item => item.hallId === this.currentHallId)
            .map(item => item.machine);
    }
}
