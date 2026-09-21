import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  Plus, 
  Download, 
  Trash2, 
  Palette, 
  Eye 
} from 'lucide-react';
import { useDice3D } from './Dice3DContext';
import { DiceSkin, DiceType, DiceSkinConfig } from './types';
import { DICE_SKINS } from './diceSkins';
import { subscribeToCustomSkins, deleteCustomDiceSkin } from './DiceSkinService';
import { downloadOfficialTemplatePNG } from './DiceTemplateManager';
import { DiceSkinUploadModal } from './DiceSkinUploadModal';

const DICE_TYPES: { type: DiceType; label: string; sides: number }[] = [
  { type: 'd4', label: 'D4', sides: 4 },
  { type: 'd6', label: 'D6', sides: 6 },
  { type: 'd8', label: 'D8', sides: 8 },
  { type: 'd10', label: 'D10', sides: 10 },
  { type: 'd12', label: 'D12', sides: 12 },
  { type: 'd20', label: 'D20', sides: 20 },
  { type: 'd100', label: 'D100', sides: 100 }
];

export const DiceOptionsDrawer: React.FC = () => {
  const {
    isOptionsOpen,
    setIsOptionsOpen,
    activeDiceType,
    setActiveDiceType,
    activeSkin,
    setActiveSkin,
    roll3DDice,
    isRolling
  } = useDice3D();

  const [availableSkins, setAvailableSkins] = useState<DiceSkinConfig[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Subscribe to all skins (built-in + custom from Firestore/local)
  useEffect(() => {
    const unsub = subscribeToCustomSkins(activeDiceType, (skins) => {
      setAvailableSkins(skins);
    });
    return () => unsub();
  }, [activeDiceType]);

  if (!isOptionsOpen) return null;

  const currentSkinConfig = availableSkins.find(s => s.id === activeSkin) || DICE_SKINS[activeSkin as keyof typeof DICE_SKINS] || DICE_SKINS['black_obsidian'];

  const handleDeleteCustomSkin = async (skinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta skin customizada?')) {
      await deleteCustomDiceSkin(skinId);
      if (activeSkin === skinId) {
        setActiveSkin('black_obsidian');
      }
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={() => setIsOptionsOpen(false)}
      >
        <div
          className="bg-[#12151c] border-t sm:border border-[#262c36] rounded-t-2xl sm:rounded-2xl max-w-md w-full p-4 sm:p-5 space-y-4 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <SlidersHorizontal size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                  Configurações de Dados 3D
                </h3>
                <p className="text-[11px] text-stone-400">
                  Modelos Fixos + Texturas de Planificação UV
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOptionsOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {/* 1. Seleção do Tipo de Dado */}
            <div>
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                Tipo de Dado Ativo:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {DICE_TYPES.map((d) => {
                  const isSelected = activeDiceType === d.type;
                  return (
                    <button
                      key={d.type}
                      onClick={() => setActiveDiceType(d.type)}
                      className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#8b1e1e] to-[#501010] text-white border border-[#b33636] shadow-md scale-102 font-mono'
                          : 'bg-[#181d26] hover:bg-[#202733] text-stone-300 border border-[#262c36] font-mono'
                      }`}
                    >
                      <span className="text-sm font-black">{d.label}</span>
                      <span className="text-[9px] text-stone-400 font-sans">{d.sides} faces</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Seleção de Skins & Texturas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Skins & Texturas de {activeDiceType.toUpperCase()}:
                </label>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                >
                  <Plus size={13} />
                  Criar Nova Skin
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableSkins.map((skin) => {
                  const isSelected = activeSkin === skin.id;

                  return (
                    <button
                      key={skin.id}
                      onClick={() => setActiveSkin(skin.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                        isSelected
                          ? 'bg-[#1a2130] border-amber-500/80 shadow-md shadow-amber-500/10'
                          : 'bg-[#161a22] border-[#262c36] hover:border-[#384252]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {skin.previewUrl || skin.textureUrl ? (
                          <img
                            src={skin.previewUrl || skin.textureUrl}
                            alt={skin.name}
                            className="w-5 h-5 rounded-full object-cover border border-white/30 shrink-0"
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full border border-white/30 shrink-0 shadow-sm"
                            style={{ backgroundColor: skin.baseColor || '#881313' }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-stone-200 font-medium truncate">
                            {skin.name}
                          </p>
                          <span className="text-[9px] text-stone-500 block">
                            {skin.isBuiltIn ? 'Oficial' : 'Custom'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && <Check size={14} className="text-amber-400" />}
                        {!skin.isBuiltIn && (
                          <span
                            onClick={(e) => handleDeleteCustomSkin(skin.id, e)}
                            title="Excluir skin"
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 text-stone-500 transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Ações Rápidas de Planificação */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
              <div className="text-[11px] text-stone-400">
                <span className="font-semibold text-stone-200 block">Template de Arte (1024×1024):</span>
                Baixe o mapa de corte UV de {activeDiceType.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => downloadOfficialTemplatePNG(activeDiceType)}
                className="px-2.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 text-[11px] font-bold flex items-center gap-1.5 transition shrink-0"
              >
                <Download size={13} />
                Baixar PNG (1024×1024)
              </button>
            </div>
          </div>

          {/* Footer / Botão de Rolagem */}
          <div className="pt-2 border-t border-[#21262d] flex items-center gap-2">
            <button
              disabled={isRolling}
              onClick={() => {
                setIsOptionsOpen(false);
                roll3DDice({ diceType: activeDiceType, skin: activeSkin });
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8b1e1e] to-[#a32222] hover:brightness-110 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/50 disabled:opacity-50"
            >
              <Sparkles size={15} />
              <span>Rolar {activeDiceType.toUpperCase()} 3D ({currentSkinConfig?.name || 'Padrão'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Skin Creator Upload Modal */}
      <DiceSkinUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialDiceType={activeDiceType}
        onSkinCreated={(newSkin) => {
          if (newSkin.diceType && newSkin.diceType !== activeDiceType) {
            setActiveDiceType(newSkin.diceType);
          }
          setActiveSkin(newSkin.id);
          setAvailableSkins((prev) => {
            const exists = prev.some(s => s.id === newSkin.id);
            if (exists) return prev.map(s => s.id === newSkin.id ? newSkin : s);
            return [newSkin, ...prev];
          });
        }}
      />
    </>
  );
};
