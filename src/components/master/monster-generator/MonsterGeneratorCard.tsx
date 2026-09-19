import React, { useState, useEffect, useRef } from 'react';
import { Sword, RefreshCw, X, Sparkles, ShieldAlert, Crosshair, Wand2, Compass, Upload, Image as ImageIcon, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MonsterGeneratorService, GeneratedMonster } from '../../../services/monsterGeneratorService';
import { CombatRole, MonsterRole, MonsterRank, CreatureType } from '../../../constants/monsterData';
import { CombatStyle, RealmorScale } from '../../../types/master';
import { GeneratedMonsterSheet } from './GeneratedMonsterSheet';
import { DEFAULT_NEUTRAL_MONSTER_IMAGE, getDefaultImageForType } from './monsterImageLibrary';
import { StorageService } from '../../../services/storageService';
import { MonsterStorageLibraryModal } from './MonsterStorageLibraryModal';
import { StorageMonster } from '../../../services/monsterStorageService';

interface MonsterGeneratorCardProps {
  onSave?: (monster: GeneratedMonster) => void;
  onClose?: () => void;
  isModal?: boolean;
  initialName?: string;
  initialImageUrl?: string;
}

export const MonsterGeneratorCard: React.FC<MonsterGeneratorCardProps> = ({ 
  onSave, 
  onClose,
  isModal = false,
  initialName = '',
  initialImageUrl
}) => {
  const [generatedMonster, setGeneratedMonster] = useState<GeneratedMonster | null>(null);

  // Nome da Criatura e Imagem (Começa vazia se não fornecido)
  const [creatureName, setCreatureName] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(initialImageUrl || '');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialName) setCreatureName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (initialImageUrl !== undefined) setSelectedImageUrl(initialImageUrl || '');
  }, [initialImageUrl]);

  const handleSelectFromLibrary = (storageMonster: StorageMonster) => {
    setSelectedImageUrl(storageMonster.url);
    if (!creatureName.trim()) {
      setCreatureName(storageMonster.name);
    }
    setNameError(null);
    setIsLibraryOpen(false);
  };

  // Generator Filters State
  const [nd, setNd] = useState('1');
  const [combatRole, setCombatRole] = useState<CombatRole>('solo');
  const [combatStyle, setCombatStyle] = useState<CombatStyle>('marcial');
  const [realmorScale, setRealmorScale] = useState<RealmorScale>('normal');
  const [role, setRole] = useState<MonsterRole>('bruto');
  const [type, setType] = useState<CreatureType>('monstro');
  const [environment, setEnvironment] = useState('floresta');
  const [theme, setTheme] = useState('sombra');

  // Upload de Imagem via StorageService existente
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uploaded = await StorageService.uploadFile(file, {
        name: cleanName,
        folder: 'monsters',
        category: 'monster',
      });

      if (uploaded && uploaded.url) {
        setSelectedImageUrl(uploaded.url);
      }
    } catch (err) {
      console.error('Erro ao fazer upload da imagem do monstro:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Suporte a tecla ESC para fechar modal de revisão ou gerador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (generatedMonster) {
          setGeneratedMonster(null);
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generatedMonster, onClose]);

  const handleGenerate = () => {
    if (!creatureName.trim()) {
      setNameError('O Nome do Monstro é obrigatório para gerar ou salvar.');
      const inputEl = document.getElementById('creature-name-input');
      inputEl?.focus();
      return;
    }
    setNameError(null);

    try {
      const monster = MonsterGeneratorService.generate({
        nd, 
        combatRole,
        combatStyle,
        realmorScale,
        rank: realmorScale as MonsterRank,
        role, 
        type, 
        environment, 
        theme
      });
      monster.name = creatureName.trim();
      monster.imageUrl = selectedImageUrl || '';
      setGeneratedMonster(monster);
    } catch (err) {
      console.error('Erro ao gerar criatura:', err);
    }
  };

  const allNds = [
    '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 'S', 'S+'
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <motion.div
        key="generator-form"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl bg-stone-950/95 border-2 border-amber-600/50 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden flex flex-col select-none"
      >
            {/* Header Compacto */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border-b border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sword size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-cinzel font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
                    Gerador de Ameaças T20 & REALMOR
                  </h3>
                  <p className="text-[10px] text-stone-400 font-cinzel italic">
                    Tabela 2-3 Oficial (Ameaças de Arton)
                  </p>
                </div>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-stone-400 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Fechar (ESC)"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Grid de Parâmetros */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* 🖼️ ÁREA DA IMAGEM & NOME DO MONSTRO */}
              <div className="p-3 bg-gradient-to-r from-stone-900/95 via-amber-950/20 to-stone-900/95 border border-gold/40 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3 sm:gap-3.5">
                  {/* Prévia pequena e discreta da imagem */}
                  <div className="shrink-0">
                    {!selectedImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setIsLibraryOpen(true)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-gold/30 hover:border-gold bg-stone-950/90 hover:bg-stone-900 transition-all flex flex-col items-center justify-center p-1 cursor-pointer text-center group shadow-sm"
                        title="Escolher imagem da Biblioteca (pasta monstro/)"
                      >
                        <BookOpen size={18} className="text-gold/60 group-hover:text-gold transition-transform group-hover:scale-110 mb-0.5" />
                        <span className="text-[9px] font-cinzel font-bold text-gold/70 group-hover:text-amber-300 leading-tight">
                          Imagem
                        </span>
                      </button>
                    ) : (
                      <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-gold/60 shadow-md bg-black">
                        <img 
                          src={selectedImageUrl} 
                          alt="Criatura" 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setIsLibraryOpen(true)}
                            className="p-1 bg-black/80 hover:bg-gold hover:text-black border border-gold/40 text-gold rounded text-[8px] font-cinzel font-bold shadow"
                            title="Trocar imagem"
                          >
                            <BookOpen size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedImageUrl('')}
                            className="p-1 bg-black/80 hover:bg-red-900 border border-red-500/40 text-red-300 rounded text-[8px] font-cinzel font-bold shadow"
                            title="Remover imagem"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campo Nome do Monstro ao lado da imagem */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="creature-name-input" className="text-[10px] sm:text-[11px] uppercase font-black text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                        <span>🏷️</span> Nome do Monstro <span className="text-red-400 font-bold">*</span>
                      </label>
                      {isUploading && (
                        <span className="text-[9px] text-amber-400 font-cinzel animate-pulse flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin" />
                          Enviando...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <input 
                        id="creature-name-input"
                        type="text"
                        value={creatureName}
                        onChange={(e) => {
                          setCreatureName(e.target.value);
                          if (nameError && e.target.value.trim()) {
                            setNameError(null);
                          }
                        }}
                        placeholder="Ex: Minotauro Furioso, Carniçal..."
                        className={`flex-1 min-w-0 bg-stone-900/90 border ${
                          nameError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-gold/30 focus:border-gold'
                        } rounded-lg px-3 py-2 text-gold font-cinzel text-xs focus:outline-none transition-colors shadow-inner`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsLibraryOpen(true)}
                        className="shrink-0 py-2 px-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/40 hover:border-gold text-gold font-cinzel text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Escolher da Biblioteca de Monstros"
                      >
                        <BookOpen size={12} />
                        <span className="hidden sm:inline">Biblioteca</span>
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="shrink-0 py-2 px-2 bg-stone-900 hover:bg-stone-800 border border-gold/30 hover:border-gold text-gold/80 font-cinzel text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        title="Upload de imagem própria"
                      >
                        <Upload size={12} />
                        <span className="hidden sm:inline">Upload</span>
                      </button>
                    </div>
                    {nameError && (
                      <p className="text-[10px] text-red-400 font-cinzel font-bold flex items-center gap-1 pt-0.5">
                        <AlertCircle size={11} className="shrink-0" />
                        <span>{nameError}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* EIXO 1: PAPEL DE COMBATE T20 (Tabela 2-3 de Ameaças de Arton) */}
              <div className="space-y-1.5 bg-amber-950/20 border border-amber-800/40 rounded p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-black text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                    <ShieldAlert size={13} className="text-amber-400" />
                    1. Papel de Combate (Tabela 2-3 Oficial)
                  </label>
                  <span className="text-[9px] font-cinzel text-amber-400/70 uppercase">
                    Ameaças de Arton
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCombatRole('solo')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatRole === 'solo'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                        : 'bg-stone-900 text-stone-300 border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    <span>⚔️ Solo</span>
                    <span className="text-[9px] opacity-80 font-normal">Tabela 2-3 A</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatRole('lacaio')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatRole === 'lacaio'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                        : 'bg-stone-900 text-stone-300 border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    <span>👥 Lacaio</span>
                    <span className="text-[9px] opacity-80 font-normal">Tabela 2-3 B</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatRole('especial')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatRole === 'especial'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                        : 'bg-stone-900 text-stone-300 border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    <span>🔮 Especial</span>
                    <span className="text-[9px] opacity-80 font-normal">Tabela 2-3 C</span>
                  </button>
                </div>
                <p className="text-[10px] text-amber-200/70 font-cinzel italic pt-1">
                  {combatRole === 'solo' && '⚔️ Solo: Criatura para combate individual (PV robusto, atributos equilibrados).'}
                  {combatRole === 'lacaio' && '👥 Lacaio: Criatura feita para grupos numerosos (alto ataque/dano, PV baixo).'}
                  {combatRole === 'especial' && '🔮 Especial: Conjuradores, líderes e suporte (foco em magias, CD de habilidades e controle).'}
                </p>
              </div>

              {/* EIXO 2 & EIXO 3: ESTILO DE COMBATE E ND */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* ND */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    2. Nível de Desafio (ND)
                  </label>
                  <select 
                    value={nd} 
                    onChange={(e) => setNd(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    {allNds.map(val => (
                      <option key={val} value={val} className="bg-stone-900 text-amber-100">ND {val}</option>
                    ))}
                  </select>
                </div>

                {/* Função Tática / Distribuição de Resistências */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Perfil de Resistências
                  </label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as MonsterRole)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="bruto" className="bg-stone-900 text-amber-100">Bruto (Fort Forte, Von Média, Ref Fraca)</option>
                    <option value="emboscador" className="bg-stone-900 text-amber-100">Emboscador (Ref Forte, Fort Média, Von Fraca)</option>
                    <option value="controlador" className="bg-stone-900 text-amber-100">Controlador (Von Forte, Fort Média, Ref Fraca)</option>
                    <option value="conjurador" className="bg-stone-900 text-amber-100">Conjurador (Von Forte, Ref Média, Fort Fraca)</option>
                    <option value="tanque" className="bg-stone-900 text-amber-100">Tanque (Fort Forte, Von Média, Ref Fraca)</option>
                    <option value="especialista" className="bg-stone-900 text-amber-100">Especialista (Ref Forte, Von Média, Fort Fraca)</option>
                  </select>
                </div>
              </div>

              {/* EIXO 3: ESTILO DE COMBATE */}
              <div className="space-y-1.5 bg-stone-900/60 border border-stone-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-black text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                    <Crosshair size={13} className="text-amber-400" />
                    3. Estilo de Combate
                  </label>
                  <span className="text-[9px] font-cinzel text-stone-400 uppercase">
                    Mecânica de Ofensiva
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCombatStyle('marcial')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'marcial'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🗡️ Marcial</span>
                    <span className="text-[9px] opacity-80 font-normal">Corpo a corpo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatStyle('atirador')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'atirador'
                        ? 'bg-blue-600 text-stone-950 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🏹 Atirador</span>
                    <span className="text-[9px] opacity-80 font-normal">À distância</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatStyle('conjurador')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'conjurador'
                        ? 'bg-purple-600 text-purple-50 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>✨ Conjurador</span>
                    <span className="text-[9px] opacity-80 font-normal">Magias & PM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatStyle('tatico')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'tatico'
                        ? 'bg-emerald-600 text-emerald-50 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🧭 Tático</span>
                    <span className="text-[9px] opacity-80 font-normal">Controle/Apoio</span>
                  </button>
                </div>
              </div>

              {/* EIXO 4: ESCALA DE PODER REALMOR */}
              <div className="space-y-1.5 bg-stone-900/50 border border-stone-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-black text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    4. Escala de Poder REALMOR
                  </label>
                  <span className="text-[9px] font-cinzel text-stone-400 uppercase">
                    Importância no Encontro
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRealmorScale('normal')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      realmorScale === 'normal'
                        ? 'bg-emerald-700 text-emerald-50 border-emerald-400 shadow-[0_0_10px_rgba(160,185,129,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🟢 Normal</span>
                    <span className="text-[9px] opacity-80 font-normal">Padrão T20</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealmorScale('elite')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      realmorScale === 'elite'
                        ? 'bg-purple-700 text-purple-50 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🟣 Elite</span>
                    <span className="text-[9px] opacity-80 font-normal">Líder / Notável</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealmorScale('chefe')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      realmorScale === 'chefe'
                        ? 'bg-red-700 text-red-50 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🔴 Chefe</span>
                    <span className="text-[9px] opacity-80 font-normal">Mecânica de Boss</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 font-cinzel italic pt-1">
                  {realmorScale === 'normal' && '🟢 Normal: Estatísticas e repertório equilibrados conforme a Tabela 2-3.'}
                  {realmorScale === 'elite' && '🟣 Elite: Espécime notável com mais opções táticas e habilidades complementares.'}
                  {realmorScale === 'chefe' && '🔴 Chefe: Inclui Ações de Chefe, Gatilho de 2ª Fase (50% PV), Reações e Resiliência Lendária.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Tipo de Criatura */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Tipo de Criatura
                  </label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as CreatureType)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="animal" className="bg-stone-900 text-amber-100">Animal</option>
                    <option value="besta" className="bg-stone-900 text-amber-100">Besta</option>
                    <option value="construto" className="bg-stone-900 text-amber-100">Construto</option>
                    <option value="demônio" className="bg-stone-900 text-amber-100">Demônio</option>
                    <option value="espírito" className="bg-stone-900 text-amber-100">Espírito</option>
                    <option value="humanoide" className="bg-stone-900 text-amber-100">Humanoide</option>
                    <option value="monstro" className="bg-stone-900 text-amber-100">Monstro</option>
                    <option value="morto-vivo" className="bg-stone-900 text-amber-100">Morto-Vivo</option>
                    <option value="planta" className="bg-stone-900 text-amber-100">Planta</option>
                  </select>
                </div>

                {/* Ambiente */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Ambiente
                  </label>
                  <select 
                    value={environment} 
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="floresta" className="bg-stone-900 text-amber-100">Floresta</option>
                    <option value="pântano" className="bg-stone-900 text-amber-100">Pântano</option>
                    <option value="montanha" className="bg-stone-900 text-amber-100">Montanha</option>
                    <option value="caverna" className="bg-stone-900 text-amber-100">Caverna</option>
                    <option value="ruínas" className="bg-stone-900 text-amber-100">Ruínas</option>
                    <option value="deserto" className="bg-stone-900 text-amber-100">Deserto</option>
                    <option value="cidade" className="bg-stone-900 text-amber-100">Cidade</option>
                    <option value="mar" className="bg-stone-900 text-amber-100">Mar</option>
                  </select>
                </div>

                {/* Tema */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Tema Elemental / Arcano
                  </label>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="sombra" className="bg-stone-900 text-amber-100">Sombra</option>
                    <option value="fogo" className="bg-stone-900 text-amber-100">Fogo</option>
                    <option value="gelo" className="bg-stone-900 text-amber-100">Gelo</option>
                    <option value="veneno" className="bg-stone-900 text-amber-100">Veneno</option>
                    <option value="arcano" className="bg-stone-900 text-amber-100">Arcano</option>
                    <option value="sagrado" className="bg-stone-900 text-amber-100">Sagrado</option>
                    <option value="profano" className="bg-stone-900 text-amber-100">Profano</option>
                    <option value="natureza" className="bg-stone-900 text-amber-100">Natureza</option>
                  </select>
                </div>
              </div>

              {/* Botão de Geração Final */}
              <div className="pt-2">
                <button 
                  id="btn-trigger-generate-monster"
                  type="button"
                  onClick={handleGenerate} 
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-stone-950 font-cinzel font-black text-xs uppercase tracking-widest rounded border border-amber-400/60 shadow-[0_0_20px_rgba(217,119,6,0.3)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Sword size={15} className="text-stone-950" />
                  <span>Gerar Criatura</span>
                </button>
              </div>
            </div>
          </motion.div>

      {/* Janela / Modal de Confirmação da Criatura Gerada (85–90% da largura em Desktop) */}
      <AnimatePresence>
        {generatedMonster && (
          <div 
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setGeneratedMonster(null);
              }
            }}
          >
            <motion.div
              key="generated-sheet-modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.15 }}
              className="w-[96vw] sm:w-[92vw] lg:w-[88vw] xl:w-[88vw] 2xl:w-[86vw] max-w-[1700px] h-[90vh] sm:h-[92vh] max-h-[92vh] flex flex-col overflow-hidden select-text"
              onClick={(e) => e.stopPropagation()}
            >
              <GeneratedMonsterSheet 
                monster={generatedMonster} 
                onReroll={handleGenerate}
                onSave={onSave ? () => {
                  if (!generatedMonster.name || !generatedMonster.name.trim()) {
                    alert('O Nome do Monstro é obrigatório para salvar.');
                    return;
                  }
                  onSave(generatedMonster);
                  setGeneratedMonster(null);
                } : undefined}
                onClose={() => setGeneratedMonster(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal da Biblioteca de Monstros (Storage monstro/) */}
      <MonsterStorageLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectFromLibrary}
        combatRole={combatRole}
        scale={realmorScale}
      />
    </div>
  );
};
