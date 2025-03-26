import DraggableUtil from "../utils/DraggableUtils.js";

export default class MixingMachine {
  constructor(mixSpeed, mixTime) {
    this.mixSpeed = mixSpeed;
    this.mixTime = mixTime;
    this.pot = null;
    this.isMixing = false;
    this.element = null;
    this.id = "machine_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    this.weatherMultiplier = 1;
  }

  render() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = "mixing-machine";

    const currentWorkspace = document.querySelector(
      ".workspace:not([style*='display: none'])"
    );
    const workspaceRect = currentWorkspace.getBoundingClientRect();
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

    const inputSlot = document.createElement("div");
    inputSlot.className = "machine-input-slot";
    inputSlot.textContent = "Drop Pot Here";
    element.appendChild(inputSlot);

    const mixingChamber = document.createElement("div");
    mixingChamber.className = "machine-mixing-chamber";
    element.appendChild(mixingChamber);

    const outputSlot = document.createElement("div");
    outputSlot.className = "machine-output-slot";
    outputSlot.textContent = "Output";
    element.appendChild(outputSlot);

    this.makeDraggable(element);
    this.setupDropZone(element);

    this.element = element;
    currentWorkspace.appendChild(element);
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

    const inputSlot = element.querySelector(".machine-input-slot");

    // Event listeners to handle dragging pots over a machine
    document.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("pot") || e.target.closest(".pot")) {
        draggedPot = e.target.closest(".pot");
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (!draggedPot) {
        return;
      }

      // Controleren of de pot in de invoer van de machine wordt geplaatst
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
    if (this.isMixing) {
      alert("This machine is currently mixing!");
      return;
    }

    if (this.pot) {
      alert("This machine already has a pot! Remove it first.");
      return;
    }

    const potMixSpeed = potElement.dataset.mixSpeed;

    if (!potMixSpeed) {
      alert("This pot is empty!");
      return;
    }

    if (potMixSpeed !== this.mixSpeed) {
      alert(`This machine can only mix pots with ${this.mixSpeed} speed!`);
      return;
    }

    this.pot = {
      element: potElement,
      id: potElement.id,
    };

    // Pot in mixmachine visualiseren
    const inputSlot = this.element.querySelector(".machine-input-slot");
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

    this.startMixing();
  }

  startMixing() {
    if (!this.pot) {
      return;
    }

    this.isMixing = true;

    const potElement = this.pot.element;
    const ingredients = this.getPotIngredients(potElement);

    if (ingredients.length === 0) {
      alert("This pot has no ingredients to mix!");
      this.releasePot();
      return;
    }

    let maxMixTime = 0;
    ingredients.forEach((ingredient) => {
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
    const inputSlot = this.element.querySelector(".machine-input-slot");
    const outputSlot = this.element.querySelector(".machine-output-slot");

    inputSlot.textContent = "Drop Pot Here";

    // Plaats pot in de uitvoer
    const potElement = this.pot.element;
    const outputRect = outputSlot.getBoundingClientRect();
    const workspaceRect = document
      .getElementById("workspace")
      .getBoundingClientRect();

    const newX =
      outputRect.left -
      workspaceRect.left +
      (outputRect.width - potElement.offsetWidth) / 2;
    const newY =
      outputRect.top -
      workspaceRect.top +
      (outputRect.height - potElement.offsetHeight) / 2;

    potElement.style.left = newX + "px";
    potElement.style.top = newY + "px";
    potElement.style.zIndex = 5;
    potElement.classList.add("mixed");

    this.pot = null;
  }

  releasePot() {
    if (!this.pot) {
      return;
    }

    const inputSlot = this.element.querySelector(".machine-input-slot");
    inputSlot.textContent = "Drop Pot Here";

    this.pot = null;
    this.isMixing = false;
  }

  getPotIngredients(potElement) {
    // This is a helper method to get all ingredients in a pot
    // In a real application, you'd probably have a reference to the Pot object
    // For now, we'll parse the DOM to gather this information

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
      weatherInfo = ` (Weather: ${(this.weatherMultiplier * 100).toFixed(0)}%)`;
    }

    machineLabel.textContent = `Mixer (${this.mixSpeed} - ${this.mixTime}ms)${weatherInfo}`;
  }
}
