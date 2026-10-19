import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtworkService } from '../../../core/services/artwork.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header">
      <div class="header-inner">
        <a routerLink="/studio" class="brand" aria-label="Somnia Home">
          <div class="brand-glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">SOMNIA</span>
            <span class="brand-tagline">Sleep Generative Art</span>
          </div>
        </a>

        <nav class="nav-links" aria-label="Main navigation">
          <a
            routerLink="/studio"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link"
          >
            <span class="nav-icon" aria-hidden="true">✦</span>
            Studio
          </a>
          <a
            routerLink="/sleep-entry"
            routerLinkActive="active"
            class="nav-link"
          >
            <span class="nav-icon" aria-hidden="true">☾</span>
            Sleep Entry
          </a>
          <a
            routerLink="/gallery"
            routerLinkActive="active"
            class="nav-link"
          >
            <span class="nav-icon" aria-hidden="true">❖</span>
            Gallery
          </a>
          <a
            routerLink="/guide"
            routerLinkActive="active"
            class="nav-link"
          >
            <span class="nav-icon" aria-hidden="true">∫</span>
            Math & Science
          </a>
        </nav>

        <div class="header-status" *ngIf="artworkService.currentSleepRecord$ | async as record">
          <div class="status-badge" title="Active Sleep Data">
            <span class="pulse-dot"></span>
            <span class="status-text">{{ record.date }} • {{ record.bedtime }}–{{ record.wakeTime }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .app-header {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: rgba(7, 10, 20, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .header-inner {
        max-width: 1440px;
        margin: 0 auto;
        padding: 0.875rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: #fff;
      }
      .brand-glyph {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(45, 212, 191, 0.25));
        border: 1px solid rgba(165, 180, 252, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a5b4fc;
      }
      .brand-glyph svg {
        width: 18px;
        height: 18px;
      }
      .brand-text {
        display: flex;
        flex-direction: column;
      }
      .brand-title {
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        background: linear-gradient(135deg, #f1f5f9, #a5b4fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .brand-tagline {
        font-size: 0.6875rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      .nav-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.875rem;
        border-radius: 0.5rem;
        text-decoration: none;
        color: #94a3b8;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }
      .nav-link:hover {
        color: #e2e8f0;
        background: rgba(255, 255, 255, 0.04);
      }
      .nav-link.active {
        color: #a5b4fc;
        background: rgba(99, 102, 241, 0.12);
        border-color: rgba(99, 102, 241, 0.25);
      }
      .nav-icon {
        font-size: 0.9rem;
        color: #818cf8;
      }
      .header-status {
        display: flex;
        align-items: center;
      }
      .status-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.35rem 0.75rem;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 9999px;
        font-size: 0.75rem;
        color: #cbd5e1;
      }
      .pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #2dd4bf;
        box-shadow: 0 0 8px #2dd4bf;
      }
      @media (max-width: 768px) {
        .header-status {
          display: none;
        }
        .header-inner {
          padding: 0.75rem 1rem;
        }
        .brand-tagline {
          display: none;
        }
        .nav-link {
          padding: 0.4rem 0.5rem;
          font-size: 0.8125rem;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  public artworkService = inject(ArtworkService);
}

