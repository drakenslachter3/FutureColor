import IngredientController from './controllers/IngredientController.js';
import PotController from './controllers/PotController.js';
import MachineController from './controllers/MachineController.js';
import WeatherController from './controllers/WeatherController.js';
import HallController from './controllers/HallController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize controllers
    const ingredientController = new IngredientController();
    const potController = new PotController();
    const machineController = new MachineController();
    const weatherController = new WeatherController();
    const hallController = new HallController();

    // Set up event listeners
    ingredientController.init();
    potController.init();
    machineController.init(weatherController);
    weatherController.init();
    hallController.init();
});
