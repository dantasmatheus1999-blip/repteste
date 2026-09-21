import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { storage, ref, getDownloadURL } from '../firebase/storage';
import { GameService } from '../services/gameService';
import { CornerBracket } from '../components/common/FantasyOrnaments';

// URL base estável do Firebase Storage para a imagem de capa e ícone
const HERO_IMAGE_DEFAULT_URL =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0150741197.firebasestorage.app/o/img-capas%2Fcapa1.png?alt=media';

const ICON_IMAGE_DEFAULT_URL =
  'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0150741197.firebasestorage.app/o/img-capas%2Fswordandstaff.png?alt=media';

// Cache global em memória para garantir URL imutável e transição instantânea entre abas
let globalCachedHeroUrl: string = HERO_IMAGE_DEFAULT_URL;
let isHeroUrlResolved = false;

let globalCachedIconUrl: string = ICON_IMAGE_DEFAULT_URL;
let isIconUrlResolved = false;

// Preload antecipado no carregamento do módulo JavaScript
if (typeof window !== 'undefined') {
  const preloader = new Image();
  preloader.src = HERO_IMAGE_DEFAULT_URL;

  const iconPreloader = new Image();
  iconPreloader.src = ICON_IMAGE_DEFAULT_URL;
}

export const GrimoireCentralPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isMaster } = useProfile();

  // Modal [ ENTRAR EM CAMPANHA ] (CÓDIGO DE CONVITE)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Imagem de Destaque da Tela Inicial (iniciada diretamente do cache para evitar flicker)
  const [heroImageUrl, setHeroImageUrl] = useState<string>(globalCachedHeroUrl);

  // Ícone Principal (espada + cajado) carregado do Firebase Storage
  const [iconImageUrl, setIconImageUrl] = useState<string>(globalCachedIconUrl);

  useEffect(() => {
    // 1. Resolução da Capa Principal no Firebase Storage
    if (!isHeroUrlResolved) {
      try {
        const imgRef = ref(storage, 'img-capas/capa1.png');
        getDownloadURL(imgRef)
          .then((url) => {
            if (url && url !== globalCachedHeroUrl) {
              globalCachedHeroUrl = url;
              isHeroUrlResolved = true;
              const nextImg = new Image();
              nextImg.onload = () => {
                setHeroImageUrl(url);
              };
              nextImg.src = url;
            } else {
              isHeroUrlResolved = true;
            }
          })
          .catch((err) => {
            console.warn('[Grimoire] Mantendo URL base para capa1.png:', err);
            isHeroUrlResolved = true;
          });
      } catch (e) {
        console.warn('[Grimoire] Erro ao obter referência de imagem:', e);
        isHeroUrlResolved = true;
      }
    }

    // 2. Resolução do Ícone Real (swordandstaff.png) no Firebase Storage
    if (!isIconUrlResolved) {
      try {
        const iconRef = ref(storage, 'img-capas/swordandstaff.png');
        getDownloadURL(iconRef)
          .then((url) => {
            if (url && url !== globalCachedIconUrl) {
              globalCachedIconUrl = url;
              isIconUrlResolved = true;
              const nextIcon = new Image();
              nextIcon.onload = () => {
                setIconImageUrl(url);
              };
              nextIcon.src = url;
            } else {
              isIconUrlResolved = true;
            }
          })
          .catch((err) => {
            console.warn('[Grimoire] Mantendo URL base para swordandstaff.png:', err);
            isIconUrlResolved = true;
          });
      } catch (e) {
        console.warn('[Grimoire] Erro ao obter referência de swordandstaff.png:', e);
        isIconUrlResolved = true;
      }
    }
  }, []);

  // Processa entrada por código de convite
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Por favor, informe o código de convite.');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const resolved = await GameService.getGameByInviteCode(cleanCode);
      if (!resolved) {
        setJoinError('Código de convite inválido ou mesa não encontrada.');
        setIsJoining(false);
        return;
      }

      const userName = profile?.name || user?.displayName || 'Aventureiro';
      await GameService.joinGame(resolved.campaignId, resolved.game.id, {
        displayName: userName,
        userId: user?.uid
      });

      setIsJoinModalOpen(false);
      setInviteCodeInput('');
      navigate(`/campaigns/${resolved.campaignId}/games/${resolved.game.id}`);
    } catch (err: any) {
      console.error('Erro ao entrar no jogo por código:', err);
      setJoinError(err?.message || 'Falha ao entrar na mesa.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="relative w-full flex flex-col justify-start pb-8 sm:pb-12 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* PARTE 1 — IMAGEM GRANDE COM ESPADINHAS E TÍTULO SOBRE A PARTE INFERIOR */}
      <div className="relative w-full block bg-black overflow-hidden">
        <img
          src={heroImageUrl}
          alt="REALMOR - Sua aventura começa agora"
          className="w-full h-auto block"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => {
            setHeroImageUrl(HERO_IMAGE_DEFAULT_URL);
          }}
        />

        {/* Camada sutil de neblina/fade na base da imagem para integrar o título à cena cinematográfica */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* ÍCONE PRINCIPAL + TÍTULO POSICIONADOS SOBRE A PARTE INFERIOR DA IMAGEM */}
        <div className="absolute inset-x-0 bottom-3 sm:bottom-4 z-10 flex flex-col items-center text-center px-4">
          <div className="mb-2 sm:mb-2.5 flex items-center justify-center">
            <img
              src={iconImageUrl}
              alt="REALMOR - Espada e Cajado"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              onError={() => {
                setIconImageUrl(ICON_IMAGE_DEFAULT_URL);
              }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight font-cinzel drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)] max-w-lg">
            SUA AVENTURA COMEÇA AGORA
          </h1>
        </div>
      </div>

      {/* PARTE 2 — ABAIXO DA IMAGEM: SOMENTE DESCRIÇÃO E BOTÕES */}
      <div className="relative w-full flex flex-col items-center text-center px-4 pt-4 sm:pt-5 pb-6">
        {/* Descrição */}
        <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-md">
          Entre em um reino, encontre sua campanha e comece a escrever sua própria história.
        </p>

        {/* Dois botões de ação */}
        <div className="mt-5 sm:mt-6 w-full max-w-md grid grid-cols-2 gap-3 sm:gap-4">
          {/* BOTÃO 1: PROCURAR CAMPANHAS */}
          <button
            onClick={() => {
              if (isMaster) {
                navigate('/master/campaigns');
              } else {
                navigate('/immersive-rpg');
              }
            }}
            className="w-full bg-[#0085ff] hover:bg-[#0074e0] active:bg-[#0060c0] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-2 rounded-lg flex items-center justify-center text-center transition-colors min-h-[46px] cursor-pointer shadow-md active:scale-98"
          >
            PROCURAR CAMPANHAS
          </button>

          {/* BOTÃO 2: ENTRAR EM CAMPANHA */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="w-full bg-[#0085ff] hover:bg-[#0074e0] active:bg-[#0060c0] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-2 rounded-lg flex items-center justify-center text-center transition-colors min-h-[46px] cursor-pointer shadow-md active:scale-98"
          >
            ENTRAR EM CAMPANHA
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL [ ENTRAR EM CAMPANHA ] (CÓDIGO DE CONVITE)          */}
      {/* ========================================================= */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-600/40 bg-[#0d0a08] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6 relative">
            <CornerBracket position="top-left" className="text-amber-500/50" />
            <CornerBracket position="top-right" className="text-amber-500/50" />
            <CornerBracket position="bottom-left" className="text-amber-500/50" />
            <CornerBracket position="bottom-right" className="text-amber-500/50" />

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <LogIn size={22} />
              </div>
              <h3 className="text-xl font-cinzel font-bold text-amber-100 tracking-wide uppercase">
                ⚔️ Entrar em uma Campanha
              </h3>
              <p className="text-xs text-stone-400 font-serif">
                Insira o código de convite fornecido pelo seu Mestre
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-5">
              {joinError && (
                <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/60 text-red-300 text-xs font-serif flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
                  <span>{joinError}</span>
                </div>
              )}

              <div className="text-center">
                <input
                  type="text"
                  maxLength={10}
                  placeholder="K7F-92A"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-center text-2xl font-mono font-bold tracking-[0.25em] uppercase py-3.5 px-4 rounded-xl bg-[#060504] border-2 border-amber-600/50 text-amber-300 focus:outline-none focus:border-amber-400 placeholder:text-stone-700 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isJoining || !inviteCodeInput.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-[0.15em] shadow-lg border border-amber-300/50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isJoining ? 'Localizando mesa...' : 'ENTRAR NA AVENTURA'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsJoinModalOpen(false);
                    setJoinError(null);
                    setInviteCodeInput('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrimoireCentralPage;
