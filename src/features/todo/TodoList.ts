/**
 * TodoList class with CRUD operations
 */

import { Todo, TodoFilter, TodoStats } from '../../types';

export class TodoList {
  private todos: Todo[] = [];
  private currentFilter: TodoFilter = 'all';

  constructor() {
    // Initialize empty todo list
  }

  /**
   * Add a new todo
   */
  addTodo(text: string): Todo {
    const newTodo: Todo = {
      id: this.generateId(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.todos.push(newTodo);
    return newTodo;
  }

  /**
   * Get all todos
   */
  getAllTodos(): Todo[] {
    return [...this.todos];
  }

  /**
   * Get todos based on current filter
   */
  getFilteredTodos(): Todo[] {
    return this.filterTodos(this.todos, this.currentFilter);
  }

  /**
   * Get a specific todo by ID
   */
  getTodoById(id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  /**
   * Update a todo
   */
  updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>): Todo | null {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      return null;
    }

    const todo = this.todos[todoIndex];
    const updatedTodo: Todo = {
      ...todo,
      ...updates,
      updatedAt: new Date()
    };

    this.todos[todoIndex] = updatedTodo;
    return updatedTodo;
  }

  /**
   * Toggle todo completion status
   */
  toggleTodo(id: string): Todo | null {
    const todo = this.getTodoById(id);
    if (!todo) {
      return null;
    }

    return this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: string): boolean {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      return false;
    }

    this.todos.splice(todoIndex, 1);
    return true;
  }

  /**
   * Delete all completed todos
   */
  deleteCompletedTodos(): number {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => !todo.completed);
    return initialLength - this.todos.length;
  }

  /**
   * Set the current filter
   */
  setFilter(filter: TodoFilter): void {
    this.currentFilter = filter;
  }

  /**
   * Get the current filter
   */
  getCurrentFilter(): TodoFilter {
    return this.currentFilter;
  }

  /**
   * Get todo statistics
   */
  getStats(): TodoStats {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;
    const pending = total - completed;

    return { total, completed, pending };
  }

  /**
   * Clear all todos
   */
  clearAll(): void {
    this.todos = [];
  }

  /**
   * Get todos count
   */
  getTodosCount(): number {
    return this.todos.length;
  }

  /**
   * Check if todo list is empty
   */
  isEmpty(): boolean {
    return this.todos.length === 0;
  }

  /**
   * Private helper method to generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Private helper method to filter todos
   */
  private filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'pending':
        return todos.filter(todo => !todo.completed);
      case 'all':
      default:
        return todos;
    }
  }
}
