const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
const groceryListEl = document.getElementById('groceryItems');
const recipeCheckboxesEl = document.getElementById('recipeCheckboxes');
const manualItemInput = document.getElementById('manualItem');
const addManualItemBtn = document.getElementById('addManualItem');

let checkedItems = JSON.parse(localStorage.getItem('checkedGroceryItems')) || {};
let manualItems = JSON.parse(localStorage.getItem('manualGroceryItems')) || [];
let selectedRecipes = JSON.parse(localStorage.getItem('selectedRecipes')) || [];

const defaultRecipes = [
  {
    name: "Cheesecake",
    ingredients: "16 oz cream cheese, 3/4 cup sugar, 2 eggs, 1 tsp vanilla extract, 1 graham cracker crust, 2 tbsp butter",
    steps: "Mix, bake, chill.",
    category: "Dessert"
  },
  {
    name: "Brownie",
    ingredients: "1/2 cup unsweetened cocoa powder, 1/2 cup flour, 1 cup sugar, 2 eggs, 1/2 cup butter, 1 tsp vanilla extract, 1/4 tsp salt",
    steps: "Mix, bake, cool.",
    category: "Dessert"
  },
  {
    name: "Avocado Toast",
    ingredients: "1 ripe avocado, 2 bread slices, 1 tsp lemon juice, 1/4 tsp salt, 1/8 tsp pepper, pinch chili flakes, 1 tsp olive oil",
    steps: "Toast bread, mash avocado, top and serve.",
    category: "Breakfast"
  },
  {
    name: "Loaded Nachos",
    ingredients: "4 cups tortilla chips, 1 cup shredded cheddar cheese, 1/4 cup sliced jalapenos, 1/2 cup black beans, 1/2 cup diced tomatoes, 1/3 cup sour cream, 1/3 cup guacamole",
    steps: "Layer and bake or microwave.",
    category: "Snacks"
  },
  {
    name: "Pork Ribs",
    ingredients: "2 lbs pork ribs, 1/2 cup barbecue sauce, 1 tsp garlic powder, 1 tsp onion powder, 1 tsp salt, 1/2 tsp pepper, 1 tbsp olive oil",
    steps: "Season, bake or grill.",
    category: "Dinner"
  },
  {
    name: "Chicken Cafreal",
    ingredients: "1.5 lbs chicken pieces, 1 cup coriander leaves, 3 green chilies, 4 garlic cloves, 1-inch ginger, 2 tbsp vinegar, 1 tsp mixed spices, 2 tbsp oil",
    steps: "Marinate and cook.",
    category: "Dinner"
  }
];

const userRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
const allRecipes = [...defaultRecipes, ...userRecipes];

function populateRecipeCheckboxes() {
  recipeCheckboxesEl.innerHTML = '';
  allRecipes.forEach((recipe, index) => {
    const label = document.createElement('label');
    label.htmlFor = `recipeCheckbox${index}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `recipeCheckbox${index}`;
    checkbox.value = index;
    checkbox.checked = selectedRecipes.includes(index);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!selectedRecipes.includes(index)) {
          selectedRecipes.push(index);
        }
      } else {
        selectedRecipes = selectedRecipes.filter(i => i !== index);
      }
      saveState();
      renderGroceryList();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(recipe.name));
    recipeCheckboxesEl.appendChild(label);
  });
}

function extractIngredients() {
  const ingredients = new Set();

  selectedRecipes.forEach(index => {
    const recipe = allRecipes[index];
    if (recipe?.ingredients) {
      recipe.ingredients.split(',').forEach(ing => {
        const trimmed = ing.trim();
        if (trimmed) ingredients.add(trimmed);
      });
    }
  });

  return Array.from(ingredients);
}

function renderGroceryList() {
  groceryListEl.innerHTML = '';

  const ingredients = extractIngredients();

  [...ingredients, ...manualItems].forEach(item => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checkedItems[item] || false;
    checkbox.onchange = () => {
      checkedItems[item] = checkbox.checked;
      saveState();
    };

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(item));

    if (manualItems.includes(item)) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.className = 'delete-btn';
      deleteBtn.title = 'Delete this item';
      deleteBtn.onclick = () => {
        manualItems = manualItems.filter(i => i !== item);
        delete checkedItems[item];
        saveState();
        renderGroceryList();
      };
      li.appendChild(deleteBtn);
    }

    groceryListEl.appendChild(li);
  });
}

addManualItemBtn.onclick = () => {
  const item = manualItemInput.value.trim();
  if (item && !manualItems.includes(item)) {
    manualItems.push(item);
    manualItemInput.value = '';
    renderGroceryList();
    saveState();
  }
};

function saveState() {
  localStorage.setItem('checkedGroceryItems', JSON.stringify(checkedItems));
  localStorage.setItem('manualGroceryItems', JSON.stringify(manualItems));
  localStorage.setItem('selectedRecipes', JSON.stringify(selectedRecipes));
}

function clearList() {
  if (confirm('Clear all grocery items and selections?')) {
    checkedItems = {};
    manualItems = [];
    selectedRecipes = [];
    saveState();
    populateRecipeCheckboxes();
    renderGroceryList();
  }
}

populateRecipeCheckboxes();
renderGroceryList();
