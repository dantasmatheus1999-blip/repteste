import { fetchStorageMonsterLibrary, StorageMonster } from '../../../services/monsterStorageService';

export interface MonsterLibraryImage {
  id: string;
  name: string;
  category: MonsterLibraryCategory;
  url: string;
  tags: string[];
}

export type MonsterLibraryCategory = 
  | 'humanoide' 
  | 'monstro' 
  | 'morto-vivo' 
  | 'demônio' 
  | 'aberração' 
  | 'animal' 
  | 'dragão' 
  | 'construto' 
  | 'elemental';

export interface CategoryInfo {
  id: MonsterLibraryCategory;
  label: string;
  icon: string;
  description: string;
}

export const MONSTER_LIBRARY_CATEGORIES: CategoryInfo[] = [
  { id: 'humanoide', label: 'Humanoide', icon: '🧝‍♂️', description: 'Orcs, goblins, cultistas, ladinos e guerreiros renegados' },
  { id: 'monstro', label: 'Monstro', icon: '👹', description: 'Bestas mágicas, quimeras, hidras, mantícoras e predadores' },
  { id: 'morto-vivo', label: 'Morto-vivo', icon: '💀', description: 'Esqueletos, lichs, vampiros, carniçais e espectros' },
  { id: 'demônio', label: 'Demônio', icon: '😈', description: 'Criaturas abissais, íncubos, balors e horrores infernais' },
  { id: 'aberração', label: 'Aberração', icon: '🐙', description: 'Flagelos tentaculares, olhos cósmicos e devoradores' },
  { id: 'animal', label: 'Animal', icon: '🐺', description: 'Lobos atrozes, ursos-coruja, aranhas gigantes e serpentes' },
  { id: 'dragão', label: 'Dragão', icon: '🐉', description: 'Dragões cromáticos, wyverns, serpes e dracos antigos' },
  { id: 'construto', label: 'Construto', icon: '⚙️', description: 'Golems de pedra e ferro, autômatos e armaduras animadas' },
  { id: 'elemental', label: 'Elemental', icon: '🔥', description: 'Manifestações vivas de fogo, gelo, terra, raio e água' }
];

export const DEFAULT_NEUTRAL_MONSTER_IMAGE = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';

