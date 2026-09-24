import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Sparkles, 
  Scissors, 
  Eye, 
  Activity, 
  UserCheck, 
  ChevronLeft, 
  RotateCcw, 
  Dices, 
  Download, 
  Info, 
  ShieldAlert,
  Camera,
  CheckCircle2,
  Box
} from 'lucide-react';
import { CharacterViewer3D } from '../../components/makehuman/CharacterViewer3D';
import { CharacterPresetSelector } from '../../components/makehuman/CharacterPresetSelector';
import { HairSelector } from '../../components/makehuman/HairSelector';
import { SkinSelector } from '../../components/makehuman/SkinSelector';
import { EyeSelector } from '../../components/makehuman/EyeSelector';
import { FacialHairSelector } from '../../components/makehuman/FacialHairSelector';

import { 
  GenderType, 
  ViewMode, 
  CHARACTER_PRESETS, 
  CharacterPreset, 
  SKIN_TONES, 
  EYE_COLORS, 
  BODY_PRESETS,
  ASSET_LICENSES 
} from '../../data/makehuman/presets';
import { 
  HAIR_STYLES, 
  HAIR_COLORS, 
  FACIAL_HAIR_OPTIONS 
} from '../../data/makehuman/hairstyles';

type ActiveTab = 'presets' | 'hair' | 'skin' | 'eyes' | 'facial_hair';

