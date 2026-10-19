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
        <!-- Logo / Brand -->
        <a routerLink="/studio" class="brand" aria-label="Somnia Home">
          <span class="brand-monogram">S</span>
          <div class="brand-identity">
            <span class="brand-title">SOMNIA</span>
            <span class="brand-edition">NOCTURNE • ED. I</span>
          </div>
        </a>

        <!-- Minimalist Icon-Only Navigation -->
        <nav class="nav-links" aria-label="Main navigation">
          <a
            routerLink="/studio"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-icon-btn"
            title="Generative Studio"
            aria-label="Generative Studio"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18M3 12h18" stroke-dasharray="2 2" />
            </svg>
          </a>

          <a
            routerLink="/sleep-entry"
            routerLinkActive="active"
            class="nav-icon-btn"
            title="Log Sleep Data"
            aria-label="Log Sleep Data"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </a>

          <a
            routerLink="/gallery"
            routerLinkActive="active"
            class="nav-icon-btn"
            title="Art Gallery"
            aria-label="Art Gallery"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </a>

          <a
            routerLink="/guide"
            routerLinkActive="active"
            class="nav-icon-btn"
            title="Mathematics & Algorithms"
            aria-label="Mathematics & Algorithms"
          >
            <span class="glyph-integral" aria-hidden="true">∫</span>
          </a>
        </nav>

        <!-- Monochromatic Sleep Status Indicator -->
        <div class="header-status" *ngIf="artworkService.currentSleepRecord$ | async as record">
          <div class="status-badge" title="Active Sleep Data">
            <span class="status-dot"></span>
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
        background: rgba(0, 0, 0, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .header-inner {
        max-width: 1440px;
        margin: 0 auto;
        padding: 0.75rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        text-decoration: none;
        color: #ffffff;
      }
      .brand-monogram {
        font-family: var(--font-display, 'Cinzel', serif);
        font-size: 1.25rem;
        font-weight: 400;
        width: 32px;
        height: 32px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        transition: border-color 0.2s;
      }
      .brand:hover .brand-monogram {
        border-color: #ffffff;
      }
      .brand-identity {
        display: flex;
        flex-direction: column;
      }
      .brand-title {
        font-family: var(--font-display, 'Cinzel', serif);
        font-size: 1.15rem;
        font-weight: 500;
        letter-spacing: 0.35em;
        color: #ffffff;
      }
      .brand-edition {
        font-family: var(--font-mono, monospace);
        font-size: 0.6rem;
        letter-spacing: 0.15em;
        color: #666666;
        margin-top: 1px;
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .nav-icon-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: #888888;
        border: 1px solid transparent;
        background: transparent;
        transition: all 0.2s ease;
      }
      .nav-icon-btn svg {
        width: 18px;
        height: 18px;
      }
      .glyph-integral {
        font-family: var(--font-art, serif);
        font-size: 1.35rem;
        font-style: italic;
        line-height: 1;
      }
      .nav-icon-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.15);
      }
      .nav-icon-btn.active {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
      }
      .header-status {
        display: flex;
        align-items: center;
      }
      .status-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.35rem 0.85rem;
        background: #000000;
        border: 1px solid rgba(255, 255, 255, 0.12);
        font-family: var(--font-mono, monospace);
        font-size: 0.7rem;
        color: #888888;
        letter-spacing: 0.05em;
      }
      .status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #ffffff;
      }
      @media (max-width: 768px) {
        .header-status {
          display: none;
        }
        .header-inner {
          padding: 0.65rem 1rem;
        }
        .brand-edition {
          display: none;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  public artworkService = inject(ArtworkService);
}
