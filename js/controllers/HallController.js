export default class HallController {
  constructor() {
    this.halls = {
      hall1: {
        element: null,
        ingredients: [],
      },
      hall2: {
        element: null,
        ingredients: [],
      },
    };
    this.mixingMachineController = null;
    this.ingredientsPanel = null;
    this.currentHall = "hall1";
  }

  registerMixingMachineController(mixingMachineController) {
    this.mixingMachineController = mixingMachineController;
  }

  initializeHalls() {
    this.ingredientsPanel = document.querySelector(".ingredients-panel");
    this.halls.hall1.element = document.getElementById("workspace");

    this.createHall2();
    this.setupHallControls();
  }

  createHall2() {
    const hall2 = document.createElement("div");
    hall2.id = "workspace2";
    hall2.className = "workspace";
    hall2.style.display = "none";
    document.querySelector(".container").appendChild(hall2);
    this.halls.hall2.element = hall2;
  }

  setupHallControls() {
    const hallSection = document.createElement("div");
    hallSection.className = "hall-section";
    hallSection.innerHTML = `
            <h2>Hallen</h2>
            <div class="hall-buttons">
                <button id="hall1Button" class="hall-button active">Hal 1</button>
                <button id="hall2Button" class="hall-button">Hal 2</button>
            </div>
        `;

    this.ingredientsPanel.appendChild(document.createElement("hr"));
    this.ingredientsPanel.appendChild(hallSection);

    document.getElementById("hall1Button").addEventListener("click", () => {
      this.switchHall("hall1");
    });
    document.getElementById("hall2Button").addEventListener("click", () => {
      this.switchHall("hall2");
    });
  }

  switchHall(hallId) {
    document.querySelectorAll(".hall-button").forEach((button) => {
      button.classList.remove("active");
    });

    const buttonId = hallId === "hall1" ? "hall1Button" : "hall2Button";
    document.getElementById(buttonId).classList.add("active");

    Object.keys(this.halls).forEach((key) => {
      if (key === hallId) {
        this.halls[key].element.style.display = "block";
      } else {
        this.halls[key].element.style.display = "none";
      }

      // Alle ingredienten van alle menghallen verzamelen
      this.halls[key].ingredients = Array.from(
        this.halls[key].element.querySelectorAll(".ingredient")
      );
    });

    // Alle verzamelde ingredienten aan de huidige menghal
    Object.keys(this.halls).forEach((key) => {
      this.halls[key].ingredients.forEach((ingredient) => {
        this.halls[hallId].element.appendChild(ingredient);
      });
    });

    this.currentHall = hallId;

    if (this.mixingMachineController) {
      this.mixingMachineController.setCurrentHall(hallId);
    }
  }
}
