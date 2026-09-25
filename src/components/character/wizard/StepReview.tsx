import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Heart, Zap, Swords, Package, Flame, Wand2, CheckCircle2 } from 'lucide-react';
import { WizardData } from './types';
import { FIXED_4_CHARACTERS, CharacterSlotPortrait } from './CharacterSelectionScreen3D';
import { resolveStorageUrlWithFallback } from '../../../firebase/storage';

interface StepReviewProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const StepReview: React.FC<StepReviewProps> = ({ data, onSubmit, isSubmitting }) => {
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);

  // Identifica o slot selecionado na etapa 1 (Guerreiro, Arcanista, Clérigo ou Inventor)
  const selectedSlot = useMemo(() => {
    const found = FIXED_4_CHARACTERS.find(
      (c) =>
        c.id === data.avatarId ||
        c.storagePath === data.avatarModelPath ||
        (data.imageUrl && data.imageUrl.includes(c.id))
    );
    return found || FIXED_4_CHARACTERS[0];
  }, [data.avatarId, data.avatarModelPath, data.imageUrl]);

  // Carrega e resolve a URL da miniatura/avatar selecionada sempre que o slot ou imageUrl mudar
  useEffect(() => {
    let isMounted = true;
    setImageError(false);

    // Se já tiver uma URL HTTP ou base64 válida (e não for .glb), usa ela
    if (
      data.imageUrl &&
      !data.imageUrl.includes('.glb') &&
      !data.imageUrl.includes('unsplash') &&
      (data.imageUrl.startsWith('http://') || data.imageUrl.startsWith('https://') || data.imageUrl.startsWith('data:') || data.imageUrl.startsWith('/'))
    ) {
      setResolvedAvatarUrl(data.imageUrl);
      return;
    }

    // Caso contrário, resolve o caminho PNG do Storage para o slot escolhido
    if (selectedSlot?.pngPath) {
      resolveStorageUrlWithFallback(selectedSlot.pngPath)
        .then((url) => {
          if (isMounted && url) {
            setResolvedAvatarUrl(url);
          }
        })
        .catch(() => {
          if (isMounted) {
            setImageError(true);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [data.imageUrl, selectedSlot]);

  return (
    <div className="w-full space-y-3.5 max-w-xl mx-auto flex flex-col pb-6 animate-fadeIn">
      {/* 1. Cabeçalho de Perfil Compacto (Avatar + Nome + Nível + Raça + Classe + Origem) */}
      <div className="bg-[#0e1219]/90 border border-amber-600/50 rounded-2xl p-3 sm:p-3.5 shadow-xl backdrop-blur-sm flex items-center gap-3 sm:gap-4">
        {/* Avatar Quadrado (~75px-85px) com borda dourada discreta */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden border-2 border-amber-500/70 shadow-md bg-stone-950 shrink-0 relative flex items-center justify-center">
          {resolvedAvatarUrl && !imageError ? (
            <img
              src={resolvedAvatarUrl}
              alt={data.name || selectedSlot.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />
          ) : (
            <CharacterSlotPortrait type={selectedSlot.portraitType} isSelected={true} />
          )}

          {/* Cantoneiras decorativas sutis */}
          <div className="absolute inset-0 pointer-events-none border border-amber-400/20 rounded-xl">
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-amber-400" />
            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-amber-400" />
            <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-amber-400" />
            <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-amber-400" />
          </div>
        </div>

        {/* Informações Compactas à Direita */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          {/* Linha Superior: Nome do Herói + Badge de Nível */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-200 truncate leading-tight">
              {data.name || 'Herói Sem Nome'}
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/40 shrink-0">
              Nível {data.level || 1}
            </span>
          </div>

          {/* Linhas Compactas: Raça, Classe, Origem */}
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-stone-300 leading-tight">
              <span className="text-amber-400 font-cinzel font-semibold text-[11px]">Raça:</span>
              <span className="text-stone-200 truncate">{data.raceName || 'Humano'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-300 leading-tight">
              <span className="text-amber-400 font-cinzel font-semibold text-[11px]">Classe:</span>
              <span className="text-stone-200 truncate">{data.className || 'Guerreiro'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-300 leading-tight">
              <span className="text-amber-400 font-cinzel font-semibold text-[11px]">Origem:</span>
              <span className="text-stone-200 truncate">{data.originName || 'Aventureiro'}</span>
            </div>

            {data.deity && data.deity !== 'Nenhuma (Não Devoto)' && (
              <div className="flex items-center gap-1.5 text-stone-300 leading-tight truncate">
                <span className="text-amber-400 font-cinzel font-semibold text-[11px]">Devoção:</span>
                <span className="text-stone-200 truncate">{data.deity.split('(')[0].trim()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 3 Vital Stats Badges: PV MÁX, PM MÁX, DEFESA */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-2.5 text-center shadow-sm">
          <span className="text-[10px] sm:text-xs text-red-400 font-bold uppercase flex items-center justify-center gap-1 font-cinzel">
            <Heart className="w-3.5 h-3.5 fill-red-400" /> PV Máx
          </span>
          <span className="text-xl sm:text-2xl font-cinzel font-bold text-red-200 block mt-0.5">
            {data.hpMax}
          </span>
        </div>

        <div className="bg-blue-950/50 border border-blue-800/50 rounded-xl p-2.5 text-center shadow-sm">
          <span className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase flex items-center justify-center gap-1 font-cinzel">
            <Zap className="w-3.5 h-3.5 fill-blue-400" /> PM Máx
          </span>
          <span className="text-xl sm:text-2xl font-cinzel font-bold text-blue-200 block mt-0.5">
            {data.manaMax}
          </span>
        </div>

        <div className="bg-amber-950/50 border border-amber-800/50 rounded-xl p-2.5 text-center shadow-sm">
          <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase flex items-center justify-center gap-1 font-cinzel">
            <Shield className="w-3.5 h-3.5 fill-amber-400" /> Defesa
          </span>
          <span className="text-xl sm:text-2xl font-cinzel font-bold text-amber-200 block mt-0.5">
            {data.defense}
          </span>
        </div>
      </div>

      {/* 3. 6 Attributes Badges: FOR, DES, CON, INT, SAB, CAR */}
      <div className="grid grid-cols-6 gap-1.5">
        {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map((attr) => {
          const mod = data.attrModifiers[attr] ?? data.attributes[attr] ?? 0;
          return (
            <div
              key={attr}
              className="bg-[#0e1219]/90 border border-amber-900/35 rounded-xl py-2 px-1 text-center shadow-xs"
            >
              <span className="text-[10px] sm:text-xs text-amber-400 font-bold block font-cinzel">
                {attr}
              </span>
              <span className="text-sm sm:text-base font-mono text-stone-100 font-bold block mt-0.5">
                {mod >= 0 ? `+${mod}` : mod}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. ATAQUES E ITENS (Visualização completa sem barra de rolagem interna) */}
      <div className="space-y-3">
        {/* Seção de Ataques */}
        <div className="bg-[#0e1219]/90 border border-amber-900/35 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 font-cinzel flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-amber-400" />
              Ataques ({data.attacks.length})
            </span>
          </div>

          {data.attacks.length === 0 ? (
            <p className="text-xs text-stone-500 italic">Nenhum ataque configurado.</p>
          ) : (
            <div className="space-y-1.5">
              {data.attacks.map((atk) => (
                <div
                  key={atk.id}
                  className="bg-[#07090e] border border-amber-900/25 rounded-xl p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-cinzel text-xs font-bold text-amber-200 block truncate">
                      {atk.name}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {atk.range} • {atk.type}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-400 block">
                      {atk.attackTest} ({atk.damage})
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 block">
                      Crítico: {atk.crit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Itens / Mochila */}
        <div className="bg-[#0e1219]/90 border border-amber-900/35 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 font-cinzel flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              Itens da Mochila ({data.equipment.length})
            </span>
          </div>

          {data.equipment.length === 0 ? (
            <p className="text-xs text-stone-500 italic">Mochila vazia.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {data.equipment.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-[#07090e] border border-amber-900/25 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs"
                >
                  <span className="text-stone-300 truncate mr-2">{item.name}</span>
                  <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0">
                    x{item.quantity} ({((Number(item.weight) || 0) * (Number(item.quantity) || 1)).toFixed(1)} kg)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Poderes e Magias (Se houver) */}
        {(data.powers.length > 0 || data.spells.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.powers.length > 0 && (
              <div className="bg-[#0e1219]/90 border border-amber-900/35 rounded-2xl p-3.5 space-y-2 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-cinzel flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Poderes ({data.powers.length})
                </span>
                <div className="space-y-1">
                  {data.powers.map((pow) => (
                    <div key={pow.id} className="text-xs text-stone-300 truncate">
                      • {pow.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.spells.length > 0 && (
              <div className="bg-[#0e1219]/90 border border-amber-900/35 rounded-2xl p-3.5 space-y-2 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-cinzel flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  Magias ({data.spells.length})
                </span>
                <div className="space-y-1">
                  {data.spells.map((sp) => (
                    <div key={sp.id} className="text-xs text-stone-300 truncate">
                      • {sp.name} ({sp.circle}º Círculo)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Confirmation CTA button: CONSAGRAR HERÓI DE ARTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-cinzel font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>{isSubmitting ? 'Consagrando Ficha...' : 'CONSAGRAR HERÓI DE ARTON'}</span>
        </button>
      </div>
    </div>
  );
};
