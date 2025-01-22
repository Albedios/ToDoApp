import { Todo, TodoPriority } from '../types/todo.types';
import { todoStore } from '../store/todoStore';

export class TodoList extends HTMLElement {
  private todos: Todo[] = [];
  private editingId: string | null = null;

  constructor() {
    super();
    this.innerHTML = this.render();
    this.setupEventListeners();
    this.updateTodos();
  }

  private updateTodos() {
    this.todos = todoStore.todos;
    const listElement = this.querySelector('.todo-list');
    if (listElement) {
      listElement.innerHTML = this.renderTodos();
    }
  }

  private setupEventListeners() {
    // Add todo form submission
    const form = this.querySelector('#add-todo-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const priority = formData.get('priority') as TodoPriority;
      const category = formData.get('category') as string;
      const dueDate = formData.get('dueDate') as string;

      if (title) {
        const todoEl = document.createElement('div');
        todoEl.classList.add('todo-new');
        
        todoStore.addTodo({
          title,
          description,
          priority: priority || 'medium',
          category,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          completed: false,
        });
        this.updateTodos();
        (e.target as HTMLFormElement).reset();
      }
    });

    // Filter changes
    const filterForm = this.querySelector('#filter-form');
    filterForm?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const value = target.value;
      const filterType = target.name;

