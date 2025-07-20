/**
 * TypeScript interfaces and types for TodoList application
 */

// Todo item interface
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Filter types for todo list
export type TodoFilter = 'all' | 'completed' | 'pending';

// Todo statistics interface
export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

// Todo form data interface
export interface TodoFormData {
  text: string;
}

// Event types for todo operations
export type TodoEventType = 'add' | 'remove' | 'toggle' | 'update' | 'clear-completed';

// Todo event interface
export interface TodoEvent {
  type: TodoEventType;
  todo?: Todo;
  todos?: Todo[];
  filter?: TodoFilter;
}

// Local storage keys
export const STORAGE_KEYS = {
  TODOS: 'todolist-todos',
  FILTER: 'todolist-filter'
} as const;

// DOM element IDs
export const DOM_IDS = {
  TODO_FORM: 'todoForm',
  TODO_INPUT: 'todoInput',
  TODO_LIST: 'todoList',
  EMPTY_STATE: 'emptyState',
  TOTAL_TODOS: 'totalTodos',
  COMPLETED_TODOS: 'completedTodos',
  PENDING_TODOS: 'pendingTodos',
  CLEAR_COMPLETED: 'clearCompleted'
} as const;

// CSS classes
export const CSS_CLASSES = {
  TODO_ITEM: 'todo-item',
  COMPLETED: 'completed',
  NEW: 'new',
  FILTER_ACTIVE: 'active'
} as const;

// Error types
export class TodoError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TodoError';
  }
}

// Validation error types
export class ValidationError extends TodoError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Storage error types
export class StorageError extends TodoError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
  }
}