export const MakeHumanTestPage: React.FC = () => {
  const navigate = useNavigate();

  // Character Customization State
  const [gender, setGender] = useState<GenderType>('male');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('preset_male_warrior');
  const [hairStyleId, setHairStyleId] = useState<string>('vitruvian_hair');
  const [hairColorId, setHairColorId] = useState<string>('dark_brown');
  const [skinToneId, setSkinToneId] = useState<string>('tan_sun');
  const [eyeColorId, setEyeColorId] = useState<string>('storm_gray');
  const [facialHairId, setFacialHairId] = useState<string>('stubble');
  const [bodyPresetId, setBodyPresetId] = useState<string>('robust');

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('presets');
  const [viewMode, setViewMode] = useState<ViewMode>('full_body');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Show temporary toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Switch Gender
  const handleGenderChange = (newGender: GenderType) => {
    if (newGender === gender) return;
    setGender(newGender);

    // Pick first matching preset for that gender
    const defaultPreset = CHARACTER_PRESETS.find(p => p.gender === newGender) || CHARACTER_PRESETS[0];
    applyPreset(defaultPreset);
    showToast(`Gênero alterado para ${newGender === 'male' ? 'Masculino' : 'Feminino'}`);
  };

  // Apply a Character Preset
  const applyPreset = (preset: CharacterPreset) => {
    setSelectedPresetId(preset.id);
    setGender(preset.gender);
    setHairStyleId(preset.hairStyleId);
    setHairColorId(preset.hairColorId);
    setSkinToneId(preset.skinToneId);
    setEyeColorId(preset.eyeColorId);
    setFacialHairId(preset.facialHairId);
    setBodyPresetId(preset.bodyPresetId);
    showToast(`Preset aplicado: "${preset.name}"`);
  };

  // Randomize Character
  const handleRandomize = () => {
    const randomGender: GenderType = Math.random() > 0.5 ? 'male' : 'female';
    const randomHairStyle = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
    const randomSkinTone = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id;
    const randomEyeColor = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].id;
    const randomBodyPreset = BODY_PRESETS[Math.floor(Math.random() * BODY_PRESETS.length)].id;
    const randomFacialHair = randomGender === 'female' 
      ? 'none' 
      : FACIAL_HAIR_OPTIONS[Math.floor(Math.random() * FACIAL_HAIR_OPTIONS.length)].id;

    setGender(randomGender);
    setSelectedPresetId(null);
    setHairStyleId(randomHairStyle);
    setHairColorId(randomHairColor);
    setSkinToneId(randomSkinTone);
    setEyeColorId(randomEyeColor);
    setFacialHairId(randomFacialHair);
    setBodyPresetId(randomBodyPreset);

    showToast('Personagem gerado aleatoriamente!');
  };

  // Reset to default
  const handleReset = () => {
    const defaultPreset = CHARACTER_PRESETS[0];
    applyPreset(defaultPreset);
    setViewMode('full_body');
    showToast('Customização restaurada ao padrão');
  };

  // Export JSON summary
  const getConfigurationJson = () => {
    return JSON.stringify({
      characterCreator: 'Helmor 3D MakeHuman Prototype',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      baseTopology: 'MakeHuman / MPFB (Vitruvian Standard)',
      gender,
      presetId: selectedPresetId,
      hairStyle: HAIR_STYLES.find(h => h.id === hairStyleId),
      hairColor: HAIR_COLORS.find(c => c.id === hairColorId),
      skinTone: SKIN_TONES.find(s => s.id === skinToneId),
      eyeColor: EYE_COLORS.find(e => e.id === eyeColorId),
      facialHair: FACIAL_HAIR_OPTIONS.find(f => f.id === facialHairId),
      bodyProportion: BODY_PRESETS.find(b => b.id === bodyPresetId),
      licenses: ASSET_LICENSES
    }, null, 2);
  };

  return (
    <div className="min-h-screen bg-[#07060a] text-stone-200 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-950/90 border border-amber-500/60 text-amber-200 px-4 py-2 rounded-xl text-xs font-cinzel font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="h-14 sm:h-16 border-b border-amber-900/30 bg-[#0c0a14]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/characters')}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-200 border border-stone-800 transition-all cursor-pointer"
            title="Voltar aos Personagens"
          >
            <ChevronLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-xs sm:text-base font-bold text-amber-300 tracking-wider uppercase">
                Character Creator 3D
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hidden sm:inline-block">
                MakeHuman / MPFB
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-sans hidden sm:block">
              Protótipo experimental isolado • /test/makehuman
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleRandomize}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 text-[11px] font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Sortear aparência aleatória"
          >
            <Dices size={14} className="text-amber-400" />
            <span className="hidden md:inline">Aleatório</span>
          </button>

          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 text-[11px] font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Resetar para o padrão"
          >
            <RotateCcw size={14} />
            <span className="hidden md:inline">Padrão</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 text-[11px] font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Exportar dados da customização"
          >
            <Download size={14} />
            <span className="hidden md:inline">JSON</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        
        {/* Left / Center Column: 3D Character Stage (7 Cols on Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-[480px] sm:h-[540px] lg:h-[620px] w-full relative">
            <CharacterViewer3D
              gender={gender}
              hairStyleId={hairStyleId}
              hairColorId={hairColorId}
              skinToneId={skinToneId}
              eyeColorId={eyeColorId}
              facialHairId={facialHairId}
              bodyPresetId={bodyPresetId}
              viewMode={viewMode}
              onViewModeChange={(m) => setViewMode(m)}
            />
          </div>

          {/* Bottom Summary Bar for Active Configuration */}
          <div className="p-3 rounded-xl bg-[#0e0d16] border border-amber-900/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-stone-500 uppercase block">Gênero & Biotipo</span>
              <span className="text-amber-200 font-bold capitalize">
                {gender === 'male' ? 'Masculino' : 'Feminino'} • {BODY_PRESETS.find(b => b.id === bodyPresetId)?.name.split(' ')[0]}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-stone-500 uppercase block">Cabelo & Cor</span>
              <span className="text-amber-200 font-bold truncate block">
                {HAIR_STYLES.find(h => h.id === hairStyleId)?.name.split(' ')[0]} • {HAIR_COLORS.find(c => c.id === hairColorId)?.name.split(' ')[0]}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-stone-500 uppercase block">Pele & Olhos</span>
              <span className="text-amber-200 font-bold truncate block">
                {SKIN_TONES.find(s => s.id === skinToneId)?.name.split(' ')[0]} • {EYE_COLORS.find(e => e.id === eyeColorId)?.name.split(' ')[0]}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-stone-500 uppercase block">Pelos Faciais</span>
              <span className="text-amber-200 font-bold truncate block">
                {gender === 'female' ? 'N/A' : FACIAL_HAIR_OPTIONS.find(f => f.id === facialHairId)?.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls (5 Cols on Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* 1. Gênero Selector */}
          <div className="p-3.5 rounded-2xl bg-[#0f0e18] border border-amber-900/40 space-y-2 shadow-xl">
            <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-300 block">
              1. Base do Personagem
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleGenderChange('male')}
                className={`py-2.5 px-3 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  gender === 'male'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-[#14121e] border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <User size={15} />
                <span>Masculino</span>
              </button>

              <button
                onClick={() => handleGenderChange('female')}
                className={`py-2.5 px-3 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  gender === 'female'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-[#14121e] border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <User size={15} />
                <span>Feminino</span>
              </button>
            </div>
          </div>

          {/* 2. Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'presets'
                  ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-md'
                  : 'bg-[#12111a] border-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Presets</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('hair');
                setViewMode('face');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'hair'
                  ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-md'
                  : 'bg-[#12111a] border-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Scissors size={13} className="text-amber-400" />
              <span>Cabelo & Cor</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('skin');
                setViewMode('full_body');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'skin'
                  ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-md'
                  : 'bg-[#12111a] border-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Activity size={13} className="text-amber-400" />
              <span>Pele & Corpo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('eyes');
                setViewMode('face');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'eyes'
                  ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-md'
                  : 'bg-[#12111a] border-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Eye size={13} className="text-sky-400" />
              <span>Olhos</span>
            </button>

            {gender === 'male' && (
              <button
                onClick={() => {
                  setActiveTab('facial_hair');
                  setViewMode('face');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'facial_hair'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-md'
                    : 'bg-[#12111a] border-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                <UserCheck size={13} className="text-amber-400" />
                <span>Barba</span>
              </button>
            )}
          </div>

          {/* 3. Tab Content Container */}
          <div className="p-4 rounded-2xl bg-[#0f0e18] border border-amber-900/40 shadow-xl space-y-4 min-h-[300px]">
            {activeTab === 'presets' && (
              <CharacterPresetSelector
                gender={gender}
                selectedPresetId={selectedPresetId}
                onSelectPreset={(p) => applyPreset(p)}
              />
            )}

            {activeTab === 'hair' && (
              <HairSelector
                selectedHairStyleId={hairStyleId}
                selectedHairColorId={hairColorId}
                onSelectHairStyle={(id) => {
                  setHairStyleId(id);
                  setSelectedPresetId(null);
                }}
                onSelectHairColor={(id) => {
                  setHairColorId(id);
                  setSelectedPresetId(null);
                }}
              />
            )}

            {activeTab === 'skin' && (
              <SkinSelector
                selectedSkinToneId={skinToneId}
                selectedBodyPresetId={bodyPresetId}
                onSelectSkinTone={(id) => {
                  setSkinToneId(id);
                  setSelectedPresetId(null);
                }}
                onSelectBodyPreset={(id) => {
                  setBodyPresetId(id);
                  setSelectedPresetId(null);
                }}
              />
            )}

            {activeTab === 'eyes' && (
              <EyeSelector
                selectedEyeColorId={eyeColorId}
                onSelectEyeColor={(id) => {
                  setEyeColorId(id);
                  setSelectedPresetId(null);
                }}
              />
            )}

            {activeTab === 'facial_hair' && (
              <FacialHairSelector
                gender={gender}
                selectedFacialHairId={facialHairId}
                onSelectFacialHair={(id) => {
                  setFacialHairId(id);
                  setSelectedPresetId(null);
                }}
              />
            )}
          </div>

          {/* Informational Banner */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-[11px] text-stone-400 font-sans flex items-start gap-2.5">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Ecossistema MakeHuman / MPFB:</strong> Modelos 3D humanos hiper-realistas com iluminação PBR de 3 pontos, suporte a Galaxy S23 e lazy loading. Sem conexão ao Firestore nesta etapa.
            </p>
          </div>
        </div>
      </main>

      {/* JSON Export Modal */}
      {showConfigModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setShowConfigModal(false)}
        >
          <div 
            className="max-w-xl w-full bg-[#100e18] border border-amber-900/60 rounded-2xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-300 uppercase flex items-center gap-2">
                <Download size={16} className="text-amber-400" />
                <span>Configuração do Personagem 3D (JSON)</span>
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-stone-400 hover:text-stone-200 text-xs font-mono px-2 py-1 rounded bg-stone-900 border border-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 font-sans">
              Dados estruturados da customização visual para posterior integração ou persistência:
            </p>

            <pre className="p-3 rounded-xl bg-black/70 border border-stone-800 text-[10px] font-mono text-emerald-300 max-h-72 overflow-y-auto custom-scrollbar select-all">
              {getConfigurationJson()}
            </pre>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getConfigurationJson());
                  showToast('JSON copiado para a área de transferência!');
                  setShowConfigModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Copiar JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
