const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const calendar = document.getElementById('calendar');
const saveIndicator = document.getElementById('saveIndicator');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');
const dayModal = document.getElementById('dayModal');
const modalDayTitle = document.getElementById('modalDayTitle');
const modalMealContent = document.getElementById('modalMealContent');

let combinedRecipes = [];

function loadInitialRecipes() {
  return fetch('recipes.json')
    .then(response => response.json())
    .then(defaultRecipes => {
      const userRecipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
      combinedRecipes = [...defaultRecipes, ...userRecipes];
      if (!localStorage.getItem('recipes')) {
        localStorage.setItem('recipes', JSON.stringify(defaultRecipes));
      }
      return combinedRecipes;
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      combinedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      return combinedRecipes;
    });
}

function getSavedRecipes() {
  return combinedRecipes;
}

function saveMeal(day, meal, value) {
  const savedPlans = JSON.parse(localStorage.getItem('mealPlans')) || {};
  if (!savedPlans[day]) savedPlans[day] = {};
  savedPlans[day][meal] = value;
  localStorage.setItem('mealPlans', JSON.stringify(savedPlans));
  showSaveIndicator();
}

function getSavedMeal(day, meal) {
  const savedPlans = JSON.parse(localStorage.getItem('mealPlans')) || {};
  return (savedPlans[day] && savedPlans[day][meal]) || '';
}

function saveRecipeSelection(day, meal, recipeIndex) {
  const savedPlans = JSON.parse(localStorage.getItem('mealPlans')) || {};
  if (!savedPlans[day]) savedPlans[day] = {};
  if (!savedPlans[day].recipeSelections) savedPlans[day].recipeSelections = {};
  savedPlans[day].recipeSelections[meal] = recipeIndex;
  localStorage.setItem('mealPlans', JSON.stringify(savedPlans));
  showSaveIndicator();
}

function getSavedRecipeSelection(day, meal) {
  const savedPlans = JSON.parse(localStorage.getItem('mealPlans')) || {};
  return (savedPlans[day] && savedPlans[day].recipeSelections && savedPlans[day].recipeSelections[meal]) || '';
}

