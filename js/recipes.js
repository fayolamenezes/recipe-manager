const recipeList = document.getElementById('recipeList');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const addRecipeSection = document.getElementById('addRecipeSection');
const recipeForm = document.getElementById('recipeForm');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const recipeCategory = document.getElementById('recipeCategory');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');

let defaultRecipes = [];
let userRecipes = [];
let recipes = [];

let editingIndex = null;

let categories = JSON.parse(localStorage.getItem('categories')) || [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snacks',
  'Vegan'
];

function saveCategories() {
  localStorage.setItem('categories', JSON.stringify(categories));
}

function renderCategoryOptions() {
  const allSelects = [categoryFilter, recipeCategory];
  allSelects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '';
    if (select === categoryFilter) {
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = 'All Categories';
      select.appendChild(allOption);
    } else {
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Category';
      select.appendChild(defaultOption);
    }
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
    select.value = currentValue || '';
  });
}

renderCategoryOptions();

function loadInitialRecipes() {
  return fetch('recipes.json')
    .then(response => response.json())
    .then(defaults => {
      defaultRecipes = defaults;
      userRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      recipes = [...defaultRecipes, ...userRecipes];
      applyFilters();
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      defaultRecipes = [];
      userRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      recipes = [...defaultRecipes, ...userRecipes];
      applyFilters();
    });
}

function saveRecipes() {
  localStorage.setItem('recipes', JSON.stringify(userRecipes));
}

function renderRecipes(data = recipes) {
  recipeList.innerHTML = '';
  data.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => showRecipeDetail(index);
    card.innerHTML = `
      <h3>${recipe.name}</h3>
      <p>${recipe.ingredients.split(',')[0]}...</p>
      ${recipe.category ? `<p class="category-label">${recipe.category}</p>` : ''}
      ${recipe.image ? `<img src="${recipe.image}" alt="Recipe image" loading="lazy" />` : ''}
    `;
    recipeList.appendChild(card);
  });
}

function applyFilters() {
  const term = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(term);
    const matchesCategory = selectedCategory ? r.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  renderRecipes(filtered);
}

function showRecipeDetail(index) {
  const recipe = recipes[index];
  const html = `
    <div class="modal">
      <h3>${recipe.name}</h3>
      ${recipe.image ? `<img src="${recipe.image}" style="max-width:100%;border-radius:5px;" />` : ''}
      ${recipe.category ? `<p><strong>Category:</strong> ${recipe.category}</p>` : ''}
      <h4>Ingredients:</h4>
      <p>${recipe.ingredients}</p>
      <h4>Steps:</h4>
      <p>${recipe.steps}</p>
      <div class="form-actions">
        <button onclick="editRecipe(${index})">Edit</button>
        <button onclick="deleteRecipe(${index})">Delete</button>
        <button onclick="closeDetail()">Close</button>
      </div>
    </div>
  `;
  recipeList.innerHTML = html;
}

function closeDetail() {
  loadInitialRecipes();
}

function editRecipe(index) {
  const recipe = recipes[index];
  document.getElementById('recipeName').value = recipe.name;
  document.getElementById('ingredients').value = recipe.ingredients;
  document.getElementById('steps').value = recipe.steps;
  recipeCategory.value = recipe.category || '';
  editingIndex = index;
  formTitle.textContent = "Edit Recipe";
  addRecipeSection.classList.remove('hidden');
}

function deleteRecipe(index) {
  if (!confirm("Delete this recipe?")) return;

  if (index < defaultRecipes.length) {
    alert("Cannot delete default recipes.");
    return;
  }

  const userIndex = index - defaultRecipes.length;
  userRecipes.splice(userIndex, 1);
  saveRecipes();
  recipes = [...defaultRecipes, ...userRecipes];
  applyFilters();
}

recipeForm.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('recipeName').value.trim();
  const ingredients = document.getElementById('ingredients').value.trim();
  const steps = document.getElementById('steps').value.trim();
  const category = recipeCategory.value;

  if (category && !categories.includes(category)) {
    categories.push(category);
    saveCategories();
    renderCategoryOptions();
  }

  const file = document.getElementById('imageUpload').files[0];

  const reader = new FileReader();
  reader.onload = function () {
    const image = file ? reader.result : null;
    const recipe = { name, ingredients, steps, category, image };

    if (editingIndex !== null) {
      if (editingIndex < defaultRecipes.length) {
        alert("Editing default recipes is not supported.");
        return;
      }
      const userIndex = editingIndex - defaultRecipes.length;
      userRecipes[userIndex] = recipe;
      editingIndex = null;
    } else {
      userRecipes.push(recipe);
    }

    saveRecipes();
    recipes = [...defaultRecipes, ...userRecipes];
    applyFilters();
    recipeForm.reset();
    formTitle.textContent = "Add New Recipe";
    addRecipeSection.classList.add('hidden');
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    const image = editingIndex !== null && editingIndex >= defaultRecipes.length
      ? userRecipes[editingIndex - defaultRecipes.length].image
      : null;
    const recipe = { name, ingredients, steps, category, image };

    if (editingIndex !== null) {
      if (editingIndex < defaultRecipes.length) {
        alert("Editing default recipes is not supported.");
        return;
      }
      const userIndex = editingIndex - defaultRecipes.length;
      userRecipes[userIndex] = recipe;
      editingIndex = null;
    } else {
      userRecipes.push(recipe);
    }

    saveRecipes();
    recipes = [...defaultRecipes, ...userRecipes];
    applyFilters();
    recipeForm.reset();
    formTitle.textContent = "Add New Recipe";
    addRecipeSection.classList.add('hidden');
  }
};

imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
  }
});

addRecipeBtn.onclick = () => {
  recipeForm.reset();
  formTitle.textContent = "Add New Recipe";
  editingIndex = null;
  addRecipeSection.classList.remove('hidden');
};

cancelBtn.onclick = () => {
  recipeForm.reset();
  addRecipeSection.classList.add('hidden');
  editingIndex = null;
};

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

loadInitialRecipes();
