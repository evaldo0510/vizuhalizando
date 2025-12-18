
export interface ColorPalette {
  hex: string;
  nome: string;
}

export interface VisagismoDetails {
  estilo: string;
  detalhes: string;
  motivo: string;
  produtos?: string[];
  tecnicas?: string[];
}

export interface Visagismo {
  cabelo: VisagismoDetails;
  barba_ou_make: VisagismoDetails;
  acessorios: string[];
}

export interface Otica {
  armacao: string;
  material: string;
  detalhes: string;
  motivo: string;
}

export interface OutfitComponent {
  peca: string;
  loja: string;
  link: string;
  preco_estimado?: string;
}

export interface PartnerItem {
  storeName: string; 
  productName: string;
  link: string; 
  priceEstimate?: string;
}

export interface OutfitSuggestion {
  titulo: string;
  detalhes: string;
  ocasiao: string;
  motivo: string;
  visagismo_sugerido: string;
  estacao?: 'Primavera' | 'Verão' | 'Outono' | 'Inverno' | 'Todas';
  estilo?: string;
  termos_busca: string; 
  partner_suggestion?: PartnerItem; 
  components?: OutfitComponent[];   
  ambientes?: string[]; 
  isFavorite?: boolean; 
  userNote?: string; 
  generatedImage?: string;
  lastModificationPrompt?: string; 
  feedback?: 'like' | 'dislike' | null;
}

// Added accuracy_estimate to QualityCheck interface to resolve TS error
export interface QualityCheck {
  valid: boolean;
  reason: string;
  accuracy_estimate: number;
}

export type SkinTone = 'Quente' | 'Frio' | 'Neutro' | 'Oliva' | 'Pardo Oliva' | 'Negro Oliva';

export interface AnalysisResult {
  quality_check: QualityCheck; 
  genero: 'Masculino' | 'Feminino'; 
  formato_rosto_detalhado: string; 
  biotipo: string; 
  analise_facial: string;
  analise_pele: string;
  tom_pele_detectado?: SkinTone; 
  analise_corporal: string;
  paleta_cores: ColorPalette[];
  visagismo: Visagismo;
  otica: Otica;
  sugestoes_roupa: OutfitSuggestion[];
}

export interface UserMetrics {
  height: string;
  weight: string;
}

export interface UserPreferences {
  favoriteStyles: string[]; 
  favoriteColors: string;   
  avoidItems: string;       
}

export interface HistoryItem {
  id: string;
  result: AnalysisResult;
  context: string;
  clientName: string;
  mode: string;
  createdAt: any;
  thumbnail?: string; 
  originalImage?: string; 
}
