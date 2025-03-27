import DraggableUtil from "../utils/DraggableUtils.js";

export default class Ingredient {
  constructor(mixTime, mixSpeed, color, structure, hallController) {
    this.mixTime = mixTime;
    this.mixSpeed = mixSpeed;
    this.color = color;
    this.structure = structure;
    this.element = null;
    this.hallController = hallController;
    this.id =
      "ingredient_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  }

  render() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = "ingredient";
    element.dataset.mixTime = this.mixTime;
    element.dataset.mixSpeed = this.mixSpeed;
    element.dataset.structure = this.structure;

    const workspace = document.querySelector(
      ".workspace:not([style*='display: none'])"
    );
    const workspaceRect = workspace.getBoundingClientRect();
    const maxX = workspaceRect.width - 60;
    const maxY = workspaceRect.height - 60;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    element.style.left = randomX + "px";
    element.style.top = randomY + "px";

    if (typeof this.color === "object" && this.color.r !== undefined) {
      element.style.backgroundColor = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
      element.textContent = `R:${this.color.r} G:${this.color.g} B:${this.color.b}`;
    } else if (typeof this.color === "object" && this.color.h !== undefined) {
      element.style.backgroundColor = `hsl(${this.color.h}, ${this.color.s}%, ${this.color.l}%)`;
      element.textContent = `H:${this.color.h} S:${this.color.s} L:${this.color.l}`;
    }

    this.applyStructure(element);
    this.makeDraggable(element);

    this.element = element;
    workspace.appendChild(element);

    return element;
  }

  makeDraggable(element) {
    DraggableUtil.makeDraggable(element);
  }

  applyStructure(element) {
    switch (this.structure) {
      case "grain":
        element.style.borderRadius = "30%";
        element.style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.5)";
        break;
      case "coarse":
        element.style.borderRadius = "15%";
        element.style.boxShadow = "inset 0 0 15px rgba(0,0,0,0.7)";
        break;
      case "smooth":
        element.style.borderRadius = "50%";
        element.style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.3)";
        break;
      case "slimy":
        element.style.borderRadius = "40%";
        element.style.boxShadow = "0 0 10px rgba(0,255,0,0.5)";
        element.style.animation = "slime 3s infinite alternate";
        if (!document.getElementById("slimeAnimation")) {
          const style = document.createElement("style");
          style.id = "slimeAnimation";
          style.textContent = `
                        @keyframes slime {
                            0% { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
                            100% { border-radius: 40% 60% 70% 30% / 50% 60% 30% 60%; }
                        }
                    `;
          document.head.appendChild(style);
        }
        break;
    }
  }
}
