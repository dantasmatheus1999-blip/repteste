import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Star, 
  Sparkles, 
  Backpack, 
  BookOpen, 
  ChevronLeft, 
  Loader2,
  AlertCircle,
  FileText,
  Flame
} from 'lucide-react';
import { CharacterService } from '../services/characterService';
import { 
  normalizeCharacterSheet, 
  NormalizedSheetData 
} from '../utils/sheetCalculations';
import { Attribute } from '../types/character';
import { SheetHeader } from '../components/character/sheet/SheetHeader';
import { SheetCombatBar } from '../components/character/sheet/SheetCombatBar';
import { SheetAttributes } from '../components/character/sheet/SheetAttributes';
import { SheetResistances } from '../components/character/sheet/SheetResistances';
import { SheetSkills } from '../components/character/sheet/SheetSkills';
import { SheetAttacks } from '../components/character/sheet/SheetAttacks';
import { SheetPowers } from '../components/character/sheet/SheetPowers';
import { SheetSpells } from '../components/character/sheet/SheetSpells';
import { SheetInventory } from '../components/character/sheet/SheetInventory';
import { SheetBiography } from '../components/character/sheet/SheetBiography';
import { RealmorLoading } from '../components/common/RealmorLoading';
import { SheetConditionsModal } from '../components/character/sheet/SheetConditionsModal';
import { SheetRestModal } from '../components/character/sheet/SheetRestModal';
import { SheetDiceRoller } from '../components/character/sheet/SheetDiceRoller';
import { SheetLevelUpModal } from '../components/character/sheet/SheetLevelUpModal';
import { SheetLevelUpModeSelectModal } from '../components/character/sheet/SheetLevelUpModeSelectModal';
import { SheetManualLevelUpModal } from '../components/character/sheet/SheetManualLevelUpModal';
import { SheetXpHistoryModal } from '../components/character/sheet/SheetXpHistoryModal';
import { applyLevelUp, LevelUpChoice } from '../services/characterEvolutionService';

type ActiveTab = 'combate' | 'pericias' | 'habilidades' | 'magias' | 'inventario' | 'detalhes';

