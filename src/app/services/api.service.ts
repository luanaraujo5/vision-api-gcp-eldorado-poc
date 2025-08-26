import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Tipos de detecção disponíveis na Google Vision API
 */
export type DetectionType = 
  | 'FACE_DETECTION'
  | 'LANDMARK_DETECTION'
  | 'LOGO_DETECTION'
  | 'LABEL_DETECTION'
  | 'TEXT_DETECTION'
  | 'DOCUMENT_TEXT_DETECTION'
  | 'SAFE_SEARCH_DETECTION'
  | 'IMAGE_PROPERTIES'
  | 'OBJECT_LOCALIZATION'
  | 'CROP_HINTS'
  | 'WEB_DETECTION';

/**
 * Interface para a requisição da Google Vision API
 */
export interface VisionRequest {
  requests: Array<{
    image: {
      content: string; // Imagem em base64
    };
    features: Array<{
      type: DetectionType;
      maxResults?: number;
    }>;
  }>;
}

/**
 * Interface para a resposta da Google Vision API
 */
export interface VisionResponse {
  responses: Array<{
    faceAnnotations?: FaceAnnotation[];
    landmarkAnnotations?: LandmarkAnnotation[];
    logoAnnotations?: LogoAnnotation[];
    labelAnnotations?: LabelAnnotation[];
    textAnnotations?: TextAnnotation[];
    documentTextAnnotation?: DocumentTextAnnotation;
    safeSearchAnnotation?: SafeSearchAnnotation;
    imagePropertiesAnnotation?: ImagePropertiesAnnotation;
    localizedObjectAnnotations?: LocalizedObjectAnnotation[];
    cropHintsAnnotation?: CropHintsAnnotation;
    webDetection?: WebDetection;
    error?: ApiError;
  }>;
}

/**
 * Interface para detecção de rostos
 */
export interface FaceAnnotation {
  boundingPoly?: BoundingPoly;
  fdBoundingPoly?: BoundingPoly;
  landmarks?: Landmark[];
  rollAngle?: number;
  panAngle?: number;
  tiltAngle?: number;
  detectionConfidence?: number;
  landmarkingConfidence?: number;
  joyLikelihood?: string;
  sorrowLikelihood?: string;
  angerLikelihood?: string;
  surpriseLikelihood?: string;
  underExposedLikelihood?: string;
  blurredLikelihood?: string;
  headwearLikelihood?: string;
}

/**
 * Interface para detecção de lugares famosos
 */
export interface LandmarkAnnotation {
  mid?: string;
  description?: string;
  score?: number;
  boundingPoly?: BoundingPoly;
  locations?: LocationInfo[];
}

/**
 * Interface para detecção de logos
 */
export interface LogoAnnotation {
  mid?: string;
  description?: string;
  score?: number;
  boundingPoly?: BoundingPoly;
}

/**
 * Interface para detecção de rótulos
 */
export interface LabelAnnotation {
  mid?: string;
  description?: string;
  score?: number;
  topicality?: number;
  boundingPoly?: BoundingPoly;
  locations?: LocationInfo[];
  properties?: Property[];
}

/**
 * Interface para detecção de texto
 */
export interface TextAnnotation {
  locale?: string;
  description?: string;
  boundingPoly?: BoundingPoly;
}

/**
 * Interface para análise de segurança
 */
export interface SafeSearchAnnotation {
  adult?: string;
  spoof?: string;
  medical?: string;
  violence?: string;
  racy?: string;
}

/**
 * Interface para propriedades da imagem
 */
export interface ImagePropertiesAnnotation {
  dominantColors?: DominantColors;
}

/**
 * Interface para localização de objetos
 */
export interface LocalizedObjectAnnotation {
  mid?: string;
  name?: string;
  score?: number;
  boundingPoly?: BoundingPoly;
}

/**
 * Interface para sugestões de recorte
 */
export interface CropHintsAnnotation {
  cropHints?: CropHint[];
}

/**
 * Interface para detecção web
 */
export interface WebDetection {
  webEntities?: WebEntity[];
  fullMatchingImages?: WebImage[];
  partialMatchingImages?: WebImage[];
  visuallySimilarImages?: WebImage[];
}

/**
 * Interfaces auxiliares
 */
export interface BoundingPoly {
  vertices?: Vertex[];
}

export interface Vertex {
  x?: number;
  y?: number;
}

export interface Landmark {
  type?: string;
  position?: Position;
}

export interface Position {
  x?: number;
  y?: number;
  z?: number;
}

export interface LocationInfo {
  latLng?: LatLng;
}

export interface LatLng {
  latitude?: number;
  longitude?: number;
}

export interface Property {
  name?: string;
  value?: string;
  uint64Value?: string;
}

export interface DominantColors {
  colors?: ColorInfo[];
}

export interface ColorInfo {
  color?: Color;
  score?: number;
  pixelFraction?: number;
}

