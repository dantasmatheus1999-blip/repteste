import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFOptionList } from 'pdf-lib';
import { findSpellInT20Catalog, getStandardT20SpellCost, cleanRawSpellName } from './t20SpellMatcher';

export interface ParsedT20CharacterDraft {
  name: string;
  playerName: string;
  raceName: string;
  raceId?: string;
  className: string;
  classId?: string;
  originName: string;
  originId?: string;
  level: number;
  deity: string;
  age: string;
  gender: string;
  size: string;
  movement: string;
  xp: number;

  attributes: {
    FOR: number;
    DES: number;
    CON: number;
    INT: number;
    SAB: number;
    CAR: number;
  };
  attrBonus?: {
    FOR: number;
    DES: number;
    CON: number;
    INT: number;
    SAB: number;
    CAR: number;
  };

  currentPV: number;
  maxPV: number;
  tempPV: number;
  currentPM: number;
  maxPM: number;
  defense: number;
  armorPenalty: number;
  armor?: {
    name: string;
    defenseBonus: number;
    penalty: number;
    type: string;
  };
  shield?: {
    name: string;
    defenseBonus: number;
    penalty: number;
  };

  skills: Record<string, {
    trained: boolean;
    extra?: number;
    others?: number;
    attrOverride?: string;
  }>;

  attacks: Array<{
    id: string;
    name: string;
    attackBonus: number;
    damage: string;
    crit: string;
    type: string;
    range: string;
    attr?: string;
    ammo?: number;
  }>;

  inventory: Array<{
    id: string;
    name: string;
    quantity: number;
    weight: number;
    equipped: boolean;
    type: string;
    description?: string;
    bonus?: number;
  }>;

  powers: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    source?: string;
  }>;

  spells: Array<{
    id: string;
    name: string;
    circle: number;
    level?: number;
    school: string;
    cost: number;
    type?: string;
    execution?: string;
    range?: string;
    target?: string;
    area?: string;
    effect?: string;
    duration?: string;
    resistance?: string;
    description?: string;
    truque?: string;
    aprimoramentos?: string[];
    foundInCatalog?: boolean;
    notFoundWarning?: string;
  }>;

  money: number;
  notes: string;
  warnings: string[];
  extractionStats: {
    pagesCount: number;
    hasInteractiveForm: boolean;
    interactiveFieldsCount: number;
    fieldsFoundCount: number;
  };
}

// Slugs mapping helpers
const SLUG_MAP: Record<string, string> = {
  // Races
  humano: 'humano',
  anao: 'anao',
  anão: 'anao',
  dahllan: 'dahllan',
  elfo: 'elfo',
  goblin: 'goblin',
  lefou: 'lefou',
  minotauro: 'minotauro',
  qareen: 'qareen',
  golem: 'golem',
  hynne: 'hynne',
  kliren: 'kliren',
  medusa: 'medusa',
  osteon: 'osteon',
  sereia: 'sereia',
  tritao: 'sereia',
  tritão: 'sereia',
  silfo: 'silfo',
  suraggel: 'suraggel',
  aggelus: 'suraggel',
  sulfure: 'suraggel',
  trog: 'trog',

  // Classes
  arcanista: 'arcanista',
  barbaro: 'barbaro',
  bárbaro: 'barbaro',
  bardo: 'bardo',
  bucaneiro: 'bucaneiro',
  cacador: 'cacador',
  caçador: 'cacador',
  cavaleiro: 'cavaleiro',
  clerigo: 'clerigo',
  clérigo: 'clerigo',
  druida: 'druida',
  guerreiro: 'guerreiro',
  inventor: 'inventor',
  ladino: 'ladino',
  lutador: 'lutador',
  nobre: 'nobre',
  paladino: 'paladino',
};

export const normalizeSlug = (text: string): string => {
  if (!text) return '';
  const cleaned = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return SLUG_MAP[cleaned] || cleaned.replace(/[^a-z0-9]/g, '-');
};

const sanitizeKey = (key: string): string => {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]/g, ''); // remove espaços, pontuação, colchetes
};

