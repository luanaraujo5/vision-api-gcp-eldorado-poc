import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CameraOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
}

export interface CameraStream {
  stream: MediaStream;
  videoElement: HTMLVideoElement;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private currentStream: MediaStream | null = null;

  constructor() { }

  /**
   * Verifica se a câmera está disponível no dispositivo
   */
  isCameraAvailable(): Observable<boolean> {
    return from(navigator.mediaDevices.getUserMedia({ video: true }))
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Inicia a câmera com as opções especificadas
   */
  startCamera(options: CameraOptions = {}): Observable<CameraStream> {
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: options.width || 1280, min: 640 },
        height: { ideal: options.height || 720, min: 480 },
        facingMode: options.facingMode || 'environment',
        aspectRatio: options.aspectRatio || 16/9,
        frameRate: { ideal: 30, min: 15 }
      }
    };

    return from(navigator.mediaDevices.getUserMedia(constraints))
      .pipe(
        map((stream) => {
          this.currentStream = stream;
          const videoElement = this.createVideoElement(stream);
          
          console.log('Câmera iniciada com sucesso:', {
            stream: stream,
            videoTracks: stream.getVideoTracks(),
            constraints: constraints
          });
          
          return { stream, videoElement };
        }),
        catchError((error) => {
          let errorMessage = 'Erro ao acessar a câmera';
          
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador.';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'A câmera está sendo usada por outro aplicativo.';
          } else if (error.name === 'OverconstrainedError') {
            errorMessage = 'As configurações da câmera não são suportadas.';
          }
          
          console.error('Erro ao iniciar câmera:', error);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Captura uma foto da câmera ativa
   */
  capturePhoto(videoElement: HTMLVideoElement): Observable<string> {
    return new Observable(observer => {
      try {
        // Aguarda o vídeo estar pronto
        if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
          observer.error(new Error('Vídeo ainda não está pronto para captura'));
          return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          observer.error(new Error('Não foi possível criar o contexto do canvas'));
          return;
        }

        // Define as dimensões do canvas baseado no vídeo
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        if (videoWidth === 0 || videoHeight === 0) {
          observer.error(new Error('Dimensões do vídeo inválidas'));
          return;
        }

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        // Desenha o frame atual do vídeo no canvas
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Converte para base64
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        console.log('Foto capturada com sucesso:', {
          width: videoWidth,
          height: videoHeight,
          dataUrlLength: photoDataUrl.length
        });
        
        observer.next(photoDataUrl);
        observer.complete();
      } catch (error) {
        observer.error(new Error('Erro ao capturar foto: ' + error));
      }
    });
  }

  /**
   * Alterna entre câmera frontal e traseira
   */
  switchCamera(): Observable<CameraStream> {
    if (this.currentStream) {
      this.stopCamera();
    }

    // Detecta a câmera atual e alterna
    return this.startCamera({ facingMode: 'user' })
      .pipe(
        catchError(() => this.startCamera({ facingMode: 'environment' }))
      );
  }

  /**
   * Para a câmera e libera os recursos
   */
  stopCamera(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }

  /**
   * Obtém a lista de câmeras disponíveis
   */
  getAvailableCameras(): Observable<MediaDeviceInfo[]> {
    return from(navigator.mediaDevices.enumerateDevices())
      .pipe(
        map(devices => devices.filter(device => device.kind === 'videoinput')),
        catchError(() => [])
      );
  }

  /**
   * Cria um elemento de vídeo para exibir o stream da câmera
   */
  private createVideoElement(stream: MediaStream): HTMLVideoElement {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.controls = false;
    
    return video;
  }

  /**
   * Converte uma foto base64 para File
   */
  dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Obtém informações sobre a câmera ativa
   */
  getCameraInfo(): Observable<{ width: number; height: number; fps: number }> {
    return new Observable(observer => {
      if (!this.currentStream) {
        observer.error(new Error('Nenhuma câmera ativa'));
        return;
      }

      const videoTrack = this.currentStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      observer.next({
        width: settings.width || 0,
        height: settings.height || 0,
        fps: settings.frameRate || 0
      });
      observer.complete();
    });
  }
}
