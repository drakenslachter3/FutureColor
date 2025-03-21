class IngredientController {
    constructor(workspaceId) {
        this.workspace = document.getElementById(workspaceId);
        this.ingredients = [];
    }

    addIngredient(mixTime, mixSpeed, color, structure) {
        const ingredient = new Ingredient(mixTime, mixSpeed, color, structure);
        this.ingredients.push(ingredient);
        this.workspace.appendChild(ingredient.render());
    }

    removeIngredient(ingredientId) {
        this.ingredients = this.ingredients.filter(ingredient => {
            if (ingredient.id === ingredientId) {
                document.getElementById(ingredientId)?.remove();
                return false;
            }
            return true;
        });
    }

    clearWorkspace() {
        this.ingredients.forEach(ingredient => {
            document.getElementById(ingredient.id)?.remove();
        });
        this.ingredients = [];
    }
}
