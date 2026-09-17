import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Heart, 
  Droplet, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  Minus, 
  Check, 
  Award,
  Search,
  User,
  Sword
} from 'lucide-react';
import { GamePlayer } from '../../types/game';
import { T20_CONDITIONS, T20ConditionDef } from '../../data/t20Conditions';
import { normalizeCharacterSheet } from '../../utils/sheetCalculations';

interface MasterPlayerControlModalProps {
  player: GamePlayer | null;
  character: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCharacter: (charId: string, partial: Record<string, any>) => void;
}

export const MasterPlayerControlModal: React.FC<MasterPlayerControlModalProps> = ({
  player,
  character,
  isOpen,
  onClose,
  onUpdateCharacter
}) => {
  if (!isOpen || !player) return null;

  const charId = character?.id || player.characterId;
  const normalized = useMemo(() => {
    if (!character) return null;
    return normalizeCharacterSheet(character, charId || '');
  }, [character, charId]);

  // Valores locais para feedback instantâneo na interface
  const maxPV = normalized?.maxPV || 20;
  const maxPM = normalized?.maxPM || 10;

  const [currentPV, setCurrentPV] = useState<number>(() => {
    if (normalized?.currentPV !== undefined) return normalized.currentPV;
    if (character?.currentPV !== undefined) return Number(character.currentPV);
    return maxPV;
  });

  const [currentPM, setCurrentPM] = useState<number>(() => {
    if (normalized?.currentPM !== undefined) return normalized.currentPM;
    if (character?.currentPM !== undefined) return Number(character.currentPM);
    return maxPM;
  });

  const [conditions, setConditions] = useState<string[]>(() => {
    return normalized?.conditions || character?.conditions || [];
  });

  const [customXp, setCustomXp] = useState<string>('');
  const [xpReason, setXpReason] = useState<string>('');
  const [conditionSearch, setConditionSearch] = useState<string>('');
  const [isAddingCondition, setIsAddingCondition] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'conditions' | 'xp'>('resources');

  // Sincroniza estado local quando o character externo for atualizado via listener (sem sobrescrever se houver edição pendente)
  useEffect(() => {
    if (normalized) {
      setCurrentPV(normalized.currentPV);
      setCurrentPM(normalized.currentPM);
      setConditions(normalized.conditions || []);
    }
  }, [normalized?.currentPV, normalized?.currentPM, normalized?.conditions]);

  // Alteração de PV com disparo para o callback debounced
  const handleAdjustPV = (delta: number) => {
    if (!charId) return;
    const nextPV = Math.min(maxPV + 50, Math.max(0, currentPV + delta));
    setCurrentPV(nextPV);
    onUpdateCharacter(charId, { currentPV: nextPV });
  };

  const handleSetPV = (val: number) => {
    if (!charId) return;
    const nextPV = Math.min(maxPV + 50, Math.max(0, val));
    setCurrentPV(nextPV);
    onUpdateCharacter(charId, { currentPV: nextPV });
  };

  // Alteração de PM com disparo para o callback debounced
  const handleAdjustPM = (delta: number) => {
    if (!charId) return;
    const nextPM = Math.min(maxPM + 50, Math.max(0, currentPM + delta));
    setCurrentPM(nextPM);
    onUpdateCharacter(charId, { currentPM: nextPM });
  };

  const handleSetPM = (val: number) => {
    if (!charId) return;
    const nextPM = Math.min(maxPM + 50, Math.max(0, val));
    setCurrentPM(nextPM);
    onUpdateCharacter(charId, { currentPM: nextPM });
  };

  // Conceder XP
  const handleGrantXp = (amount: number, reasonText?: string) => {
    if (!charId || amount <= 0) return;
    const currentTotalXp = Number(character?.xp ?? character?.xpTotal ?? 0);
    const newTotalXp = currentTotalXp + amount;
    
    const newEntry = {
      id: `xp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      characterId: charId,
      characterName: normalized?.name || player.characterName || 'Personagem',
      amount,
      previousXp: currentTotalXp,
      newXp: newTotalXp,
      reason: reasonText?.trim() || `Concedido pelo Mestre (+${amount} XP)`,
      createdAt: new Date().toISOString(),
      createdBy: 'master'
    };

    const existingHistory = Array.isArray(character?.xpHistory) ? character.xpHistory : [];
    const updatedHistory = [newEntry, ...existingHistory];

    onUpdateCharacter(charId, {
      xp: newTotalXp,
      xpTotal: newTotalXp,
      xpHistory: updatedHistory
    });

    setCustomXp('');
    setXpReason('');
  };

  // Alternar / Adicionar / Remover Condição
  const handleToggleCondition = (condNameOrId: string) => {
    if (!charId) return;
    const isPresent = conditions.includes(condNameOrId);
    let nextList: string[];
    if (isPresent) {
      nextList = conditions.filter(c => c !== condNameOrId);
    } else {
      nextList = [...conditions, condNameOrId];
    }
    setConditions(nextList);
    onUpdateCharacter(charId, { conditions: nextList });
  };

  const filteredConditions = useMemo(() => {
    if (!conditionSearch.trim()) return T20_CONDITIONS;
    const term = conditionSearch.toLowerCase().trim();
    return T20_CONDITIONS.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.shortDesc.toLowerCase().includes(term)
    );
  }, [conditionSearch]);

  const avatarUrl = player.characterAvatar || character?.imageUrl || '';
  const charName = normalized?.name || player.characterName || 'Aventureiro';
  const className = normalized?.className || player.characterClass || 'Classe';
  const level = normalized?.level || player.characterLevel || 1;
  const raceName = normalized?.raceName || player.characterRace || '';

  const hpPercent = Math.min(100, Math.max(0, Math.round((currentPV / Math.max(1, maxPV)) * 100)));
  const pmPercent = Math.min(100, Math.max(0, Math.round((currentPM / Math.max(1, maxPM)) * 100)));

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-stone-950 border border-amber-700/70 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: 'radial-gradient(ellipse at top, rgba(217, 119, 6, 0.08) 0%, transparent 80%)'
        }}
      >
        {/* Cabeçalho do Card */}
        <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-amber-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-stone-900 border border-amber-600/50 overflow-hidden shrink-0 flex items-center justify-center text-amber-400 shadow-md">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={charName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sword size={24} className="text-amber-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-500">⚔️</span>
                <h3 className="font-cinzel font-black text-base text-amber-100 truncate tracking-wide">
                  {charName}
                </h3>
              </div>
              <p className="text-xs text-stone-300 font-medium truncate">
                {className} • Nível {level} {raceName ? `(${raceName})` : ''}
              </p>
              <p className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                <User size={10} />
                <span>Jogador: <strong className="text-stone-400">{player.displayName}</strong></span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-amber-950/60 border border-amber-900/40 text-stone-400 hover:text-amber-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas de Navegação Compactas */}
        <div className="flex border-b border-amber-900/30 bg-stone-950 font-cinzel text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'resources'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <Heart size={14} className="text-red-400" />
            <span>Recursos (PV / PM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'conditions'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span>Condições ({conditions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('xp')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'xp'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <Award size={14} className="text-purple-400" />
            <span>Conceder XP</span>
          </button>
        </div>

        {/* Corpo do Painel */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh]">
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {/* CONTROLE DE PV (PONTOS DE VIDA) */}
              <div className="p-3.5 rounded-xl bg-stone-900/70 border border-red-950/80 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-red-400 uppercase tracking-wider">
                    <Heart size={14} className="fill-red-500/20" /> Pontos de Vida (PV)
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-200">
                    {currentPV} / {maxPV} PV
                  </span>
                </div>

                {/* Barra Visual de PV */}
                <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-red-950/70">
                  <div 
                    className="h-full bg-gradient-to-r from-red-700 via-red-500 to-red-600 rounded-full transition-all duration-200"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>

                {/* Botões de Ajuste Rápido PV: [-5] [-1] [Input] [+1] [+5] */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustPV(-5)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-red-950/60 border border-red-900/50 text-red-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Diminuir 5 PV"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustPV(-1)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-red-950/60 border border-red-900/50 text-red-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Diminuir 1 PV"
                  >
                    -1
                  </button>

                  {/* Input Direto de PV */}
                  <input
                    type="number"
                    value={currentPV}
                    onChange={(e) => handleSetPV(parseInt(e.target.value) || 0)}
                    className="w-16 py-1 px-1.5 text-center font-mono font-bold text-xs bg-stone-950 border border-amber-700/60 rounded-lg text-amber-200 focus:outline-none focus:border-amber-400"
                  />

                  <button
                    type="button"
                    onClick={() => handleAdjustPV(1)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-emerald-950/60 border border-emerald-900/50 text-emerald-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Aumentar 1 PV"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustPV(5)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-emerald-950/60 border border-emerald-900/50 text-emerald-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Aumentar 5 PV"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* CONTROLE DE PM (PONTOS DE MANA) */}
              <div className="p-3.5 rounded-xl bg-stone-900/70 border border-blue-950/80 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-blue-400 uppercase tracking-wider">
                    <Droplet size={14} className="fill-blue-500/20" /> Pontos de Mana (PM)
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-200">
                    {currentPM} / {maxPM} PM
                  </span>
                </div>

                {/* Barra Visual de PM */}
                <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-blue-950/70">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600 rounded-full transition-all duration-200"
                    style={{ width: `${pmPercent}%` }}
                  />
                </div>

                {/* Botões de Ajuste Rápido PM: [-5] [-1] [Input] [+1] [+5] */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustPM(-5)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-blue-950/60 border border-blue-900/50 text-blue-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Diminuir 5 PM"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustPM(-1)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-blue-950/60 border border-blue-900/50 text-blue-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Diminuir 1 PM"
                  >
                    -1
                  </button>

                  {/* Input Direto de PM */}
                  <input
                    type="number"
                    value={currentPM}
                    onChange={(e) => handleSetPM(parseInt(e.target.value) || 0)}
                    className="w-16 py-1 px-1.5 text-center font-mono font-bold text-xs bg-stone-950 border border-amber-700/60 rounded-lg text-amber-200 focus:outline-none focus:border-amber-400"
                  />

                  <button
                    type="button"
                    onClick={() => handleAdjustPM(1)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-cyan-950/60 border border-cyan-900/50 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Aumentar 1 PM"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustPM(5)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-950 hover:bg-cyan-950/60 border border-cyan-900/50 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                    title="Aumentar 5 PM"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Botões de Ação de Cura e Descanso Completo */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleSetPV(maxPV);
                    handleSetPM(maxPM);
                  }}
                  className="flex-1 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/50 text-amber-200 font-cinzel font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Descanso Pleno (100% PV/PM)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="space-y-3">
              {/* Condições Atuais do Personagem */}
              <div>
                <label className="text-[11px] font-cinzel font-bold text-amber-400 block uppercase tracking-wider mb-1.5">
                  Condições Ativas no Momento:
                </label>
                {conditions.length === 0 ? (
                  <p className="text-xs text-stone-500 italic p-3 rounded-lg bg-stone-900/40 border border-stone-800 text-center">
                    Nenhuma condição debilitante ativa.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {conditions.map((cond) => {
                      const def = T20_CONDITIONS.find(c => c.id === cond.toLowerCase() || c.name.toLowerCase() === cond.toLowerCase());
                      const label = def?.name || cond;
                      return (
                        <span
                          key={cond}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-red-200 text-xs font-medium shadow-sm"
                        >
                          <span>{label}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleCondition(cond)}
                            className="text-red-400 hover:text-red-100 p-0.5 rounded hover:bg-red-900/50 transition-colors cursor-pointer"
                            title="Remover condição"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Adicionar Nova Condição (Lista de Tormenta 20) */}
              <div className="pt-2 border-t border-amber-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-cinzel font-bold text-stone-300 uppercase tracking-wider">
                    Catálogo de Condições (T20):
                  </span>
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Filtrar condições (ex: Abalado, Caído, Cego)..."
                    value={conditionSearch}
                    onChange={(e) => setConditionSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-900 border border-amber-900/40 text-stone-200 placeholder:text-stone-600 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 p-1 custom-scrollbar">
                  {filteredConditions.map((condDef) => {
                    const isActive = conditions.some(c => c.toLowerCase() === condDef.id || c.toLowerCase() === condDef.name.toLowerCase());
                    return (
                      <button
                        key={condDef.id}
                        type="button"
                        onClick={() => handleToggleCondition(condDef.name)}
                        className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isActive
                            ? 'bg-red-950/60 border-red-600/70 text-red-200 font-bold'
                            : 'bg-stone-900/50 border-stone-800/80 text-stone-300 hover:border-amber-800/60 hover:bg-stone-900'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-200">{condDef.name}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-stone-950 text-stone-400 uppercase">
                              {condDef.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 truncate">
                            {condDef.shortDesc}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs">
                          {isActive ? '✓ Ativa' : '+ Adicionar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'xp' && (
            <div className="space-y-3">
              {/* Botões de XP Rápido: [+100] [+500] [+1000] */}
              <div>
                <label className="text-[11px] font-cinzel font-bold text-amber-400 block uppercase tracking-wider mb-2">
                  Atalhos de Recompensa de XP:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGrantXp(100, 'Combate / Vitória')}
                    className="py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-purple-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <span>⭐ +100 XP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGrantXp(500, 'Superação de Desafio')}
                    className="py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-purple-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <span>⭐ +500 XP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGrantXp(1000, 'Missão Cumprida')}
                    className="py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-purple-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <span>⭐ +1000 XP</span>
                  </button>
                </div>
              </div>

              {/* Concessão de XP Personalizada */}
              <div className="pt-2 border-t border-amber-900/30 space-y-2">
                <label className="text-[11px] font-cinzel font-bold text-stone-300 block uppercase tracking-wider">
                  Valor Personalizado de XP:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Ex: 350"
                    value={customXp}
                    onChange={(e) => setCustomXp(e.target.value)}
                    className="w-28 px-3 py-2 rounded-lg bg-stone-900 border border-amber-900/50 text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Motivo (opcional: Derrotou o ogro...)"
                    value={xpReason}
                    onChange={(e) => setXpReason(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-amber-900/50 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={!customXp || parseInt(customXp) <= 0}
                  onClick={() => handleGrantXp(parseInt(customXp) || 0, xpReason)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white font-cinzel font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Award size={15} />
                  <span>Conceder {customXp ? `+${customXp} XP` : 'XP'}</span>
                </button>
              </div>

              <div className="p-2 rounded-lg bg-stone-900/40 border border-stone-800 text-[11px] text-stone-400 font-cinzel text-center">
                Total Acumulado na Ficha: <strong className="text-purple-300">{normalized?.xpTotal || character?.xp || 0} XP</strong>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botão Fechar */}
        <div className="p-3 bg-stone-900/70 border-t border-amber-900/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 border border-amber-900/50 text-amber-200 font-cinzel font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            [ FECHAR ]
          </button>
        </div>
      </div>
    </div>
  );
};
