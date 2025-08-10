/**
 * TodoList class with CRUD operations and validation
 */

import { Todo, TodoFilter, TodoStats, ValidationError, StorageError } from '../../types';
import { StorageUtils } from '../../utils';

export class TodoList {
  private todos: Todo[] = [];
  private currentFilter: TodoFilter = 'all';

  constructor() {
    // Initialize todo list with data from localStorage
    this.loadFromStorage();
  }

  /**
   * Add a new todo
   */
  addTodo(text: string): Todo {
    try {
      this.validateTodoText(text);
      
      const sanitizedText = this.sanitizeTodoText(text);
      const newTodo: Todo = {
        id: this.generateId(),
        text: sanitizedText,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.todos.push(newTodo);
      this.saveToStorage();
      return newTodo;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to add todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all todos
   */
  getAllTodos(): Todo[] {
    try {
      return [...this.todos];
    } catch (error) {
      throw new Error(`Failed to get todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get todos based on current filter
   */
  getFilteredTodos(): Todo[] {
    try {
      return this.filterTodos(this.todos, this.currentFilter);
    } catch (error) {
      throw new Error(`Failed to get filtered todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific todo by ID
   */
  getTodoById(id: string): Todo | undefined {
    try {
      this.validateId(id);
      return this.todos.find(todo => todo.id === id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to get todo by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a todo
   */
  updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>): Todo | null {
    try {
      this.validateId(id);
      
      const todoIndex = this.todos.findIndex(todo => todo.id === id);
      
      if (todoIndex === -1) {
        return null;
      }

      const todo = this.todos[todoIndex];
      if (!todo) {
        return null;
      }
      
      // Validate text if it's being updated
      if (updates.text !== undefined) {
        this.validateTodoText(updates.text);
        updates.text = this.sanitizeTodoText(updates.text);
      }
      
      // Validate completed status if it's being updated
      if (updates.completed !== undefined) {
        this.validateCompletedStatus(updates.completed);
      }

      const updatedTodo: Todo = {
        id: todo.id,
        text: updates.text !== undefined ? updates.text : todo.text,
        completed: updates.completed !== undefined ? updates.completed : todo.completed,
        createdAt: todo.createdAt,
        updatedAt: new Date()
      };

      this.todos[todoIndex] = updatedTodo;
      this.saveToStorage();
      return updatedTodo;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to update todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Toggle todo completion status
   */
  toggleTodo(id: string): Todo | null {
    try {
      this.validateId(id);
      
      const todo = this.getTodoById(id);
      if (!todo) {
        return null;
      }

      return this.updateTodo(id, { completed: !todo.completed });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to toggle todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: string): boolean {
    try {
      this.validateId(id);
      
      const todoIndex = this.todos.findIndex(todo => todo.id === id);
      
      if (todoIndex === -1) {
        return false;
      }

      this.todos.splice(todoIndex, 1);
      this.saveToStorage();
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to delete todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all completed todos
   */
  deleteCompletedTodos(): number {
    try {
      const initialLength = this.todos.length;
      this.todos = this.todos.filter(todo => !todo.completed);
      this.saveToStorage();
      return initialLength - this.todos.length;
    } catch (error) {
      throw new Error(`Failed to delete completed todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set the current filter
   */
  setFilter(filter: TodoFilter): void {
    try {
      this.validateFilter(filter);
      this.currentFilter = filter;
      this.saveFilterToStorage();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to set filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current filter
   */
  getCurrentFilter(): TodoFilter {
    try {
      return this.currentFilter;
    } catch (error) {
      throw new Error(`Failed to get current filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get todo statistics
   */
  getStats(): TodoStats {
    try {
      const total = this.todos.length;
      const completed = this.todos.filter(todo => todo.completed).length;
      const pending = total - completed;

      return { total, completed, pending };
    } catch (error) {
      throw new Error(`Failed to get todo statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all todos
   */
  clearAll(): void {
    try {
      this.todos = [];
      this.saveToStorage();
    } catch (error) {
      throw new Error(`Failed to clear all todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  /**
   * Validation methods
   */
  
  /**
   * Validate todo text input
   */
  private validateTodoText(text: string): void {
    if (!text || typeof text !== 'string') {
      throw new ValidationError('Todo text is required');
    }
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      throw new ValidationError('Todo text cannot be empty');
    }
    
    if (trimmedText.length > 200) {
      throw new ValidationError('Todo text cannot exceed 200 characters');
    }
  }

  /**
   * Sanitize todo text (remove extra whitespace, trim)
   */
  private sanitizeTodoText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Validate todo ID
   */
  private validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Todo ID is required');
    }
    
    if (id.trim().length === 0) {
      throw new ValidationError('Todo ID cannot be empty');
    }
  }

  /**
   * Validate completed status
   */
  private validateCompletedStatus(completed: boolean): void {
    if (typeof completed !== 'boolean') {
      throw new ValidationError('Completed status must be a boolean');
    }
  }

  /**
   * Validate filter type
   */
  private validateFilter(filter: TodoFilter): void {
    const validFilters: TodoFilter[] = ['all', 'completed', 'pending'];
    
    if (!validFilters.includes(filter)) {
      throw new ValidationError(`Invalid filter type. Must be one of: ${validFilters.join(', ')}`);
    }
  }

  /**
   * Storage methods for in-memory persistence
   */
  
  /**
   * Load todos from localStorage
   */
  private loadFromStorage(): void {
    try {
      this.todos = StorageUtils.loadTodos();
      this.currentFilter = StorageUtils.loadFilter();
    } catch (error) {
      console.warn('Failed to load todos from storage:', error);
      // Continue with empty state if storage fails
      this.todos = [];
      this.currentFilter = 'all';
    }
  }

  /**
   * Save todos to localStorage
   */
  private saveToStorage(): void {
    try {
      StorageUtils.saveTodos(this.todos);
    } catch (error) {
      throw new StorageError(`Failed to save todos to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save filter preference to localStorage
   */
  private saveFilterToStorage(): void {
    try {
      StorageUtils.saveFilter(this.currentFilter);
    } catch (error) {
      throw new StorageError(`Failed to save filter to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all data from storage
   */
  public clearStorage(): void {
    try {
      StorageUtils.clearAll();
      this.todos = [];
      this.currentFilter = 'all';
    } catch (error) {
      throw new StorageError(`Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export todos to JSON string
   */
  public exportTodos(): string {
    try {
      return JSON.stringify(this.todos, null, 2);
    } catch (error) {
      throw new Error(`Failed to export todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import todos from JSON string
   */
  public importTodos(jsonString: string): number {
    try {
      const importedTodos = JSON.parse(jsonString);
      
      if (!Array.isArray(importedTodos)) {
        throw new Error('Invalid data format: expected an array of todos');
      }

      // Validate each todo
      const validTodos: Todo[] = [];
      for (const todo of importedTodos) {
        if (this.isValidTodo(todo)) {
          validTodos.push({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt)
          });
        }
      }

      this.todos = validTodos;
      this.saveToStorage();
      return validTodos.length;
    } catch (error) {
      throw new Error(`Failed to import todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate todo object structure
   */
  private isValidTodo(todo: any): todo is Todo {
    return (
      typeof todo === 'object' &&
      todo !== null &&
      typeof todo.id === 'string' &&
      typeof todo.text === 'string' &&
      typeof todo.completed === 'boolean' &&
      typeof todo.createdAt === 'string' &&
      typeof todo.updatedAt === 'string'
    );
  }
}
