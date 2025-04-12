import DraggableUtil from "../utils/DraggableUtils.js";

export default class MixingMachine {
  constructor(mixSpeed, mixTime, speedLabel) {
    this.mixSpeed = mixSpeed;
    this.speedLabel = speedLabel;
    this.mixTime = mixTime;
    this.pot1 = null;
    this.pot2 = null;
    this.isMixing = false;
    this.element = null;
    this.id = "machine_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    this.weatherMultiplier = 1;
  }

  render() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = "mixing-machine";

    const workspace = document.querySelector(
      ".workspace:not([style*='display: none'])"
    );
    const workspaceRect = workspace.getBoundingClientRect();
    const maxX = workspaceRect.width - 150;
    const maxY = workspaceRect.height - 150;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    element.style.left = randomX + "px";
    element.style.top = randomY + "px";

    const machineLabel = document.createElement("div");
    machineLabel.className = "machine-label";
    machineLabel.textContent = `Mixer (${this.mixSpeed} - ${this.mixTime}ms)`;
    element.appendChild(machineLabel);

    const inputSlot1 = document.createElement("div");
    inputSlot1.className = "machine-input-slot";
    inputSlot1.dataset.slotNumber = "1";
    inputSlot1.textContent = "Pot 1";
    element.appendChild(inputSlot1);

    const inputSlot2 = document.createElement("div");
    inputSlot2.className = "machine-input-slot";
    inputSlot2.dataset.slotNumber = "2";
    inputSlot2.textContent = "Pot 2";
    element.appendChild(inputSlot2);

    const mixingChamber = document.createElement("div");
    mixingChamber.className = "machine-mixing-chamber";
    element.appendChild(mixingChamber);

    const outputSlot = document.createElement("div");
    outputSlot.className = "machine-output-slot";
    outputSlot.textContent = "Uit";
    element.appendChild(outputSlot);

    this.makeDraggable(element);
    this.setupDropZone(element);

