/**
 * Utility functions for TodoList application
 */

import { Todo, TodoStats, TodoFilter, ValidationError, StorageError } from './types.js';

/**
 * Generate a unique ID for todo items
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate todo text input
 */
export function validateTodoText(text: string): void {
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
export function sanitizeTodoText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Calculate todo statistics
 */
export function calculateStats(todos: Todo[]): TodoStats {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const pending = total - completed;
  
  return { total, completed, pending };
}

/**
 * Filter todos based on filter type
 */
export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
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
 * Sort todos by creation date (newest first)
 */
export function sortTodosByDate(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Local storage utilities
 */
export class StorageUtils {
  /**
   * Save todos to localStorage
   */
  static saveTodos(todos: Todo[]): void {
    try {
      const serializedTodos = JSON.stringify(todos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString()
      })));
      localStorage.setItem('todolist-todos', serializedTodos);
    } catch (error) {
      throw new StorageError('Failed to save todos to localStorage');
    }
  }

  /**
   * Load todos from localStorage
   */
  static loadTodos(): Todo[] {
    try {
      const serializedTodos = localStorage.getItem('todolist-todos');
      if (!serializedTodos) {
        return [];
      }
      
      const parsedTodos = JSON.parse(serializedTodos);
      return parsedTodos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      }));
    } catch (error) {
      console.warn('Failed to load todos from localStorage:', error);
      return [];
    }
  }

  /**
   * Save filter preference to localStorage
   */
  static saveFilter(filter: TodoFilter): void {
    try {
      localStorage.setItem('todolist-filter', filter);
    } catch (error) {
      throw new StorageError('Failed to save filter to localStorage');
    }
  }

  /**
   * Load filter preference from localStorage
   */
  static loadFilter(): TodoFilter {
    try {
      const filter = localStorage.getItem('todolist-filter') as TodoFilter;
      return filter || 'all';
    } catch (error) {
      console.warn('Failed to load filter from localStorage:', error);
      return 'all';
    }
  }

  /**
   * Clear all todo data from localStorage
   */
  static clearAll(): void {
    try {
      localStorage.removeItem('todolist-todos');
      localStorage.removeItem('todolist-filter');
    } catch (error) {
      throw new StorageError('Failed to clear localStorage');
    }
  }
}

/**
 * DOM utility functions
 */
export class DOMUtils {
  /**
   * Get DOM element by ID with type safety
   */
  static getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  }

  /**
   * Create a new DOM element with attributes
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes: Record<string, string> = {},
    textContent?: string
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  }

  /**
   * Add CSS classes to element
   */
  static addClasses(element: HTMLElement, ...classes: string[]): void {
    element.classList.add(...classes);
  }

  /**
   * Remove CSS classes from element
   */
  static removeClasses(element: HTMLElement, ...classes: string[]): void {
    element.classList.remove(...classes);
  }

  /**
   * Toggle CSS class on element
   */
  static toggleClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force);
  }
}
