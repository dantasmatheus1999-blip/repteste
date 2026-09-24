import React, { useCallback, useRef } from 'react';
import { UserCheck } from 'lucide-react';
import { WizardData } from './types';
import { AvatarSelector3D, Avatar3DOption } from './AvatarSelector3D';

interface StepIdentityProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({ data, onChange }) => {
  const dataRef = useRef(data);
  dataRef.current = data;

  const handleSelect3DAvatar = useCallback((avatar: Avatar3DOption, resolvedUrl: string) => {
    const current = dataRef.current;
    const nextImageUrl = avatar.previewUrl || resolvedUrl || current.imageUrl;

    // Evita chamadas redundantes se os dados já estiverem sincronizados
    if (
      current.avatarType === '3d' &&
      current.avatarId === avatar.id &&
      current.avatarModelPath === avatar.storagePath &&
      current.imageUrl === nextImageUrl
    ) {
      return;
    }

    onChange({
      avatarType: '3d',
      avatarId: avatar.id,
      avatarModelPath: avatar.storagePath,
      imageUrl: nextImageUrl
    });
  }, [onChange]);

  return (
    <div className="w-full space-y-4 max-w-xl mx-auto">
      {/* 1. NOME DO PERSONAGEM E NOME DO JOGADOR */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
        {/* Character Name Input */}
        <div className="space-y-1">
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
          <p className="text-[10px] text-stone-500">
            O nome heróico pelo qual você será reconhecido em Arton.
          </p>
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

      {/* 2. AVATAR 3D DO PERSONAGEM (SUBSTITUI RETRATOS 2D DE ARTON) */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
        <AvatarSelector3D
          selectedAvatarId={data.avatarId || 'guerreiro'}
          selectedModelPath={data.avatarModelPath || '3d/anaogrande-v1.glb'}
          onSelectAvatar={handleSelect3DAvatar}
        />
      </div>
    </div>
  );
};
