import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  RotateCcw, 
  Dices, 
  User, 
  Smile, 
  Scissors, 
  Shirt, 
  Shield, 
  Gem,
  Info,
  Layers,
  Box,
  X
} from 'lucide-react';
import { 
  CharacterVisualState, 
  CustomizerCategory, 
  INITIAL_VISUAL_STATE,
  VISUAL_LAYERS_ORDER 
} from '../../../types/characterCustomizer';
import { CharacterVisualStage } from './CharacterVisualStage';
import { CustomizerCategoryOptions } from './CustomizerCategoryOptions';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: CustomizerCategory; label: string; icon: React.ElementType }[] = [
  { id: 'corpo', label: 'Corpo', icon: User },
  { id: 'rosto', label: 'Rosto', icon: Smile },
  { id: 'cabelo', label: 'Cabelo', icon: Scissors },
  { id: 'roupa', label: 'Roupa', icon: Shirt },
  { id: 'armadura', label: 'Armadura', icon: Shield },
  { id: 'acessorios', label: 'Acessórios', icon: Gem },
];

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [visualState, setVisualState] = useState<CharacterVisualState>(INITIAL_VISUAL_STATE);
  const [activeCategory, setActiveCategory] = useState<CustomizerCategory>('corpo');
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = (updates: Partial<CharacterVisualState>) => {
    setVisualState(prev => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setVisualState(INITIAL_VISUAL_STATE);
  };

  const handleRandomize = () => {
    const skinTones = [
      { name: 'Bronzeado de Arton', hex: '#d4a373' },
      { name: 'Pálido Alvo', hex: '#f4ebd9' },
      { name: 'Moreno de Valkaria', hex: '#a67c52' },
      { name: 'Ébano Profundo', hex: '#5c3d2e' },
      { name: 'Élfico Dourado', hex: '#e6c280' },
    ];
    const hairColors = [
      { name: 'Castanho Ébano', hex: '#3d2616' },
      { name: 'Louro Real', hex: '#eab308' },
      { name: 'Ruivo Flamejante', hex: '#c2410c' },
      { name: 'Prata Élfica', hex: '#94a3b8' },
      { name: 'Negro Noturno', hex: '#18181b' },
    ];
    const outfitColors = [
      { name: 'Azul Noturno', hex: '#1e293b' },
      { name: 'Carmesim Imperial', hex: '#7f1d1d' },
      { name: 'Couro Rústico', hex: '#78350f' },
      { name: 'Verde Florestal', hex: '#14532d' },
      { name: 'Preto Sombrio', hex: '#0f172a' },
    ];
    const hairStyles: CharacterVisualState['hairStyle'][] = ['curto', 'longo', 'trancas', 'coque', 'raspado', 'selvagem'];
    const armorStyles: CharacterVisualState['armorStyle'][] = ['nenhuma', 'couro', 'malha', 'placas'];
    const expressions: CharacterVisualState['expression'][] = ['determinado', 'sereno', 'astuto', 'feroz'];
    const weapons: CharacterVisualState['weaponSilhouette'][] = ['espada', 'cajado', 'adagas', 'nenhuma'];
    const cloaks: CharacterVisualState['cloakStyle'][] = ['nenhuma', 'veludo', 'capuz', 'rasgada'];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const randomSkin = pick(skinTones);
    const randomHair = pick(hairColors);
    const randomOutfit = pick(outfitColors);

    setVisualState({
      ...visualState,
      skinTone: randomSkin.hex,
      skinToneName: randomSkin.name,
      hairColor: randomHair.hex,
      hairColorName: randomHair.name,
      hairStyle: pick(hairStyles),
      outfitColor: randomOutfit.hex,
      outfitColorName: randomOutfit.name,
      armorStyle: pick(armorStyles),
      expression: pick(expressions),
      weaponSilhouette: pick(weapons),
      cloakStyle: pick(cloaks),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08070b] text-stone-200 overflow-hidden animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* CABEÇALHO DO CUSTOMIZADOR                                    */}
      {/* ============================================================ */}
      <header className="h-14 sm:h-16 px-3 sm:px-4 bg-[#0e0c14]/95 border-b border-amber-900/40 flex items-center justify-between shrink-0 shadow-md z-20 backdrop-blur-md">
        {/* Botão Voltar */}
        <button
          onClick={onClose}
          className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-amber-900/40 text-amber-300 hover:text-amber-100 text-xs font-cinzel font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={16} className="text-amber-400" />
          <span>Voltar</span>
        </button>

        {/* Título Central */}
        <div className="text-center px-2 flex flex-col items-center">
          <h2 className="text-sm sm:text-base font-cinzel font-bold text-amber-200 uppercase tracking-widest leading-tight flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>Personalizar Personagem</span>
          </h2>
          <span className="text-[10px] text-stone-400 font-mono tracking-wider uppercase">
            Protótipo Visual • Sistema de Camadas
          </span>
        </div>

        {/* Ações Rápidas: 3D Test, Aleatório e Reset */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => {
              onClose();
              navigate('/test/3d');
            }}
            title="Abrir Ambiente de Teste 3D (Three.js)"
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-amber-900/40 text-amber-300 text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Box size={14} className="text-amber-400" />
            <span className="text-[10px] font-cinzel font-bold hidden sm:inline">Modo 3D</span>
          </button>

          <button
            onClick={handleRandomize}
            title="Sortear Aparência"
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-amber-900/40 text-amber-300 text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Dices size={15} className="text-amber-400" />
            <span className="text-[10px] font-cinzel font-bold hidden sm:inline">Aleatório</span>
          </button>

          <button
            onClick={handleReset}
            title="Restaurar Padrão"
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-amber-900/40 text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* CORPO PRINCIPAL (Layout Mobile-First com Scroll Interno)     */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full overflow-hidden p-3 sm:p-4 gap-3">
        {/* 1. Área Central: O Palco Visual do Personagem */}
        <CharacterVisualStage
          visualState={visualState}
          activeCategory={CATEGORIES.find(c => c.id === activeCategory)?.label || 'Corpo'}
        />

        {/* 2. Área Inferior: Seletor de Categorias + Painel de Opções */}
        <section className="bg-[#100e16]/95 border border-amber-900/40 rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.85)] flex flex-col gap-3 shrink-0">
          {/* Barra de Abas de Categorias (Scroll Horizontal no Mobile) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar touch-pan-x border-b border-amber-900/30">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-stone-900/60 text-stone-400 border border-transparent hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-amber-400' : 'text-stone-500'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Área com Opções e Controles da Categoria Selecionada */}
          <div className="max-h-[160px] sm:max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
            <CustomizerCategoryOptions
              category={activeCategory}
              state={visualState}
              onChange={handleUpdate}
            />
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* RODAPÉ INFORMATIVO (Mobile Safe Area)                         */}
      {/* ============================================================ */}
      <footer className="px-4 py-2 bg-[#0c0a10] border-t border-amber-900/30 text-center shrink-0">
        <p className="text-[10px] text-stone-400 font-sans leading-tight">
          Protótipo visual de validação para o Helmor. As alterações são interativas e não alteram fichas salvas.
        </p>
      </footer>
    </div>
  );
};
