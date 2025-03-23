import IngredientController from "./controllers/IngredientController.js";
import MixingMachineController from "./controllers/MixingMachineController.js";
import HallController from "./controllers/HallController.js";
import PotController from "./controllers/PotController.js";
import WeatherController from "./controllers/WeatherController.js";

document.addEventListener('DOMContentLoaded', () => {
    const weatherController = new WeatherController('Amsterdam');
    const hallController = new HallController();
    const ingredientController = new IngredientController();
    const potController = new PotController();
    const mixingMachineController = new MixingMachineController(weatherController);
    
    hallController.registerMixingMachineController(mixingMachineController);
    
    hallController.initializeHalls();
    ingredientController.initializeControls();
    mixingMachineController.initializeControls();
    potController.initializeControls();
    weatherController.initializeControls();
});
