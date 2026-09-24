import React, { useState, useEffect, useMemo } from 'react';
import { Info, Heart, Zap, ChevronRight, X, Check } from 'lucide-react';
import { WizardData } from './types';
import { T20_CLASSES_DETAILED } from '../../../data/t20ClassesDetailed';
import { T20_CLASSES } from '../../../data/t20Data';
import { resolveStorageUrlWithFallback } from '../../../firebase/storage';

interface StepClassProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export interface ClassVisualMeta {
  id: string;
  order: number;
  file: string;
  storagePath: string;
  name: string;
  badge: string;
  pvBase: number;
  pmBase: number;
  summary: string;
  candidates: string[];
}

const CATEGORY_FILTERS: { id: 'all' | 'combatente' | 'conjurador' | 'especialista' | 'suporte'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'combatente', label: 'Comb.' },
  { id: 'conjurador', label: 'Conj.' },
  { id: 'especialista', label: 'Esp.' },
  { id: 'suporte', label: 'Sup.' },
];

export const ORDERED_CLASS_CONFIG: ClassVisualMeta[] = [
  {
    id: 'arcanista',
    order: 1,
    file: '01_arcanista.png',
    storagePath: 'img-capas/classe-capas/01_arcanista.png',
    name: 'ARCANISTA',
    badge: 'Conjurador',
    pvBase: 8,
    pmBase: 6,
    summary: 'Mestre das artes arcanas, capaz de moldar a realidade com magia.',
    candidates: [
      'img-capas/classe-capas/01_arcanista.png',
      'img-capas/classe-capas/arcanista.png',
      'classe-capas/01_arcanista.png',
      'class-capas/01_arcanista.png',
      'img-capas/01_arcanista.png',
      '01_arcanista.png'
    ]
  },
  {
    id: 'barbaro',
    order: 2,
    file: '02_barbaro.png',
    storagePath: 'img-capas/classe-capas/02_barbaro.png',
    name: 'BÁRBARO',
    badge: 'Combatente',
    pvBase: 22,
    pmBase: 2,
    summary: 'Guerreiro selvagem que canaliza a fúria para superar seus limites.',
    candidates: [
      'img-capas/classe-capas/02_barbaro.png',
      'img-capas/classe-capas/barbaro.png',
      'classe-capas/02_barbaro.png',
      'class-capas/02_barbaro.png',
      'img-capas/02_barbaro.png',
      '02_barbaro.png'
    ]
  },
  {
    id: 'bardo',
    order: 3,
    file: '03_bardo.png',
    storagePath: 'img-capas/classe-capas/03_bardo.png',
    name: 'BARDO',
    badge: 'Especialista',
    pvBase: 12,
    pmBase: 4,
    summary: 'Artista e contador de histórias, capaz de inspirar, influenciar e manipular.',
    candidates: [
      'img-capas/classe-capas/03_bardo.png',
      'img-capas/classe-capas/bardo.png',
      'classe-capas/03_bardo.png',
      'class-capas/03_bardo.png',
      'img-capas/03_bardo.png',
      '03_bardo.png'
    ]
  },
  {
    id: 'bucaneiro',
    order: 4,
    file: '04_bucaneiro.png',
    storagePath: 'img-capas/classe-capas/04_bucaneiro.png',
    name: 'BUCANEIRO',
    badge: 'Especialista',
    pvBase: 16,
    pmBase: 3,
    summary: 'Aventureiro dos mares, habilidoso em combate, manobras e fortuna.',
    candidates: [
      'img-capas/classe-capas/04_bucaneiro.png',
      'img-capas/classe-capas/bucaneiro.png',
      'classe-capas/04_bucaneiro.png',
      'class-capas/04_bucaneiro.png',
      'img-capas/04_bucaneiro.png',
      '04_bucaneiro.png'
    ]
  },
  {
    id: 'cacador',
    order: 5,
    file: '05_cacador.png',
    storagePath: 'img-capas/classe-capas/05_cacador.png',
    name: 'CAÇADOR',
    badge: 'Especialista',
    pvBase: 16,
    pmBase: 3,
    summary: 'Mestre da natureza, rastreador implacável e companheiro das criaturas selvagens.',
    candidates: [
      'img-capas/classe-capas/05_cacador.png',
      'img-capas/classe-capas/cacador.png',
      'classe-capas/05_cacador.png',
      'class-capas/05_cacador.png',
      'img-capas/05_cacador.png',
      '05_cacador.png'
    ]
  },
  {
    id: 'cavaleiro',
    order: 6,
    file: '06_cavaleiro.png',
    storagePath: 'img-capas/classe-capas/06_cavaleiro.png',
    name: 'CAVALEIRO',
    badge: 'Combatente',
    pvBase: 20,
    pmBase: 3,
    summary: 'Nobre guerreiro montado, defensor de ideais e senhor do campo de batalha.',
    candidates: [
      'img-capas/classe-capas/06_cavaleiro.png',
      'img-capas/classe-capas/cavaleiro.png',
      'classe-capas/06_cavaleiro.png',
      'class-capas/06_cavaleiro.png',
      'img-capas/06_cavaleiro.png',
      '06_cavaleiro.png'
    ]
  },
  {
    id: 'clerigo',
    order: 7,
    file: '07_clerigo.png',
    storagePath: 'img-capas/classe-capas/07_clerigo.png',
    name: 'CLÉRIGO',
    badge: 'Suporte',
    pvBase: 16,
    pmBase: 5,
    summary: 'O canalizador do poder dos deuses, capaz de curar, proteger e expulsar o mal.',
    candidates: [
      'img-capas/classe-capas/07_clerigo.png',
      'img-capas/classe-capas/clerigo.png',
      'classe-capas/07_clerigo.png',
      'class-capas/07_clerigo.png',
      'img-capas/07_clerigo.png',
      '07_clerigo.png'
    ]
  },
  {
    id: 'druida',
    order: 8,
    file: '08_druida.png',
    storagePath: 'img-capas/classe-capas/08_druida.png',
    name: 'DRUIDA',
    badge: 'Conjurador',
    pvBase: 18,
    pmBase: 5,
    summary: 'Guardião dos ciclos da natureza, capaz de moldar a terra, os animais e os elementos.',
    candidates: [
      'img-capas/classe-capas/08_druida.png',
      'img-capas/classe-capas/druida.png',
      'classe-capas/08_druida.png',
      'class-capas/08_druida.png',
      'img-capas/08_druida.png',
      '08_druida.png'
    ]
  },
  {
    id: 'guerreiro',
    order: 9,
    file: '09_guerreiro.png',
    storagePath: 'img-capas/classe-capas/09_guerreiro.png',
    name: 'GUERREIRO',
    badge: 'Combatente',
    pvBase: 20,
    pmBase: 3,
    summary: 'Especialista em armas e táticas de combate, dominando o campo de batalha.',
    candidates: [
      'img-capas/classe-capas/09_guerreiro.png',
      'img-capas/classe-capas/guerreiro.png',
      'classe-capas/09_guerreiro.png',
      'class-capas/09_guerreiro.png',
      'img-capas/09_guerreiro.png',
      '09_guerreiro.png'
    ]
  },
  {
    id: 'inventor',
    order: 10,
    file: '10_inventor.png',
    storagePath: 'img-capas/classe-capas/10_inventor.png',
    name: 'INVENTOR',
    badge: 'Especialista',
    pvBase: 16,
    pmBase: 4,
    summary: 'Gênio da engenhosidade, capaz de criar dispositivos, máquinas e soluções inovadoras.',
    candidates: [
      'img-capas/classe-capas/10_inventor.png',
      'img-capas/classe-capas/inventor.png',
      'classe-capas/10_inventor.png',
      'class-capas/10_inventor.png',
      'img-capas/10_inventor.png',
      '10_inventor.png'
    ]
  },
  {
    id: 'ladino',
    order: 11,
    file: '11_ladino.png',
    storagePath: 'img-capas/classe-capas/11_ladino.png',
    name: 'LADINO',
    badge: 'Especialista',
    pvBase: 12,
    pmBase: 4,
    summary: 'Mestre da furtividade e das perícias, capaz de agir nas sombras.',
    candidates: [
      'img-capas/classe-capas/11_ladino.png',
      'img-capas/classe-capas/ladino.png',
      'classe-capas/11_ladino.png',
      'class-capas/11_ladino.png',
      'img-capas/11_ladino.png',
      '11_ladino.png'
    ]
  },
  {
    id: 'lutador',
    order: 12,
    file: '12_lutador.png',
    storagePath: 'img-capas/classe-capas/12_lutador.png',
    name: 'LUTADOR',
    badge: 'Combatente',
    pvBase: 20,
    pmBase: 2,
    summary: 'Especialista no combate desarmado, dominando técnicas marciais e o próprio corpo.',
    candidates: [
      'img-capas/classe-capas/12_lutador.png',
      'img-capas/classe-capas/lutador.png',
      'classe-capas/12_lutador.png',
      'class-capas/12_lutador.png',
      'img-capas/12_lutador.png',
      '12_lutador.png'
    ]
  },
  {
    id: 'nobre',
    order: 13,
    file: '13_nobre.png',
    storagePath: 'img-capas/classe-capas/13_nobre.png',
    name: 'NOBRE',
    badge: 'Especialista',
    pvBase: 14,
    pmBase: 4,
    summary: 'Líder nato, mestre da diplomacia, estratégia e influência.',
    candidates: [
      'img-capas/classe-capas/13_nobre.png',
      'img-capas/classe-capas/nobre.png',
      'classe-capas/13_nobre.png',
      'class-capas/13_nobre.png',
      'img-capas/13_nobre.png',
      '13_nobre.png'
    ]
  },
  {
    id: 'paladino',
    order: 14,
    file: '14_paladino.png',
    storagePath: 'img-capas/classe-capas/14_paladino.png',
    name: 'PALADINO',
    badge: 'Combatente',
    pvBase: 20,
    pmBase: 4,
    summary: 'Guerreiro sagrado, defensor da justiça e portador de ideais elevados.',
    candidates: [
      'img-capas/classe-capas/14_paladino.png',
      'img-capas/classe-capas/paladino.png',
      'classe-capas/14_paladino.png',
      'class-capas/14_paladino.png',
      'img-capas/14_paladino.png',
      '14_paladino.png'
    ]
  }
];