const T20_SKILL_KEYS = [
  'acrobacia', 'adestramento', 'atletismo', 'atuacao', 'cavalgar', 'conhecimento', 
  'cura', 'diplomacia', 'enganacao', 'fortitude', 'furtividade', 'guerra', 
  'iniciativa', 'intimidacao', 'intuicao', 'investigacao', 'jogatina', 'ladinagem', 
  'luta', 'misticismo', 'nobreza', 'oficio', 'oficio1', 'oficio2', 'percepcao', 'pilotagem', 'pontaria', 
  'reflexos', 'religiao', 'sobrevivencia', 'vontade'
];

/**
 * Lê diretamente no navegador o arquivo PDF da ficha Tormenta 20.
 * Inspeciona campos do formulário AcroForm com prioridade e extrai
 * todas as informações estruturadas oficiais de Tormenta 20 (Edição JdA).
 */
export async function parseT20PdfDirectlyInBrowser(
  pdfBuffer: ArrayBuffer, 
  originalFilename: string
): Promise<ParsedT20CharacterDraft> {
  const warnings: string[] = [];

  // 1. Carrega o documento PDF no navegador com pdf-lib
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  } catch (err: any) {
    throw new Error(`Não foi possível abrir o arquivo PDF: ${err.message || 'Arquivo inválido ou corrompido'}`);
  }

  const pagesCount = pdfDoc.getPageCount();
  const rawFieldsMap = new Map<string, any>();
  const sanitizedMap = new Map<string, any>();
  let hasInteractiveForm = false;
  let interactiveFieldsCount = 0;

  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    interactiveFieldsCount = fields.length;

    if (fields.length > 0) {
      hasInteractiveForm = true;
      for (const field of fields) {
        const rawName = field.getName();
        let val: any = null;

        if (field instanceof PDFTextField) {
          val = field.getText();
        } else if (field instanceof PDFCheckBox) {
          val = field.isChecked();
        } else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup || field instanceof PDFOptionList) {
          val = field.getSelected();
          if (Array.isArray(val)) val = val[0] || '';
        } else {
          // Fallback para outros tipos de campo
          try {
            if (typeof (field as any).getText === 'function') {
              val = (field as any).getText();
            } else if (typeof (field as any).isChecked === 'function') {
              val = (field as any).isChecked();
            } else if (typeof (field as any).getSelected === 'function') {
              val = (field as any).getSelected();
            }
          } catch {
            // campo silenciosamente ignorado
          }
        }

        if (val !== null && val !== undefined) {
          rawFieldsMap.set(rawName, val);
          const sKey = sanitizeKey(rawName);
          sanitizedMap.set(sKey, val);
        }
      }
    }
  } catch (formErr) {
    console.warn('[PDF Client Parser] Aviso ao obter campos de formulário:', formErr);
  }

  // Funções utilitárias de busca nos campos com tolerância a variações
  const findValue = (patterns: string[]): any => {
    // 1. Busca por correspondência exata nos sanitizados
    for (const pat of patterns) {
      const sPat = sanitizeKey(pat);
      if (sanitizedMap.has(sPat)) {
        const v = sanitizedMap.get(sPat);
        if (v !== undefined && v !== null && String(v).trim() !== '') return v;
      }
    }

    // 2. Busca por sufixo ou substring
    for (const pat of patterns) {
      const sPat = sanitizeKey(pat);
      for (const [key, val] of sanitizedMap.entries()) {
        if (key.endsWith(sPat) || key === sPat || (key.includes(sPat) && sPat.length >= 4)) {
          if (val !== undefined && val !== null && String(val).trim() !== '') return val;
        }
      }
    }

    return null;
  };

  const findString = (patterns: string[], fallback = ''): string => {
    const val = findValue(patterns);
    if (val === null || val === undefined) return fallback;
    return String(val).trim();
  };

  const findNumber = (patterns: string[], fallback = 0): number => {
    const val = findValue(patterns);
    if (val === null || val === undefined) return fallback;
    const str = String(val).replace(/[^\d\-+]/g, '').trim();
    const num = parseInt(str, 10);
    return isNaN(num) ? fallback : num;
  };

  const findBool = (patterns: string[]): boolean => {
    const val = findValue(patterns);
    if (typeof val === 'boolean') return val;
    if (val === null || val === undefined) return false;
    const str = String(val).trim().toLowerCase();
    return str === 'true' || str === 'yes' || str === 'sim' || str === 'on' || str === '1' || str === 'x';
  };

  // ============================================================
  // 1. IDENTIDADE DO PERSONAGEM
  // ============================================================
  let name = findString([
    'Nome_Personagem', 'Nome do Personagem', 'Nome', 'Personagem', 
    'CharacterName', 'Name', 'Heroi', 'NomeHeroi', 'Character_Name'
  ]);

  if (!name) {
    name = originalFilename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim() || 'Herói Sem Nome';
    warnings.push('Nome do herói não especificado na ficha; preenchido a partir do nome do arquivo.');
  }

  const playerName = findString([
    'Jogador', 'Nome do Jogador', 'Nome_Jogador', 'Player', 'PlayerName', 'Player_Name'
  ]);

  const raceName = findString([
    'Raca', 'Raça', 'Race', 'Raca_Nome', 'Race_Name'
  ], 'Humano');

  const className = findString([
    'Classe', 'Class', 'Classes', 'Nivel e Classe', 'Nivel_Classe', 'Classe_Nivel', 'Class_Level'
  ], 'Guerreiro');

  const originName = findString([
    'Origem', 'Origin', 'Origem_Nome', 'Origin_Name'
  ], 'Herói Camponês');

  const raceId = normalizeSlug(raceName);
  const classId = normalizeSlug(className);
  const originId = normalizeSlug(originName);

  let level = findNumber(['Nivel', 'Nível', 'Level', 'Lvl', 'NV'], 1);
  if (level < 1 || level > 20) level = 1;

  const deity = findString(['Divindade', 'Deus', 'Deity', 'God', 'Divindade_Nome']);
  const age = findString(['Idade', 'Age']);
  const gender = findString(['Sexo', 'Genero', 'Gênero', 'Gender']);
  const size = findString(['Tamanho', 'Size'], 'Médio');
  const movement = findString(['Deslocamento', 'Desloc', 'Speed', 'Movement'], '9m');
  const xp = findNumber(['XP', 'Experiencia', 'Experiência', 'Pontos_Experiencia', 'Exp'], 0);

  // ============================================================
  // 2. ATRIBUTOS (Tormenta 20 JdA)
  // ============================================================
  const rawFOR = findNumber(['FOR_Mod', 'Mod_FOR', 'FOR_mod', 'FOR_Total', 'FOR', 'Forca', 'Força', 'FOR_valor', 'Atributo_FOR'], 0);
  const rawDES = findNumber(['DES_Mod', 'Mod_DES', 'DES_mod', 'DES_Total', 'DES', 'Destreza', 'DES_valor', 'Atributo_DES'], 0);
  const rawCON = findNumber(['CON_Mod', 'Mod_CON', 'CON_mod', 'CON_Total', 'CON', 'Constituicao', 'Constituição', 'CON_valor', 'Atributo_CON'], 0);
  const rawINT = findNumber(['INT_Mod', 'Mod_INT', 'INT_mod', 'INT_Total', 'INT', 'Inteligencia', 'Inteligência', 'INT_valor', 'Atributo_INT'], 0);
  const rawSAB = findNumber(['SAB_Mod', 'Mod_SAB', 'SAB_mod', 'SAB_Total', 'SAB', 'Sabedoria', 'SAB_valor', 'Atributo_SAB'], 0);
  const rawCAR = findNumber(['CAR_Mod', 'Mod_CAR', 'CAR_mod', 'CAR_Total', 'CAR', 'Carisma', 'CAR_valor', 'Atributo_CAR'], 0);

  const convertAttrMod = (val: number): number => {
    // Se o valor for clássico antigo (ex: 8, 10, 14, 18), converte para modificador JdA
    if (val >= 8) {
      return Math.floor((val - 10) / 2);
    }
    return val;
  };

  const attributes = {
    FOR: convertAttrMod(rawFOR),
    DES: convertAttrMod(rawDES),
    CON: convertAttrMod(rawCON),
    INT: convertAttrMod(rawINT),
    SAB: convertAttrMod(rawSAB),
    CAR: convertAttrMod(rawCAR),
  };

  // ============================================================
  // 3. RECURSOS: PV, PM, DEFESA E ARMADURA
  // ============================================================
  const maxPVFromForm = findNumber(['PV_Total', 'PV_Max', 'PV_Maximo', 'PVMax', 'Pontos_de_Vida_Total', 'PV_Tot'], 0);
  const currentPVFromForm = findNumber(['PV_Atual', 'PV', 'Pontos_de_Vida_Atual', 'PVAtual'], maxPVFromForm || 20);
  const maxPV = maxPVFromForm > 0 ? maxPVFromForm : (currentPVFromForm > 0 ? currentPVFromForm : 20);
  const currentPV = currentPVFromForm > 0 ? currentPVFromForm : maxPV;
  const tempPV = findNumber(['PV_Temp', 'PV_Temporario', 'PVTemp'], 0);

  const maxPMFromForm = findNumber(['PM_Total', 'PM_Max', 'PM_Maximo', 'PMMax', 'Pontos_de_Mana_Total', 'PM_Tot'], 0);
  const currentPMFromForm = findNumber(['PM_Atual', 'PM', 'Pontos_de_Mana_Atual', 'PMAtual'], maxPMFromForm || 10);
  const maxPM = maxPMFromForm >= 0 && (maxPMFromForm > 0 || currentPMFromForm > 0) ? (maxPMFromForm || currentPMFromForm) : 10;
  const currentPM = currentPMFromForm >= 0 ? currentPMFromForm : maxPM;

  const defenseFromForm = findNumber(['Defesa_Total', 'Defesa', 'CA', 'DefesaTotal', 'DEF'], 0);
  const defense = defenseFromForm > 0 ? defenseFromForm : (10 + attributes.DES);

  const armorPenalty = findNumber(['Penalidade_Armadura', 'Penalidade_Total', 'PenalidadeArmadura', 'Penalidade'], 0);

  const armorName = findString(['Armadura_Nome', 'Armadura', 'Nome_Armadura']);
  const armorBonus = findNumber(['Armadura_Defesa', 'Armadura_Bonus', 'Bonus_Armadura', 'Armadura_Bonus_Defesa'], 0);
  const armorPen = findNumber(['Armadura_Penalidade', 'Penalidade_Armadura_Item'], 0);
  const armorType = findString(['Armadura_Tipo', 'Tipo_Armadura'], 'leve');

  const shieldName = findString(['Escudo_Nome', 'Escudo', 'Nome_Escudo']);
  const shieldBonus = findNumber(['Escudo_Defesa', 'Escudo_Bonus', 'Bonus_Escudo'], 0);
  const shieldPen = findNumber(['Escudo_Penalidade', 'Penalidade_Escudo_Item'], 0);

  // ============================================================
  // 4. PERÍCIAS OFICIAIS (29 Perícias T20)
  // ============================================================
  const skills: Record<string, { trained: boolean; extra?: number; others?: number }> = {};

  for (const sk of T20_SKILL_KEYS) {
    const baseSk = sk.replace(/\d+$/, ''); // 'oficio1' -> 'oficio'
    
    // 1. Detecção rigorosa de caixas marcadas e checkboxes do PDF
    const isBoxChecked = findBool([
      `Check_${sk}`, `Treinada_${sk}`, `${sk}_Treinada`, `${sk}_Check`, 
      `Pericia_${sk}_Treinada`, `Pericia_${sk}_Treino`, `Treino_${sk}`, `Treinada_${baseSk}`,
      `${sk}_Treino`, `Check_${baseSk}`, `Pericia_${sk}`, `chk_${sk}`, `chk${sk}`,
      `CB_${sk}`, `Box_${sk}`, `${sk}_Box`, `${sk}_T`, `${sk}T`, `Treinado_${sk}`,
      `${sk}_Treinado`, `Treino${sk}`, `${sk}_Marcado`, `Marcado_${sk}`, `Check_${sk}_T`
    ]);

    // 2. Detecção por valor numérico de treino preenchido (bônus oficial T20: +2, +4, +6)
    const trainBonusVal = findNumber([
      `${sk}_Treino`, `Treino_${sk}`, `Bonus_Treino_${sk}`, `${sk}_Bonus_Treino`,
      `Pericia_${sk}_Treino`, `${baseSk}_Treino`, `Treino_${baseSk}`
    ], 0);

    // Perícia é considerada treinada apenas se a caixa estiver marcada ou treino >= 2
    const isTrained = isBoxChecked || trainBonusVal >= 2;

    const othersVal = findNumber([
      `Outros_${sk}`, `${sk}_Outros`, `${sk}_Bonus`, `${sk}_Extra`, `${sk}_Mod`,
      `Pericia_${sk}_Outros`, `Outros_${baseSk}`
    ], 0);

    skills[baseSk] = {
      trained: isTrained,
      others: othersVal,
      extra: 0
    };
  }

  // ============================================================
  // 5. ATAQUES / ARMAS
  // ============================================================
  const attacks: Array<{
    id: string;
    name: string;
    attackBonus: number;
    damage: string;
    crit: string;
    type: string;
    range: string;
    attr?: string;
  }> = [];

  // Tenta extrair linhas numeradas (1 a 10)
  for (let i = 1; i <= 10; i++) {
    const atkName = findString([
      `Arma${i}_Nome`, `Ataque${i}_Nome`, `Arma_${i}_Nome`, `Arma_${i}`, `Arma${i}`, 
      `Ataque${i}`, `Ataque_${i}`, `Atk${i}_Nome`, `Atk${i}`
    ]);

    if (atkName && atkName.trim() !== '') {
      const atkBonus = findNumber([
        `Arma${i}_Ataque`, `Arma${i}_Bonus`, `Ataque${i}_Bonus`, `Ataque${i}_Teste`,
        `Arma_${i}_Ataque`, `Arma_${i}_Bonus`, `Atk${i}_Bonus`
      ], 0);

      const atkDamage = findString([
        `Arma${i}_Dano`, `Ataque${i}_Dano`, `Arma_${i}_Dano`, `Dano${i}`, `Dano_${i}`
      ], '1d6');

      const atkCrit = findString([
        `Arma${i}_Crit`, `Arma${i}_Critico`, `Ataque${i}_Critico`, `Critico${i}`, `Crit_${i}`
      ], '20/x2');

      const atkType = findString([
        `Arma${i}_Tipo`, `Ataque${i}_Tipo`, `Tipo${i}`, `Tipo_${i}`
      ], 'Corte');

      const atkRange = findString([
        `Arma${i}_Alcance`, `Ataque${i}_Alcance`, `Alcance${i}`, `Alcance_${i}`
      ], 'Corpo a corpo');

      attacks.push({
        id: `atk_${Date.now()}_${i}`,
        name: atkName,
        attackBonus: atkBonus,
        damage: atkDamage,
        crit: atkCrit,
        type: atkType,
        range: atkRange,
        attr: 'FOR'
      });
    }
  }

  // Se nenhum ataque estruturado foi encontrado, busca campo de texto corrido
  if (attacks.length === 0) {
    const freeTextAttacks = findString(['Ataques', 'Armas', 'Lista_Ataques', 'Ataques_Texto']);
    if (freeTextAttacks) {
      const lines = freeTextAttacks.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach((line, idx) => {
        attacks.push({
          id: `atk_free_${idx}`,
          name: line.substring(0, 40),
          attackBonus: 0,
          damage: '1d6',
          crit: '20/x2',
          type: 'Corte',
          range: 'Corpo a corpo',
          attr: 'FOR'
        });
      });
    }
  }

  // ============================================================
  // 6. EQUIPAMENTOS E INVENTÁRIO
  // ============================================================
  const inventory: Array<{
    id: string;
    name: string;
    quantity: number;
    weight: number;
    equipped: boolean;
    type: string;
    description?: string;
  }> = [];

  // Tenta extrair linhas numeradas de itens (1 a 30)
  for (let i = 1; i <= 30; i++) {
    const itemName = findString([
      `Item${i}_Nome`, `Item_${i}_Nome`, `Item${i}`, `Item_${i}`, 
      `Equipamento${i}_Nome`, `Equipamento${i}`, `Equip${i}_Nome`, `Equip${i}`
    ]);

    if (itemName && itemName.trim() !== '') {
      const itemQtd = findNumber([`Item${i}_Qtd`, `Item${i}_Quantidade`, `Item_${i}_Qtd`, `Qtd${i}`], 1);
      const itemWeight = findNumber([`Item${i}_Peso`, `Item${i}_Espaco`, `Item_${i}_Peso`, `Peso${i}`, `Espaco${i}`], 0);
      const itemEquipped = findBool([`Item${i}_Equipado`, `Item${i}_Check`, `Item_${i}_Equipado`]);

      inventory.push({
        id: `item_${Date.now()}_${i}`,
        name: itemName,
        quantity: Math.max(1, itemQtd),
        weight: Math.max(0, itemWeight),
        equipped: itemEquipped,
        type: 'item',
        description: ''
      });
    }
  }

  // Se não houver itens por linha, busca caixa de texto livre de inventário
  if (inventory.length === 0) {
    const freeTextEquip = findString(['Equipamento', 'Equipamentos', 'Itens', 'Mochila', 'Inventario', 'Outros_Itens', 'Inventário']);
    if (freeTextEquip) {
      const lines = freeTextEquip.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach((line, idx) => {
        inventory.push({
          id: `item_free_${idx}`,
          name: line.substring(0, 50),
          quantity: 1,
          weight: 1,
          equipped: false,
          type: 'item',
          description: line
        });
      });
    }
  }

  const money = findNumber(['Tibares', 'Dinheiro', 'TS', 'T$', 'Tibar', 'Plata', 'Ouro', 'Riqueza'], 0);

  // ============================================================
  // 7. HABILIDADES E PODERES
  // ============================================================
  const powers: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    source?: string;
  }> = [];

  // Tenta extrair linhas numeradas de habilidades
  for (let i = 1; i <= 20; i++) {
    const habName = findString([
      `Habilidade${i}_Nome`, `Poder${i}_Nome`, `Hab${i}_Nome`, `Habilidade${i}`, `Poder${i}`, `Hab${i}`
    ]);

    if (habName && habName.trim() !== '') {
      const habDesc = findString([
        `Habilidade${i}_Desc`, `Habilidade${i}_Descricao`, `Poder${i}_Desc`, `Hab${i}_Desc`, `Habilidade${i}_Texto`
      ]);
      const habType = findString([`Habilidade${i}_Tipo`, `Poder${i}_Tipo`], 'Habilidade');

      powers.push({
        id: `pow_${Date.now()}_${i}`,
        name: habName,
        type: habType,
        description: habDesc,
        source: 'Ficha'
      });
    }
  }

  // Se não houver habilidades por linha, analisa caixas de texto estruturadas
  if (powers.length === 0) {
    const habTextSources = [
      { name: 'Habilidades de Raça', key: findString(['Habilidades_Raca', 'Hab_Raca', 'Poderes_Raca']) },
      { name: 'Habilidades de Classe', key: findString(['Habilidades_Classe', 'Hab_Classe', 'Poderes_Classe']) },
      { name: 'Poderes Gerais', key: findString(['Poderes_Gerais', 'Poderes']) },
      { name: 'Poderes Concedidos', key: findString(['Poderes_Concedidos', 'Poderes_Divinos']) },
      { name: 'Habilidades e Poderes', key: findString(['Habilidades_Poderes', 'Habilidades', 'Poderes_Habilidades']) },
    ];

    habTextSources.forEach(({ name: typeLabel, key: textVal }, sIdx) => {
      if (textVal && textVal.trim() !== '') {
        const lines = textVal.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach((line, lIdx) => {
          powers.push({
            id: `pow_txt_${sIdx}_${lIdx}`,
            name: line.substring(0, 50),
            type: typeLabel,
            description: line,
            source: typeLabel
          });
        });
      }
    });
  }

  // ============================================================
  // 8. MAGIAS E GRIMÓRIO (Busca e Validação no Catálogo T20 Oficial)
  // ============================================================
  const spells: Array<{
    id: string;
    name: string;
    circle: number;
    level?: number;
    school: string;
    cost: number;
    type?: string;
    execution?: string;
    range?: string;
    target?: string;
    area?: string;
    effect?: string;
    duration?: string;
    resistance?: string;
    description?: string;
    truque?: string;
    aprimoramentos?: string[];
    foundInCatalog?: boolean;
    notFoundWarning?: string;
  }> = [];

  const processedSpellKeys = new Set<string>();

  const addSpellCandidate = (rawName: string) => {
    if (!rawName || typeof rawName !== 'string') return;
    const cleaned = cleanRawSpellName(rawName);
    if (!cleaned || cleaned.length < 2) return;

    // Chave para evitar duplicatas
    const dedupeKey = cleaned.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    if (!dedupeKey || processedSpellKeys.has(dedupeKey)) return;
    processedSpellKeys.add(dedupeKey);

    // 1. Procura no catálogo oficial T20 do REALMOR
    const catalogSpell = findSpellInT20Catalog(cleaned) || findSpellInT20Catalog(rawName);

    if (catalogSpell) {
      // Importa o registro COMPLETO e EXATO do catálogo do sistema
      spells.push({
        id: catalogSpell.id,
        name: catalogSpell.name,
        circle: catalogSpell.circle,
        level: catalogSpell.circle,
        school: catalogSpell.school,
        type: catalogSpell.type,
        execution: catalogSpell.execution,
        range: catalogSpell.range,
        target: catalogSpell.target,
        area: catalogSpell.area,
        effect: catalogSpell.effect,
        duration: catalogSpell.duration,
        resistance: catalogSpell.resistance,
        description: catalogSpell.description,
        truque: catalogSpell.truque,
        aprimoramentos: catalogSpell.aprimoramentos,
        cost: getStandardT20SpellCost(catalogSpell.circle),
        foundInCatalog: true
      });
    } else {
      // Magia não encontrada no catálogo oficial
      spells.push({
        id: `unmatched_spell_${Date.now()}_${spells.length}`,
        name: cleaned,
        circle: 1,
        level: 1,
        school: 'Desconhecida',
        cost: 1,
        description: '',
        foundInCatalog: false,
        notFoundWarning: 'Magia não encontrada no catálogo oficial T20'
      });
      warnings.push(`Magia "${cleaned}" não foi encontrada no catálogo oficial T20 e necessita revisão manual.`);
    }
  };

  // Tenta extrair linhas numeradas de magias (1 a 40)
  for (let i = 1; i <= 40; i++) {
    const splName = findString([
      `Magia${i}_Nome`, `Magia_${i}_Nome`, `Magia${i}`, `Magia_${i}`, 
      `Spell${i}_Name`, `Spell${i}`, `Nome_Magia_${i}`, `Magia_Nome_${i}`,
      `Nome_Magia${i}`, `MagiaNome${i}`
    ]);

    if (splName && splName.trim() !== '') {
      addSpellCandidate(splName);
    }
  }

  // Se não houver magias por linha numerada, busca campos de texto estruturados ou por círculo
  const freeTextSpells = findString([
    'Magias', 'Grimorio', 'Grimório', 'Lista_Magias', 
    'Magias_1_Circulo', 'Magias_2_Circulo', 'Magias_3_Circulo', 'Magias_4_Circulo', 'Magias_5_Circulo',
    'Magias_1', 'Magias_2', 'Magias_3', 'Magias_4', 'Magias_5'
  ]);

  if (freeTextSpells && freeTextSpells.trim() !== '') {
    const lines = freeTextSpells.split(/[\r\n,;]+/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      addSpellCandidate(line);
    }
  }

  // ============================================================
  // 9. HISTÓRIA E ANOTAÇÕES
  // ============================================================
  const notes = findString([
    'Historia', 'História', 'Historico', 'Histórico', 'Anotacoes', 'Anotações', 
    'Notas', 'Biografia', 'Personalidade', 'Aparencia', 'Aparência', 'Aliados'
  ]);

  if (!hasInteractiveForm && rawFieldsMap.size === 0) {
    warnings.push('O PDF não contém campos interativos de formulário preenchidos. Por favor, revise e complete os dados.');
  }

  return {
    name,
    playerName,
    raceName,
    raceId,
    className,
    classId,
    originName,
    originId,
    level,
    deity,
    age,
    gender,
    size,
    movement,
    xp,
    attributes,
    currentPV,
    maxPV,
    tempPV,
    currentPM,
    maxPM,
    defense,
    armorPenalty,
    armor: (armorName || armorBonus > 0) ? {
      name: armorName || 'Armadura',
      defenseBonus: armorBonus,
      penalty: armorPen,
      type: armorType
    } : undefined,
    shield: (shieldName || shieldBonus > 0) ? {
      name: shieldName || 'Escudo',
      defenseBonus: shieldBonus,
      penalty: shieldPen
    } : undefined,
    skills,
    attacks,
    inventory,
    powers,
    spells,
    money,
    notes,
    warnings,
    extractionStats: {
      pagesCount,
      hasInteractiveForm,
      interactiveFieldsCount,
      fieldsFoundCount: rawFieldsMap.size
    }
  };
}
