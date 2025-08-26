import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DetectionType, VisionResponse } from '../../services/api.service';
import { CameraService, CameraStream } from '../../services/camera.service';
import { PwaService } from '../../services/pwa.service';
import { Subscription } from 'rxjs';

/**
 * Componente principal para análise de imagens usando Google Vision API
 * Permite upload de imagens e seleção de tipos de detecção
 */
@Component({
  selector: 'app-vision-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vision-analyzer.component.html',
  styleUrls: ['./vision-analyzer.component.css']
})
export class VisionAnalyzerComponent implements OnInit, OnDestroy {
  @ViewChild('cameraVideo', { static: false }) cameraVideo!: ElementRef<HTMLVideoElement>;
  
  /** Imagem selecionada pelo usuário */
  selectedImage: File | null = null;
  
  /** Estado da câmera */
  cameraActive = false;
  cameraStream: MediaStream | null = null;
  cameraError: string | null = null;
  
  /** Estado PWA */
  isPWAInstalled = false;
  installPromptAvailable = false;
  isOnline = true;
  
  /** Subscriptions para cleanup */
  private subscriptions = new Subscription();
  
  /** Preview da imagem em base64 para exibição */
  imagePreview: string | null = null;
  
  /** Tipos de detecção selecionados pelo usuário */
  selectedDetections: DetectionType[] = [];
  
  /** Número máximo de resultados por tipo de detecção */
  maxResults: number = 5;
  
  /** Estado de carregamento da API */
  loading = false;
  
  /** Mensagem de erro, se houver */
  error: string | null = null;
  
  /** Resultados da análise da API */
  results: VisionResponse | null = null;

  /**
   * Opções de detecção disponíveis com descrições amigáveis
   */
  readonly detectionOptions: { value: DetectionType; label: string; description: string; icon: string }[] = [
    { 
      value: 'FACE_DETECTION', 
      label: 'Detecção de Rosto', 
      description: 'Rostos, emoções, pose, qualidade da imagem',
      icon: '😊'
    },
    { 
      value: 'LANDMARK_DETECTION', 
      label: 'Detecção de Lugares', 
      description: 'Pão de Açúcar, Cristo Redentor, monumentos famosos',
      icon: '🗺️'
    },
    { 
      value: 'LOGO_DETECTION', 
      label: 'Detecção de Logos', 
      description: 'Marcas, logotipos e símbolos comerciais',
      icon: '🏢'
    },
    { 
      value: 'LABEL_DETECTION', 
      label: 'Rótulos Gerais', 
      description: 'Descrições como "praia", "computador", "carro"',
      icon: '🏷️'
    },
    { 
      value: 'TEXT_DETECTION', 
      label: 'Detecção de Texto', 
      description: 'OCR para textos, placas, sinais em imagens',
      icon: '📝'
    },
    { 
      value: 'DOCUMENT_TEXT_DETECTION', 
      label: 'Texto de Documentos', 
      description: 'OCR avançado para documentos e manuscritos',
      icon: '📄'
    },
    { 
      value: 'SAFE_SEARCH_DETECTION', 
      label: 'Conteúdo Seguro', 
      description: 'Análise de conteúdo sensível ou inadequado',
      icon: '🛡️'
    },
    { 
      value: 'IMAGE_PROPERTIES', 
      label: 'Propriedades da Imagem', 
      description: 'Cores dominantes e características visuais',
      icon: '🎨'
    },
    { 
      value: 'OBJECT_LOCALIZATION', 
      label: 'Localização de Objetos', 
      description: 'Detecção de objetos e suas posições na imagem',
      icon: '🎯'
    },
    { 
      value: 'CROP_HINTS', 
      label: 'Sugestões de Recorte', 
      description: 'Sugestões automáticas de crop da imagem',
      icon: '✂️'
    },
    { 
      value: 'WEB_DETECTION', 
      label: 'Detecção Web', 
      description: 'Busca por imagens similares na internet',
      icon: '🌐'
    }
  ];

  constructor(
    private apiService: ApiService,
    private cameraService: CameraService,
    private pwaService: PwaService
  ) { }

