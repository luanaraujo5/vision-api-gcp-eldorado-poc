import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { VisionAnalyzerComponent } from './app/components/vision-analyzer/vision-analyzer.component';

bootstrapApplication(VisionAnalyzerComponent, appConfig)
  .catch(err => console.error(err));