export const MONSTER_IMAGE_LIBRARY: MonsterLibraryImage[] = [
  // 1. HUMANOIDE
  {
    id: 'hum-1',
    name: 'Guerreiro Sombrio',
    category: 'humanoide',
    url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80',
    tags: ['guerreiro', 'armadura', 'cavaleiro', 'espada', 'humanoide']
  },
  {
    id: 'hum-2',
    name: 'Orc Guerreiro de Batalha',
    category: 'humanoide',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['orc', 'bárbaro', 'guerreiro', 'tribal', 'humanoide']
  },
  {
    id: 'hum-3',
    name: 'Cultista do Caos',
    category: 'humanoide',
    url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80',
    tags: ['cultista', 'manto', 'magia', 'bruxo', 'humanoide', 'sombra']
  },
  {
    id: 'hum-4',
    name: 'Ladino Assassino das Sombras',
    category: 'humanoide',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['ladino', 'assassino', 'adaga', 'veneno', 'capuz', 'humanoide']
  },
  {
    id: 'hum-5',
    name: 'Mago Renegado Arcano',
    category: 'humanoide',
    url: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=600&auto=format&fit=crop&q=80',
    tags: ['mago', 'arcano', 'feiticeiro', 'humanoide', 'conjurador']
  },
  {
    id: 'hum-6',
    name: 'Arqueiro Batedor Élfico Sombrio',
    category: 'humanoide',
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600&auto=format&fit=crop&q=80',
    tags: ['arqueiro', 'atirador', 'elfo', 'floresta', 'humanoide']
  },

  // 2. MONSTRO
  {
    id: 'mon-1',
    name: 'Quimera das Cavernas',
    category: 'monstro',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['quimera', 'besta', 'garras', 'predador', 'monstro']
  },
  {
    id: 'mon-2',
    name: 'Hidra Voraz do Pântano',
    category: 'monstro',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['hidra', 'serpente', 'pântano', 'veneno', 'monstro']
  },
  {
    id: 'mon-3',
    name: 'Gárgula de Pedra Ancestral',
    category: 'monstro',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['gárgula', 'asas', 'pedra', 'monstro', 'ruínas']
  },
  {
    id: 'mon-4',
    name: 'Espreitador Noturno',
    category: 'monstro',
    url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&auto=format&fit=crop&q=80',
    tags: ['predador', 'escuridão', 'sombra', 'monstro', 'emboscador']
  },
  {
    id: 'mon-5',
    name: 'Basilisco Petrificador',
    category: 'monstro',
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&auto=format&fit=crop&q=80',
    tags: ['basilisco', 'olhar', 'pedra', 'réptil', 'monstro']
  },
  {
    id: 'mon-6',
    name: 'Besta Chifruda dos Ermos',
    category: 'monstro',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    tags: ['chifres', 'bruto', 'besta', 'fúria', 'monstro']
  },

  // 3. MORTO-VIVO
  {
    id: 'und-1',
    name: 'Lich Ancião Arcano',
    category: 'morto-vivo',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['lich', 'caveira', 'necromante', 'magia', 'morto-vivo']
  },
  {
    id: 'und-2',
    name: 'Cavaleiro da Morte Espectral',
    category: 'morto-vivo',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    tags: ['cavaleiro', 'morte', 'armadura', 'espada', 'morto-vivo']
  },
  {
    id: 'und-3',
    name: 'Aparição Lamentosa',
    category: 'morto-vivo',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['fantasma', 'espectro', 'espírito', 'sombra', 'morto-vivo']
  },
  {
    id: 'und-4',
    name: 'Lorde Vampiro Sanguinário',
    category: 'morto-vivo',
    url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80',
    tags: ['vampiro', 'sangue', 'nobre', 'gótico', 'morto-vivo']
  },
  {
    id: 'und-5',
    name: 'Zumbi da Praga Putrefata',
    category: 'morto-vivo',
    url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80',
    tags: ['zumbi', 'cadáver', 'podridão', 'horda', 'morto-vivo']
  },
  {
    id: 'und-6',
    name: 'Esqueleto Guardião de Cripta',
    category: 'morto-vivo',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['esqueleto', 'ossos', 'escudo', 'tumba', 'morto-vivo']
  },

  // 4. DEMÔNIO
  {
    id: 'dem-1',
    name: 'Balor das Chamas Abissais',
    category: 'demônio',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80',
    tags: ['balor', 'fogo', 'abismo', 'chifres', 'demônio', 'chamas']
  },
  {
    id: 'dem-2',
    name: 'Senhor Infernal das Sombras',
    category: 'demônio',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    tags: ['inferno', 'profano', 'trevas', 'demônio']
  },
  {
    id: 'dem-3',
    name: 'Succubus Sedutora Abissal',
    category: 'demônio',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['succubus', 'ilusão', 'asas', 'charme', 'demônio']
  },
  {
    id: 'dem-4',
    name: 'Diabrete Torturador Voraz',
    category: 'demônio',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['diabrete', 'ferrão', 'pequeno', 'demônio', 'lacaio']
  },
  {
    id: 'dem-5',
    name: 'Titã Demoníaco Chifrudo',
    category: 'demônio',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    tags: ['titã', 'gigante', 'chifres', 'fúria', 'demônio']
  },

  // 5. ABERRAÇÃO
  {
    id: 'abe-1',
    name: 'Horror Tentacular do Abismo',
    category: 'aberração',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    tags: ['tentáculos', 'abismo', 'alien', 'pesadelo', 'aberração']
  },
  {
    id: 'abe-2',
    name: 'Olho Cósmico Voraz',
    category: 'aberração',
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&auto=format&fit=crop&q=80',
    tags: ['olho', 'beholder', 'visão', 'raios', 'aberração']
  },
  {
    id: 'abe-3',
    name: 'Flagelo Mental Psíquico',
    category: 'aberração',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['psíquico', 'mente', 'tentáculos', 'inteligência', 'aberração']
  },
  {
    id: 'abe-4',
    name: 'Espreitador do Vazio Insondável',
    category: 'aberração',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['vazio', 'estranho', 'caos', 'loucura', 'aberração']
  },

  // 6. ANIMAL
  {
    id: 'ani-1',
    name: 'Lobo Atroz Alfa',
    category: 'animal',
    url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=600&auto=format&fit=crop&q=80',
    tags: ['lobo', 'matilha', 'presas', 'floresta', 'animal']
  },
  {
    id: 'ani-2',
    name: 'Urso Pardo Gigante das Montanhas',
    category: 'animal',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80',
    tags: ['urso', 'garras', 'força', 'montanha', 'animal']
  },
  {
    id: 'ani-3',
    name: 'Aranha Colossal Venenosa',
    category: 'animal',
    url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
    tags: ['aranha', 'teia', 'veneno', 'caverna', 'animal']
  },
  {
    id: 'ani-4',
    name: 'Serpente Gigante Constritora',
    category: 'animal',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['cobra', 'serpente', 'escamas', 'veneno', 'animal']
  },
  {
    id: 'ani-5',
    name: 'Águia Gigante Majestosa',
    category: 'animal',
    url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&auto=format&fit=crop&q=80',
    tags: ['águia', 'pássaro', 'penas', 'voo', 'animal']
  },

  // 7. DRAGÃO
  {
    id: 'dra-1',
    name: 'Dragão Vermelho Vulcânico Ancião',
    category: 'dragão',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    tags: ['dragão', 'fogo', 'chamas', 'asas', 'vermelho', 'réptil']
  },
  {
    id: 'dra-2',
    name: 'Dragão Negro do Pântano Ácido',
    category: 'dragão',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['dragão', 'negro', 'ácido', 'pântano', 'chifres']
  },
  {
    id: 'dra-3',
    name: 'Serpe Alada Glacial (Wyvern)',
    category: 'dragão',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['wyvern', 'serpe', 'gelo', 'voo', 'ferrão', 'dragão']
  },
  {
    id: 'dra-4',
    name: 'Dragão Dourado Guardião Rúnico',
    category: 'dragão',
    url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80',
    tags: ['dragão', 'ouro', 'dourado', 'sagrado', 'majestoso']
  },
  {
    id: 'dra-5',
    name: 'Draco Ancião das Sombras',
    category: 'dragão',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['dragão', 'sombra', 'trevas', 'caverna', 'escamas']
  },

  // 8. CONSTRUTO
  {
    id: 'con-1',
    name: 'Golem de Ferro Forjado',
    category: 'construto',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    tags: ['golem', 'ferro', 'metal', 'pesado', 'construto']
  },
  {
    id: 'con-2',
    name: 'Guardião de Pedra Ancestral',
    category: 'construto',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['pedra', 'monolito', 'estátua', 'runas', 'construto']
  },
  {
    id: 'con-3',
    name: 'Autômato Rúnico de Engrenagens',
    category: 'construto',
    url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80',
    tags: ['autômato', 'engrenagens', 'steampunk', 'relógio', 'construto']
  },
  {
    id: 'con-4',
    name: 'Armadura Encantada Sentinela',
    category: 'construto',
    url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80',
    tags: ['armadura', 'espada', 'vazia', 'magia', 'construto']
  },

  // 9. ELEMENTAL
  {
    id: 'ele-1',
    name: 'Elemental de Fogo Vivo Flamejante',
    category: 'elemental',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80',
    tags: ['fogo', 'chamas', 'labareda', 'cinzas', 'elemental']
  },
  {
    id: 'ele-2',
    name: 'Elemental da Tempestade e Relâmpago',
    category: 'elemental',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['raio', 'tempestade', 'trovão', 'vento', 'elemental']
  },
  {
    id: 'ele-3',
    name: 'Elemental de Terra Rochoso',
    category: 'elemental',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['terra', 'pedra', 'rocha', 'montanha', 'elemental']
  },
  {
    id: 'ele-4',
    name: 'Espírito Elemental dos Mares e Águas',
    category: 'elemental',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    tags: ['água', 'mar', 'onda', 'rio', 'elemental']
  },
  {
    id: 'ele-5',
    name: 'Elemental de Gelo e Neve Eterna',
    category: 'elemental',
    url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&auto=format&fit=crop&q=80',
    tags: ['gelo', 'neve', 'frio', 'cristal', 'elemental']
  }
];

