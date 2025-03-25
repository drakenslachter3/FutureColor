import Ingredient from "../models/Ingredient.js";

export default class IngredientController {
  constructor() {
    this.colorType = null;
    this.rgbControls = null;
    this.hslControls = null;
    this.ingredientForm = null;
  }

  initializeControls() {
    this.colorType = document.getElementById("colorType");
    this.rgbControls = document.getElementById("rgbControls");
    this.hslControls = document.getElementById("hslControls");
    this.ingredientForm = document.getElementById("ingredientForm");

    this.setupColorTypeToggle();
    this.setupSliderUpdates();
    this.setupFormSubmission();
  }

  setupColorTypeToggle() {
    this.colorType.addEventListener("change", () => {
      if (this.colorType.value === "rgb") {
        this.rgbControls.style.display = "block";
        this.hslControls.style.display = "none";
      } else {
        this.rgbControls.style.display = "none";
        this.hslControls.style.display = "block";
      }
    });
  }

  setupSliderUpdates() {
    ["red", "green", "blue", "hue", "saturation", "lightness"].forEach((id) => {
      const slider = document.getElementById(id);
      const valueElement = document.getElementById(id + "Value");

      slider.addEventListener("input", () => {
        valueElement.textContent = slider.value;
      });
    });
  }

  setupFormSubmission() {
    this.ingredientForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const mixTime = parseInt(document.getElementById("mixTime").value);
      const mixSpeed = document.getElementById("mixSpeed").value;
      const structure = document.getElementById("structure").value;

      let color;
      if (this.colorType.value === "rgb") {
        color = {
          r: parseInt(document.getElementById("red").value),
          g: parseInt(document.getElementById("green").value),
          b: parseInt(document.getElementById("blue").value),
        };
      } else {
        color = {
          h: parseInt(document.getElementById("hue").value),
          s: parseInt(document.getElementById("saturation").value),
          l: parseInt(document.getElementById("lightness").value),
        };
      }

      const ingredient = new Ingredient(mixTime, mixSpeed, color, structure);
      ingredient.render();
    });
  }
}