  ngOnInit(): void {
    this.setupPWASubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stopCamera();
  }

  /**
   * Configura as subscriptions PWA
   */
  private setupPWASubscriptions(): void {
    this.subscriptions.add(
      this.pwaService.getInstallStatus().subscribe(
        (installed) => this.isPWAInstalled = installed
      )
    );

    this.subscriptions.add(
      this.pwaService.getInstallPromptAvailable().subscribe(
        (available) => this.installPromptAvailable = available
      )
    );

    this.subscriptions.add(
      this.pwaService.getOnlineStatus().subscribe(
        (online) => this.isOnline = online
      )
    );
  }

  /**
   * Manipula a seleção de imagem pelo usuário
   * @param event - Evento de mudança do input file
   */
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validação do tipo de arquivo
      if (!this.isValidImageFile(file)) {
        this.error = 'Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF, BMP)';
        return;
      }

      // Validação do tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'O arquivo é muito grande. Tamanho máximo permitido: 10MB';
        return;
      }

      this.selectedImage = file;
      this.createImagePreview(file);
      this.error = null;
      this.results = null;
    }
  }

  /**
   * Verifica se o arquivo é uma imagem válida
   * @param file - Arquivo a ser validado
   * @returns true se for uma imagem válida
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    return validTypes.includes(file.type);
  }

  /**
   * Cria preview da imagem selecionada
   * @param file - Arquivo de imagem selecionado
   */
  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
      
      // Scroll automático para a seção de Tipos de Detecção após um pequeno delay
      setTimeout(() => {
        const detectionSection = document.getElementById('detection-section');
        if (detectionSection) {
          detectionSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 300);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Alterna a seleção de um tipo de detecção
   * @param detection - Tipo de detecção a ser alternado
   */
  toggleDetection(detection: DetectionType): void {
    const index = this.selectedDetections.indexOf(detection);
    if (index > -1) {
      this.selectedDetections.splice(index, 1);
    } else {
      this.selectedDetections.push(detection);
    }
  }

  /**
   * Verifica se um tipo de detecção está selecionado
   * @param detection - Tipo de detecção a ser verificado
   * @returns true se estiver selecionado, false caso contrário
   */
  isDetectionSelected(detection: DetectionType): boolean {
    return this.selectedDetections.includes(detection);
  }

  /**
   * Analisa a imagem usando os tipos de detecção selecionados
   */
  analyzeImage(): void {
    if (!this.selectedImage || this.selectedDetections.length === 0) {
      this.error = 'Selecione uma imagem e pelo menos um tipo de detecção';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = null;

    // Converter imagem para base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result.split(',')[1]; // Remove o prefixo data:image/...;base64,
      
      this.apiService.analyzeImage(base64, this.selectedDetections, this.maxResults).subscribe({
        next: (response) => {
          this.results = response;
          this.loading = false;
          
          // Scroll automático para a seção de resultados após um pequeno delay
          setTimeout(() => {
            const resultsSection = document.querySelector('.results-section');
            if (resultsSection) {
              resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }, 500);
        },
        error: (err) => {
          let errorMessage = 'Erro ao analisar imagem';
          
          if (err.status === 400) {
            errorMessage = 'Erro na requisição. Verifique se a imagem é válida.';
          } else if (err.status === 401) {
            errorMessage = 'Erro de autenticação. Verifique sua API key.';
          } else if (err.status === 403) {
            errorMessage = 'Acesso negado. Verifique as permissões da sua API key.';
          } else if (err.status === 429) {
            errorMessage = 'Limite de requisições excedido. Tente novamente mais tarde.';
          } else if (err.status >= 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          } else if (err.message) {
            errorMessage += ': ' + err.message;
          }
          
          this.error = errorMessage;
          this.loading = false;
        }
      });
    };
    reader.readAsDataURL(this.selectedImage);
  }

  /**
   * Limpa a mensagem de erro
   */
  clearError(): void {
    this.error = null;
  }

  /**
   * Limpa todos os dados e retorna ao estado inicial
   */
  clearAll(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.selectedDetections = [];
    this.results = null;
    this.error = null;
  }

  /**
   * Verifica se a análise pode ser executada
   * @returns true se pode analisar, false caso contrário
   */
  canAnalyze(): boolean {
    return this.selectedImage !== null && 
           this.selectedDetections.length > 0 && 
           !this.loading;
  }

  /**
   * Obtém o número de detecções selecionadas
   * @returns Número de tipos de detecção selecionados
   */
  getSelectedCount(): number {
    return this.selectedDetections.length;
  }

  /**
   * Converte um score de confiança para porcentagem formatada
   * @param score - Score de confiança (0-1) ou undefined
   * @returns Porcentagem formatada ou 'N/A' se não disponível
   */
  getConfidencePercentage(score: number | undefined): string {
    if (score === undefined || score === null) {
      return 'N/A';
    }
    return (score * 100).toFixed(0);
  }

  // ===== MÉTODOS DA CÂMERA =====

  /**
   * Inicia a câmera
   */
  startCamera(): void {
    this.cameraError = null;
    this.cameraActive = true;

    this.cameraService.startCamera()
      .subscribe({
        next: (stream) => {
          this.cameraStream = stream.stream;
          this.cameraError = null;
        },
        error: (error) => {
          this.cameraError = error.message;
          this.cameraActive = false;
        }
      });
  }

  /**
   * Para a câmera
   */
  stopCamera(): void {
    this.cameraService.stopCamera();
    this.cameraActive = false;
    this.cameraStream = null;
    this.cameraError = null;
  }

  /**
   * Evento quando o vídeo da câmera é carregado
   */
  onVideoLoaded(): void {
    console.log('Vídeo da câmera carregado com sucesso');
  }

  /**
   * Captura uma foto da câmera
   */
  capturePhoto(): void {
    if (!this.cameraStream || !this.cameraVideo?.nativeElement) {
      this.cameraError = 'Câmera não está disponível';
      return;
    }

    // Aguarda um pouco para garantir que o vídeo esteja renderizando
    setTimeout(() => {
      try {
        const videoElement = this.cameraVideo.nativeElement;
        
        // Verifica se o vídeo tem dimensões válidas
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          this.cameraError = 'Vídeo ainda não está pronto. Aguarde um momento e tente novamente.';
          return;
        }

        this.cameraService.capturePhoto(videoElement)
          .subscribe({
            next: (photoDataUrl) => {
              // Converte para File e usa como imagem selecionada
              const file = this.cameraService.dataUrlToFile(photoDataUrl, 'camera-photo.jpg');
              this.selectedImage = file;
              this.createImagePreview(file);
              this.stopCamera();
              this.error = null;
              this.results = null;
            },
            error: (error) => {
              this.cameraError = 'Erro ao capturar foto: ' + error.message;
            }
          });
      } catch (error) {
        this.cameraError = 'Erro ao capturar foto: ' + error;
      }
    }, 500); // Aguarda 500ms para o vídeo renderizar
  }

  /**
   * Alterna entre câmera frontal e traseira
   */
  switchCamera(): void {
    if (!this.cameraStream) return;

    this.cameraService.switchCamera()
      .subscribe({
        next: (stream) => {
          this.cameraStream = stream.stream;
          this.cameraError = null;
        },
        error: (error) => {
          this.cameraError = 'Erro ao alternar câmera: ' + error.message;
        }
      });
  }

  // ===== MÉTODOS PWA =====

  /**
   * Instala o app como PWA
   */
  async installPWA(): Promise<void> {
    try {
      await this.pwaService.showInstallPrompt();
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  }

  /**
   * Verifica atualizações do app
   */
  checkForUpdates(): void {
    this.pwaService.checkForUpdates().subscribe({
      next: (hasUpdates) => {
        if (hasUpdates) {
          console.log('Atualizações disponíveis');
        }
      }
    });
  }

  /**
   * Atualiza o app
   */
  updateApp(): void {
    this.pwaService.updateApp();
  }

  /**
   * Solicita permissão para notificações
   */
  requestNotificationPermission(): void {
    this.pwaService.requestNotificationPermission();
  }
}
