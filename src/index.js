// import _ from 'lodash';
import './style.css';

// import from src modules
import display from './methods.js';
import Interactive from './interactive.js';

const inputList = document.getElementById('inputList');
const addList = document.getElementById('addList');

// Existing: Add task on form submit
inputList.addEventListener('submit', (e) => {
  e.preventDefault();
  display.addLists(addList.value);
  addList.value = '';
});

// Existing: Clear completed tasks
document.querySelector('#btnClear').addEventListener('click', Interactive.clearCompletedToDoLists);

// New: Filter button event listeners (All/Achieved/Todo)
document.getElementById('filter-all').addEventListener('click', () => display.filterTasks('all'));
document.getElementById('filter-achieved').addEventListener('click', () => display.filterTasks('achieved'));
document.getElementById('filter-todo').addEventListener('click', () => display.filterTasks('todo'));

window.addEventListener('load', () => {
  document.addEventListener('listUpdated', () => {
    Interactive.checkStatusEvent();
  }, false);
  Interactive.checkStatusEvent();
  display.showLists(); // Initialize with 'all' filter
});
