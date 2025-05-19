const groceryListEl = document.getElementById('groceryItems');
const recipeCheckboxesEl = document.getElementById('recipeCheckboxes');
const manualItemInput = document.getElementById('manualItem');
const addManualItemBtn = document.getElementById('addManualItem');

let checkedItems = JSON.parse(localStorage.getItem('checkedGroceryItems')) || {};
let manualItems = JSON.parse(localStorage.getItem('manualGroceryItems')) || [];
let selectedRecipes = JSON.parse(localStorage.getItem('selectedRecipes')) || [];

let allRecipes = [];

async function fetchAllRecipes() {
  try {
    const defaultRecipes = await fetch('recipes.json').then(res => res.json());
    const userRecipes = JSON.parse(localStorage.getItem('recipes')) || [];

    const merged = [...defaultRecipes, ...userRecipes];
    allRecipes = merged.filter(
      (recipe, index, self) =>
        index === self.findIndex(r => r.name === recipe.name)
    );
  } catch (err) {
    console.error('Failed to load default recipes:', err);
    allRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
  }
}

async function populateRecipeCheckboxes() {
  await fetchAllRecipes();

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
        if (!selectedRecipes.includes(index)) selectedRecipes.push(index);
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

window.addEventListener('focus', async () => {
  await populateRecipeCheckboxes();
  renderGroceryList();
});

(async () => {
  await populateRecipeCheckboxes();
  renderGroceryList();
})();
