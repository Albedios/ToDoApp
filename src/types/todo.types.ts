export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
  subtasks?: Todo[];
  createdAt: Date;
  updatedAt: Date;
}

export type TodoPriority = 'low' | 'medium' | 'high';

export interface TodoFilter {
  status?: 'all' | 'active' | 'completed';
  priority?: TodoPriority;
  category?: string;
  search?: string;
}

export interface TodoStore {
  todos: Todo[];
  filter: TodoFilter;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: Partial<TodoFilter>) => void;
}
