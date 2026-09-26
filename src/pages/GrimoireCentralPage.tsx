import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { storage, ref, getDownloadURL } from '../firebase/storage';
import { GameService } from '../services/gameService';
import { CornerBracket } from '../components/common/FantasyOrnaments';
import { AssetCacheService } from '../services/assetCacheService';

// URL base estável do Firebase Storage para a imagem de capa e ícone
const HERO_IMAGE_DEFAULT_URL =
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';

const ICON_IMAGE_DEFAULT_URL = '/icone-main.png';

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
  const [heroImageUrl, setHeroImageUrl] = useState<string>(() =>
    AssetCacheService.getCachedUrl(HERO_IMAGE_DEFAULT_URL)
  );

  // Ícone Principal (espada + cajado) carregado do Firebase Storage
  const [iconImageUrl, setIconImageUrl] = useState<string>(() =>
    AssetCacheService.getCachedUrl(ICON_IMAGE_DEFAULT_URL)
  );

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
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-end items-center px-4 pb-24 sm:pb-28 pt-8 overflow-hidden select-none bg-black">
      
      {/* ========================================================= */}
      {/* FUNDO: 100% PREENCHIDO (COVER), SEM BORDAS E SEM MARGEM   */}
      {/* ========================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img
          src={heroImageUrl}
          alt="HELMOR - Sua aventura começa agora"
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => {
            setHeroImageUrl(HERO_IMAGE_DEFAULT_URL);
          }}
        />

        {/* Gradiente suave integrado para legibilidade sem criar caixas artificiais */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
      </div>

      {/* ========================================================= */}
      {/* CONTEÚDO PRINCIPAL SOBREPOSTO AO FUNDO                     */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-4 sm:space-y-5 my-auto">
        
        {/* Ícone de Espadas e Cajado */}
        <div className="flex items-center justify-center">
          <img
            src={iconImageUrl}
            alt="Espada e Cajado"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] filter brightness-110"
            loading="eager"
            referrerPolicy="no-referrer"
            onError={() => {
              setIconImageUrl(ICON_IMAGE_DEFAULT_URL);
            }}
          />
        </div>

        {/* Título Principal */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight font-cinzel drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          SUA AVENTURA COMEÇA AGORA
        </h1>

        {/* Descrição */}
        <p className="text-sm sm:text-base text-gray-200 font-normal leading-relaxed max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Entre em um reino, encontre sua campanha e comece a escrever sua própria história.
        </p>

        {/* Dois Botões de Ação */}
        <div className="w-full pt-2 grid grid-cols-2 gap-3 sm:gap-4">
          {/* BOTÃO 1: PROCURAR CAMPANHAS */}
          <button
            id="btn-procurar-campanhas"
            onClick={() => {
              if (isMaster) {
                navigate('/mestre');
              } else {
                navigate('/jogador');
              }
            }}
            className="w-full bg-[#0085ff] hover:bg-[#0074e0] active:bg-[#0060c0] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-2 rounded-lg flex items-center justify-center text-center transition-all min-h-[48px] cursor-pointer shadow-[0_4px_15px_rgba(0,133,255,0.35)] active:scale-95"
          >
            PROCURAR CAMPANHAS
          </button>

          {/* BOTÃO 2: ENTRAR EM CAMPANHA */}
          <button
            id="btn-entrar-campanha"
            onClick={() => setIsJoinModalOpen(true)}
            className="w-full bg-[#0085ff] hover:bg-[#0074e0] active:bg-[#0060c0] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-2 rounded-lg flex items-center justify-center text-center transition-all min-h-[48px] cursor-pointer shadow-[0_4px_15px_rgba(0,133,255,0.35)] active:scale-95"
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
