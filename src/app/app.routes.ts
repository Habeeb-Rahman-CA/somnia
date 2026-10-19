import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'studio',
    pathMatch: 'full',
  },
  {
    path: 'studio',
    loadComponent: () =>
      import('./features/art-studio/art-studio.component').then(
        (m) => m.ArtStudioComponent,
      ),
  },
  {
    path: 'sleep-entry',
    loadComponent: () =>
      import('./features/sleep-entry/sleep-entry.component').then(
        (m) => m.SleepEntryComponent,
      ),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.component').then(
        (m) => m.GalleryComponent,
      ),
  },
  {
    path: 'artwork/:id',
    loadComponent: () =>
      import('./features/artwork-detail/artwork-detail.component').then(
        (m) => m.ArtworkDetailComponent,
      ),
  },
  {
    path: 'guide',
    loadComponent: () =>
      import('./features/educational-guide/educational-guide.component').then(
        (m) => m.EducationalGuideComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'studio',
  },
];
