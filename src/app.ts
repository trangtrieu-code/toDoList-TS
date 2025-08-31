/**
 * Main TodoList Application
 * Handles UI components and event handlers
 */

import { TodoList } from './TodoList.js';
import { Todo, TodoFilter, ValidationError, StorageError, DOM_IDS, CSS_CLASSES } from './types.js';
import { DOMUtils } from './utils.js';

export class TodoApp {
  private todoList: TodoList;
  private todoForm: HTMLFormElement | null = null;
  private todoInput: HTMLInputElement | null = null;
  private todoListContainer: HTMLUListElement | null = null;
  private emptyState: HTMLElement | null = null;
  private filterButtons: NodeListOf<HTMLButtonElement> | null = null;
  private clearCompletedBtn: HTMLButtonElement | null = null;

  // Statistics elements
  private totalTodosEl: HTMLElement | null = null;
  private completedTodosEl: HTMLElement | null = null;
  private pendingTodosEl: HTMLElement | null = null;

  constructor() {
    this.todoList = new TodoList();
    this.initializeElements();
    this.setupEventListeners();
    this.render();
  }

  /**
   * Initialize DOM elements
   */
  private initializeElements(): void {
    this.todoForm = DOMUtils.getElementById<HTMLFormElement>(DOM_IDS.TODO_FORM);
    this.todoInput = DOMUtils.getElementById<HTMLInputElement>(DOM_IDS.TODO_INPUT);
    this.todoListContainer = DOMUtils.getElementById<HTMLUListElement>(DOM_IDS.TODO_LIST);
    this.emptyState = DOMUtils.getElementById<HTMLElement>(DOM_IDS.EMPTY_STATE);
    this.clearCompletedBtn = DOMUtils.getElementById<HTMLButtonElement>(DOM_IDS.CLEAR_COMPLETED);

    // Statistics elements
    this.totalTodosEl = DOMUtils.getElementById<HTMLElement>(DOM_IDS.TOTAL_TODOS);
    this.completedTodosEl = DOMUtils.getElementById<HTMLElement>(DOM_IDS.COMPLETED_TODOS);
    this.pendingTodosEl = DOMUtils.getElementById<HTMLElement>(DOM_IDS.PENDING_TODOS);

    // Filter buttons
    this.filterButtons = document.querySelectorAll('.filter-btn');

    // Debug logging
    console.log('DOM Elements initialized:', {
      todoForm: !!this.todoForm,
      todoInput: !!this.todoInput,
      todoListContainer: !!this.todoListContainer,
      emptyState: !!this.emptyState,
      clearCompletedBtn: !!this.clearCompletedBtn,
      totalTodosEl: !!this.totalTodosEl,
      completedTodosEl: !!this.completedTodosEl,
      pendingTodosEl: !!this.pendingTodosEl,
      filterButtons: this.filterButtons?.length || 0
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Form submission
    this.todoForm?.addEventListener('submit', (e) => this.handleAddTodo(e));

    // Filter buttons
    this.filterButtons?.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilterChange(e));
    });

