import React, { useState, useRef, useCallback } from 'react';
import { DiceType, DiceSkinConfig, SkinValidationResult } from './types';
import { downloadOfficialTemplatePNG, validateSkinImage, generateOfficialTemplateCanvas, normalizeTextureTo1024 } from './DiceTemplateManager';
import { uploadCustomDiceSkin } from './DiceSkinService';
import { Dice3DPreview } from './Dice3DPreview';
import { 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  HelpCircle, 
  Layers, 
  Sliders, 
  Save, 
  Eye, 
  Loader2 
} from 'lucide-react';

interface DiceSkinUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDiceType?: DiceType;
  onSkinCreated?: (newSkin: DiceSkinConfig) => void;
}

export const DiceSkinUploadModal: React.FC<DiceSkinUploadModalProps> = ({
  isOpen,
  onClose,
  initialDiceType = 'd20',
  onSkinCreated
}) => {
  const [selectedDiceType, setSelectedDiceType] = useState<DiceType>(initialDiceType);
  const [skinName, setSkinName] = useState('');
  const [description, setDescription] = useState('');
  const [roughness, setRoughness] = useState(0.25);
  const [metalness, setMetalness] = useState(0.35);
  const [glowColor, setGlowColor] = useState('');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<SkinValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDiceTypeChange = (type: DiceType) => {
    setSelectedDiceType(type);
    setUploadedFile(null);
    setPreviewUrl(null);
    setValidation(null);
  };

  const handleFileSelect = async (file: File) => {
    setIsValidating(true);
    setSaveError(null);

    try {
      // Automatically normalize the texture to standard 1024x1024 px
      const normalized = await normalizeTextureTo1024(file, file.name);
      setUploadedFile(normalized.file);
      setPreviewUrl(normalized.dataUrl);

      const valResult = await validateSkinImage(normalized.dataUrl, selectedDiceType);
      
      if (normalized.wasResized) {
        valResult.warnings.push(`Resolução original (${normalized.originalWidth}x${normalized.originalHeight}px) normalizada automaticamente para 1024x1024px sem distorção.`);
      }

      setValidation(valResult);
    } catch (err: any) {
      console.error('[DiceSkinUploadModal] File normalization/validation error:', err);
      setValidation({
        valid: false,
        errors: [err.message || 'Erro ao processar e normalizar imagem enviada.'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!uploadedFile || !validation?.valid || !skinName.trim()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const newSkin = await uploadCustomDiceSkin({
        name: skinName.trim(),
        description: description.trim() || `Skin customizada para ${selectedDiceType.toUpperCase()}`,
        diceType: selectedDiceType,
        textureBlobOrFile: uploadedFile,
        previewDataUrl: previewUrl || undefined,
        roughness,
        metalness,
        glowColor: glowColor || undefined
      });

      onSkinCreated?.(newSkin);
      onClose();
    } catch (err: any) {
      console.error('[DiceSkinUploadModal] Save failed:', err);
      setSaveError(err.message || 'Erro ao salvar skin no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  // Temporary preview config for 3D inspection
  const tempSkinConfig: DiceSkinConfig = {
    id: 'temp_preview',
    name: skinName || 'Preview de Teste',
    description: '',
    diceType: selectedDiceType,
    textureUrl: previewUrl || undefined,
    baseColor: '#1e293b',
    edgeColor: '#0f172a',
    numberColor: '#f8fafc',
    highlightColor: '#38bdf8',
    roughness,
    metalness,
    glow: glowColor || undefined
  };

  const diceTypes: { id: DiceType; label: string; sides: number }[] = [
    { id: 'd4', label: 'D4', sides: 4 },
    { id: 'd6', label: 'D6', sides: 6 },
    { id: 'd8', label: 'D8', sides: 8 },
    { id: 'd10', label: 'D10', sides: 10 },
    { id: 'd12', label: 'D12', sides: 12 },
    { id: 'd20', label: 'D20', sides: 20 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Criador de Skin de Dado 3D
                <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Padrão 1024×1024
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Envie uma textura planificada desenhada sobre o modelo padrão UV de 1024×1024 px
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">

          {/* Step 1: Select Dice Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Selecione o Tipo de Dado:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {diceTypes.map((dt) => {
                const isSelected = selectedDiceType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => handleDiceTypeChange(dt.id)}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/20 to-red-950/40 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10 font-bold scale-[1.02]'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-sm font-black font-mono">{dt.label}</span>
                    <span className="text-[10px] text-slate-400">{dt.sides} faces</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Download Blueprint Template */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  Baixar Template UV Oficial de {selectedDiceType.toUpperCase()} (1024×1024)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Baixe a grade planificada oficial em 1024×1024 px com marcações (FACE_01 a FACE_{selectedDiceType === 'd20' ? '20' : selectedDiceType.substring(1)}), linhas de corte e numeração.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadOfficialTemplatePNG(selectedDiceType)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
              Baixar PNG (1024x1024)
            </button>
          </div>

          {/* Step 3: Upload Area + 3D Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Upload & Validation */}
            <div className="flex flex-col gap-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Enviar Imagem Planificada:
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[190px] ${
                  previewUrl
                    ? 'border-emerald-500/60 bg-emerald-950/10'
                    : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/40 hover:bg-slate-900/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={previewUrl} 
                      alt="Texture Preview" 
                      className="w-24 h-24 object-cover rounded-lg border border-emerald-500/40 shadow"
                    />
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {uploadedFile?.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Clique ou arraste para substituir arquivo
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-slate-800 text-amber-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      Arraste a textura planificada aqui
                    </span>
                    <span className="text-xs text-slate-400">
                      Formatos suportados: PNG, JPG, WEBP (Quadrado 1:1)
                    </span>
                  </div>
                )}
              </div>

              {/* Validation Feedback */}
              {validation && (
                <div className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                  validation.valid 
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {validation.valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Textura Validada com Sucesso!
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        Inconsistências Detectadas:
                      </>
                    )}
                  </div>
                  {validation.errors.map((err, i) => (
                    <p key={i} className="text-[11px] text-red-200">• {err}</p>
                  ))}
                  {validation.warnings.map((warn, i) => (
                    <p key={i} className="text-[11px] text-amber-300">• Aviso: {warn}</p>
                  ))}
                  {validation.dimensions && (
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      Dimensões: {validation.dimensions.width}x{validation.dimensions.height}px (1:1)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Realtime 3D Preview */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>3. Modelo 3D Interativo:</span>
                <span className="text-[10px] text-amber-400 font-normal">Arraste para girar em 360°</span>
              </label>

              <Dice3DPreview
                diceType={selectedDiceType}
                skinConfig={tempSkinConfig}
                className="w-full h-64 sm:h-72"
                showControls={true}
              />
            </div>
          </div>

          {/* Step 4: Skin Metadata & PBR Material Config */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              4. Configurações da Skin & Material PBR:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome da Skin <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={skinName}
                  onChange={(e) => setSkinName(e.target.value)}
                  placeholder="Ex: Rubi Sagrado de Khalmyr"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição / Inspiração
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Forjado em obsidiana pura com números dourados"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                  maxLength={120}
                />
              </div>
            </div>

            {/* PBR Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Rugosidade (Roughness):</span>
                  <span className="font-mono text-amber-400 font-bold">{Math.round(roughness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Polido / Vidro</span>
                  <span>Fosco / Pedra</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Metalicidade (Metalness):</span>
                  <span className="font-mono text-amber-400 font-bold">{Math.round(metalness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Não-metálico</span>
                  <span>Metal Puro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              {saveError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!uploadedFile || !validation?.valid || !skinName.trim() || isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando Skin...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar e Aplicar Skin
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
