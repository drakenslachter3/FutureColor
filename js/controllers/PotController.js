import Pot from "../models/Pot.js";

export default class PotController {
  constructor() {
    this.ingredientsPanel = null;
  }

  initializeControls() {
    this.ingredientsPanel = document.querySelector(".ingredients-panel");
    this.setupCreatePotButton();
  }

  setupCreatePotButton() {
    const createPotButton = document.createElement("button");
    createPotButton.id = "createPotButton";
    createPotButton.textContent = "Create New Pot";
    createPotButton.style.marginTop = "1rem";

    this.ingredientsPanel.appendChild(createPotButton);

    createPotButton.addEventListener("click", () => {
      const pot = new Pot();
      pot.render();
    });
  }
}
