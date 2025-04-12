import DraggableUtil from "../utils/DraggableUtils.js";
import { hslToRgb } from "../utils/ColorUtils.js";

export default class Pot {
  constructor() {
    this.ingredients = [];
    this.mixSpeed = null;
    this.element = null;
    this.id = "pot_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  }

  render() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = "pot";

    const workspace = document.querySelector(
      ".workspace:not([style*='display: none'])"
    );
    const workspaceRect = workspace.getBoundingClientRect();
    const maxX = workspaceRect.width - 100;
    const maxY = workspaceRect.height - 100;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    element.style.left = randomX + "px";
    element.style.top = randomY + "px";

    const potLabel = document.createElement("div");
    potLabel.className = "pot-label";
    potLabel.textContent = "Lege Pot";
    element.appendChild(potLabel);

    // Potinformatie opslaan voor kleurentest
    const colorHandle = document.createElement("div");
    colorHandle.innerHTML = "⊕";
    colorHandle.title =
      "Sleep dit symbool om deze kleur toe te voegen aan de kleurentest";
    colorHandle.setAttribute("draggable", "true");
    colorHandle.addEventListener("dragstart", (e) => {
      const potData = {
        id: this.id,
        color: this.element.style.backgroundColor || "rgba(0, 0, 0, 0.7)",
      };
      e.dataTransfer.setData("application/pot", JSON.stringify(potData));
    });
    element.appendChild(colorHandle);

    this.makeDraggable(element);
    this.setupDropZone(element);

    this.element = element;
    workspace.appendChild(element);
    return element;
  }

  makeDraggable(element) {
    DraggableUtil.makeDraggable(element, {
      shouldDrag: (e) => !e.target.classList.contains("ingredient-in-pot"),
    });
  }

  getColor() {
    return hslToRgb(this.hue, this.saturation, this.lightness);
  }

  setupDropZone(element) {
    let draggedIngredient = null;

    document.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("ingredient")) {
        draggedIngredient = e.target;
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (!draggedIngredient) return;

      // Kijken of het ingredient binnen de grenzen van de pot zit
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

    if (this.ingredients.length === 0) {
      this.mixSpeed = mixSpeed;
      this.element.dataset.mixSpeed = mixSpeed;
      this.updatePotLabel();
    } else if (mixSpeed !== this.mixSpeed) {
      alert("Alleen ingredienten met dezelfde snelheid mogen in een pot!");
      return;
    }

    // Ingredient in de pot stoppen
    const ingredientData = {
      id: ingredientElement.id,
      mixTime: parseInt(ingredientElement.dataset.mixTime),
      mixSpeed: ingredientElement.dataset.mixSpeed,
      structure: ingredientElement.dataset.structure,
      color: this.extractColor(ingredientElement),
    };

    this.ingredients.push(ingredientData);

    ingredientElement.remove();

    this.renderIngredientsInPot();
    this.updatePotLabel();
    this.updatePotColor();
  }

  renderIngredientsInPot() {
    const existingIngredients =
      this.element.querySelectorAll(".ingredient-in-pot");
    existingIngredients.forEach((el) => el.remove());

    let ingredientsContainer = this.element.querySelector(".pot-ingredients");
    if (!ingredientsContainer) {
      ingredientsContainer = document.createElement("div");
      ingredientsContainer.className = "pot-ingredients";
      this.element.appendChild(ingredientsContainer);
    } else {
      ingredientsContainer.innerHTML = "";
    }

    this.ingredients.forEach((ingredient, index) => {
      const ingredientEl = document.createElement("div");
      ingredientEl.className = "ingredient-in-pot";
      ingredientEl.style.backgroundColor = this.getColorString(
        ingredient.color
      );

      const angle = (index / this.ingredients.length) * 2 * Math.PI;
      const radius = 30;
      const x = 50 + radius * Math.cos(angle) - 10;
      const y = 50 + radius * Math.sin(angle) - 10;

      ingredientEl.style.left = x + "px";
      ingredientEl.style.top = y + "px";

      ingredientsContainer.appendChild(ingredientEl);
    });
  }

  updatePotLabel() {
    const label = this.element.querySelector(".pot-label");
    if (this.ingredients.length === 0) {
      label.textContent = "Lege Pot";
    } else {
      label.textContent = `Gekleurde Pot (${this.mixSpeed})`;
    }
  }

  updatePotColor() {
    if (this.ingredients.length === 0) {
      return;
    }

    let red = 0,
      green = 0,
      blue = 0;

    this.ingredients.forEach((ingredient) => {
      const color = ingredient.color;
      if (color.r !== undefined) {
        red += color.r;
        green += color.g;
        blue += color.b;
      } else if (color.h !== undefined) {
        const rgb = this.getColor(color.h, color.s, color.l);
        red += rgb.r;
        green += rgb.g;
        blue += rgb.b;
      }
    });

    red = Math.round(red / this.ingredients.length);
    green = Math.round(green / this.ingredients.length);
    blue = Math.round(blue / this.ingredients.length);

    this.element.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, 0.7)`;
  }

  extractColor(element) {
    const bgColor = element.style.backgroundColor;

    if (bgColor.startsWith("rgb")) {
      const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
        };
      }
    }

    if (bgColor.startsWith("hsl")) {
      const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        return {
          h: parseInt(match[1]),
          s: parseInt(match[2]),
          l: parseInt(match[3]),
        };
      }
    }

    const text = element.textContent.trim();
    if (text.startsWith("R:")) {
      const rgbValues = text.match(/R:(\d+) G:(\d+) B:(\d+)/);
      if (rgbValues) {
        return {
          r: parseInt(rgbValues[1]),
          g: parseInt(rgbValues[2]),
          b: parseInt(rgbValues[3]),
        };
      }
    } else if (text.startsWith("H:")) {
      const hslValues = text.match(/H:(\d+) S:(\d+) L:(\d+)/);
      if (hslValues) {
        return {
          h: parseInt(hslValues[1]),
          s: parseInt(hslValues[2]),
          l: parseInt(hslValues[3]),
        };
      }
    }

    return { r: 0, g: 0, b: 0 };
  }

  getColorString(color) {
    if (color.r !== undefined) {
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
    } else if (color.h !== undefined) {
      return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    }
    return "black";
  }
}
