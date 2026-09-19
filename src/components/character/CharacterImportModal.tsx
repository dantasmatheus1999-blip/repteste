import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Plus, 
  Trash2, 
  BookOpen, 
  Layers, 
  Feather, 
  Coins, 
  Package, 
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { CharacterService } from '../../services/characterService';
import { T20Character } from '../../types/t20';
import { T20_RACES } from '../../data/t20Races';
import { T20_CLASSES, T20_SKILLS } from '../../data/t20Data';
import { T20_ORIGINS } from '../../data/t20Origins';
import { T20_DEITIES } from '../../data/t20Deities';
import { T20_SPELLS } from '../../data/t20Spells';
import { parseT20PdfDirectlyInBrowser, ParsedT20CharacterDraft } from '../../services/t20PdfParserClient';
import { findSpellInT20Catalog, getStandardT20SpellCost } from '../../services/t20SpellMatcher';
import { T20Spell } from '../../types/spells';

interface CharacterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCharacters?: (T20Character & { id: string })[];
  onImportSuccess?: (characterId: string) => void;
}

type TabType = 'identidade' | 'atributos' | 'pericias' | 'ataques' | 'equipamento' | 'poderes' | 'magias' | 'biografia';

export const CharacterImportModal: React.FC<CharacterImportModalProps> = ({
  isOpen,
  onClose,
  existingCharacters = [],
  onImportSuccess
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados do fluxo
  const [step, setStep] = useState<'upload' | 'reading' | 'review' | 'saving'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingStatusText, setReadingStatusText] = useState('Analisando arquivo PDF...');

  // Dados da ficha em revisão
  const [draft, setDraft] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('identidade');
  const [duplicateResolution, setDuplicateResolution] = useState<'create_new' | 'update_existing'>('create_new');
  const [matchingExistingChar, setMatchingExistingChar] = useState<(T20Character & { id: string }) | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setFile(null);
      setErrorMessage(null);
      setDraft(null);
      setActiveTab('identidade');
    }
  }, [isOpen]);

  // Checa duplicatas quando o draft muda
  useEffect(() => {
    if (draft?.name && existingCharacters.length > 0) {
      const match = existingCharacters.find(
        c => (c.name || '').trim().toLowerCase() === draft.name.trim().toLowerCase()
      );
      if (match) {
        setMatchingExistingChar(match);
        setDuplicateResolution('create_new');
      } else {
        setMatchingExistingChar(null);
      }
    } else {
      setMatchingExistingChar(null);
    }
  }, [draft?.name, existingCharacters]);

  if (!isOpen) return null;

  // Handlers de Arquivo
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage(null);
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Por favor, selecione um arquivo em formato PDF (.pdf).');
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMessage('O arquivo é muito grande (máximo de 25MB).');
      return;
    }
    setFile(selectedFile);
  };

  // Iniciar Leitura do PDF
  const handleStartExtraction = async () => {
    if (!file) return;

    setStep('reading');
    setReadingProgress(20);
    setReadingStatusText('Inspecionando campos e estrutura do PDF no navegador...');

    const progressTimer = setInterval(() => {
      setReadingProgress(prev => {
        if (prev < 50) {
          setReadingStatusText('Lendo campos de formulário (AcroForms) e estrutura Tormenta 20...');
          return prev + 15;
        }
        if (prev < 85) {
          setReadingStatusText('Extraindo atributos, perícias oficiais, recursos e magias...');
          return prev + 10;
        }
        return prev;
      });
    }, 250);

    try {
      // Leitura 100% direta no navegador via ArrayBuffer e pdf-lib
      const arrayBuffer = await file.arrayBuffer();
      
      setReadingProgress(75);
      setReadingStatusText('Processando campos oficiais e normalizando regras T20...');
      
      const parsedCharacter = await parseT20PdfDirectlyInBrowser(arrayBuffer, file.name);

      clearInterval(progressTimer);
      setReadingProgress(100);
      setReadingStatusText('Ficha decodificada com sucesso!');

      setTimeout(() => {
        setDraft(parsedCharacter);
        setStep('review');
      }, 400);

    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('[Character Import] Erro na leitura local do PDF:', err);
      setErrorMessage(err.message || 'Não foi possível ler os dados do PDF. Verifique se o arquivo não está protegido ou corrompido.');
      setStep('upload');
    }
  };

  // Confirmação e Salvamento Final no Firestore
  const handleConfirmSave = async () => {
    if (!user || !draft) return;

    setStep('saving');
    try {
      // Prepara o objeto completo pronto para persistência e normalização
      const characterPayload: Partial<T20Character> = {
        name: draft.name || 'Herói Sem Nome',
        level: draft.level || 1,
        classId: draft.classId || 'guerreiro',
        attributes: draft.attributes || { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
        attrBonus: draft.attributes || { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
        currentPV: draft.currentPV ?? draft.maxPV ?? 20,
        currentPM: draft.currentPM ?? draft.maxPM ?? 10,
        skills: draft.skills || {},
        attacks: draft.attacks || [],
        inventory: draft.inventory || [],
        spells: draft.spells || [],
        abilities: draft.powers || [],
        money: draft.money || 0,
        notes: draft.notes || '',
        xp: draft.xp || 0,
        characterData: {
          identity: {
            name: draft.name || 'Herói Sem Nome',
            playerName: draft.playerName || '',
            raceName: draft.raceName || 'Humano',
            raceId: draft.raceId || 'humano',
            className: draft.className || 'Guerreiro',
            classId: draft.classId || 'guerreiro',
            originName: draft.originName || 'Herói Camponês',
            originId: draft.originId || 'heroi-campones',
            level: draft.level || 1,
            deity: draft.deity || '',
            age: draft.age || '',
            gender: draft.gender || '',
            size: draft.size || 'Médio',
            movement: draft.movement || '9m',
          },
          baseAttributes: draft.attributes,
          choices: {
            trainedSkills: Object.entries(draft.skills || {})
              .filter(([_, s]: any) => s.trained)
              .map(([key]) => key),
            powers: (draft.powers || []).map((p: any) => p.name),
            spells: (draft.spells || []).map((s: any) => s.name),
            equipment: {
              accessories: []
            }
          },
          state: {
            currentPV: draft.currentPV ?? draft.maxPV ?? 20,
            currentPM: draft.currentPM ?? draft.maxPM ?? 10,
            conditions: [],
            buffs: [],
            debuffs: []
          }
        },
        // Propriedades diretas para compatibilidade com queries e views
        raceName: draft.raceName || 'Humano',
        raceId: draft.raceId || 'humano',
        className: draft.className || 'Guerreiro',
        originName: draft.originName || 'Herói Camponês',
        originId: draft.originId || 'heroi-campones',
        playerName: draft.playerName || '',
        deity: draft.deity || '',
        movement: draft.movement || '9m',
        size: draft.size || 'Médio',
        defense: draft.defense || (10 + (draft.attributes?.DES || 0)),
        armor: draft.armor,
        shield: draft.shield,
        armorPenalty: draft.armorPenalty || 0,
      } as any;

      let savedId: string;

      if (matchingExistingChar && duplicateResolution === 'update_existing') {
        await CharacterService.updateCharacter(matchingExistingChar.id, characterPayload);
        savedId = matchingExistingChar.id;
      } else {
        const createdId = await CharacterService.createCharacter(user.uid, characterPayload);
        if (!createdId) throw new Error("Não foi possível obter o ID da ficha criada.");
        savedId = createdId;
      }

      if (onImportSuccess) {
        onImportSuccess(savedId);
      }
      onClose();
      navigate(`/characters/${savedId}`);

    } catch (err: any) {
      console.error('[Character Import] Erro ao salvar:', err);
      setErrorMessage(err.message || 'Erro ao gravar a ficha no grimório.');
      setStep('review');
    }
  };

  // Modificadores de Atributos Auxiliares no Draft
  const updateAttr = (attr: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR', val: number) => {
    setDraft((prev: any) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: val
      }
    }));
  };

  const toggleSkill = (skillId: string) => {
    setDraft((prev: any) => {
      const cur = prev.skills[skillId] || { trained: false, others: 0 };
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [skillId]: {
            ...cur,
            trained: !cur.trained
          }
        }
      };
    });
  };

  const updateSkillOther = (skillId: string, val: number) => {
    setDraft((prev: any) => {
      const cur = prev.skills[skillId] || { trained: false, others: 0 };
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [skillId]: {
            ...cur,
            others: val
          }
        }
      };
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => step !== 'reading' && step !== 'saving' && onClose()}
    >
      <div 
        className="bg-[#0e0e14] border border-gold/40 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* MODAL HEADER                                                 */}
        {/* ============================================================ */}
        <div className="px-5 py-4 border-b border-gold/20 bg-gradient-to-r from-black/80 via-gold/5 to-black/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-gold tracking-wide uppercase flex items-center gap-2">
                <span>Importar Ficha Tormenta 20</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-amber-300 font-mono tracking-normal border border-gold/30">
                  PDF / OCR
                </span>
              </h3>
              <p className="text-[11px] text-stone-400 font-sans">
                {step === 'review' ? 'Revise e edite todos os campos lidos antes de consagrar o herói' : 'Envie sua ficha oficial preenchida para cadastro instantâneo no sistema'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={step === 'reading' || step === 'saving'}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* ============================================================ */}
        {/* ERROR BANNER                                                 */}
        {/* ============================================================ */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-red-950/60 border border-red-800/60 rounded-lg flex items-center gap-3 text-red-200 text-xs">
            <AlertTriangle size={18} className="shrink-0 text-red-400" />
            <div className="flex-1">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-200">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: UPLOAD                                               */}
        {/* ============================================================ */}
        {step === 'upload' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-gold bg-gold/10 scale-[0.99]'
                  : 'border-gold/30 hover:border-gold/60 bg-black/40 hover:bg-gold/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_25px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>

              <div className="space-y-1.5 max-w-md">
                <p className="font-cinzel text-base sm:text-lg font-bold text-amber-200">
                  {file ? file.name : 'Arraste sua ficha PDF aqui ou clique para selecionar'}
                </p>
                <p className="text-xs text-stone-400 font-sans">
                  Suporta fichas oficiais de Tormenta 20 (Jambô Editora / JdA), formulários interativos e PDFs exportados.
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/40 text-amber-300 text-xs font-mono">
                  <FileText size={14} />
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-300">Pronto para leitura</span>
                </div>
              )}
            </div>

            {/* Badges de recursos suportados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-black/40 border border-gold/15 flex items-start gap-2.5">
                <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-stone-300">
                  <span className="font-bold text-amber-200 block">Formulários & Visual</span>
                  Extrai campos automáticos ou aplica leitura visual inteligente em fichas achatadas.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-gold/15 flex items-start gap-2.5">
                <Sword size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-stone-300">
                  <span className="font-bold text-amber-200 block">Completo T20 JdA</span>
                  Importa atributos, ataques, magias, perícias, itens, PV/PM e habilidades de raça/origem.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-gold/15 flex items-start gap-2.5">
                <Check size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-stone-300">
                  <span className="font-bold text-amber-200 block">100% Editável</span>
                  Você revisa e ajusta todos os valores antes de salvar no seu grimório pessoal.
                </div>
              </div>
            </div>

            {/* Ações do Upload */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-cinzel font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!file}
                onClick={handleStartExtraction}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles size={15} />
                <span>Iniciar Leitura e Extração</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: READING / PROGRESS ANIMATION                         */}
        {/* ============================================================ */}
        {step === 'reading' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[350px]">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-gold">
                <FileText size={32} className="animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h4 className="font-cinzel text-lg font-bold text-gold uppercase tracking-wider">
                Lendo e Decodificando Ficha T20
              </h4>
              <p className="text-xs text-stone-300 font-sans">
                {readingStatusText}
              </p>
            </div>

            <div className="w-full max-w-sm bg-black/60 border border-gold/20 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-gold/60">{readingProgress}% concluído</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: REVIEW / EDIT DRAFT                                  */}
        {/* ============================================================ */}
        {step === 'review' && draft && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Notificação de Avisos ou Duplicata */}
            <div className="px-5 pt-3 pb-1 space-y-2 bg-black/40 border-b border-gold/15 shrink-0">
              {matchingExistingChar && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Info size={16} className="text-amber-400 shrink-0" />
                    <span>Já existe um herói chamado <strong className="text-amber-300 font-cinzel">"{draft.name}"</strong> no seu grimório.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 text-[11px]">
                      <input 
                        type="radio" 
                        name="dupAction" 
                        checked={duplicateResolution === 'create_new'} 
                        onChange={() => setDuplicateResolution('create_new')} 
                        className="accent-amber-400"
                      />
                      <span>Criar Novo Herói</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 text-[11px]">
                      <input 
                        type="radio" 
                        name="dupAction" 
                        checked={duplicateResolution === 'update_existing'} 
                        onChange={() => setDuplicateResolution('update_existing')} 
                        className="accent-amber-400"
                      />
                      <span>Atualizar Existente</span>
                    </label>
                  </div>
                </div>
              )}

              {draft.warnings && draft.warnings.length > 0 && (
                <div className="p-2 rounded-lg bg-gold/10 border border-gold/20 flex items-start gap-2 text-[11px] text-amber-200/90">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-300 block">Observações da Leitura Automática:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-300 text-[10px]">
                      {draft.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Sub-Abas de Navegação */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 custom-scrollbar text-xs">
                {[
                  { id: 'identidade', label: '🏷️ Identidade', icon: FileText },
                  { id: 'atributos', label: '⚡ Atributos & PV/PM', icon: Zap },
                  { id: 'pericias', label: '📜 Perícias', icon: Feather },
                  { id: 'ataques', label: '⚔️ Ataques', icon: Sword },
                  { id: 'equipamento', label: '🎒 Equipamento', icon: Package },
                  { id: 'poderes', label: '🌟 Habilidades', icon: Sparkles },
                  { id: 'magias', label: '🔮 Magias', icon: BookOpen },
                  { id: 'biografia', label: '📖 História', icon: Layers },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as TabType)}
                    className={`px-3 py-1.5 rounded-lg font-cinzel text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeTab === t.id
                        ? 'bg-gold/20 text-amber-300 border border-gold/40 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-[#0b0b10]">
              
              {/* ABA: IDENTIDADE */}
              {activeTab === 'identidade' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Nome do Personagem</label>
                    <input
                      type="text"
                      value={draft.name || ''}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-amber-200 font-cinzel font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Nome do Jogador</label>
                    <input
                      type="text"
                      value={draft.playerName || ''}
                      onChange={(e) => setDraft({ ...draft, playerName: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Raça</label>
                    <input
                      type="text"
                      value={draft.raceName || ''}
                      onChange={(e) => setDraft({ ...draft, raceName: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Classe</label>
                    <input
                      type="text"
                      value={draft.className || ''}
                      onChange={(e) => setDraft({ ...draft, className: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Origem</label>
                    <input
                      type="text"
                      value={draft.originName || ''}
                      onChange={(e) => setDraft({ ...draft, originName: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Nível</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={draft.level || 1}
                      onChange={(e) => setDraft({ ...draft, level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-amber-300 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Divindade</label>
                    <input
                      type="text"
                      value={draft.deity || ''}
                      onChange={(e) => setDraft({ ...draft, deity: e.target.value })}
                      placeholder="Ex: Valkaria, Khalmyr..."
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Deslocamento</label>
                    <input
                      type="text"
                      value={draft.movement || '9m'}
                      onChange={(e) => setDraft({ ...draft, movement: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Tamanho</label>
                    <input
                      type="text"
                      value={draft.size || 'Médio'}
                      onChange={(e) => setDraft({ ...draft, size: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Idade / Gênero</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Idade"
                        value={draft.age || ''}
                        onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                        className="w-1/2 px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                      />
                      <input
                        type="text"
                        placeholder="Gênero"
                        value={draft.gender || ''}
                        onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                        className="w-1/2 px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-cinzel uppercase text-gold font-bold">Experiência (XP)</label>
                    <input
                      type="number"
                      min={0}
                      value={draft.xp || 0}
                      onChange={(e) => setDraft({ ...draft, xp: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-3 py-2 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200"
                    />
                  </div>
                </div>
              )}

              {/* ABA: ATRIBUTOS & RECURSOS */}
              {activeTab === 'atributos' && (
                <div className="space-y-5">
                  <div>
                    <h5 className="font-cinzel text-xs font-bold text-gold uppercase tracking-wider mb-2">
                      Atributos (Tormenta 20 - Edição Jogo do Ano)
                    </h5>
                    <p className="text-[11px] text-stone-400 mb-3">
                      No T20 JdA, o valor utilizado diretamente é o próprio modificador (-2 a +10).
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map(attr => (
                        <div key={attr} className="p-3 bg-black/60 border border-gold/20 rounded-lg text-center space-y-1">
                          <span className="text-xs font-cinzel font-bold text-amber-400 block">{attr}</span>
                          <input
                            type="number"
                            value={draft.attributes?.[attr] ?? 0}
                            onChange={(e) => updateAttr(attr, parseInt(e.target.value) || 0)}
                            className="w-full text-center py-1 bg-black/40 border border-stone-800 rounded font-medieval text-lg text-amber-200 font-bold"
                          />
                          <span className="text-[10px] text-stone-500 font-mono">
                            {(draft.attributes?.[attr] ?? 0) >= 0 ? `+${draft.attributes?.[attr] ?? 0}` : draft.attributes?.[attr]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gold/15">
                    <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-red-400 font-cinzel text-xs font-bold uppercase">
                        <Heart size={14} />
                        <span>Pontos de Vida (PV)</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-[9px] text-stone-400 uppercase">Atual</label>
                          <input
                            type="number"
                            value={draft.currentPV ?? 20}
                            onChange={(e) => setDraft({ ...draft, currentPV: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-black/60 border border-red-900/60 rounded text-xs text-red-200 font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] text-stone-400 uppercase">Máximo</label>
                          <input
                            type="number"
                            value={draft.maxPV ?? 20}
                            onChange={(e) => setDraft({ ...draft, maxPV: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-black/60 border border-red-900/60 rounded text-xs text-red-200 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-400 font-cinzel text-xs font-bold uppercase">
                        <Zap size={14} />
                        <span>Pontos de Mana (PM)</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-[9px] text-stone-400 uppercase">Atual</label>
                          <input
                            type="number"
                            value={draft.currentPM ?? 10}
                            onChange={(e) => setDraft({ ...draft, currentPM: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-black/60 border border-blue-900/60 rounded text-xs text-blue-200 font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] text-stone-400 uppercase">Máximo</label>
                          <input
                            type="number"
                            value={draft.maxPM ?? 10}
                            onChange={(e) => setDraft({ ...draft, maxPM: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-black/60 border border-blue-900/60 rounded text-xs text-blue-200 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-stone-900/60 border border-gold/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-gold font-cinzel text-xs font-bold uppercase">
                        <Shield size={14} />
                        <span>Defesa Total</span>
                      </div>
                      <input
                        type="number"
                        value={draft.defense ?? 10}
                        onChange={(e) => setDraft({ ...draft, defense: parseInt(e.target.value) || 10 })}
                        className="w-full px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-amber-200 font-bold"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-stone-900/60 border border-gold/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-stone-300 font-cinzel text-xs font-bold uppercase">
                        <span>Penalidade Armadura</span>
                      </div>
                      <input
                        type="number"
                        value={draft.armorPenalty ?? 0}
                        onChange={(e) => setDraft({ ...draft, armorPenalty: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-stone-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ABA: PERÍCIAS */}
              {activeTab === 'pericias' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-black/60 border border-gold/20 rounded-lg">
                    <div>
                      <h4 className="text-xs font-cinzel font-bold text-amber-300">
                        Perícias Oficiais T20
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Importadas automaticamente a partir das caixas de seleção e campos marcados na ficha PDF.
                      </p>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-gold/10 border border-gold/30 text-[11px] font-cinzel font-semibold text-amber-300 whitespace-nowrap">
                      {Object.values(draft.skills || {}).filter((s: any) => s.trained).length} de {T20_SKILLS.length} Treinadas
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {T20_SKILLS.map(skillDef => {
                      const skillState = draft.skills?.[skillDef.id] || { trained: false, others: 0 };
                      return (
                        <div
                          key={skillDef.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                            skillState.trained
                              ? 'bg-gold/15 border-gold/50 text-amber-200 shadow-sm'
                              : 'bg-black/40 border-stone-800/80 text-stone-400'
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={skillState.trained}
                              onChange={() => toggleSkill(skillDef.id)}
                              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-cinzel font-semibold block leading-tight ${
                                  skillState.trained ? 'text-amber-200' : 'text-stone-300'
                                }`}>
                                  {skillDef.name}
                                </span>
                                {skillState.trained && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono uppercase">
                                    Treinada
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-stone-500 font-mono uppercase">
                                Atributo-chave: {skillDef.attr}
                              </span>
                            </div>
                          </label>

                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-stone-500">Outros:</span>
                            <input
                              type="number"
                              value={skillState.others || 0}
                              onChange={(e) => updateSkillOther(skillDef.id, parseInt(e.target.value) || 0)}
                              className="w-12 px-1.5 py-0.5 bg-black/60 border border-stone-800 rounded text-[11px] text-center text-amber-300"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABA: ATAQUES */}
              {activeTab === 'ataques' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-stone-400">
                      Armas, golpes e ataques extraídos da ficha.
                    </p>
                    <button
                      onClick={() => {
                        const newAtk = {
                          id: `atk_${Date.now()}`,
                          name: 'Novo Ataque',
                          attackBonus: 0,
                          damage: '1d6',
                          crit: '20/x2',
                          type: 'Corte',
                          range: 'Corpo a corpo',
                          attr: 'FOR'
                        };
                        setDraft({ ...draft, attacks: [...(draft.attacks || []), newAtk] });
                      }}
                      className="px-2.5 py-1 rounded bg-gold/15 hover:bg-gold/25 border border-gold/40 text-amber-300 text-xs font-cinzel font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Adicionar Arma</span>
                    </button>
                  </div>

                  {(draft.attacks || []).length === 0 ? (
                    <div className="p-8 text-center bg-black/40 rounded-lg border border-dashed border-stone-800 text-stone-500 text-xs font-cinzel">
                      Nenhum ataque registrado. Clique acima para adicionar.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draft.attacks.map((atk: any, idx: number) => (
                        <div key={atk.id || idx} className="p-3 rounded-lg bg-black/50 border border-stone-800 flex flex-wrap sm:flex-nowrap items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nome da Arma"
                            value={atk.name}
                            onChange={(e) => {
                              const updated = [...draft.attacks];
                              updated[idx].name = e.target.value;
                              setDraft({ ...draft, attacks: updated });
                            }}
                            className="flex-1 min-w-[130px] px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-amber-200 font-bold"
                          />
                          <input
                            type="number"
                            placeholder="Bônus"
                            title="Bônus de Ataque"
                            value={atk.attackBonus}
                            onChange={(e) => {
                              const updated = [...draft.attacks];
                              updated[idx].attackBonus = parseInt(e.target.value) || 0;
                              setDraft({ ...draft, attacks: updated });
                            }}
                            className="w-16 px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-center text-amber-300"
                          />
                          <input
                            type="text"
                            placeholder="Dano (ex: 1d8+3)"
                            value={atk.damage}
                            onChange={(e) => {
                              const updated = [...draft.attacks];
                              updated[idx].damage = e.target.value;
                              setDraft({ ...draft, attacks: updated });
                            }}
                            className="w-24 px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-stone-200"
                          />
                          <input
                            type="text"
                            placeholder="Crítico"
                            value={atk.crit}
                            onChange={(e) => {
                              const updated = [...draft.attacks];
                              updated[idx].crit = e.target.value;
                              setDraft({ ...draft, attacks: updated });
                            }}
                            className="w-20 px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-stone-200"
                          />
                          <input
                            type="text"
                            placeholder="Tipo"
                            value={atk.type}
                            onChange={(e) => {
                              const updated = [...draft.attacks];
                              updated[idx].type = e.target.value;
                              setDraft({ ...draft, attacks: updated });
                            }}
                            className="w-20 px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-stone-200"
                          />
                          <button
                            onClick={() => {
                              const updated = draft.attacks.filter((_: any, i: number) => i !== idx);
                              setDraft({ ...draft, attacks: updated });
                            }}
                            className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: EQUIPAMENTO & RIQUEZA */}
              {activeTab === 'equipamento' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-black/60 border border-gold/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Coins size={18} className="text-amber-400" />
                      <span className="text-xs font-cinzel font-bold text-gold uppercase">Tibares (T$) / Riqueza</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={draft.money || 0}
                        onChange={(e) => setDraft({ ...draft, money: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-28 px-3 py-1 bg-black/80 border border-stone-800 rounded text-xs text-amber-300 font-bold"
                      />
                      <span className="text-xs text-stone-400 font-mono">T$</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-stone-400">
                      Itens na mochila e pertences do herói.
                    </p>
                    <button
                      onClick={() => {
                        const newItem = {
                          id: `item_${Date.now()}`,
                          name: 'Novo Item',
                          quantity: 1,
                          weight: 1,
                          equipped: false,
                          type: 'item',
                          description: ''
                        };
                        setDraft({ ...draft, inventory: [...(draft.inventory || []), newItem] });
                      }}
                      className="px-2.5 py-1 rounded bg-gold/15 hover:bg-gold/25 border border-gold/40 text-amber-300 text-xs font-cinzel font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Adicionar Item</span>
                    </button>
                  </div>

                  {(draft.inventory || []).length === 0 ? (
                    <div className="p-8 text-center bg-black/40 rounded-lg border border-dashed border-stone-800 text-stone-500 text-xs font-cinzel">
                      Nenhum item registrado. Clique acima para adicionar.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draft.inventory.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="p-2.5 rounded-lg bg-black/50 border border-stone-800 flex flex-wrap sm:flex-nowrap items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-400" title="Equipado">
                            <input
                              type="checkbox"
                              checked={item.equipped}
                              onChange={(e) => {
                                const updated = [...draft.inventory];
                                updated[idx].equipped = e.target.checked;
                                setDraft({ ...draft, inventory: updated });
                              }}
                              className="accent-amber-400"
                            />
                            <span className="text-[9px] uppercase">Eqp</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Nome do Item"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...draft.inventory];
                              updated[idx].name = e.target.value;
                              setDraft({ ...draft, inventory: updated });
                            }}
                            className="flex-1 min-w-[140px] px-2 py-1 bg-black/60 border border-stone-800 rounded text-xs text-stone-200"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-stone-500">Qtd:</span>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...draft.inventory];
                                updated[idx].quantity = parseInt(e.target.value) || 1;
                                setDraft({ ...draft, inventory: updated });
                              }}
                              className="w-14 px-1.5 py-1 bg-black/60 border border-stone-800 rounded text-xs text-center text-stone-200"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-stone-500">Peso:</span>
                            <input
                              type="number"
                              min={0}
                              value={item.weight}
                              onChange={(e) => {
                                const updated = [...draft.inventory];
                                updated[idx].weight = parseInt(e.target.value) || 0;
                                setDraft({ ...draft, inventory: updated });
                              }}
                              className="w-14 px-1.5 py-1 bg-black/60 border border-stone-800 rounded text-xs text-center text-stone-200"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const updated = draft.inventory.filter((_: any, i: number) => i !== idx);
                              setDraft({ ...draft, inventory: updated });
                            }}
                            className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: HABILIDADES & PODERES */}
              {activeTab === 'poderes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-stone-400">
                      Habilidades de Raça, Classe, Origem e Poderes Gerais.
                    </p>
                    <button
                      onClick={() => {
                        const newPow = {
                          id: `pow_${Date.now()}`,
                          name: 'Novo Poder',
                          type: 'Poder Geral',
                          description: ''
                        };
                        setDraft({ ...draft, powers: [...(draft.powers || []), newPow] });
                      }}
                      className="px-2.5 py-1 rounded bg-gold/15 hover:bg-gold/25 border border-gold/40 text-amber-300 text-xs font-cinzel font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Adicionar Poder</span>
                    </button>
                  </div>

                  {(draft.powers || []).length === 0 ? (
                    <div className="p-8 text-center bg-black/40 rounded-lg border border-dashed border-stone-800 text-stone-500 text-xs font-cinzel">
                      Nenhuma habilidade cadastrada. Clique acima para adicionar.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {draft.powers.map((pow: any, idx: number) => (
                        <div key={pow.id || idx} className="p-3 rounded-lg bg-black/50 border border-stone-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              placeholder="Nome da Habilidade"
                              value={pow.name}
                              onChange={(e) => {
                                const updated = [...draft.powers];
                                updated[idx].name = e.target.value;
                                setDraft({ ...draft, powers: updated });
                              }}
                              className="flex-1 px-2.5 py-1 bg-black/60 border border-stone-800 rounded text-xs text-amber-300 font-cinzel font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Tipo (ex: Classe, Raça)"
                              value={pow.type}
                              onChange={(e) => {
                                const updated = [...draft.powers];
                                updated[idx].type = e.target.value;
                                setDraft({ ...draft, powers: updated });
                              }}
                              className="w-36 px-2 py-1 bg-black/60 border border-stone-800 rounded text-[11px] text-stone-300"
                            />
                            <button
                              onClick={() => {
                                const updated = draft.powers.filter((_: any, i: number) => i !== idx);
                                setDraft({ ...draft, powers: updated });
                              }}
                              className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Descrição e regras do poder..."
                            value={pow.description}
                            onChange={(e) => {
                              const updated = [...draft.powers];
                              updated[idx].description = e.target.value;
                              setDraft({ ...draft, powers: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-stone-800/80 rounded text-xs text-stone-300 resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: MAGIAS */}
              {activeTab === 'magias' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-black/60 border border-blue-900/30 rounded-lg">
                    <div>
                      <h4 className="text-xs font-cinzel font-bold text-blue-300">
                        Grimório de Magias (Catálogo Oficial T20)
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Magias identificadas na ficha são automaticamente vinculadas ao catálogo de regras do REALMOR.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          const spellId = e.target.value;
                          if (!spellId) return;
                          const found = T20_SPELLS.find(s => s.id === spellId);
                          if (found) {
                            const newSpl = {
                              id: found.id,
                              name: found.name,
                              circle: found.circle,
                              level: found.circle,
                              school: found.school,
                              type: found.type,
                              execution: found.execution,
                              range: found.range,
                              target: found.target,
                              area: found.area,
                              effect: found.effect,
                              duration: found.duration,
                              resistance: found.resistance,
                              description: found.description,
                              truque: found.truque,
                              aprimoramentos: found.aprimoramentos,
                              cost: getStandardT20SpellCost(found.circle),
                              foundInCatalog: true
                            };
                            setDraft({ ...draft, spells: [...(draft.spells || []), newSpl] });
                          }
                          e.target.value = '';
                        }}
                        defaultValue=""
                        className="px-2.5 py-1 bg-black/80 border border-blue-800/60 rounded text-xs text-blue-200 font-cinzel cursor-pointer"
                      >
                        <option value="" disabled>+ Adicionar do Catálogo...</option>
                        {T20_SPELLS.map(sp => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name} ({sp.circle}º Círculo • {sp.school})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(draft.spells || []).length === 0 ? (
                    <div className="p-8 text-center bg-black/40 rounded-lg border border-dashed border-stone-800 text-stone-500 text-xs font-cinzel">
                      Nenhuma magia identificada na ficha. Use o seletor acima para adicionar magias do catálogo.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draft.spells.map((spl: any, idx: number) => {
                        const isOfficial = spl.foundInCatalog !== false;
                        return (
                          <div 
                            key={spl.id || idx} 
                            className={`p-3.5 rounded-lg border space-y-2.5 transition-colors ${
                              isOfficial 
                                ? 'bg-[#0e1726]/70 border-blue-800/40 shadow-sm' 
                                : 'bg-amber-950/20 border-amber-800/40'
                            }`}
                          >
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs font-cinzel font-bold text-blue-200">
                                  {spl.name}
                                </span>
                                {isOfficial ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                                    <Check size={10} /> Catálogo Oficial T20
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono flex items-center gap-1">
                                    <AlertTriangle size={10} /> Magia não encontrada no catálogo
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 bg-black/50 border border-stone-800 rounded text-blue-300 font-mono">
                                  {spl.circle || 1}º Círculo
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-black/50 border border-stone-800 rounded text-stone-300 font-mono">
                                  {spl.school || 'Universal'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-950/60 border border-blue-700/40 rounded text-blue-300 font-mono font-bold">
                                  {spl.cost || 1} PM
                                </span>
                                <button
                                  onClick={() => {
                                    const updated = draft.spells.filter((_: any, i: number) => i !== idx);
                                    setDraft({ ...draft, spells: updated });
                                  }}
                                  className="p-1.5 text-stone-500 hover:text-red-400 transition-colors ml-1"
                                  title="Remover magia"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Metadados Técnicos Oficiais */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-black/40 p-2 rounded border border-stone-800/60">
                              {spl.execution && (
                                <div>
                                  <span className="text-stone-500 block text-[9px] uppercase font-mono">Execução</span>
                                  <span className="text-stone-300 capitalize">{spl.execution}</span>
                                </div>
                              )}
                              {spl.range && (
                                <div>
                                  <span className="text-stone-500 block text-[9px] uppercase font-mono">Alcance</span>
                                  <span className="text-stone-300 capitalize">{spl.range}</span>
                                </div>
                              )}
                              {spl.duration && (
                                <div>
                                  <span className="text-stone-500 block text-[9px] uppercase font-mono">Duração</span>
                                  <span className="text-stone-300 capitalize">{spl.duration}</span>
                                </div>
                              )}
                              {spl.resistance && (
                                <div>
                                  <span className="text-stone-500 block text-[9px] uppercase font-mono">Resistência</span>
                                  <span className="text-stone-300">{spl.resistance}</span>
                                </div>
                              )}
                            </div>

                            {/* Seção de Vinculação para Magias Não Encontradas */}
                            {!isOfficial && (
                              <div className="p-2.5 bg-black/60 rounded border border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <span className="text-[11px] text-amber-200">
                                  Vincular a uma magia existente no catálogo:
                                </span>
                                <select
                                  onChange={(e) => {
                                    const targetId = e.target.value;
                                    if (!targetId) return;
                                    const found = T20_SPELLS.find(s => s.id === targetId);
                                    if (found) {
                                      const updated = [...draft.spells];
                                      updated[idx] = {
                                        id: found.id,
                                        name: found.name,
                                        circle: found.circle,
                                        level: found.circle,
                                        school: found.school,
                                        type: found.type,
                                        execution: found.execution,
                                        range: found.range,
                                        target: found.target,
                                        area: found.area,
                                        effect: found.effect,
                                        duration: found.duration,
                                        resistance: found.resistance,
                                        description: found.description,
                                        truque: found.truque,
                                        aprimoramentos: found.aprimoramentos,
                                        cost: getStandardT20SpellCost(found.circle),
                                        foundInCatalog: true
                                      };
                                      setDraft({ ...draft, spells: updated });
                                    }
                                  }}
                                  defaultValue=""
                                  className="w-full sm:w-64 px-2 py-1 bg-black border border-stone-800 rounded text-xs text-stone-200"
                                >
                                  <option value="" disabled>Selecione a magia correspondente...</option>
                                  {T20_SPELLS.map(sp => (
                                    <option key={sp.id} value={sp.id}>
                                      {sp.name} ({sp.circle}º • {sp.school})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Descrição e Efeito */}
                            {spl.description && (
                              <p className="text-xs text-stone-300 leading-relaxed bg-black/20 p-2 rounded border border-stone-800/40">
                                {spl.description}
                              </p>
                            )}

                            {/* Aprimoramentos Oficiais */}
                            {Array.isArray(spl.aprimoramentos) && spl.aprimoramentos.length > 0 && (
                              <div className="space-y-1 bg-black/40 p-2 rounded border border-stone-800/60">
                                <span className="text-[10px] text-amber-400/90 font-cinzel font-bold block uppercase tracking-wider">
                                  Aprimoramentos:
                                </span>
                                <div className="space-y-1">
                                  {spl.aprimoramentos.map((apr: string, aprIdx: number) => (
                                    <div key={aprIdx} className="text-[11px] text-stone-300 flex items-start gap-1.5">
                                      <span className="text-amber-400 font-bold">•</span>
                                      <span>{apr}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: BIOGRAFIA & ANOTAÇÕES */}
              {activeTab === 'biografia' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-cinzel uppercase text-gold font-bold block">
                    Histórico, Origens e Anotações de Campanha
                  </label>
                  <textarea
                    rows={8}
                    value={draft.notes || ''}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    placeholder="Histórico do personagem, aparência, personalidade, votos divinos, etc..."
                    className="w-full p-3 bg-black/60 border border-stone-800 focus:border-gold/60 rounded-lg text-xs text-stone-200 leading-relaxed custom-scrollbar"
                  />
                </div>
              )}
            </div>

            {/* Ações da Revisão */}
            <div className="px-5 py-3 border-t border-gold/20 bg-black/80 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-cinzel font-semibold transition-colors"
              >
                Voltar / Trocar PDF
              </button>

              <button
                onClick={handleConfirmSave}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <Check size={16} />
                <span>Confirmar e Cadastrar Herói</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SAVING STATE                                         */}
        {/* ============================================================ */}
        {step === 'saving' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
            <Loader2 size={38} className="animate-spin text-gold" />
            <div className="space-y-1">
              <h4 className="font-cinzel text-base font-bold text-gold uppercase">
                Consagrando Herói no Grimório...
              </h4>
              <p className="text-xs text-stone-400">
                Gravando ficha e inicializando regras Tormenta 20.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
