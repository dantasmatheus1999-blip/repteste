export type CustomizerCategory = 
  | 'corpo' 
  | 'rosto' 
  | 'cabelo' 
  | 'roupa' 
  | 'armadura' 
  | 'acessorios';

export type VisualLayerType = 
  | 'corpo' 
  | 'pele' 
  | 'rosto' 
  | 'cabelo' 
  | 'roupa' 
  | 'armadura' 
  | 'capa' 
  | 'elmo' 
  | 'arma' 
  | 'escudo' 
  | 'acessorios';

/**
 * Ordem conceitual da pilha de renderização em camadas do Helmor:
 * 1. Capa (fundo)
 * 2. Corpo (estrutura básica)
 * 3. Pele (tom e textura)
 * 4. Rosto (olhos, boca, traços)
 * 5. Cabelo (fios e penteado)
 * 6. Roupa (camada base de vestuário)
 * 7. Armadura (placas, malha, ombreiras)
 * 8. Elmo / Acessório de Cabeça
 * 9. Arma / Empunhadura
 * 10. Escudo / Mão Secundária
 * 11. Acessórios (medalhões, cintos, auras)
 */
export const VISUAL_LAYERS_ORDER: { id: VisualLayerType; name: string; zIndex: number; description: string }[] = [
  { id: 'capa', name: 'Capa (Costas)', zIndex: 1, description: 'Tecido ou manto fixado atrás do personagem' },
  { id: 'corpo', name: 'Corpo', zIndex: 2, description: 'Estrutura e proporção anatômica base' },
  { id: 'pele', name: 'Pele', zIndex: 3, description: 'Pigmentação, tom e textura dérmica' },
  { id: 'rosto', name: 'Rosto', zIndex: 4, description: 'Expressão, formato dos olhos e marcas' },
  { id: 'cabelo', name: 'Cabelo', zIndex: 5, description: 'Penteado e tonalidade capilar' },
  { id: 'roupa', name: 'Roupa', zIndex: 6, description: 'Túnica, calças e vestes de tecido' },
  { id: 'armadura', name: 'Armadura', zIndex: 7, description: 'Couro, cota de malha ou placas metálicas' },
  { id: 'elmo', name: 'Elmo / Diadema', zIndex: 8, description: 'Proteção ou ornamento craniano' },
  { id: 'arma', name: 'Arma', zIndex: 9, description: 'Espada, cajado, arco ou adaga empunhada' },
  { id: 'escudo', name: 'Escudo', zIndex: 10, description: 'Proteção de braço ou guarda' },
  { id: 'acessorios', name: 'Acessórios', zIndex: 11, description: 'Medalhão, cintos, runas e auras' }
];

export interface CustomizerOption {
  id: string;
  name: string;
  description?: string;
  previewColor?: string;
  previewIcon?: string;
  tags?: string[];
}

export interface CharacterVisualState {
  // Corpo
  bodyType: 'atletico' | 'esbelto' | 'robusto' | 'arcano';
  skinTone: string; // hex
  skinToneName: string;
  pose: 'neutra' | 'vigilante' | 'combate';
  
  // Rosto
  faceShape: 'angular' | 'suave' | 'marcado' | 'heroico';
  expression: 'determinado' | 'sereno' | 'astuto' | 'feroz';
  eyeColor: string; // hex
  eyeColorName: string;
  faceMarking: 'nenhuma' | 'cicatriz' | 'runa' | 'pintura';

  // Cabelo
  hairStyle: 'curto' | 'longo' | 'trancas' | 'coque' | 'raspado' | 'selvagem';
  hairColor: string; // hex
  hairColorName: string;

  // Roupa
  outfitStyle: 'aventureiro' | 'manto_viajante' | 'nobre' | 'tunica_magica' | 'andarilho';
  outfitColor: string; // hex
  outfitColorName: string;

  // Armadura
  armorStyle: 'nenhuma' | 'couro' | 'malha' | 'placas' | 'guardiao';
  armorMaterial: 'aco' | 'bronze' | 'ouro' | 'ferro_negro';

  // Acessórios
  cloakStyle: 'nenhuma' | 'veludo' | 'capuz' | 'rasgada';
  accessoryType: 'nenhum' | 'medalao_sagrado' | 'amuleto_arcano' | 'cinto_alquimia';
  weaponSilhouette: 'nenhuma' | 'espada' | 'cajado' | 'adagas';
  
  // Efeitos visuais
  auraEffect: 'nenhuma' | 'dourada' | 'arcana' | 'sombria';
}

export const INITIAL_VISUAL_STATE: CharacterVisualState = {
  bodyType: 'atletico',
  skinTone: '#d4a373',
  skinToneName: 'Bronzeado de Arton',
  pose: 'neutra',
  
  faceShape: 'heroico',
  expression: 'determinado',
  eyeColor: '#eab308',
  eyeColorName: 'Âmbar de Valkaria',
  faceMarking: 'nenhuma',

  hairStyle: 'curto',
  hairColor: '#3d2616',
  hairColorName: 'Castanho Ébano',

  outfitStyle: 'aventureiro',
  outfitColor: '#1e293b',
  outfitColorName: 'Azul Noturno',

  armorStyle: 'couro',
  armorMaterial: 'aco',

  cloakStyle: 'nenhuma',
  accessoryType: 'medalao_sagrado',
  weaponSilhouette: 'espada',
  auraEffect: 'dourada',
};
