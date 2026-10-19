import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="modalId + '-title'"
      (click)="onBackdropClick($event)"
      (keydown.escape)="cancel.emit()"
      tabindex="-1"
    >
      <div class="modal-card" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h3 [id]="modalId + '-title'" class="modal-title">{{ title }}</h3>
        </header>
        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>
        <footer class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="cancel.emit()"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="btn"
            [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'"
            (click)="confirm.emit()"
          >
            {{ confirmLabel }}
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(4, 7, 16, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1.5rem;
      }
      .modal-card {
        background: #0d1120;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1rem;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 25px rgba(99, 102, 241, 0.15);
        overflow: hidden;
        animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .modal-header {
        padding: 1.5rem 1.5rem 0.75rem;
      }
      .modal-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #f1f5f9;
        margin: 0;
      }
      .modal-body {
        padding: 0 1.5rem 1.5rem;
      }
      .modal-message {
        color: #94a3b8;
        font-size: 0.9375rem;
        line-height: 1.5;
        margin: 0;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        border: 1px solid transparent;
      }
      .btn-secondary {
        background: rgba(255, 255, 255, 0.06);
        color: #cbd5e1;
        border-color: rgba(255, 255, 255, 0.1);
      }
      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }
      .btn-primary {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: #fff;
      }
      .btn-primary:hover {
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
      }
      .btn-danger {
        background: #dc2626;
        color: #fff;
      }
      .btn-danger:hover {
        background: #b91c1c;
      }
      @keyframes scaleUp {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  ],
})
export class ConfirmationModalComponent {
  @Input() public isOpen = false;
  @Input() public title = 'Confirm Action';
  @Input() public message = 'Are you sure you want to proceed?';
  @Input() public confirmLabel = 'Confirm';
  @Input() public cancelLabel = 'Cancel';
  @Input() public isDanger = false;
  @Input() public modalId = 'confirm-modal';

  @Output() public confirm = new EventEmitter<void>();
  @Output() public cancel = new EventEmitter<void>();

  public onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}

