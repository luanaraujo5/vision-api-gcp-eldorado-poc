import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private installPromptAvailable = new BehaviorSubject<boolean>(false);
  private isOnline = new BehaviorSubject<boolean>(navigator.onLine);
  private isInstalled = new BehaviorSubject<boolean>(this.checkIfInstalled());

  constructor() {
    this.initializePWA();
    this.setupEventListeners();
  }

  /**
   * Inicializa o serviço PWA
   */
  private initializePWA(): void {
    // Registra o service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/assets/ngsw-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration);
          
          // Verifica se há atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }

    // Verifica se o app pode ser instalado
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as PWAInstallPrompt;
      this.installPromptAvailable.next(true);
    });
  }

  /**
   * Configura os listeners de eventos
   */
  private setupEventListeners(): void {
    // Monitora status online/offline
    window.addEventListener('online', () => {
      this.isOnline.next(true);
      this.showOnlineNotification();
    });

    window.addEventListener('offline', () => {
      this.isOnline.next(false);
      this.showOfflineNotification();
    });

    // Monitora mudanças no service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  /**
   * Verifica se o app está instalado
   */
  private checkIfInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Mostra o prompt de instalação
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.installPromptAvailable.next(false);
        this.deferredPrompt = null;
        this.isInstalled.next(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
      return false;
    }
  }

  /**
   * Atualiza o app quando há uma nova versão
   */
  updateApp(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then((registration) => {
          if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
    }
  }

  /**
   * Verifica se há atualizações disponíveis
   */
  checkForUpdates(): Observable<boolean> {
    return new Observable(observer => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration()
          .then((registration) => {
            if (registration) {
              registration.update();
              observer.next(true);
            } else {
              observer.next(false);
            }
            observer.complete();
          })
          .catch(() => {
            observer.next(false);
            observer.complete();
          });
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  /**
   * Obtém o status de instalação
   */
  getInstallStatus(): Observable<boolean> {
    return this.isInstalled.asObservable();
  }

  /**
   * Obtém o status de disponibilidade do prompt de instalação
   */
  getInstallPromptAvailable(): Observable<boolean> {
    return this.installPromptAvailable.asObservable();
  }

  /**
   * Obtém o status online/offline
   */
  getOnlineStatus(): Observable<boolean> {
    return this.isOnline.asObservable();
  }

  /**
   * Verifica se o app está rodando como PWA
   */
  isRunningAsPWA(): boolean {
    return this.isInstalled.value || 
           window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Mostra notificação de atualização disponível
   */
  private showUpdateNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Vision API Atualizado', {
        body: 'Uma nova versão está disponível. Clique para atualizar.',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: 'app-update'
      });

      notification.onclick = () => {
        this.updateApp();
        notification.close();
      };
    }
  }

  /**
   * Mostra notificação de status online
   */
  private showOnlineNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Conexão Restaurada', {
        body: 'Você está online novamente.',
        icon: '/assets/icons/icon-192x192.png',
        tag: 'connection-status'
      });
    }
  }

  /**
   * Mostra notificação de status offline
   */
  private showOfflineNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sem Conexão', {
        body: 'Você está offline. Algumas funcionalidades podem não estar disponíveis.',
        icon: '/assets/icons/icon-192x192.png',
        tag: 'connection-status'
      });
    }
  }

  /**
   * Solicita permissão para notificações
   */
  requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied' as NotificationPermission);
  }

  /**
   * Obtém informações sobre o app
   */
  getAppInfo(): { version: string; name: string; description: string } {
    return {
      version: '1.0.0',
      name: 'Vision API Frontend',
      description: 'Frontend Angular para análise de imagens usando Google Vision API'
    };
  }
}
