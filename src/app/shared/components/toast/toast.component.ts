import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside
      class="toast-container"
      role="region"
      aria-live="polite"
      aria-label="System notifications"
    >
      <div
        *ngFor="let toast of toastService.toasts$ | async"
        class="toast-item"
        role="alert"
      >
        <span class="toast-dot"></span>
        <span class="toast-text">{{ toast.text }}</span>
        <button
          type="button"
          class="toast-close"
          aria-label="Dismiss notification"
          (click)="toastService.remove(toast.id)"
        >
          &times;
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        pointer-events: none;
      }
      .toast-item {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(10, 10, 10, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        color: #ffffff;
        padding: 0.65rem 1.15rem;
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.8);
        font-family: var(--font-mono, monospace);
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .toast-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ffffff;
      }
      .toast-close {
        background: transparent;
        border: none;
        color: #777777;
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        padding: 0 0.2rem;
        transition: color 0.15s;
      }
      .toast-close:hover {
        color: #ffffff;
      }
      @keyframes toastIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ToastComponent {
  public toastService = inject(ToastService);
}