    this.element = element;
    workspace.appendChild(element);
    return element;
  }

  makeDraggable(element) {
    DraggableUtil.makeDraggable(element, {
      shouldDrag: (e) => {
        return (
          !this.isMixing &&
          !e.target.classList.contains("machine-input-slot") &&
          !e.target.classList.contains("machine-output-slot")
        );
      },
    });
  }

  setupDropZone(element) {
    let draggedPot = null;

    const inputSlot1 = element.querySelector(
      ".machine-input-slot[data-slot-number='1']"
    );
    const inputSlot2 = element.querySelector(
      ".machine-input-slot[data-slot-number='2']"
    );

    // Kijken of de potten in de mengmachine worden geplaatst
    document.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("pot") || e.target.closest(".pot")) {
        draggedPot = e.target.closest(".pot");
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (!draggedPot) {
        return;
      }

      const inputRect1 = inputSlot1.getBoundingClientRect();
      if (
        e.clientX >= inputRect1.left &&
        e.clientX <= inputRect1.right &&
        e.clientY >= inputRect1.top &&
        e.clientY <= inputRect1.bottom
      ) {
        this.tryAddPot(draggedPot, 1);
      }

      const inputRect2 = inputSlot2.getBoundingClientRect();
      if (
        e.clientX >= inputRect2.left &&
        e.clientX <= inputRect2.right &&
        e.clientY >= inputRect2.top &&
        e.clientY <= inputRect2.bottom
      ) {
        this.tryAddPot(draggedPot, 2);
      }

      draggedPot = null;
    });
  }

  tryAddPot(potElement, slotNumber) {
    if (this.isMixing) {
      alert("Deze machine is al aan het mixen!");
      return;
    }

    if (
      (this.pot1 && this.pot1.id === potElement.id) ||
      (this.pot2 && this.pot2.id === potElement.id)
    ) {
      alert("Deze pot is al in gebruik in deze machine!");
      return;
    }

    if ((slotNumber === 1 && this.pot1) || (slotNumber === 2 && this.pot2)) {
      alert(`Slot ${slotNumber} heeft al een pot!`);
      return;
    }

    const potMixSpeed = potElement.dataset.mixSpeed;

    if (!potMixSpeed) {
      alert("Deze pot is leeg!");
      return;
    }

    if (potMixSpeed !== this.mixSpeed) {
      alert(
        `Deze machine kan allen potten mixen met een snelheid van ${this.speedLabel}`
      );
      return;
    }

    const potInfo = {
      element: potElement,
      id: potElement.id,
    };

    if (slotNumber === 1) {
      this.pot1 = potInfo;
    } else {
      this.pot2 = potInfo;
    }

    // Pot in mixmachine visualiseren
    const inputSlot = this.element.querySelector(
      `.machine-input-slot[data-slot-number='${slotNumber}']`
    );
    const inputRect = inputSlot.getBoundingClientRect();
    const workspaceRect = document
      .getElementById("workspace")
      .getBoundingClientRect();

    const newX =
      inputRect.left -
      workspaceRect.left +
      (inputRect.width - potElement.offsetWidth) / 2;
    const newY =
      inputRect.top -
      workspaceRect.top +
      (inputRect.height - potElement.offsetHeight) / 2;

    potElement.style.left = newX + "px";
    potElement.style.top = newY + "px";
    potElement.style.zIndex = 1;

    inputSlot.textContent = "";

    if (this.pot1 && this.pot2) {
      this.startMixing();
    }
  }

  startMixing() {
    if (!this.pot1 || !this.pot2) {
      return;
    }

    this.isMixing = true;

    const pot1Element = this.pot1.element;
    const pot2Element = this.pot2.element;

    const ingredients1 = this.getPotIngredients(pot1Element);
    const ingredients2 = this.getPotIngredients(pot2Element);

    if (ingredients1.length === 0 || ingredients2.length === 0) {
      alert("Een van de potten heeft geen ingredienten!");
      this.releasePots();
      return;
    }

    const allIngredients = [...ingredients1, ...ingredients2];

    let maxMixTime = 0;
    allIngredients.forEach((ingredient) => {
      maxMixTime = Math.max(maxMixTime, ingredient.mixTime);
    });

    const adjustedMixTime = maxMixTime * this.weatherMultiplier;

    this.element.classList.add("mixing");
    const mixingChamber = this.element.querySelector(".machine-mixing-chamber");
    mixingChamber.innerHTML = '<div class="mixing-animation"></div>';
    mixingChamber.firstChild.style.animationDuration =
      adjustedMixTime / 1000 + "s";

    const progressBar = document.createElement("div");
    progressBar.className = "mixing-progress";
    progressBar.innerHTML = '<div class="mixing-progress-bar"></div>';
    mixingChamber.appendChild(progressBar);

    const progressBarInner = progressBar.querySelector(".mixing-progress-bar");
    progressBarInner.style.transition = `width ${adjustedMixTime}ms linear`;

    setTimeout(() => {
      progressBarInner.style.width = "100%";
    }, 50);

    setTimeout(() => {
      this.completeMixing();
    }, adjustedMixTime);
  }

  completeMixing() {
    this.isMixing = false;
    this.element.classList.remove("mixing");

    const mixingChamber = this.element.querySelector(".machine-mixing-chamber");
    mixingChamber.innerHTML = "";

    const inputSlot1 = this.element.querySelector(
      ".machine-input-slot[data-slot-number='1']"
    );
    const inputSlot2 = this.element.querySelector(
      ".machine-input-slot[data-slot-number='2']"
    );
    const outputSlot = this.element.querySelector(".machine-output-slot");

    inputSlot1.textContent = "Pot 1";
    inputSlot2.textContent = "Pot 2";

    // Eerste pot in de uitvoer stoppen en tweede pot verstoppen
    const outputPotElement = this.pot1.element;
    const hiddenPotElement = this.pot2.element;
    hiddenPotElement.style.display = "none";

    const outputRect = outputSlot.getBoundingClientRect();
    const workspaceRect = document
      .getElementById("workspace")
      .getBoundingClientRect();

    const newX =
      outputRect.left -
      workspaceRect.left +
      (outputRect.width - outputPotElement.offsetWidth) / 2;
    const newY =
      outputRect.top -
      workspaceRect.top +
      (outputRect.height - outputPotElement.offsetHeight) / 2;

    outputPotElement.style.left = newX + "px";
    outputPotElement.style.top = newY + "px";
    outputPotElement.style.zIndex = 5;
    outputPotElement.classList.add("mixed");

    this.combineIngredients(outputPotElement, hiddenPotElement);
    this.combinePotColors(outputPotElement, hiddenPotElement);

    this.pot1 = null;
    this.pot2 = null;
  }

  combineIngredients(targetPot, sourcePot) {
    const sourceIngredients = sourcePot.querySelectorAll(".ingredient-in-pot");

    sourceIngredients.forEach((ingredient) => {
      const clone = ingredient.cloneNode(true);
      targetPot.appendChild(clone);
    });

    const potLabel = targetPot.querySelector(".pot-label");
    potLabel.textContent = `Gemengde Pot (${this.mixSpeed})`;
  }

  combinePotColors(targetPot, sourcePot) {
    const targetColor = this.extractColor(targetPot.style.backgroundColor);
    const sourceColor = this.extractColor(sourcePot.style.backgroundColor);

    const red = Math.round((targetColor.r + sourceColor.r) / 2);
    const green = Math.round((targetColor.g + sourceColor.g) / 2);
    const blue = Math.round((targetColor.b + sourceColor.b) / 2);

    targetPot.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, 0.7)`;
  }

  releasePots() {
    const inputSlot1 = this.element.querySelector(
      ".machine-input-slot[data-slot-number='1']"
    );
    const inputSlot2 = this.element.querySelector(
      ".machine-input-slot[data-slot-number='2']"
    );

    inputSlot1.textContent = "Pot 1";
    inputSlot2.textContent = "Pot 2";

    this.pot1 = null;
    this.pot2 = null;
    this.isMixing = false;
  }

  getPotIngredients(potElement) {
    const ingredients = [];

    const ingredientElements =
      potElement.querySelectorAll(".ingredient-in-pot");

    ingredientElements.forEach((element) => {
      const bgColor = element.style.backgroundColor;

      const potLabel = potElement.querySelector(".pot-label");
      const labelText = potLabel.textContent;
      const mixSpeedMatch = labelText.match(/\((.*?)\s*-/);
      const mixSpeed = mixSpeedMatch ? mixSpeedMatch[1] : "medium";

      const ingredient = {
        mixSpeed: mixSpeed,
        mixTime: this.mixTime,
        color: this.extractColor(bgColor),
      };

      ingredients.push(ingredient);
    });

    return ingredients;
  }

  // Kleurenreeks parsen
  extractColor(colorString) {
    if (colorString.startsWith("rgb")) {
      const match = colorString.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
      );
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
        };
      }
    }

    if (colorString.startsWith("hsl")) {
      const match = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        return {
          h: parseInt(match[1]),
          s: parseInt(match[2]),
          l: parseInt(match[3]),
        };
      }
    }

    return { r: 0, g: 0, b: 0 };
  }

  updateWeatherMultiplier(weather) {
    this.weatherMultiplier = 1;

    if (weather.rain || weather.snow) {
      this.weatherMultiplier *= 1.1;
    }

    if (weather.temperature < 10) {
      this.weatherMultiplier *= 1.15;
    }

    const machineLabel = this.element.querySelector(".machine-label");
    let weatherInfo = "";

    if (this.weatherMultiplier !== 1) {
      weatherInfo = ` (Weer: ${(this.weatherMultiplier * 100).toFixed(0)}%)`;
    }

    machineLabel.textContent = `Mengmachine (${this.speedLabel} - ${this.mixTime}ms)${weatherInfo}`;
  }
}