export function getImagesByCategory(category: MonsterLibraryCategory): MonsterLibraryImage[] {
  return MONSTER_IMAGE_LIBRARY.filter(img => img.category === category);
}

export function searchLibraryImages(searchTerm: string): MonsterLibraryImage[] {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return MONSTER_IMAGE_LIBRARY;
  
  return MONSTER_IMAGE_LIBRARY.filter(img => 
    img.name.toLowerCase().includes(term) ||
    img.category.toLowerCase().includes(term) ||
    img.tags.some(tag => tag.toLowerCase().includes(term))
  );
}

export { fetchStorageMonsterLibrary };
export type { StorageMonster };

export async function getMergedMonsterLibrary(forceRefresh = false): Promise<MonsterLibraryImage[]> {
  try {
    const storageMonsters = await fetchStorageMonsterLibrary(forceRefresh);
    if (storageMonsters && storageMonsters.length > 0) {
      const formattedStorageItems: MonsterLibraryImage[] = storageMonsters.map(sm => ({
        id: sm.id,
        name: sm.name,
        category: (sm.category as MonsterLibraryCategory) || 'monstro',
        url: sm.url,
        tags: [sm.name.toLowerCase(), 'storage', 'realmor', 'monstro']
      }));
      // As imagens do Firebase Storage (monstro/) vêm em primeiro lugar como biblioteca padrão
      return [...formattedStorageItems, ...MONSTER_IMAGE_LIBRARY];
    }
  } catch (e) {
    console.warn('Erro ao mesclar biblioteca do storage:', e);
  }
  return MONSTER_IMAGE_LIBRARY;
}