export const CharacterSheetView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados principais
  const [rawCharacter, setRawCharacter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('combate');

  // Modais globais
  const [conditionsModalOpen, setConditionsModalOpen] = useState(false);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [modeSelectModalOpen, setModeSelectModalOpen] = useState(false);
  const [manualLevelUpModalOpen, setManualLevelUpModalOpen] = useState(false);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [xpHistoryModalOpen, setXpHistoryModalOpen] = useState(false);

  // Rolador de dados acionado externamente
  const [externalRoll, setExternalRoll] = useState<{ formula: string; label?: string; timestamp: number } | null>(null);

  // Debounce de salvamento no Firestore
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Record<string, any>>({});

  // 1. Inscrição em tempo real com Firestore
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const unsubscribe = CharacterService.subscribeToCharacter(id, (char) => {
      if (char) {
        setRawCharacter((prev: any) => {
          return { ...char, ...pendingUpdatesRef.current };
        });
      } else {
        setRawCharacter(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [id]);

  // 2. Normalização matemática completa da ficha
  const sheet: NormalizedSheetData | null = useMemo(() => {
    if (!rawCharacter) return null;
    return normalizeCharacterSheet(rawCharacter, id || '');
  }, [rawCharacter, id]);

  // Função centralizada para enfileirar e salvar dados no Firestore com debounce
  const queueUpdate = useCallback((partial: Record<string, any>) => {
    if (!id) return;

    setRawCharacter((prev: any) => ({ ...prev, ...partial }));
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...partial };
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const payloadToSave = { ...pendingUpdatesRef.current };
        pendingUpdatesRef.current = {};
        await CharacterService.updateCharacter(id, payloadToSave);
      } catch (err) {
        console.error('Erro ao sincronizar ficha com o servidor:', err);
      } finally {
        setIsSaving(false);
      }
    }, 450);
  }, [id]);

  // Handlers interativos
  const handleUpdatePV = useCallback((newPV: number) => {
    queueUpdate({ currentPV: newPV });
  }, [queueUpdate]);

  const handleUpdatePM = useCallback((newPM: number) => {
    queueUpdate({ currentPM: newPM });
  }, [queueUpdate]);

  const handleSpendPM = useCallback((cost: number) => {
    if (!sheet) return;
    if (sheet.currentPM < cost) {
      alert(`Você não possui Pontos de Mana suficientes (precisa de ${cost} PM, possui ${sheet.currentPM} PM)!`);
      return;
    }
    handleUpdatePM(Math.max(0, sheet.currentPM - cost));
  }, [sheet, handleUpdatePM]);

  const handleToggleCondition = useCallback((conditionId: string) => {
    if (!sheet) return;
    const currentList = sheet.conditions || [];
    let newList: string[];
    if (currentList.includes(conditionId)) {
      newList = currentList.filter(c => c !== conditionId);
    } else {
      newList = [...currentList, conditionId];
    }
    queueUpdate({ conditions: newList });
  }, [sheet, queueUpdate]);

  const handleRemoveCondition = useCallback((conditionId: string) => {
    if (!sheet) return;
    const newList = sheet.conditions.filter(c => c !== conditionId);
    queueUpdate({ conditions: newList });
  }, [sheet, queueUpdate]);

  const handleApplyRest = useCallback((type: 'short' | 'long') => {
    if (!sheet) return;
    if (type === 'short') {
      const recoveredPV = Math.min(sheet.maxPV, sheet.currentPV + sheet.level);
      const recoveredPM = Math.min(sheet.maxPM, sheet.currentPM + sheet.level);
      queueUpdate({ currentPV: recoveredPV, currentPM: recoveredPM });
    } else {
      const removableConditions = ['abalado', 'fatigado', 'fraco', 'sangrando', 'enjoado', 'pasmo', 'vulneravel'];
      const updatedConditions = sheet.conditions.filter(c => !removableConditions.includes(c.toLowerCase()));
      queueUpdate({ 
        currentPV: sheet.maxPV, 
        currentPM: sheet.maxPM,
        conditions: updatedConditions
      });
    }
  }, [sheet, queueUpdate]);

  const handleUpdateAttribute = useCallback((attr: Attribute, newVal: number) => {
    if (!sheet) return;
    const updatedAttrs = {
      ...sheet.attributes,
      [attr]: newVal
    };
    queueUpdate({ attributes: updatedAttrs });
  }, [sheet, queueUpdate]);

  const handleToggleSkillTrained = useCallback((skillId: string) => {
    if (!sheet) return;
    const rawSkills = rawCharacter?.skills || {};
    const currentSkillState = rawSkills[skillId] || {};
    const currentlyTrained = sheet.skills.find(s => s.id === skillId)?.trained ?? false;

    const updatedSkills = {
      ...rawSkills,
      [skillId]: {
        ...currentSkillState,
        trained: !currentlyTrained
      }
    };
    queueUpdate({ skills: updatedSkills });
  }, [sheet, rawCharacter, queueUpdate]);

  const handleAddAttack = useCallback((newAtk: any) => {
    if (!sheet) return;
    const updated = [...sheet.attacks, newAtk];
    queueUpdate({ attacks: updated });
  }, [sheet, queueUpdate]);

  const handleUpdateAttack = useCallback((attackId: string, updatedPayload: any) => {
    if (!sheet) return;
    const updated = sheet.attacks.map(atk => atk.id === attackId ? { ...atk, ...updatedPayload } : atk);
    queueUpdate({ attacks: updated });
  }, [sheet, queueUpdate]);

  const handleDeleteAttack = useCallback((attackId: string) => {
    if (!sheet) return;
    const updated = sheet.attacks.filter(atk => atk.id !== attackId);
    queueUpdate({ attacks: updated });
  }, [sheet, queueUpdate]);

  const handleAddPower = useCallback((newPower: any) => {
    if (!sheet) return;
    const updated = [...sheet.powers, newPower];
    queueUpdate({ abilities: updated });
  }, [sheet, queueUpdate]);

  const handleDeletePower = useCallback((powerId: string) => {
    if (!sheet) return;
    const updated = sheet.powers.filter(p => p.id !== powerId);
    queueUpdate({ abilities: updated });
  }, [sheet, queueUpdate]);

  const handleAddSpell = useCallback((newSpell: any) => {
    if (!sheet) return;
    const updated = [...sheet.spells, newSpell];
    queueUpdate({ spells: updated });
  }, [sheet, queueUpdate]);

  const handleDeleteSpell = useCallback((spellId: string) => {
    if (!sheet) return;
    const updated = sheet.spells.filter(s => s.id !== spellId);
    queueUpdate({ spells: updated });
  }, [sheet, queueUpdate]);

  const handleAddItem = useCallback((newItem: any) => {
    if (!sheet) return;
    const updated = [...sheet.inventory, newItem];
    queueUpdate({ inventory: updated });
  }, [sheet, queueUpdate]);

  const handleUpdateItemQuantity = useCallback((itemId: string, newQty: number) => {
    if (!sheet) return;
    const updated = sheet.inventory.map(item => item.id === itemId ? { ...item, quantity: newQty } : item);
    queueUpdate({ inventory: updated });
  }, [sheet, queueUpdate]);

  const handleToggleItemEquipped = useCallback((itemId: string) => {
    if (!sheet) return;
    const updated = sheet.inventory.map(item => item.id === itemId ? { ...item, equipped: !item.equipped } : item);
    queueUpdate({ inventory: updated });
  }, [sheet, queueUpdate]);

  const handleDeleteItem = useCallback((itemId: string) => {
    if (!sheet) return;
    const updated = sheet.inventory.filter(item => item.id !== itemId);
    queueUpdate({ inventory: updated });
  }, [sheet, queueUpdate]);

  const handleUpdateMoney = useCallback((newMoney: number) => {
    queueUpdate({ money: newMoney });
  }, [queueUpdate]);

  const handleUpdateNotes = useCallback((newNotes: string) => {
    queueUpdate({ notes: newNotes });
  }, [queueUpdate]);

  const handleRollDice = useCallback((formula: string, label?: string) => {
    setExternalRoll({
      formula,
      label,
      timestamp: Date.now()
    });
  }, []);

  const handleConfirmLevelUp = useCallback(async (choice: LevelUpChoice) => {
    if (!id || !rawCharacter) return;
    setIsSaving(true);
    try {
      const { updatedCharacter } = applyLevelUp(rawCharacter, choice);
      setRawCharacter(updatedCharacter);
      await CharacterService.updateCharacter(id, updatedCharacter);
      setLevelUpModalOpen(false);
    } catch (err) {
      console.error('Erro ao evoluir personagem automaticamente:', err);
    } finally {
      setIsSaving(false);
    }
  }, [id, rawCharacter]);

  const handleConfirmManualLevelUp = useCallback(async (updatedCharacter: any) => {
    if (!id || !rawCharacter) return;
    setIsSaving(true);
    try {
      setRawCharacter(updatedCharacter);
      await CharacterService.updateCharacter(id, updatedCharacter);
      setManualLevelUpModalOpen(false);
    } catch (err) {
      console.error('Erro ao evoluir personagem manualmente:', err);
    } finally {
      setIsSaving(false);
    }
  }, [id, rawCharacter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 animate-in fade-in duration-300">
        <RealmorLoading message="Carregando ficha do personagem..." subtitle="Preparando dados de combate e magias" size="md" />
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <AlertCircle size={36} className="text-stone-400 mx-auto" />
        <h2 className="text-lg font-sans text-stone-200 font-bold uppercase tracking-wider">
          Personagem Não Encontrado
        </h2>
        <p className="text-xs text-stone-500 font-sans">
          O registro deste herói não pôde ser localizado ou foi excluído.
        </p>
        <button
          onClick={() => navigate('/characters')}
          className="px-4 py-2 rounded-lg bg-[#141820] border border-[#21262d] hover:border-[#384252] text-stone-200 font-sans text-xs font-semibold uppercase transition-colors cursor-pointer"
        >
          Voltar para Personagens
        </button>
      </div>
    );
  }

  // Lista de abas solicitadas pelo usuário: COMBATE, PERÍCIAS, HABILIDADES, INVENTÁRIO, MAGIAS, DETALHES
  const tabs = [
    { id: 'combate', label: 'Combate', icon: Sword },
    { id: 'pericias', label: `Perícias (${sheet.skills.length})`, icon: Star },
    { id: 'habilidades', label: `Habilidades (${sheet.powers.length})`, icon: Sparkles },
    { id: 'magias', label: `Magias (${sheet.spells.length})`, icon: Sparkles },
    { id: 'inventario', label: `Inventário (${sheet.inventory.length})`, icon: Backpack },
    { id: 'detalhes', label: 'Detalhes', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-stone-200 pb-20 select-none sm:select-auto">
      {/* 1. CABEÇALHO COMPACTO COM AVATAR, NOME, STAT BLOCKS, CONDIÇÕES E DESCANSO */}
      <SheetHeader
        sheet={sheet}
        isSaving={isSaving}
        onOpenRest={() => setRestModalOpen(true)}
        onOpenConditions={() => setConditionsModalOpen(true)}
        onOpenLevelUp={() => setModeSelectModalOpen(true)}
        onOpenXpHistory={() => setXpHistoryModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-3 py-2.5 space-y-3">
        {/* 2. BARRA DE RECURSOS DE COMBATE: PV, PM, CONDIÇÕES */}
        <SheetCombatBar
          sheet={sheet}
          onUpdatePV={handleUpdatePV}
          onUpdatePM={handleUpdatePM}
          onRemoveCondition={handleRemoveCondition}
          onOpenConditionsModal={() => setConditionsModalOpen(true)}
          onRollDice={handleRollDice}
        />

        {/* 3. NAVEGAÇÃO DE ABAS SÓBRIA & DISCRETA */}
        <div className="sticky top-[58px] z-20 bg-[#0a0a0e]/95 backdrop-blur-xs py-1 border-b border-[#21262d]">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}-btn`}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#141820] text-stone-100 border border-[#30363d] shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-[#141820]/40'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-[#c5a869]' : 'text-stone-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. CONTEÚDO DA ABA ATIVA */}
        <div className="pt-0.5">
          {/* ABA 1: COMBATE */}
          {activeTab === 'combate' && (
            <div className="space-y-3">
              {/* Atributos Básicos com [ - ] [ + ] e teste d20 no modificador */}
              <SheetAttributes
                sheet={sheet}
                onUpdateAttribute={handleUpdateAttribute}
                onRollDice={handleRollDice}
              />

              {/* Resistências (Fortitude, Reflexos, Vontade) */}
              <SheetResistances
                sheet={sheet}
                onRollDice={handleRollDice}
              />

              {/* Ataques & Armas */}
              <SheetAttacks
                sheet={sheet}
                onAddAttack={handleAddAttack}
                onUpdateAttack={handleUpdateAttack}
                onDeleteAttack={handleDeleteAttack}
                onRollDice={handleRollDice}
              />
            </div>
          )}

          {/* ABA 2: PERÍCIAS */}
          {activeTab === 'pericias' && (
            <SheetSkills
              sheet={sheet}
              onToggleTrained={handleToggleSkillTrained}
              onRollDice={handleRollDice}
            />
          )}

          {/* ABA 3: HABILIDADES */}
          {activeTab === 'habilidades' && (
            <SheetPowers
              sheet={sheet}
              onAddPower={handleAddPower}
              onDeletePower={handleDeletePower}
            />
          )}

          {/* ABA 4: MAGIAS */}
          {activeTab === 'magias' && (
            <SheetSpells
              sheet={sheet}
              onAddSpell={handleAddSpell}
              onDeleteSpell={handleDeleteSpell}
              onSpendPM={handleSpendPM}
            />
          )}

          {/* ABA 5: INVENTÁRIO */}
          {activeTab === 'inventario' && (
            <SheetInventory
              sheet={sheet}
              onAddItem={handleAddItem}
              onUpdateItemQuantity={handleUpdateItemQuantity}
              onToggleItemEquipped={handleToggleItemEquipped}
              onDeleteItem={handleDeleteItem}
              onUpdateMoney={handleUpdateMoney}
            />
          )}

          {/* ABA 6: DETALHES */}
          {activeTab === 'detalhes' && (
            <SheetBiography
              sheet={sheet}
              onUpdateNotes={handleUpdateNotes}
            />
          )}
        </div>
      </main>

      {/* 5. MODAL DE CONDIÇÕES DISCRETO */}
      {conditionsModalOpen && (
        <SheetConditionsModal
          activeConditions={sheet.conditions}
          onToggleCondition={handleToggleCondition}
          onClose={() => setConditionsModalOpen(false)}
        />
      )}

      {/* 6. MODAL DE DESCANSO SÓBRIO */}
      {restModalOpen && (
        <SheetRestModal
          sheet={sheet}
          onApplyRest={handleApplyRest}
          onClose={() => setRestModalOpen(false)}
        />
      )}

      {/* 7. ROLADOR DE DADOS FLUTUANTE DISCRETO (Inspirado no botão d20 de D&D Beyond) */}
      <SheetDiceRoller externalRoll={externalRoll} />

      {/* 8. MODAL DE ESCOLHA DO MODO DE EVOLUÇÃO (MANUAL OU AUTOMÁTICO BETA) */}
      {modeSelectModalOpen && (
        <SheetLevelUpModeSelectModal
          isOpen={modeSelectModalOpen}
          sheet={sheet}
          onClose={() => setModeSelectModalOpen(false)}
          onSelectManual={() => setManualLevelUpModalOpen(true)}
          onSelectAutomatic={() => setLevelUpModalOpen(true)}
        />
      )}

      {/* 9. MODAL DE EVOLUÇÃO MANUAL (O Jogador escolhe benefícios, o Sistema calcula valores) */}
      {manualLevelUpModalOpen && (
        <SheetManualLevelUpModal
          isOpen={manualLevelUpModalOpen}
          rawCharacter={rawCharacter}
          onClose={() => setManualLevelUpModalOpen(false)}
          onConfirm={handleConfirmManualLevelUp}
          isSaving={isSaving}
        />
      )}

      {/* 10. MODAL DE EVOLUÇÃO AUTOMÁTICA OFICIAL T20 (BETA PRESERVADO) */}
      {levelUpModalOpen && (
        <SheetLevelUpModal
          isOpen={levelUpModalOpen}
          character={rawCharacter}
          onClose={() => setLevelUpModalOpen(false)}
          onConfirm={handleConfirmLevelUp}
          isSaving={isSaving}
        />
      )}

      {/* 11. MODAL DE HISTÓRICO DE XP */}
      {xpHistoryModalOpen && (
        <SheetXpHistoryModal
          isOpen={xpHistoryModalOpen}
          onClose={() => setXpHistoryModalOpen(false)}
          characterName={sheet.name}
          xpTotal={sheet.xpTotal}
          xpHistory={sheet.xpHistory}
        />
      )}
    </div>
  );
};
