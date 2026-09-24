import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CharacterService } from '../services/characterService';
import { T20Character } from '../types/t20';
import { CharacterCustomizerModal } from '../components/character/customizer/CharacterCustomizerModal';
import { CharacterSelectionStage3D } from '../components/character/CharacterSelectionStage3D';
import { 
  Plus, 
  User, 
  Loader2, 
  Sword, 
  AlertTriangle,
  Sparkles,
  Scroll,
  Copy,
  Trash2,
  ChevronRight,
  Shield,
  Heart,
  Zap,
  MoreVertical,
  Layers
} from 'lucide-react';
import { RealmorLoading } from '../components/common/RealmorLoading';

// Modelos 3D padrão do sistema quando o usuário ainda não possui personagens cadastrados
const DEFAULT_3D_HEROES = [
  {
    id: 'template_guerreiro',
    name: 'Guerreiro de Valkaria',
    raceName: 'Humano',
    className: 'Guerreiro',
    level: 1,
    avatarId: 'guerreiro',
    avatarModelPath: '3d/anaogrande-v1.glb',
    avatarType: '3d' as const,
    imageUrl: '',
    isTemplate: true
  },
  {
    id: 'template_arcanista',
    name: 'Arcanista Místico',
    raceName: 'Elfo',
    className: 'Arcanista',
    level: 1,
    avatarId: 'arcanista',
    avatarModelPath: '3d/Arcanista-v1.glb',
    avatarType: '3d' as const,
    imageUrl: '',
    isTemplate: true
  },
  {
    id: 'template_clerigo',
    name: 'Clérigo da Luz',
    raceName: 'Humano',
    className: 'Clérigo',
    level: 1,
    avatarId: 'clerigo',
    avatarModelPath: '3d/Clerigo-v1.glb',
    avatarType: '3d' as const,
    imageUrl: '',
    isTemplate: true
  },
  {
    id: 'template_inventor',
    name: 'Inventor Engenhoso',
    raceName: 'Anão',
    className: 'Inventor',
    level: 1,
    avatarId: 'inventor',
    avatarModelPath: '3d/skeleto-v1.glb',
    avatarType: '3d' as const,
    imageUrl: '',
    isTemplate: true
  }
];