function showSaveIndicator() {
  saveIndicator.classList.remove('hidden');
  clearTimeout(showSaveIndicator.timeout);
  showSaveIndicator.timeout = setTimeout(() => {
    saveIndicator.classList.add('hidden');
  }, 1000);
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function createMealRow(day, meal) {
  const savedRecipes = getSavedRecipes();
  const row = document.createElement('div');
  row.className = 'meal-row';

  const label = document.createElement('label');
  label.textContent = meal;
  label.setAttribute('for', `${day}-${meal}-textarea`);
  row.appendChild(label);

  const textarea = document.createElement('textarea');
  textarea.id = `${day}-${meal}-textarea`;
  textarea.placeholder = `What will you eat for ${meal}?`;
  textarea.value = getSavedMeal(day, meal);
  autoResizeTextarea(textarea);
  textarea.addEventListener('input', e => {
    autoResizeTextarea(e.target);
    saveMeal(day, meal, e.target.value);
  });
  row.appendChild(textarea);

  const select = document.createElement('select');
  select.setAttribute('aria-label', `Select recipe for ${meal} on ${day}`);
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select recipe...';
  select.appendChild(defaultOption);

  savedRecipes.forEach((recipe, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = recipe.name || `Recipe ${index + 1}`;
    select.appendChild(option);
  });

  select.value = getSavedRecipeSelection(day, meal);
  select.addEventListener('change', e => {
    const selectedRecipeIndex = e.target.value;
    saveRecipeSelection(day, meal, selectedRecipeIndex);

    if (selectedRecipeIndex !== '') {
      const recipe = savedRecipes[selectedRecipeIndex];
      if (recipe) {
        let currentText = textarea.value.trim();
        if (!currentText.includes(recipe.name)) {
          textarea.value = currentText ? currentText + '\n' + recipe.name : recipe.name;
          autoResizeTextarea(textarea);
          saveMeal(day, meal, textarea.value);
        }
      }
    }
  });
  row.appendChild(select);

  const groceryBtn = document.createElement('button');
  groceryBtn.type = 'button';
  groceryBtn.className = 'add-grocery-btn';
  groceryBtn.textContent = 'Add to Grocery List';
  groceryBtn.title = `Add ${meal} for ${day} to grocery list`;
  groceryBtn.addEventListener('click', () => {
    alert(`Added ${meal} on ${day} to Grocery List:\n${textarea.value.trim() || '(empty)'}`);
  });
  row.appendChild(groceryBtn);

  return row;
}

function createRecipeDropdown(day, meal, textarea) {
  const savedRecipes = getSavedRecipes();
  const select = document.createElement('select');
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select recipe...';
  select.appendChild(defaultOption);

  savedRecipes.forEach((recipe, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = recipe.name || `Recipe ${index + 1}`;
    select.appendChild(option);
  });

  select.value = getSavedRecipeSelection(day, meal);
  select.addEventListener('change', e => {
    const selectedIndex = e.target.value;
    saveRecipeSelection(day, meal, selectedIndex);

    if (selectedIndex !== '') {
      const recipe = savedRecipes[selectedIndex];
      if (recipe && !textarea.value.includes(recipe.name)) {
        textarea.value = textarea.value.trim()
          ? textarea.value.trim() + '\n' + recipe.name
          : recipe.name;
        autoResizeTextarea(textarea);
      }
    }
  });
  return select;
}

function renderPlanner() {
  calendar.innerHTML = '';
  days.forEach(day => {
    const savedPlans = JSON.parse(localStorage.getItem('mealPlans')) || {};
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const dayTitle = document.createElement('h4');
    dayTitle.textContent = day;
    cell.appendChild(dayTitle);

    const summary = document.createElement('ul');
    summary.className = 'meal-summary';

    meals.forEach(meal => {
      const mealText = getSavedMeal(day, meal);
      if (mealText) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${meal}:</strong> ${mealText}`;
        summary.appendChild(li);
      }
    });

    if (!summary.children.length) {
      const placeholder = document.createElement('p');
      placeholder.className = 'empty-placeholder';
      placeholder.textContent = 'Click to plan meals';
      summary.appendChild(placeholder);
    }

    cell.appendChild(summary);

    cell.addEventListener('click', () => {
      calendar.innerHTML = '';
      renderDayDetail(day);
    });

    calendar.appendChild(cell);
  });
}

function renderDayDetail(day) {
  calendar.innerHTML = '';
  const cell = document.createElement('div');
  cell.className = 'day-cell full-detail';

  const dayTitle = document.createElement('h4');
  dayTitle.textContent = day;
  cell.appendChild(dayTitle);

  const textareaMap = {};

  meals.forEach(meal => {
    const row = document.createElement('div');
    row.className = 'meal-row';

    const label = document.createElement('label');
    label.textContent = meal;
    row.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.value = getSavedMeal(day, meal);
    autoResizeTextarea(textarea);
    row.appendChild(textarea);
    textareaMap[meal] = textarea;

    row.appendChild(createRecipeDropdown(day, meal, textarea));
    cell.appendChild(row);
  });

  const buttonRow = document.createElement('div');
  buttonRow.style.marginTop = '15px';
  buttonRow.style.display = 'flex';
  buttonRow.style.gap = '10px';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className = 'save-button';
  saveBtn.addEventListener('click', () => {
    meals.forEach(meal => {
      saveMeal(day, meal, textareaMap[meal].value.trim());
    });
    showSaveIndicator();
  });

  const backBtn = document.createElement('button');
  backBtn.textContent = '⬅ Back to Week View';
  backBtn.className = 'back-button';
  backBtn.addEventListener('click', () => renderPlanner());

  buttonRow.appendChild(saveBtn);
  buttonRow.appendChild(backBtn);
  cell.appendChild(buttonRow);

  calendar.appendChild(cell);
}

clearAllBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all meal plans? This cannot be undone.')) {
    localStorage.removeItem('mealPlans');
    renderPlanner();
  }
});

exportBtn.addEventListener('click', () => {
  const savedPlans = JSON.parse(localStorage.getItem('mealPlans')) || {};
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedPlans, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "meal-plan.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

loadInitialRecipes().then(() => {
  renderPlanner();
});

window.closeDayModal = closeDayModal;
