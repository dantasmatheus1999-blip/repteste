import React from 'react';
import { 
  CharacterVisualState, 
  CustomizerCategory 
} from '../../../types/characterCustomizer';
import { 
  Check, 
  Sparkles, 
  Shield, 
  Sword, 
  User, 
  Smile, 
  Scissors, 
  Shirt, 
  Gem,
  Flame,
  Palette
} from 'lucide-react';

interface CustomizerCategoryOptionsProps {
  category: CustomizerCategory;
  state: CharacterVisualState;
  onChange: (updates: Partial<CharacterVisualState>) => void;
}

export const CustomizerCategoryOptions: React.FC<CustomizerCategoryOptionsProps> = ({
  category,
  state,
  onChange
}) => {
  // Paletas de Cores Predefinidas Canônicas de Arton
  const skinTones = [
    { name: 'Bronzeado de Arton', hex: '#d4a373' },
    { name: 'Pálido Alvo', hex: '#f4ebd9' },
    { name: 'Moreno de Valkaria', hex: '#a67c52' },
    { name: 'Ébano Profundo', hex: '#5c3d2e' },
    { name: 'Élfico Dourado', hex: '#e6c280' },
    { name: 'Cinza Osteon/Golem', hex: '#94a3b8' },
    { name: 'Carmesim Lefou', hex: '#991b1b' },
  ];

  const eyeColors = [
    { name: 'Âmbar de Valkaria', hex: '#eab308' },
    { name: 'Azul Gélido', hex: '#38bdf8' },
    { name: 'Verde Esmeralda', hex: '#22c55e' },
    { name: 'Violeta Arcano', hex: '#a855f7' },
    { name: 'Rubro de Aharadak', hex: '#ef4444' },
    { name: 'Castanho Profundo', hex: '#713f12' },
  ];

  const hairColors = [
    { name: 'Castanho Ébano', hex: '#3d2616' },
    { name: 'Louro Real', hex: '#eab308' },
    { name: 'Ruivo Flamejante', hex: '#c2410c' },
    { name: 'Prata Élfica', hex: '#94a3b8' },
    { name: 'Branco Nevado', hex: '#f8fafc' },
    { name: 'Negro Noturno', hex: '#18181b' },
  ];

  const outfitColors = [
    { name: 'Azul Noturno', hex: '#1e293b' },
    { name: 'Carmesim Imperial', hex: '#7f1d1d' },
    { name: 'Couro Rústico', hex: '#78350f' },
    { name: 'Verde Florestal', hex: '#14532d' },
    { name: 'Preto Sombrio', hex: '#0f172a' },
    { name: 'Branco Sagrado', hex: '#e2e8f0' },
  ];

  return (
    <div className="w-full space-y-3.5 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. CATEGORIA: CORPO                                          */}
      {/* ============================================================ */}
      {category === 'corpo' && (
        <div className="space-y-3">
          {/* Tom de Pele */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette size={13} className="text-amber-400" /> Tom de Pele
              </span>
              <span className="text-[10px] text-stone-400 font-sans normal-case">{state.skinToneName}</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar touch-pan-x">
              {skinTones.map((tone) => (
                <button
                  key={tone.hex}
                  onClick={() => onChange({ skinTone: tone.hex, skinToneName: tone.name })}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer relative shadow-sm ${
                    state.skinTone === tone.hex
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                      : 'border-stone-800 hover:border-amber-900/60'
                  }`}
                  style={{ backgroundColor: tone.hex }}
                  title={tone.name}
                  aria-label={tone.name}
                >
                  {state.skinTone === tone.hex && (
                    <Check size={16} className="text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Biotipo Corporal */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Biotipo Anatômico
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'atletico', name: 'Atlético', desc: 'Equilibrado e ágil' },
                { id: 'esbelto', name: 'Esbelto', desc: 'Fino e gracioso' },
                { id: 'robusto', name: 'Robusto', desc: 'Forte e imponente' },
                { id: 'arcano', name: 'Místico', desc: 'Postura acadêmica' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ bodyType: opt.id as any })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    state.bodyType === opt.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-amber-900/50 hover:bg-stone-900'
                  }`}
                >
                  <div className="text-xs font-cinzel font-bold">{opt.name}</div>
                  <div className="text-[10px] text-stone-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. CATEGORIA: ROSTO                                          */}
      {/* ============================================================ */}
      {category === 'rosto' && (
        <div className="space-y-3">
          {/* Cor dos Olhos */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Olhar & Cor dos Olhos</span>
              <span className="text-[10px] text-stone-400 font-sans normal-case">{state.eyeColorName}</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
              {eyeColors.map((eye) => (
                <button
                  key={eye.hex}
                  onClick={() => onChange({ eyeColor: eye.hex, eyeColorName: eye.name })}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer relative shadow-sm ${
                    state.eyeColor === eye.hex
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                      : 'border-stone-800 hover:border-amber-900/60'
                  }`}
                  style={{ backgroundColor: eye.hex }}
                  title={eye.name}
                  aria-label={eye.name}
                >
                  {state.eyeColor === eye.hex && (
                    <Check size={16} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Expressão Facial */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Expressão Facial
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'determinado', name: 'Determinado', desc: 'Foco inabalável' },
                { id: 'sereno', name: 'Sereno', desc: 'Calmo e confiante' },
                { id: 'astuto', name: 'Astuto', desc: 'Olhar sagaz' },
                { id: 'feroz', name: 'Feroz', desc: 'Fúria de combate' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ expression: opt.id as any })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    state.expression === opt.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-amber-900/50 hover:bg-stone-900'
                  }`}
                >
                  <div className="text-xs font-cinzel font-bold">{opt.name}</div>
                  <div className="text-[10px] text-stone-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Marcas & Cicatrizes */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Marcas & Símbolos
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'nenhuma', name: 'Nenhuma' },
                { id: 'cicatriz', name: 'Cicatriz' },
                { id: 'runa', name: 'Runa Mística' },
                { id: 'pintura', name: 'Pintura' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ faceMarking: opt.id as any })}
                  className={`p-2 rounded-lg text-center border text-xs font-sans transition-all cursor-pointer ${
                    state.faceMarking === opt.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CATEGORIA: CABELO                                         */}
      {/* ============================================================ */}
      {category === 'cabelo' && (
        <div className="space-y-3">
          {/* Cor do Cabelo */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Tonalidade Capilar</span>
              <span className="text-[10px] text-stone-400 font-sans normal-case">{state.hairColorName}</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
              {hairColors.map((hair) => (
                <button
                  key={hair.hex}
                  onClick={() => onChange({ hairColor: hair.hex, hairColorName: hair.name })}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer relative shadow-sm ${
                    state.hairColor === hair.hex
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                      : 'border-stone-800 hover:border-amber-900/60'
                  }`}
                  style={{ backgroundColor: hair.hex }}
                  title={hair.name}
                  aria-label={hair.name}
                >
                  {state.hairColor === hair.hex && (
                    <Check size={16} className={hair.hex === '#f8fafc' ? 'text-black' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Estilo do Penteado */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Corte & Estilo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'curto', name: 'Curto Soldado' },
                { id: 'longo', name: 'Longo Nobre' },
                { id: 'trancas', name: 'Tranças Guerreiras' },
                { id: 'coque', name: 'Coque Mestre' },
                { id: 'selvagem', name: 'Selvagem' },
                { id: 'raspado', name: 'Raspado' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ hairStyle: opt.id as any })}
                  className={`p-2.5 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                    state.hairStyle === opt.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-amber-900/50 hover:bg-stone-900'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. CATEGORIA: ROUPA                                          */}
      {/* ============================================================ */}
      {category === 'roupa' && (
        <div className="space-y-3">
          {/* Cor da Roupa */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Tecido & Tonalidade</span>
              <span className="text-[10px] text-stone-400 font-sans normal-case">{state.outfitColorName}</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
              {outfitColors.map((outfit) => (
                <button
                  key={outfit.hex}
                  onClick={() => onChange({ outfitColor: outfit.hex, outfitColorName: outfit.name })}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer relative shadow-sm ${
                    state.outfitColor === outfit.hex
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                      : 'border-stone-800 hover:border-amber-900/60'
                  }`}
                  style={{ backgroundColor: outfit.hex }}
                  title={outfit.name}
                  aria-label={outfit.name}
                >
                  {state.outfitColor === outfit.hex && (
                    <Check size={16} className={outfit.hex === '#e2e8f0' ? 'text-black' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modelo da Roupa */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Modelo do Traje
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'aventureiro', name: 'Túnica de Aventureiro', desc: 'Prático e durável' },
                { id: 'manto_viajante', name: 'Manto de Viajante', desc: 'Resistente a intempéries' },
                { id: 'nobre', name: 'Vestes Nobres', desc: 'Seda bordada com ouro' },
                { id: 'tunica_magica', name: 'Túnica Rúnica', desc: 'Tecido com fios de mana' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ outfitStyle: opt.id as any })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    state.outfitStyle === opt.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-amber-900/50 hover:bg-stone-900'
                  }`}
                >
                  <div className="text-xs font-cinzel font-bold">{opt.name}</div>
                  <div className="text-[10px] text-stone-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CATEGORIA: ARMADURA                                       */}
      {/* ============================================================ */}
      {category === 'armadura' && (
        <div className="space-y-3">
          {/* Tipo de Armadura */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Tipo de Proteção
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'nenhuma', name: 'Sem Armadura', desc: 'Apenas tecido leve' },
                { id: 'couro', name: 'Gibão de Couro', desc: 'Couro batido leve' },
                { id: 'malha', name: 'Cota de Malha', desc: 'Argolas de aço flexível' },
                { id: 'placas', name: 'Placas de Guerra', desc: 'Aço maciço forjado' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ armorStyle: opt.id as any })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    state.armorStyle === opt.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-amber-900/50 hover:bg-stone-900'
                  }`}
                >
                  <div className="text-xs font-cinzel font-bold">{opt.name}</div>
                  <div className="text-[10px] text-stone-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Acabamento Metálico */}
          {state.armorStyle !== 'nenhuma' && (
            <div>
              <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                Acabamento do Metal
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'aco', name: 'Aço' },
                  { id: 'bronze', name: 'Bronze' },
                  { id: 'ouro', name: 'Ouro' },
                  { id: 'ferro_negro', name: 'F. Negro' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onChange({ armorMaterial: opt.id as any })}
                    className={`p-2 rounded-lg text-center border text-xs font-sans transition-all cursor-pointer ${
                      state.armorMaterial === opt.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. CATEGORIA: ACESSÓRIOS                                     */}
      {/* ============================================================ */}
      {category === 'acessorios' && (
        <div className="space-y-3">
          {/* Capas & Mantos */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Capa & Manto
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'nenhuma', name: 'Sem Capa' },
                { id: 'veludo', name: 'Capa de Veludo Real' },
                { id: 'capuz', name: 'Manto com Capuz' },
                { id: 'rasgada', name: 'Manto de Batalha' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ cloakStyle: opt.id as any })}
                  className={`p-2 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                    state.cloakStyle === opt.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 font-bold'
                      : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-amber-900/50'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Arma ou Foco na Mão */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              Arma / Foco Empunhado
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'nenhuma', name: 'Nenhuma' },
                { id: 'espada', name: 'Espada' },
                { id: 'cajado', name: 'Cajado' },
                { id: 'adagas', name: 'Adaga' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ weaponSilhouette: opt.id as any })}
                  className={`p-2 rounded-lg text-center border text-xs font-sans transition-all cursor-pointer ${
                    state.weaponSilhouette === opt.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Aura Mística de Fundo */}
          <div>
            <label className="block text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" /> Aura Rúnica de Fundo
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'dourada', name: 'Dourada' },
                { id: 'arcana', name: 'Arcana' },
                { id: 'sombria', name: 'Sombria' },
                { id: 'nenhuma', name: 'Nenhuma' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ auraEffect: opt.id as any })}
                  className={`p-2 rounded-lg text-center border text-xs font-sans transition-all cursor-pointer ${
                    state.auraEffect === opt.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