export interface Color {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

export interface CropHint {
  boundingPoly?: BoundingPoly;
  confidence?: number;
  importanceFraction?: number;
}

export interface WebEntity {
  entityId?: string;
  score?: number;
  description?: string;
}

export interface WebImage {
  url?: string;
  score?: number;
}

export interface DocumentTextAnnotation {
  pages?: Page[];
  text?: string;
}

export interface Page {
  property?: TextProperty;
  width?: number;
  height?: number;
  blocks?: Block[];
}

export interface TextProperty {
  detectedLanguages?: DetectedLanguage[];
  detectedBreak?: DetectedBreak;
}

export interface DetectedLanguage {
  languageCode?: string;
  confidence?: number;
}

export interface DetectedBreak {
  type?: string;
  isPrefix?: boolean;
}

export interface Block {
  property?: TextProperty;
  boundingBox?: BoundingPoly;
  paragraphs?: Paragraph[];
  blockType?: string;
}

export interface Paragraph {
  property?: TextProperty;
  boundingBox?: BoundingPoly;
  words?: Word[];
}

export interface Word {
  property?: TextProperty;
  boundingBox?: BoundingPoly;
  symbols?: Symbol[];
}

export interface Symbol {
  property?: TextProperty;
  boundingBox?: BoundingPoly;
  text?: string;
  confidence?: number;
}

export interface ApiError {
  code?: number;
  message?: string;
  status?: string;
  details?: any[];
}

/**
 * Serviço para integração com a Google Vision API
 * Permite análise de imagens usando diferentes tipos de detecção
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  private readonly apiKey = environment.apiKey;

  constructor(private http: HttpClient) { 
    // Validação de ambiente
    if (!this.apiUrl) {
      throw new Error('API_URL não está configurada no ambiente');
    }
    if (!this.apiKey) {
      throw new Error('API_KEY não está configurada no ambiente');
    }
  }

  /**
   * Analisa uma imagem usando os tipos de detecção especificados
   * @param imageBase64 - Imagem em formato base64 (sem o prefixo data:image/...;base64,)
   * @param detectionTypes - Array de tipos de detecção a serem aplicados
   * @param maxResults - Número máximo de resultados por tipo de detecção (padrão: 5)
   * @returns Observable com a resposta da API
   */
  analyzeImage(
    imageBase64: string, 
    detectionTypes: DetectionType[], 
    maxResults: number = 5
  ): Observable<VisionResponse> {
    const request: VisionRequest = {
      requests: [{
        image: {
          content: imageBase64
        },
        features: detectionTypes.map(type => ({
          type,
          maxResults
        }))
      }]
    };

    const params = new HttpParams().set('key', this.apiKey);
    
    return this.http.post<VisionResponse>(this.apiUrl, request, { params });
  }

  /**
   * Detecta rostos em uma imagem
   * @param imageBase64 - Imagem em base64
   * @param maxResults - Número máximo de rostos a detectar
   * @returns Observable com os resultados da detecção facial
   */
  detectFaces(imageBase64: string, maxResults: number = 5): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['FACE_DETECTION'], maxResults);
  }

  /**
   * Detecta lugares famosos em uma imagem
   * @param imageBase64 - Imagem em base64
   * @param maxResults - Número máximo de lugares a detectar
   * @returns Observable com os resultados da detecção de lugares
   */
  detectLandmarks(imageBase64: string, maxResults: number = 5): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['LANDMARK_DETECTION'], maxResults);
  }

  /**
   * Detecta logotipos de marcas em uma imagem
   * @param imageBase64 - Imagem em base64
   * @param maxResults - Número máximo de logos a detectar
   * @returns Observable com os resultados da detecção de logos
   */
  detectLogos(imageBase64: string, maxResults: number = 5): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['LOGO_DETECTION'], maxResults);
  }

  /**
   * Detecta rótulos gerais que descrevem o conteúdo da imagem
   * @param imageBase64 - Imagem em base64
   * @param maxResults - Número máximo de rótulos a detectar
   * @returns Observable com os resultados da detecção de rótulos
   */
  detectLabels(imageBase64: string, maxResults: number = 5): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['LABEL_DETECTION'], maxResults);
  }

  /**
   * Realiza OCR para detectar textos em imagens
   * @param imageBase64 - Imagem em base64
   * @param maxResults - Número máximo de textos a detectar
   * @returns Observable com os resultados da detecção de texto
   */
  detectText(imageBase64: string, maxResults: number = 5): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['TEXT_DETECTION'], maxResults);
  }

  /**
   * Realiza OCR avançado para documentos
   * @param imageBase64 - Imagem em base64
   * @returns Observable com os resultados da detecção de texto em documentos
   */
  detectDocumentText(imageBase64: string): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['DOCUMENT_TEXT_DETECTION']);
  }

  /**
   * Analisa o conteúdo da imagem para detectar material sensível
   * @param imageBase64 - Imagem em base64
   * @returns Observable com os resultados da análise de segurança
   */
  detectSafeSearch(imageBase64: string): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['SAFE_SEARCH_DETECTION']);
  }

  /**
   * Detecta propriedades visuais da imagem como cores dominantes
   * @param imageBase64 - Imagem em base64
   * @returns Observable com as propriedades da imagem
   */
  detectImageProperties(imageBase64: string): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['IMAGE_PROPERTIES']);
  }

  /**
   * Detecta múltiplos objetos e suas posições na imagem
   * @param imageBase64 - Imagem em base64
   * @param maxResults - Número máximo de objetos a detectar
   * @returns Observable com os resultados da localização de objetos
   */
  detectObjects(imageBase64: string, maxResults: number = 5): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['OBJECT_LOCALIZATION'], maxResults);
  }

  /**
   * Obtém sugestões automáticas de recorte para a imagem
   * @param imageBase64 - Imagem em base64
   * @returns Observable com as sugestões de recorte
   */
  getCropHints(imageBase64: string): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['CROP_HINTS']);
  }

  /**
   * Realiza busca por imagens similares na web
   * @param imageBase64 - Imagem em base64
   * @returns Observable com os resultados da detecção web
   */
  detectWebContent(imageBase64: string): Observable<VisionResponse> {
    return this.analyzeImage(imageBase64, ['WEB_DETECTION']);
  }
}
