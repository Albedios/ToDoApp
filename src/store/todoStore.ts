import { Todo, TodoFilter, TodoStore } from '../types/todo.types';

class TodoStoreImpl implements TodoStore {
  private static instance: TodoStoreImpl;
  private _todos: Todo[] = [];
  private _filter: TodoFilter = { status: 'all' };

  private constructor() {
    this.loadFromLocalStorage();
  }

  static getInstance(): TodoStoreImpl {
    if (!TodoStoreImpl.instance) {
      TodoStoreImpl.instance = new TodoStoreImpl();
    }
    return TodoStoreImpl.instance;
  }

  private loadFromLocalStorage() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      this._todos = JSON.parse(savedTodos, (key, value) => {
        if (key === 'dueDate' || key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(this._todos));
  }

  get todos(): Todo[] {
    return this.getFilteredTodos();
  }

  get filter(): TodoFilter {
    return this._filter;
  }

  private getFilteredTodos(): Todo[] {
    return this._todos.filter(todo => {
      if (this._filter.status && this._filter.status !== 'all') {
        if (this._filter.status === 'completed' && !todo.completed) return false;
        if (this._filter.status === 'active' && todo.completed) return false;
      }

      if (this._filter.priority && todo.priority !== this._filter.priority) {
        return false;
      }

      if (this._filter.category && todo.category !== this._filter.category) {
        return false;
      }

      if (this._filter.search) {
        const search = this._filter.search.toLowerCase();
        return (
          todo.title.toLowerCase().includes(search) ||
          todo.description?.toLowerCase().includes(search) ||
          false
        );
      }

      return true;
    });
  }

  addTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): void {
    const now = new Date();
    const newTodo: Todo = {
      ...todoData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this._todos.unshift(newTodo);
    this.saveToLocalStorage();
  }

  updateTodo(id: string, updates: Partial<Todo>): void {
    const index = this._todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      this._todos[index] = {
        ...this._todos[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveToLocalStorage();
    }
  }

  deleteTodo(id: string): void {
    this._todos = this._todos.filter(todo => todo.id !== id);
    this.saveToLocalStorage();
  }

  toggleTodo(id: string): void {
    const todo = this._todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = new Date();
      this.saveToLocalStorage();
    }
  }

  setFilter(filter: Partial<TodoFilter>): void {
    this._filter = { ...this._filter, ...filter };
  }
}

export const todoStore = TodoStoreImpl.getInstance();