      todoStore.setFilter({ [filterType]: value });
      this.updateTodos();
    });

    // Todo actions delegation
    this.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const todoEl = target.closest('[data-todo-id]') as HTMLElement | null;
      if (!todoEl) return;

      const todoId = todoEl.getAttribute('data-todo-id');
      if (!todoId) return;

      // Handle different button clicks
      if (target.closest('.toggle-todo')) {
        todoStore.toggleTodo(todoId);
        this.updateTodos();
      } 
      else if (target.closest('.delete-todo')) {
        todoEl.classList.add('todo-delete');
        todoEl.addEventListener('animationend', () => {
          todoStore.deleteTodo(todoId);
          this.updateTodos();
        });
      }
      else if (target.closest('.edit-todo')) {
        this.editingId = todoId;
        this.updateTodos();
        // Focus the input after updating
        setTimeout(() => {
          const input = todoEl.querySelector('[name="edit-title"]') as HTMLInputElement;
          if (input) input.focus();
        }, 0);
      }
    });

    // Save edit on enter, cancel on escape
    this.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      const todoEl = target.closest('[data-todo-id]') as HTMLElement | null;
      
      if (!todoEl || !this.editingId) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.saveEdit(todoEl);
      } else if (e.key === 'Escape') {
        this.editingId = null;
        this.updateTodos();
      }
    });

    // Save edit on blur
    this.addEventListener('blur', (e) => {
      const target = e.target as HTMLElement;
      const todoEl = target.closest('[data-todo-id]') as HTMLElement | null;
      
      if (todoEl && this.editingId && (target.matches('input') || target.matches('textarea'))) {
        this.saveEdit(todoEl);
      }
    }, true);

    // Mouse move effect for geometric shapes
    document.addEventListener('mousemove', (e) => {
      const shapes = document.querySelectorAll('.geometric-shape');
      shapes.forEach((shape, i) => {
        const speed = 0.02 - (i * 0.005);
        const rect = shape.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * speed;
        const deltaY = (e.clientY - centerY) * speed;
        
        (shape as HTMLElement).style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg)`;
      });
    });
  }

  private saveEdit(todoEl: Element) {
    if (!this.editingId) return;

    const titleInput = todoEl.querySelector('[name="edit-title"]') as HTMLInputElement;
    const descInput = todoEl.querySelector('[name="edit-description"]') as HTMLTextAreaElement;

    if (titleInput && titleInput.value.trim()) {
      todoStore.updateTodo(this.editingId, {
        title: titleInput.value,
        description: descInput?.value || '',
      });
      this.editingId = null;
      this.updateTodos();
    }
  }

  private renderTodos(): string {
    if (this.todos.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center py-8 text-gray-500">
          <i class="ph ph-clipboard-text text-4xl mb-2"></i>
          <p>No todos yet. Add one above!</p>
        </div>
      `;
    }

    return this.todos
      .map(
        (todo) => `
        <div class="todo-card mb-4 ${this.editingId === todo.id ? 'editing' : ''}" data-todo-id="${todo.id}">
          <div class="flex items-center justify-between group">
            <div class="flex items-center gap-4 flex-1">
              <button class="toggle-todo w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                todo.completed
                  ? 'bg-primary-purple border-primary-purple'
                  : 'border-gray-300 hover:border-primary-purple'
              }">
                ${
                  todo.completed
                    ? '<i class="ph ph-check text-white"></i>'
                    : ''
                }
              </button>
              <div class="flex-1">
                ${
                  this.editingId === todo.id
                    ? `
                      <input type="text" name="edit-title" class="input mb-2" value="${todo.title}" />
                      <textarea name="edit-description" class="input" rows="2">${todo.description || ''}</textarea>
                    `
                    : `
                      <h3 class="text-lg font-medium ${
                        todo.completed ? 'text-gray-400 line-through' : ''
                      }">${todo.title}</h3>
                      ${
                        todo.description
                          ? `<p class="text-gray-600 mt-1">${todo.description}</p>`
                          : ''
                      }
                    `
                }
                <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  ${todo.dueDate ? `
                    <span class="flex items-center gap-1">
                      <i class="ph ph-calendar"></i>
                      ${todo.dueDate.toLocaleDateString()}
                    </span>
                  ` : ''}
                  ${todo.category ? `
                    <span class="flex items-center gap-1">
                      <i class="ph ph-tag"></i>
                      ${todo.category}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                this.getPriorityClasses(todo.priority)
              }">
                <i class="ph ph-flag"></i>
                ${todo.priority}
              </span>
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="edit-todo p-1 text-gray-400 hover:text-primary-purple transform hover:scale-110 transition-all">
                  <i class="ph ph-pencil text-lg"></i>
                </button>
                <button class="delete-todo p-1 text-gray-400 hover:text-red-500 transform hover:scale-110 transition-all">
                  <i class="ph ph-trash text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  }

  private getPriorityClasses(priority: TodoPriority): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return '';
    }
  }

  render(): string {
    return `
      <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-4xl font-bold text-center mb-8 bg-gradient-primary text-transparent bg-clip-text">Todo App</h1>
        
        <form id="add-todo-form" class="todo-card mb-8">
          <div class="grid grid-cols-1 gap-4">
            <input type="text" name="title" placeholder="What needs to be done?" class="input" required />
            <input type="text" name="description" placeholder="Add a description (optional)" class="input" />
            
            <div class="grid grid-cols-3 gap-4">
              <select name="priority" class="input">
                <option value="low">
                  <i class="ph ph-flag"></i> Low Priority
                </option>
                <option value="medium" selected>
                  <i class="ph ph-flag"></i> Medium Priority
                </option>
                <option value="high">
                  <i class="ph ph-flag"></i> High Priority
                </option>
              </select>
              
              <input type="text" name="category" placeholder="Category" class="input" />
              <input type="date" name="dueDate" class="input" />
            </div>
            
            <button type="submit" class="btn-primary group">
              <i class="ph ph-plus text-lg transition-transform group-hover:rotate-90"></i>
              Add Task
            </button>
          </div>
        </form>

        <div class="todo-card mb-8">
          <form id="filter-form" class="grid grid-cols-3 gap-4">
            <select name="status" class="input">
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            
            <select name="priority" class="input">
              <option value="">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            
            <div class="relative">
              <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input type="text" name="search" placeholder="Search todos..." class="input pl-10" />
            </div>
          </form>
        </div>

        <div class="todo-list">
          ${this.renderTodos()}
        </div>
      </div>
    `;
  }
}

customElements.define('todo-list', TodoList);