export const StepClass: React.FC<StepClassProps> = ({ data, onChange }) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'combatente' | 'especialista' | 'conjurador' | 'suporte'>('all');
  const [inspectClass, setInspectClass] = useState<typeof T20_CLASSES_DETAILED[0] | null>(null);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});

  // Carrega as URLs das capas a partir de img-capas/classe-capas/
  useEffect(() => {
    let isMounted = true;

    async function loadAllCovers() {
      const urls: Record<string, string> = {};

      await Promise.all(
        ORDERED_CLASS_CONFIG.map(async (config) => {
          try {
            const url = await resolveStorageUrlWithFallback(config.storagePath, config.candidates);
            if (url) {
              urls[config.id] = url;
              console.log(`[CLASSES] ${config.name} → URL carregada:`, url);
            }
          } catch (err: any) {
            console.error(`[CLASSES] ${config.name} → Erro ao carregar imagem:`, err?.message || err);
          }
        })
      );

      if (isMounted) {
        setCoverUrls(urls);
      }
    }

    loadAllCovers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredClassConfigs = useMemo(() => {
    return ORDERED_CLASS_CONFIG.filter((cfg) => {
      const detailed = T20_CLASSES_DETAILED.find((c) => c.id === cfg.id);
      const matchesCat =
        categoryFilter === 'all' ||
        cfg.badge.toLowerCase() === categoryFilter.toLowerCase() ||
        (detailed && detailed.category.toLowerCase() === categoryFilter.toLowerCase());

      return matchesCat;
    });
  }, [categoryFilter]);

  const handleSelectClass = (classId: string, classNameFormatted: string) => {
    const stats = T20_CLASSES[classId as keyof typeof T20_CLASSES] || T20_CLASSES['guerreiro'];
    const conMod = data.attrModifiers.CON || 0;
    const calculatedPV = stats.pvBase + conMod + ((stats.pvPerLevel + conMod) * (data.level - 1));
    const calculatedPM = stats.pmBase + (stats.pmPerLevel * (data.level - 1));

    const detailedClass = T20_CLASSES_DETAILED.find((c) => c.id === classId);

    onChange({
      classId,
      className: detailedClass ? detailedClass.name : classNameFormatted,
      hp: Math.max(1, calculatedPV),
      hpMax: Math.max(1, calculatedPV),
      mana: Math.max(0, calculatedPM),
      manaMax: Math.max(0, calculatedPM)
    });
  };

  const handleLevelChange = (newLevel: number) => {
    const level = Math.max(1, Math.min(20, newLevel));
    const stats = T20_CLASSES[data.classId as keyof typeof T20_CLASSES] || T20_CLASSES['guerreiro'];
    const conMod = data.attrModifiers.CON || 0;
    const calculatedPV = stats.pvBase + conMod + ((stats.pvPerLevel + conMod) * (level - 1));
    const calculatedPM = stats.pmBase + (stats.pmPerLevel * (level - 1));

    onChange({
      level,
      hp: Math.max(1, calculatedPV),
      hpMax: Math.max(1, calculatedPV),
      mana: Math.max(0, calculatedPM),
      manaMax: Math.max(0, calculatedPM)
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 pb-8 select-none">
      {/* 1. Barra Superior com Controles de Nível e PV / PM */}
      <div className="bg-[#0b0a08]/90 border border-[#3e2e18] rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md">
        {/* Controles de Nível */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Nível</span>
          <div className="flex items-center bg-[#070503] rounded-lg border border-[#4a391e] p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => handleLevelChange(data.level - 1)}
              disabled={data.level <= 1}
              className="w-7 h-7 flex items-center justify-center rounded text-amber-300 hover:bg-[#2e2110] disabled:opacity-30 font-bold transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center font-cinzel font-bold text-amber-200 text-sm">
              {data.level}
            </span>
            <button
              type="button"
              onClick={() => handleLevelChange(data.level + 1)}
              disabled={data.level >= 20}
              className="w-7 h-7 flex items-center justify-center rounded text-amber-300 hover:bg-[#2e2110] disabled:opacity-30 font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Pílulas de PV / PM da classe selecionada */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-800/60 text-red-200 font-mono flex items-center gap-1.5 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            <span className="font-bold">{data.hpMax} PV</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-200 font-mono flex items-center gap-1.5 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <span className="font-bold">{data.manaMax} PM</span>
          </span>
        </div>
      </div>

      {/* 2. Filtros Compactos de Categoria (Sem campo de busca) */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full py-0.5">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`flex-1 py-1.5 px-1 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide text-center transition-all cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-[0_0_12px_rgba(217,119,6,0.35)] border border-amber-400'
                : 'bg-[#0f0e0c]/90 text-stone-400 hover:text-amber-200 border border-[#2d2417] hover:border-[#5a3f1b]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Grid de 2 Colunas de Cards Horizontais Idênticos à Imagem de Referência */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        {filteredClassConfigs.map((cfg) => {
          const isSelected = data.classId === cfg.id;
          const coverUrl = coverUrls[cfg.id];
          const detailed = T20_CLASSES_DETAILED.find((c) => c.id === cfg.id);

          return (
            <div
              key={cfg.id}
              onClick={() => handleSelectClass(cfg.id, cfg.name)}
              className={`group relative text-left rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden min-h-[125px] sm:min-h-[145px] md:min-h-[155px] flex flex-col justify-between p-2.5 sm:p-3 bg-[#080604] shadow-xl ${
                isSelected
                  ? 'border-[#fcd34d] ring-2 ring-amber-400/90 shadow-[0_0_22px_rgba(252,211,77,0.45)]'
                  : 'border-[#5a3f1b]/90 hover:border-[#d4af37]/80 hover:shadow-[0_0_15px_rgba(212,175,55,0.25)]'
              }`}
            >
              {/* CAMADA DE FUNDO: Imagem Oficial da Classe (Alinhada à Direita/Fundo) */}
              {coverUrl && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img
                    src={coverUrl}
                    alt={cfg.name}
                    className="w-full h-full object-cover object-right sm:object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Gradiente escuro da esquerda para garantir legibilidade impecável dos textos */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#070503] via-[#070503]/85 via-45% to-transparent" />
                  {/* Vinheta sutil superior e inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070503]/70 via-transparent to-[#070503]/50" />
                </div>
              )}

              {/* Botão de Informações ⓘ no Canto Superior Direito */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (detailed) {
                    setInspectClass(detailed);
                  }
                }}
                className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-stone-500/70 bg-black/60 hover:border-amber-400 hover:bg-black text-stone-300 hover:text-amber-200 flex items-center justify-center transition-colors shadow-md cursor-pointer"
                title="Ver detalhes da classe"
              >
                <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Ícone de Seta > no Canto Inferior Direito */}
              <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-20 pointer-events-none text-stone-400 group-hover:text-amber-300 transition-colors">
                <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 opacity-80" />
              </div>

              {/* CONTEÚDO PRINCIPAL DO CARD (Esquerda) */}
              <div className="relative z-10 flex flex-col justify-between h-full max-w-[70%] sm:max-w-[65%]">
                <div className="space-y-1 sm:space-y-1.5">
                  {/* Nome da Classe */}
                  <h3 className="font-cinzel text-xs sm:text-sm md:text-base font-bold tracking-wider text-[#f5ebd7] uppercase leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                    {cfg.name}
                  </h3>

                  {/* Pílula de Categoria */}
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border border-[#9b722d]/90 bg-black/75 text-[#f5d076] backdrop-blur-xs shadow-xs">
                      {cfg.badge}
                    </span>
                  </div>

                  {/* PV e PM */}
                  <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-medium pt-0.5">
                    <span className="inline-flex items-center gap-1 font-mono font-semibold text-stone-200 drop-shadow-xs">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />
                      <span>{cfg.pvBase} PV</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono font-semibold text-stone-200 drop-shadow-xs">
                      <Zap className="w-3 h-3 text-blue-400 fill-blue-400 shrink-0" />
                      <span>{cfg.pmBase} PM</span>
                    </span>
                  </div>
                </div>

                {/* Descrição em 2 linhas */}
                <p className="text-[9px] sm:text-[10px] md:text-[11px] text-stone-300/95 leading-tight line-clamp-2 mt-1 sm:mt-1.5 drop-shadow-sm font-sans">
                  {cfg.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Modal de Inspeção Completa da Classe */}
      {inspectClass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-lg bg-[#0a0806] border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-amber-200">
                  {ORDERED_CLASS_CONFIG.find((c) => c.id === inspectClass.id)?.name || inspectClass.name}
                </h3>
                <span className="text-[11px] text-amber-500 uppercase tracking-widest font-semibold capitalize">
                  {ORDERED_CLASS_CONFIG.find((c) => c.id === inspectClass.id)?.badge || inspectClass.category} • {inspectClass.role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectClass(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar text-xs leading-relaxed flex-1">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Conceito da Classe
                </span>
                <p className="text-stone-300">
                  {ORDERED_CLASS_CONFIG.find((c) => c.id === inspectClass.id)?.summary || inspectClass.concept || inspectClass.summary}
                </p>
              </div>

              {/* Atributos Chave */}
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Atributos Chave
                </span>
                <div className="flex gap-2 text-stone-300">
                  <span>Principais: <strong className="text-amber-300">{inspectClass.primaryAttributes.join(', ')}</strong></span>
                  <span>• Secundários: <strong className="text-stone-400">{inspectClass.secondaryAttributes.join(', ')}</strong></span>
                </div>
              </div>

              {/* Pontos Fortes e Fraquezas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#0e0d0b] border border-emerald-900/40">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Pontos Fortes</span>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-300 text-[11px]">
                    {inspectClass.strengths.slice(0, 3).map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e0d0b] border border-red-900/40">
                  <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Fraquezas</span>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-300 text-[11px]">
                    {inspectClass.weaknesses.slice(0, 3).map((wk, i) => (
                      <li key={i}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSelectClass(inspectClass.id, inspectClass.name);
                  setInspectClass(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Escolher {ORDERED_CLASS_CONFIG.find((c) => c.id === inspectClass.id)?.name || inspectClass.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
