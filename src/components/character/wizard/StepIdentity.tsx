import React, { useRef, useState } from 'react';
import { Shield, Upload, Check, UserCheck, Link as LinkIcon, Loader2 } from 'lucide-react';
import { WizardData, PRESET_AVATARS } from './types';
import { compressImageFile } from '../../../utils/imageCompression';
import { StorageService } from '../../../services/storageService';

interface StepIdentityProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const metadata = await StorageService.uploadFile(file, {
          category: 'avatar',
          name: file.name.replace(/\.[^/.]+$/, '')
        });
        onChange({ imageUrl: metadata.url });
      } catch (err) {
        console.warn('Fallback para compressão local ao falhar upload direto:', err);
        try {
          const compressedDataUrl = await compressImageFile(file, {
            maxWidth: 300,
            maxHeight: 300,
            quality: 0.8,
            cropToSquare: true
          });
          onChange({ imageUrl: compressedDataUrl });
        } catch (e) {
          console.error('Erro ao processar imagem:', e);
        }
      } finally {
        setIsCompressing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <div className="w-full space-y-4 max-w-xl mx-auto">
      {/* Hero Avatar & Core Inputs Card */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
        {/* Top: Avatar Preview & Character Name side-by-side on mobile */}
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_15px_rgba(217,119,6,0.3)] bg-stone-950">
            {isCompressing ? (
              <div className="w-full h-full flex items-center justify-center bg-stone-950">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : (
              <img
                src={data.imageUrl}
                alt={data.name || 'Retrato'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-600 text-stone-950 shadow-md hover:bg-amber-500 transition-colors disabled:opacity-50"
            title="Trocar imagem"
          >
            {isCompressing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          </button>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Nome do Personagem <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ex: Roland de Valkaria..."
              maxLength={60}
              className="w-full bg-stone-950 border border-amber-900/60 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 text-base font-cinzel font-bold transition-all shadow-inner"
            />
            <p className="text-[10px] text-stone-500 truncate">
              O nome heróico pelo qual você será reconhecido em Arton.
            </p>
          </div>
        </div>

        {/* Player Name Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-1">
            Nome do Jogador
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.playerName}
              onChange={(e) => onChange({ playerName: e.target.value })}
              placeholder="Seu nome ou apelido..."
              maxLength={50}
              className="w-full bg-stone-950 border border-amber-900/50 rounded-xl px-3.5 py-2 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <UserCheck className="absolute right-3 top-2.5 w-4 h-4 text-stone-600 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Preset Avatars Selection */}
      <div className="bg-stone-900/60 border border-amber-900/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Retratos de Arton
          </span>
          <span className="text-[10px] text-stone-400">Selecione com 1 toque</span>
        </div>

        {/* 2 rows of 4 avatars (8 total) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {PRESET_AVATARS.map((preset) => {
            const isSelected = data.imageUrl === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ imageUrl: preset.url })}
                title={preset.label}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-500/60 shadow-[0_0_12px_rgba(217,119,6,0.4)] scale-105'
                    : 'border-stone-800 hover:border-amber-700/60 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom URL or Upload option in 1 compact line */}
        <div className="pt-2 border-t border-amber-900/20 flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-500" />
            <input
              type="url"
              value={data.imageUrl.startsWith('data:') ? '' : data.imageUrl}
              onChange={(e) => onChange({ imageUrl: e.target.value })}
              placeholder="Cole o link de uma imagem da internet..."
              className="w-full bg-stone-950 border border-amber-900/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-300 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/40 text-amber-300 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