    // Clear completed button
    this.clearCompletedBtn?.addEventListener('click', () => this.handleClearCompleted());
  }

  /**
   * Handle add todo form submission
   */
  private handleAddTodo(event: Event): void {
    event.preventDefault();
    console.log('Form submitted!');
    
    if (!this.todoInput) {
      console.error('Todo input not found!');
      return;
    }

    const text = this.todoInput.value.trim();
    console.log('Todo text:', text);
    
    if (!text) {
      console.log('Empty text, not adding todo');
      return;
    }

    try {
      const newTodo = this.todoList.addTodo(text);
      console.log('Todo added:', newTodo);
      this.todoInput.value = '';
      this.render();
      this.showSuccessMessage(`Todo "${newTodo.text}" added successfully!`);
    } catch (error) {
      console.error('Error adding todo:', error);
      this.handleError(error, 'Failed to add todo');
    }
  }

  /**
   * Handle filter button clicks
   */
  private handleFilterChange(event: Event): void {
    const target = event.target as HTMLButtonElement;
    const filter = target.dataset.filter as TodoFilter;

    if (!filter) return;

    try {
      this.todoList.setFilter(filter);
      this.updateFilterButtons(filter);
      this.render();
    } catch (error) {
      this.handleError(error, 'Failed to change filter');
    }
  }

  /**
   * Handle todo toggle (completion status)
   */
  private handleToggleTodo(todoId: string): void {
    try {
      const updatedTodo = this.todoList.toggleTodo(todoId);
      if (updatedTodo) {
        this.render();
        const status = updatedTodo.completed ? 'completed' : 'pending';
        this.showSuccessMessage(`Todo marked as ${status}!`);
      }
    } catch (error) {
      this.handleError(error, 'Failed to toggle todo');
    }
  }

  /**
   * Handle todo deletion
   */
  private handleDeleteTodo(todoId: string): void {
    try {
      const success = this.todoList.deleteTodo(todoId);
      if (success) {
        this.render();
        this.showSuccessMessage('Todo deleted successfully!');
      }
    } catch (error) {
      this.handleError(error, 'Failed to delete todo');
    }
  }

  /**
   * Handle clear completed todos
   */
  private handleClearCompleted(): void {
    try {
      const deletedCount = this.todoList.deleteCompletedTodos();
      if (deletedCount > 0) {
        this.render();
        this.showSuccessMessage(`${deletedCount} completed todo(s) cleared!`);
      } else {
        this.showInfoMessage('No completed todos to clear.');
      }
    } catch (error) {
      this.handleError(error, 'Failed to clear completed todos');
    }
  }

  /**
   * Render the entire application
   */
  private render(): void {
    this.renderTodoList();
    this.renderStatistics();
    this.updateClearCompletedButton();
    this.updateEmptyState();
  }

  /**
   * Render the todo list
   */
  private renderTodoList(): void {
    if (!this.todoListContainer) return;

    const todos = this.todoList.getFilteredTodos();
    this.todoListContainer.innerHTML = '';

    todos.forEach(todo => {
      const todoElement = this.createTodoElement(todo);
      this.todoListContainer!.appendChild(todoElement);
    });
  }

  /**
   * Create a todo element
   */
  private createTodoElement(todo: Todo): HTMLLIElement {
    const li = DOMUtils.createElement('li', {
      'class': `${CSS_CLASSES.TODO_ITEM} ${todo.completed ? CSS_CLASSES.COMPLETED : ''}`,
      'data-todo-id': todo.id
    });

    li.innerHTML = `
      <div class="form-check d-flex align-items-center">
        <input 
          class="form-check-input me-3" 
          type="checkbox" 
          ${todo.completed ? 'checked' : ''}
          id="todo-${todo.id}"
        >
        <label class="form-check-label flex-grow-1" for="todo-${todo.id}">
          <span class="todo-text">${this.escapeHtml(todo.text)}</span>
        </label>
        <button 
          type="button" 
          class="btn btn-outline-danger btn-sm ms-2"
          data-action="delete"
          title="Delete todo"
        >
          Delete
        </button>
      </div>
    `;

    // Add event listeners
    const checkbox = li.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const deleteBtn = li.querySelector('[data-action="delete"]') as HTMLButtonElement;

    checkbox.addEventListener('change', () => this.handleToggleTodo(todo.id));
    deleteBtn.addEventListener('click', () => this.handleDeleteTodo(todo.id));

    return li;
  }

  /**
   * Render statistics
   */
  private renderStatistics(): void {
    const stats = this.todoList.getStats();

    if (this.totalTodosEl) {
      this.totalTodosEl.textContent = stats.total.toString();
    }
    if (this.completedTodosEl) {
      this.completedTodosEl.textContent = stats.completed.toString();
    }
    if (this.pendingTodosEl) {
      this.pendingTodosEl.textContent = stats.pending.toString();
    }
  }

  /**
   * Update filter buttons active state
   */
  private updateFilterButtons(activeFilter: TodoFilter): void {
    this.filterButtons?.forEach(btn => {
      const filter = btn.dataset.filter as TodoFilter;
      DOMUtils.toggleClass(btn, CSS_CLASSES.FILTER_ACTIVE, filter === activeFilter);
    });
  }

  /**
   * Update clear completed button visibility
   */
  private updateClearCompletedButton(): void {
    if (!this.clearCompletedBtn) return;

    const stats = this.todoList.getStats();
    this.clearCompletedBtn.style.display = stats.completed > 0 ? 'inline-block' : 'none';
  }

  /**
   * Update empty state visibility
   */
  private updateEmptyState(): void {
    if (!this.emptyState) return;

    const todos = this.todoList.getFilteredTodos();
    this.emptyState.style.display = todos.length === 0 ? 'block' : 'none';
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    this.showMessage(message, 'success');
  }

  /**
   * Show info message
   */
  private showInfoMessage(message: string): void {
    this.showMessage(message, 'info');
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    this.showMessage(message, 'danger');
  }

  /**
   * Show message with Bootstrap modal
   */
  private showMessage(message: string, type: 'success' | 'info' | 'danger'): void {
    // Remove existing modals
    const existingModals = document.querySelectorAll('#messageModal');
    existingModals.forEach(modal => modal.remove());

    // Create modal HTML
    const modalHtml = `
      <div class="modal fade" id="messageModal" tabindex="-1" aria-labelledby="messageModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-${type} text-white">
              <h5 class="modal-title" id="messageModalLabel">
                ${this.getModalTitle(type)}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-${type}" data-bs-dismiss="modal">OK</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modalElement = document.getElementById('messageModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();

      // Auto-hide after 3 seconds
      setTimeout(() => {
        modal.hide();
        // Remove modal from DOM after hiding
        setTimeout(() => {
          if (modalElement.parentNode) {
            modalElement.remove();
          }
        }, 300);
      }, 3000);
    }
  }

  /**
   * Get modal title based on type
   */
  private getModalTitle(type: 'success' | 'info' | 'danger'): string {
    switch (type) {
      case 'success':
        return '✅ Success';
      case 'info':
        return 'ℹ️ Information';
      case 'danger':
        return '❌ Error';
      default:
        return '📝 Message';
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown, context: string): void {
    console.error(`${context}:`, error);
    
    let message = `${context}. Please try again.`;
    
    if (error instanceof ValidationError) {
      message = error.message;
    } else if (error instanceof StorageError) {
      message = `Storage error: ${error.message}`;
    } else if (error instanceof Error) {
      message = error.message;
    }

    this.showErrorMessage(message);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
