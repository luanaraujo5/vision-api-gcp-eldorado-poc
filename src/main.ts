import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { VisionAnalyzerComponent } from './app/components/vision-analyzer/vision-analyzer.component';

bootstrapApplication(VisionAnalyzerComponent, appConfig)
  .catch(err => console.error(err));

// Registra o service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/ngsw-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  });
}
