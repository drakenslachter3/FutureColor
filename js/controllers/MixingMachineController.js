import MixingMachine from "../models/MixingMachine.js";

export default class MixingMachineController {
  constructor(weatherServiceController) {
    this.ingredientsPanel = null;
    this.weatherServiceController = weatherServiceController;
    this.machines = [];
    this.currentHallId = "hall1";
  }

  initializeControls() {
    this.ingredientsPanel = document.querySelector(".ingredients-panel");
    this.setupMachineControls();
  }

  setupMachineControls() {
    const machineSection = document.createElement("div");
    machineSection.className = "machine-section";
    machineSection.innerHTML = `
            <h2>Mengmachine</h2>
            <div class="form-group">
                <label for="machineMixSpeed">Mixsnelheid:</label>
                <select id="machineMixSpeed">
                    <option value="slow">Langzaam</option>
                    <option value="medium">Middelmatig</option>
                    <option value="fast">Snel</option>
                </select>
            </div>
            <div class="form-group">
                <label for="machineMixTime">Mixsnelheid (ms):</label>
                <input type="number" id="machineMixTime" min="1000" step="500" value="3000">
            </div>
            <button id="createMachineButton">Maak Machine</button>
        `;

    this.ingredientsPanel.appendChild(document.createElement("hr"));
    this.ingredientsPanel.appendChild(machineSection);

    document
      .getElementById("createMachineButton")
      .addEventListener("click", () => {
        this.createMachine();
      });
  }

  createMachine() {
    const mixSpeed = document.getElementById("machineMixSpeed").value;
    const mixTime = parseInt(document.getElementById("machineMixTime").value);

    if (this.weatherServiceController.tempHighAlert) {
      const activeMachines = this.getMachinesInCurrentHall().filter(
        (m) => m.isMixing
      );
      if (activeMachines.length > 0) {
        alert(
          "Temperatuur is te hoog, kan alleen maar 1 machine gebruiken."
        );
        return;
      }
    }

    let speedLabel = "";
    switch(mixSpeed){
      case "slow":
        speedLabel = "Langzaam";
        break;
      case "medium":
        speedLabel = "Middelmatig";
        break;
      case "fast":
        speedLabel = "Snel";
        break;
      default:
        speedLabel = "Onbekende snelheid";
        break;
    }
    const machine = new MixingMachine(mixSpeed, mixTime, speedLabel);

    machine.render();

    this.weatherServiceController.registerMachine(machine);

    this.machines.push({
      machine: machine,
      hallId: this.currentHallId,
    });
  }

  setCurrentHall(hallId) {
    this.currentHallId = hallId;
  }

  getMachinesInCurrentHall() {
    return this.machines
      .filter((item) => item.hallId === this.currentHallId)
      .map((item) => item.machine);
  }
}
