import { Routes } from '@angular/router';
import { VisionAnalyzerComponent } from './components/vision-analyzer/vision-analyzer.component';

export const routes: Routes = [
  { path: '', redirectTo: '/vision', pathMatch: 'full' },
  { path: 'vision', component: VisionAnalyzerComponent }
];
