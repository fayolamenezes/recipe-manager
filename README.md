# Recipe and Meal Planner Web App

This is a fully functional web application that allows users to manage their recipes, plan weekly meals, and generate grocery lists based on selected recipes and meal plans. It is designed with a responsive layout and offers persistent data storage using the browser's local storage.

## Features

### 1. Home Page
- Introduction to the application.
- Navigation to all other sections.

### 2. Recipe Manager
- Add, edit, and delete personal recipes.
- Filter recipes by category or search by name.
- Upload images for each recipe.
- View recipe details in a modal.

### 3. Meal Planner
- Plan meals for each day of the week.
- Assign recipes to each meal (Breakfast, Lunch, Dinner, Snacks).
- Automatically save plans to local storage.
- Export meal plan as a JSON file.
- Clear all meal plans with a single click.

### 4. Grocery List
- Select multiple recipes to auto-generate a grocery list.
- Manually add custom grocery items.
- Check off completed items.
- Option to print the grocery list.
- Clear all items when needed.

## Technologies Used

- HTML5
- CSS3 (Modular styles: `style.css`, `recipes.css`, `planner.css`, `grocery.css`)
- JavaScript (Modular scripts: `main.js`, `recipes.js`, `planner.js`, `grocery.js`)
- Local Storage for persistent data
- JSON file (`recipes.json`) for default recipe data
- Responsive Design

## Folder Structure
meal-planner/
│
├── index.html
├── recipes.html
├── planner.html
├── grocery-list.html
├── recipes.json
│
├── js/
│ ├── main.js
│ ├── recipes.js
│ ├── planner.js
│ └── grocery.js
│
├── css/
│ ├── style.css
│ ├── recipes.css
│ ├── planner.css
│ └── grocery.css
│
├── images/
│ ├── cheesecake.jpg
│ ├── brownie.jpg
│ └── ... (more recipe images)


## How to Use

1. Clone or download this repository.
2. Open `index.html` in any modern browser.
3. Navigate through the application using the top navigation bar.
4. Add your own recipes, plan your weekly meals, and build a grocery list.

## Notes

- All data is stored in your browser’s local storage, so no backend setup is needed.
- You can reset data by clearing local storage or using the provided "Clear All" buttons.

## License

This project is licensed for educational and personal use. Attribution appreciated.
