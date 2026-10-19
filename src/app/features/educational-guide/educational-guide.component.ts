import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-educational-guide',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './educational-guide.component.html',
  styleUrls: ['./educational-guide.component.css'],
})
export class EducationalGuideComponent {
  public activeTab: 'prng' | 'noise' | 'flow' | 'particles' | 'sleep' | 'perf' = 'prng';

  public setActiveTab(tab: 'prng' | 'noise' | 'flow' | 'particles' | 'sleep' | 'perf'): void {
    this.activeTab = tab;
  }
}

