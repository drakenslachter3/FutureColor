import { hslToRgb, rgbToHsl, parseRgbColor } from "../utils/ColorUtils.js";

export default class ColorTestController {
  constructor(hallController) {
    this.hallController = hallController;
    this.colorGridElement = document.getElementById("colorGrid");
    this.colorPopup = document.getElementById("colorPopup");
    this.colorTestPanel = document.getElementById("colorTestPanel");
    this.activeDragItem = null;
  }

  initializeControls() {
    document
      .getElementById("generateGrid")
      .addEventListener("click", () => this.generateGrid());
    document.querySelector(".close-popup").addEventListener("click", () => {
      this.colorPopup.style.display = "none";
    });

    // Kleurentestpaneel drag events toelaten
    this.colorTestPanel.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    this.colorTestPanel.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  generateGrid() {
    const rows = parseInt(document.getElementById("gridRows").value);
    const columns = parseInt(document.getElementById("gridColumns").value);

    this.colorGridElement.innerHTML = "";
    this.colorGridElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    this.colorGridElement.style.gridTemplateRows = `repeat(${rows}, 50px)`;

    this.colorGridElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    for (let i = 0; i < rows * columns; i++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-cell");
      cell.dataset.index = i;

      cell.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.canAcceptDrop(e.dataTransfer.types)) {
          cell.classList.add("valid-target");
        }
      });

      cell.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        cell.classList.remove("valid-target");
      });

      cell.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        cell.classList.remove("valid-target");
        this.handleDrop(e, cell);
      });

      cell.addEventListener("click", () => {
        if (cell.dataset.color) {
          this.showTriadicColors(cell.dataset.color);
        }
      });

      this.colorGridElement.appendChild(cell);
    }
  }

  canAcceptDrop(types) {
    return types.includes("application/pot");
  }

  handleDrop(event, cell) {
    const data = event.dataTransfer.getData("application/pot");

    if (data) {
      try {
        const paintInfo = JSON.parse(data);

        if (paintInfo.color) {
          cell.style.backgroundColor = paintInfo.color;
          cell.dataset.color = paintInfo.color;
          cell.classList.add("filled");
        }
      } catch (e) {
        console.error("handleDrop parse error:", e);
      }
    }
  }

  showTriadicColors(baseColor) {
    const rgbValues = parseRgbColor(baseColor);
    const hsl = rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b);

    // Triadische kleuren berekenen (120 en 240 graden van baseColor)
    const triadic1Hsl = { ...hsl, h: (hsl.h + 120) % 360 };
    const triadic2Hsl = { ...hsl, h: (hsl.h + 240) % 360 };

    const triadic1Rgb = hslToRgb(triadic1Hsl.h, triadic1Hsl.s, triadic1Hsl.l);
    const triadic2Rgb = hslToRgb(triadic2Hsl.h, triadic2Hsl.s, triadic2Hsl.l);

    const rgbString = `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`;
    const triadic1String = `rgb(${triadic1Rgb.r}, ${triadic1Rgb.g}, ${triadic1Rgb.b})`;
    const triadic2String = `rgb(${triadic2Rgb.r}, ${triadic2Rgb.g}, ${triadic2Rgb.b})`;

    document.getElementById("originalColorSample").style.backgroundColor =
      rgbString;
    document.getElementById("triadicColor1Sample").style.backgroundColor =
      triadic1String;
    document.getElementById("triadicColor2Sample").style.backgroundColor =
      triadic2String;

    document.getElementById("originalColorInfo").innerHTML =
      `RGB: ${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}<br>` +
      `HSL: ${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(
        hsl.l
      )}%`;

    document.getElementById("triadicColor1Info").innerHTML =
      `RGB: ${triadic1Rgb.r}, ${triadic1Rgb.g}, ${triadic1Rgb.b}<br>` +
      `HSL: ${Math.round(triadic1Hsl.h)}°, ${Math.round(
        triadic1Hsl.s
      )}%, ${Math.round(triadic1Hsl.l)}%`;

    document.getElementById("triadicColor2Info").innerHTML =
      `RGB: ${triadic2Rgb.r}, ${triadic2Rgb.g}, ${triadic2Rgb.b}<br>` +
      `HSL: ${Math.round(triadic2Hsl.h)}°, ${Math.round(
        triadic2Hsl.s
      )}%, ${Math.round(triadic2Hsl.l)}%`;

    this.colorPopup.style.display = "block";
  }
}
