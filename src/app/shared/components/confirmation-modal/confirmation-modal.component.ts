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
            class="modal-btn"
            (click)="cancel.emit()"
            title="Dismiss"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            class="modal-btn modal-btn-confirm"
            [class.modal-btn-danger]="isDanger"
            (click)="confirm.emit()"
            [title]="confirmLabel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
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
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(16px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1.5rem;
      }
      .modal-card {
        background: #080808;
        border: 1px solid rgba(255, 255, 255, 0.2);
        width: 100%;
        max-width: 420px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.9);
        overflow: hidden;
      }
      .modal-header {
        padding: 1.5rem 1.5rem 0.75rem;
      }
      .modal-title {
        font-family: var(--font-art, serif);
        font-size: 1.35rem;
        font-weight: 400;
        letter-spacing: 0.04em;
        color: #ffffff;
        margin: 0;
      }
      .modal-body {
        padding: 0 1.5rem 1.5rem;
      }
      .modal-message {
        color: #888888;
        font-size: 0.875rem;
        line-height: 1.6;
        margin: 0;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .modal-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: transparent;
        color: #888888;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: all 0.2s ease;
      }
      .modal-btn svg {
        width: 16px;
        height: 16px;
      }
      .modal-btn:hover {
        border-color: #ffffff;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.08);
      }
      .modal-btn-confirm {
        background: #ffffff;
        color: #000000;
        border-color: #ffffff;
      }
      .modal-btn-confirm:hover {
        background: #d4d4d4;
        color: #000000;
      }
      .modal-btn-danger {
        background: #ffffff;
        color: #000000;
      }
      .modal-btn-danger:hover {
        background: #000000;
        color: #ffffff;
        border-color: #ffffff;
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
