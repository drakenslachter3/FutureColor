import IngredientController from "./controllers/IngredientController.js";
import MixingMachineController from "./controllers/MixingMachineController.js";
import HallController from "./controllers/HallController.js";
import PotController from "./controllers/PotController.js";
import WeatherServiceController from "./controllers/WeatherServiceController.js";

document.addEventListener('DOMContentLoaded', () => {
    const weatherServiceController = new WeatherServiceController('Punggol');
    const hallController = new HallController();
    const ingredientController = new IngredientController();
    const potController = new PotController();
    const mixingMachineController = new MixingMachineController(weatherServiceController);
    
    hallController.registerMixingMachineController(mixingMachineController);
    
    hallController.initializeHalls();
    ingredientController.initializeControls();
    mixingMachineController.initializeControls();
    potController.initializeControls();
    weatherServiceController.initializeControls();
});