export const CharacterListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [characters, setCharacters] = useState<(T20Character & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Modal de Exclusão
  const [charToDelete, setCharToDelete] = useState<(T20Character & { id: string }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carrega personagens do usuário via listener em tempo real
  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      const unsubscribe = CharacterService.subscribeToUserCharacters(user.uid, (chars) => {
        setCharacters(chars);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Lista de slots (SEMPRE 4 SLOTS)
  const slotsData = useMemo(() => {
    // Se o usuário tem personagens criados no Firestore
    if (characters.length > 0) {
      const slots: Array<any> = [];
      for (let i = 0; i < 4; i++) {
        if (i < characters.length) {
          slots.push({
            ...characters[i],
            isEmpty: false,
            isTemplate: false,
            modelPath: (characters[i] as any).avatarModelPath || '3d/anaogrande-v1.glb'
          });
        } else {
          slots.push({
            id: `empty_slot_${i}`,
            isEmpty: true
          });
        }
      }
      return slots;
    }

    // Se ainda não tiver personagens criados, usa os modelos 3D do projeto nos primeiros slots
    return [
      {
        ...DEFAULT_3D_HEROES[0],
        isEmpty: false,
        modelPath: DEFAULT_3D_HEROES[0].avatarModelPath
      },
      {
        ...DEFAULT_3D_HEROES[1],
        isEmpty: false,
        modelPath: DEFAULT_3D_HEROES[1].avatarModelPath
      },
      {
        id: 'empty_slot_2',
        isEmpty: true
      },
      {
        id: 'empty_slot_3',
        isEmpty: true
      }
    ];
  }, [characters]);

  // Personagem ativo selecionado atualmente
  const activeCharacter = useMemo(() => {
    const candidate = slotsData[selectedSlotIndex];
    if (candidate && !candidate.isEmpty) {
      return candidate;
    }
    // Fallback para o primeiro slot preenchido
    return slotsData.find(s => !s.isEmpty) || slotsData[0];
  }, [slotsData, selectedSlotIndex]);

  // Ação de duplicar personagem
  const handleDuplicate = async (char: any) => {
    if (!user || char.isTemplate) return;
    try {
      await CharacterService.duplicateCharacter(user.uid, char);
      setShowActionsMenu(false);
    } catch (err) {
      console.error('Erro ao duplicar personagem:', err);
    }
  };

  // Ação de confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!charToDelete) return;
    setIsDeleting(true);
    try {
      await CharacterService.deleteCharacter(charToDelete.id);
      setCharToDelete(null);
      setSelectedSlotIndex(0);
    } catch (err) {
      console.error('Erro ao excluir personagem:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Se não autenticado
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-black/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(217,119,6,0.3)]">
          <User size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-cinzel text-gold-gradient font-bold uppercase tracking-widest">
            Acesso Restrito
          </h2>
          <p className="text-amber-200/60 text-xs sm:text-sm italic max-w-xs font-serif">
            "Apenas personagens registrados no grande grimório podem ver suas crônicas."
          </p>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-stone-950 font-cinzel font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          Acessar Codex / Entrar
        </button>
      </div>
    );
  }

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 animate-in fade-in duration-300">
        <RealmorLoading message="Conjurando salão de heróis..." subtitle="Sincronizando modelos 3D de Arton" size="md" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] max-w-lg mx-auto flex flex-col justify-between overflow-hidden px-2 sm:px-4 py-2 sm:py-3 select-none">
      
      {/* ============================================================ */}
      {/* CENÁRIO GÓTICO MEDIEVAL DE FUNDO (Catedral, Pilares & Tochas) */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Fundo com gradiente atmosférico profundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08070c] via-[#0e0c14] to-[#060509]" />

        {/* Arco Gótico & Janela Central ao Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[420px] h-[360px] opacity-15">
          <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-500 fill-none" strokeWidth="1.5">
            {/* Arco Ogival */}
            <path d="M 50 350 L 50 180 C 50 80, 200 20, 200 20 C 200 20, 350 80, 350 180 L 350 350" />
            <path d="M 80 350 L 80 190 C 80 110, 200 55, 200 55 C 200 55, 320 110, 320 190 L 320 350" strokeWidth="0.8" />
            {/* Rosácea Central */}
            <circle cx="200" cy="150" r="55" strokeWidth="1" />
            <circle cx="200" cy="150" r="38" strokeWidth="0.6" strokeDasharray="3 3" />
            <line x1="200" y1="95" x2="200" y2="205" strokeWidth="0.8" />
            <line x1="145" y1="150" x2="255" y2="150" strokeWidth="0.8" />
            <line x1="161" y1="111" x2="239" y2="189" strokeWidth="0.6" />
            <line x1="161" y1="189" x2="239" y2="111" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Pilares Góticos Laterais */}
        <div className="absolute top-10 left-0 w-16 sm:w-24 h-full bg-gradient-to-r from-black via-[#14121a]/80 to-transparent border-r border-amber-900/10 opacity-70" />
        <div className="absolute top-10 right-0 w-16 sm:w-24 h-full bg-gradient-to-l from-black via-[#14121a]/80 to-transparent border-l border-amber-900/10 opacity-70" />

        {/* Estandartes Solares de Arton (Esquerda e Direita ao fundo) */}
        <div className="absolute top-20 left-2 sm:left-4 w-7 sm:w-9 h-32 sm:h-44 bg-gradient-to-b from-[#6b1414]/70 to-[#300a0a]/80 border-x border-b border-amber-600/30 rounded-b-sm shadow-xl flex flex-col items-center pt-3 opacity-60">
          <div className="w-4 h-4 rounded-full border border-amber-400/60 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
          </div>
          <div className="w-0.5 h-12 bg-amber-400/30 mt-2" />
        </div>

        <div className="absolute top-20 right-2 sm:right-4 w-7 sm:w-9 h-32 sm:h-44 bg-gradient-to-b from-[#6b1414]/70 to-[#300a0a]/80 border-x border-b border-amber-600/30 rounded-b-sm shadow-xl flex flex-col items-center pt-3 opacity-60">
          <div className="w-4 h-4 rounded-full border border-amber-400/60 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
          </div>
          <div className="w-0.5 h-12 bg-amber-400/30 mt-2" />
        </div>

        {/* Brilho das Tochas em Arandelas */}
        <div className="absolute top-52 left-2 sm:left-6 w-12 h-12 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
        <div className="absolute top-52 right-2 sm:right-6 w-12 h-12 rounded-full bg-amber-500/20 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Vinheta Escura Inferior para Dar Destaque aos Slots */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* ============================================================ */}
      {/* 1. TOPO: TÍTULO COM ROSA DOS VENTOS DOURADA & ORNAMENTOS     */}
      {/* ============================================================ */}
      <header className="relative z-20 text-center pt-1 sm:pt-2 pb-1 space-y-1">
        {/* Rosa dos Ventos / Emblema Dourado no Topo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="relative flex items-center justify-center w-6 h-6 text-amber-400">
            {/* Símbolo Solar / Bússola Rúnica Nobre */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-400 stroke-amber-200" strokeWidth="0.5">
              <polygon points="12,1 14.5,9.5 23,12 14.5,14.5 12,23 9.5,14.5 1,12 9.5,9.5" />
              <circle cx="12" cy="12" r="3.5" className="fill-[#0c0a10] stroke-amber-400" strokeWidth="1" />
              <circle cx="12" cy="12" r="1.5" className="fill-amber-300" />
            </svg>
          </div>
          <div className="w-8 sm:w-12 h-[1px] bg-gradient-to-l from-transparent via-amber-500/60 to-transparent" />
        </div>

        {/* Título Centralizado em Duas Linhas Nobres */}
        <div className="space-y-0.5">
          <h2 className="text-xs sm:text-sm font-cinzel font-semibold tracking-[0.3em] uppercase text-amber-300/80 drop-shadow-sm">
            Seleção de
          </h2>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-cinzel font-black tracking-[0.22em] uppercase text-gold-gradient drop-shadow-[0_2px_12px_rgba(217,119,6,0.35)]">
            Personagens
          </h1>
        </div>

        {/* Ornamento Losango Dourado com Hastes */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-amber-500/50" />
          <div className="w-1.5 h-1.5 rotate-45 border border-amber-400 bg-amber-500/60 shadow-[0_0_6px_rgba(217,119,6,0.8)]" />
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. ÁREA PRINCIPAL: VISUALIZADOR 3D CENTRAL & INFO DO HERÓI   */}
      {/* ============================================================ */}
      <main className="relative flex-1 w-full min-h-[340px] sm:min-h-[420px] flex flex-col items-center justify-center my-1">
        {/* Palco 3D WebGL em Alta Resolução com OrbitControls */}
        <div className="w-full h-full flex-1 relative flex items-center justify-center">
          <CharacterSelectionStage3D
            modelPath={activeCharacter?.modelPath || activeCharacter?.avatarModelPath || '3d/anaogrande-v1.glb'}
            characterName={activeCharacter?.name || 'Herói'}
          />
        </div>

        {/* Cartão Flutuante Superior com Nome e Atributos Rápidos do Herói */}
        {activeCharacter && !activeCharacter.isEmpty && (
          <div className="absolute top-2 left-2 right-2 sm:left-4 sm:right-4 z-15 pointer-events-auto flex items-center justify-between">
            {/* Badge do Herói */}
            <div className="px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-amber-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-2.5 max-w-[70%]">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-cinzel font-bold text-xs shrink-0">
                {activeCharacter.level || 1}
              </div>
              <div className="truncate">
                <h3 className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 truncate leading-tight">
                  {activeCharacter.name || 'Herói Sem Nome'}
                </h3>
                <p className="text-[10px] text-stone-400 truncate">
                  {activeCharacter.raceName || 'Raça'} • {activeCharacter.className || 'Classe'}
                </p>
              </div>
            </div>

            {/* Menu Rápido de Ações */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(prev => !prev)}
                className="p-2 rounded-xl bg-black/75 backdrop-blur-md border border-amber-900/50 text-amber-300 hover:text-amber-100 hover:border-amber-500/60 transition-all cursor-pointer shadow-lg"
                title="Opções do Herói"
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown de Ações */}
              {showActionsMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(false)} />
                  <div className="absolute right-0 top-11 w-44 bg-[#121019] border border-amber-700/50 rounded-xl shadow-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95">
                    {/* Abrir Ficha */}
                    {!activeCharacter.isTemplate ? (
                      <button
                        onClick={() => {
                          setShowActionsMenu(false);
                          navigate(`/characters/${activeCharacter.id}`);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-cinzel text-amber-200 hover:bg-amber-500/15 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Scroll size={14} className="text-amber-400" />
                        <span>Abrir Ficha</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowActionsMenu(false);
                          navigate('/characters/sheet');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-cinzel text-amber-200 hover:bg-amber-500/15 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus size={14} className="text-amber-400" />
                        <span>Criar Esta Ficha</span>
                      </button>
                    )}

                    {/* Duplicar */}
                    {!activeCharacter.isTemplate && (
                      <button
                        onClick={() => handleDuplicate(activeCharacter)}
                        className="w-full text-left px-3 py-2 text-xs font-cinzel text-stone-300 hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Copy size={14} className="text-stone-400" />
                        <span>Duplicar Ficha</span>
                      </button>
                    )}

                    {/* Excluir */}
                    {!activeCharacter.isTemplate && (
                      <button
                        onClick={() => {
                          setShowActionsMenu(false);
                          setCharToDelete(activeCharacter);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-cinzel text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-2 transition-colors border-t border-amber-900/30 mt-1 cursor-pointer"
                      >
                        <Trash2 size={14} className="text-red-400" />
                        <span>Excluir</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Botão de Ação Primária Central "JOGAR COM ESTE HERÓI" */}
        <div className="absolute bottom-3 inset-x-4 z-15 pointer-events-auto flex items-center justify-center gap-2">
          {!activeCharacter?.isTemplate && activeCharacter?.id ? (
            <button
              onClick={() => navigate(`/characters/${activeCharacter.id}`)}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(217,119,6,0.45)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sword size={16} />
              <span>Jogar com {activeCharacter.name.split(' ')[0]}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/characters/sheet')}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(217,119,6,0.45)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Criar Novo Personagem</span>
            </button>
          )}
        </div>
      </main>

      {/* ============================================================ */}
      {/* 3. PARTE INFERIOR: SEMPRE 4 SLOTS DE PERSONAGENS COM MOLDURA  */}
      {/* ============================================================ */}
      <footer className="relative z-20 w-full pt-1 pb-2">
        {/* Divisor Rúnico Inferior */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-amber-500/40" />
          <div className="w-1 h-1 rotate-45 bg-amber-400/70" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-amber-500/40" />
        </div>

        {/* Grade com SEMPRE 4 Slots Retangulares no Formato Mobile Vertical */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 px-1">
          {slotsData.map((slot, index) => {
            const isSelected = selectedSlotIndex === index && !slot.isEmpty;
            const isEmptySlot = slot.isEmpty;

            return (
              <button
                key={slot.id || `slot_${index}`}
                type="button"
                onClick={() => {
                  if (isEmptySlot) {
                    navigate('/characters/sheet');
                  } else {
                    setSelectedSlotIndex(index);
                  }
                }}
                className={`relative aspect-[3/4] rounded-xl transition-all duration-300 flex flex-col items-center justify-between p-1 sm:p-1.5 group cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-amber-400 border-2 border-amber-300 bg-gradient-to-b from-amber-950/80 to-[#120e17] shadow-[0_0_25px_rgba(217,119,6,0.65),inset_0_0_15px_rgba(217,119,6,0.3)] scale-[1.03] z-10'
                    : isEmptySlot
                    ? 'border-2 border-dashed border-stone-800 hover:border-amber-700/50 bg-[#0e0c12]/60 hover:bg-[#14121a]/80 opacity-65 hover:opacity-100'
                    : 'border-2 border-amber-900/40 hover:border-amber-600/70 bg-gradient-to-b from-stone-900/90 to-[#0c0a10] opacity-80 hover:opacity-100 shadow-lg'
                }`}
              >
                {/* Marcador Superior Dourado no Slot Ativo (Losango iluminado) */}
                {isSelected && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-amber-400 border border-amber-200 shadow-[0_0_8px_rgba(251,191,36,1)] z-20" />
                )}

                {/* Cantos Ornamentados Góticos */}
                <div className={`absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l ${isSelected ? 'border-amber-300' : 'border-amber-700/40'}`} />
                <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r ${isSelected ? 'border-amber-300' : 'border-amber-700/40'}`} />
                <div className={`absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l ${isSelected ? 'border-amber-300' : 'border-amber-700/40'}`} />
                <div className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r ${isSelected ? 'border-amber-300' : 'border-amber-700/40'}`} />

                {/* Conteúdo do Slot */}
                {!isEmptySlot ? (
                  <>
                    {/* Imagem / Avatar do Personagem ou Visualizador Estilizado */}
                    <div className="w-full flex-1 rounded-lg overflow-hidden relative flex items-center justify-center bg-black/40">
                      {slot.imageUrl ? (
                        <img
                          src={slot.imageUrl}
                          alt={slot.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-amber-400/80">
                          <Sword size={22} className={isSelected ? 'text-amber-300 scale-110' : 'text-stone-500'} />
                          <span className="text-[8px] font-mono uppercase tracking-tighter text-amber-400 mt-1">3D</span>
                        </div>
                      )}

                      {/* Gradiente de Sombra Inferior no Card */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                      {/* Badge de Nível */}
                      <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/70 border border-amber-500/40 text-[9px] font-cinzel text-amber-300 font-bold">
                        N{slot.level || 1}
                      </div>
                    </div>

                    {/* Nome do Personagem no Slot */}
                    <div className="w-full text-center pt-1 truncate">
                      <span className={`text-[10px] sm:text-[11px] font-cinzel font-bold block truncate leading-tight ${
                        isSelected ? 'text-amber-200 drop-shadow' : 'text-stone-400'
                      }`}>
                        {slot.name.split(' ')[0]}
                      </span>
                    </div>
                  </>
                ) : (
                  /* Slot Vazio */
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-1.5 text-stone-600 group-hover:text-amber-400 transition-colors p-1">
                    <div className="w-7 h-7 rounded-full border border-dashed border-stone-700 group-hover:border-amber-500/60 flex items-center justify-center transition-colors">
                      <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[9px] font-cinzel font-semibold uppercase tracking-wider text-stone-500 group-hover:text-amber-300 transition-colors">
                      Vazio
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODAIS AUXILIARES (Exclusão & Personalização)                 */}
      {/* ============================================================ */}
      <CharacterCustomizerModal
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
      />

      {charToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isDeleting && setCharToDelete(null)}
        >
          <div 
            className="bg-[#100e16] border border-red-900/60 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.95)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-cinzel text-sm font-bold text-red-300 uppercase">
                  Excluir Personagem
                </h4>
                <p className="text-[11px] text-stone-400">
                  Esta ação é irreversível
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Tem certeza que deseja apagar a crônica de <span className="font-bold text-amber-200 font-cinzel">{charToDelete.name}</span>?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setCharToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-cinzel font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-cinzel font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterListPage;
