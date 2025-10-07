// import from src modules folder
import DataList from './datalist.js';

// get listed inputs from local storage
export default class display {
  // New: Track current filter (default 'all')
  static currentFilter = 'all';

  static getToDoListFromStorage = () => {
    let toDoLists;

    if (JSON.parse(localStorage.getItem('LocalDataList')) === null) {
      toDoLists = [];
    } else {
      toDoLists = JSON.parse(localStorage.getItem('LocalDataList'));
    }
    return toDoLists;
  };

  // add listed inputs to the local storage
  static addListToStorage = (toDoLists) => {
    const item = JSON.stringify(toDoLists);
    localStorage.setItem('LocalDataList', item);
  };

  // index list inputs by number
  static newIndexNum = (toDoLists) => {
    toDoLists.forEach((item, i) => {
      item.index = i + 1;
    });
  }

  // New: Filter tasks (All/Achieved/Todo)
  static filterTasks(filterType) {
    this.currentFilter = filterType;
    let filteredLists = this.getToDoListFromStorage();
    
    switch (filterType) {
      case 'achieved':
        filteredLists = filteredLists.filter(item => item.completed === true);
        break;
      case 'todo':
        filteredLists = filteredLists.filter(item => item.completed !== true);
        break;
      case 'all':
      default:
        // No filter
        break;
    }
    
    this.showFilteredLists(filteredLists);
    this.updateFilterButtons(filterType);
  }

  // New: Render filtered lists (handles inline edit/remove setup)
  static showFilteredLists(filteredLists) {
    const container = document.querySelector('.toDoListContainer');
    container.innerHTML = '';
    filteredLists.forEach((item) => {
      let statusCheck = item.completed ? 'checked' : '';
      let statusCompleted = item.completed ? 'completed' : '';
      const ul = this.toDoListsHtml(item, statusCheck, statusCompleted);
      container.appendChild(ul);
    });

    this.setupDeleteBtn(); // Independent remove
    this.setupInlineEditing(); // Inline edit

    const event = new Event('listUpdated');
    document.dispatchEvent(event);
  }

  // New: Update filter button active state
  static updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`filter-${activeFilter}`).classList.add('active');
  }

  // delete from local storage (unchanged, but used in independent remove)
  static deleteListData = (id) => {
    let toDoLists = this.getToDoListFromStorage();
    const ListItemToDelete = toDoLists[id];

    toDoLists = toDoLists.filter((item) => item !== ListItemToDelete);

    this.newIndexNum(toDoLists);
    this.addListToStorage(toDoLists);
  };

  // Update task description (used in modify via inline edit)
  static ListInputUpdate = (newDescription, id) => {
    const toDoLists = this.getToDoListFromStorage();
    const updateList = toDoLists[id];

    toDoLists.forEach((item) => {
      if (item === updateList) {
        item.description = newDescription;
      }
    });

    this.addListToStorage(toDoLists);
    this.showLists(); // Re-render with current filter
  };

  // New/Updated: Independent remove (trash always visible)
  static setupDeleteBtn = () => {
    document.querySelectorAll('.remove_btn').forEach((button) => {
      button.style.display = 'block'; // Always visible
      // Clone to prevent duplicate listeners on re-render
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      newButton.addEventListener('click', (event) => {
        event.preventDefault();
        let id = parseInt(newButton.id) - 1;
        this.deleteListData(id);
        this.showLists(); // Re-render with filter
      });
    });
  };

  // New: Inline editing (click text to edit, save on blur/Enter)
  static setupInlineEditing = () => {
    document.querySelectorAll('.task-input').forEach((input) => {
      // Set original value if not already set
      if (!input.dataset.original) {
        input.dataset.original = input.value;
      }

      // Click to enable editing
      input.addEventListener('click', (e) => {
        if (input.readOnly) {
          input.readOnly = false;
          input.focus();
          input.classList.add('editing');
          input.select(); // Select text for easy edit
        }
      });

      // Save on blur (click away)
      input.addEventListener('blur', (e) => {
        const newDesc = e.target.value.trim();
        const original = e.target.dataset.original;
        const listIndex = parseInt(e.target.id.replace('LIST', '')) - 1;
        
        if (newDesc && newDesc !== original) {
          this.ListInputUpdate(newDesc, listIndex);
          e.target.dataset.original = newDesc; // Update original
        } else if (!newDesc) {
          // Revert if empty
          e.target.value = original;
        }
        e.target.readOnly = true;
        e.target.classList.remove('editing');
      });

      // Save on Enter
      input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          input.blur(); // Trigger save
        }
      });
    });
  };

  // Updated: Generate task HTML (supports inline edit/remove)
  static toDoListsHtml = ({ description, index }, statusCheck, statusCompleted) => {
    const ul = document.createElement('ul');
    ul.className = 'to-do';
    ul.innerHTML = `
      <li><input class="checkbox" id="${index}" type="checkbox" ${statusCheck}></li> 
      <li><input id="LIST${index}" type="text" class="task-input ${statusCompleted}" value="${description}" readonly data-original="${description}"></li>
      <li class="remove-edit">
        <button class="edit_list_btn" id="${index}"><i class="fa fa-ellipsis-v icon"></i></button>
        <button class="remove_btn" id="${index}"><i class="fa fa-trash-can icon"></i></button>
      </li>
    `;
    return ul;
  }

  // show listed tasks (now applies current filter)
  static showLists = () => {
    this.filterTasks(this.currentFilter);
  };

  // add a task (unchanged, but re-renders with filter)
  static addLists = (description) => {
    const toDoLists = this.getToDoListFromStorage();
    const index = toDoLists.length + 1;
    const newtask = new DataList(description, false, index);

    toDoLists.push(newtask);
    this.addListToStorage(toDoLists);
    this.showLists();
  }

  // Note: Old methods (editListBtnEvent, updateListBtnEvent, removeToDoListBtn) removed as replaced by inline/setup methods
}
