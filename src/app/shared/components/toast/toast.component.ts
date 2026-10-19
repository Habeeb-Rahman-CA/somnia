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
        [ngClass]="'toast-' + toast.type"
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
        background: rgba(13, 17, 31, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(12px);
        color: #f1f5f9;
        padding: 0.75rem 1.25rem;
        border-radius: 9999px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.2);
        font-size: 0.875rem;
        animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .toast-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #818cf8;
      }
      .toast-success .toast-dot {
        background: #34d399;
        box-shadow: 0 0 8px #34d399;
      }
      .toast-warning .toast-dot {
        background: #facc15;
        box-shadow: 0 0 8px #facc15;
      }
      .toast-info .toast-dot {
        background: #38bdf8;
        box-shadow: 0 0 8px #38bdf8;
      }
      .toast-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: 0 0.25rem;
        transition: color 0.15s;
      }
      .toast-close:hover {
        color: #fff;
      }
      @keyframes toastIn {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class ToastComponent {
  public toastService = inject(ToastService);
}