export function getDefaultImageForType(typeStr?: string): string {
  if (!typeStr) return DEFAULT_NEUTRAL_MONSTER_IMAGE;
  const normalized = typeStr.toLowerCase().trim();
  
  if (normalized.includes('drag')) {
    const dra = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'dragão');
    if (dra) return dra.url;
  }
  if (normalized.includes('morto') || normalized.includes('zumbi') || normalized.includes('esqueleto')) {
    const und = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'morto-vivo');
    if (und) return und.url;
  }
  if (normalized.includes('dem')) {
    const dem = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'demônio');
    if (dem) return dem.url;
  }
  if (normalized.includes('aber')) {
    const abe = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'aberração');
    if (abe) return abe.url;
  }
  if (normalized.includes('animal') || normalized.includes('fera') || normalized.includes('besta')) {
    const ani = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'animal');
    if (ani) return ani.url;
  }
  if (normalized.includes('construto') || normalized.includes('golem')) {
    const con = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'construto');
    if (con) return con.url;
  }
  if (normalized.includes('elemental') || normalized.includes('fogo') || normalized.includes('gelo')) {
    const ele = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'elemental');
    if (ele) return ele.url;
  }
  if (normalized.includes('humanoide') || normalized.includes('humano') || normalized.includes('orc') || normalized.includes('goblin')) {
    const hum = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'humanoide');
    if (hum) return hum.url;
  }

  const mon = MONSTER_IMAGE_LIBRARY.find(i => i.category === 'monstro');
  return mon ? mon.url : DEFAULT_NEUTRAL_MONSTER_IMAGE;
}

