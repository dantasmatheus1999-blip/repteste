import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Sword, 
  Plus, 
  Users, 
  Copy, 
  Check, 
  Trash2, 
  Edit, 
  Shield, 
  Castle, 
  LogIn, 
  CheckCircle2, 
  ChevronRight, 
  Scroll, 
  Sparkles,
  Dices,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { GameService } from '../../services/gameService';
import { MasterService } from '../../services/masterService';
import { Game, GameStatus } from '../../types/game';
import { Campaign } from '../../types/master';
import { CreateGameModal } from '../../components/games/CreateGameModal';
import { EditGameModal } from '../../components/games/EditGameModal';
import { RealmorLoading } from '../../components/common/RealmorLoading';
import { Button } from '../../components/Button';

// Cantoneiras decorativas para caixas nobres
const OrnateCorners: React.FC<{ color?: string }> = ({ color = 'border-amber-500/50' }) => (
  <div className="absolute inset-0 pointer-events-none">
    <div className={`absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${color}`} />
    <div className={`absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${color}`} />
    <div className={`absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${color}`} />
    <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${color}`} />
  </div>
);

export const NewMasterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isMaster } = useProfile();

  const [masterGames, setMasterGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Modais de Criação e Edição
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null);

  // Estados de feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  const userDisplayName = profile?.name || user?.displayName || 'Matheus Dantas';

  // 1. Inscrição em tempo real nas Salas/Mesas do Mestre
  useEffect(() => {
    if (!user?.uid) {
      setLoadingGames(false);
      return;
    }

    setLoadingGames(true);
    const unsubGames = GameService.subscribeToMasterGames(user.uid, (loadedGames) => {
      setMasterGames(loadedGames);
      setLoadingGames(false);
    });

    return () => unsubGames();
  }, [user?.uid]);

  // 2. Inscrição em tempo real nas Campanhas do Mestre
  useEffect(() => {
    if (!user?.uid) {
      setLoadingCampaigns(false);
      return;
    }

    setLoadingCampaigns(true);
    const unsubCampaigns = MasterService.subscribeToCampaigns(user.uid, (loadedCampaigns) => {
      setCampaigns(loadedCampaigns);
      setLoadingCampaigns(false);
      if (loadedCampaigns.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(loadedCampaigns[0].id);
      }
    });

    return () => unsubCampaigns();
  }, [user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyInvite = (game: Game, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const inviteUrl = `${window.location.origin}/join/${game.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(game.id);
    showToast(`Código ${game.inviteCode} copiado para a área de transferência!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDeleteGame = async (game: Game, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Deseja realmente excluir a mesa "${game.name}"? Todos os jogadores perderão acesso.`)) {
      return;
    }
    setActionLoading(game.id);
    try {
      await GameService.deleteGame(game.campaignId, game.id);
      showToast('Mesa de jogo excluída com sucesso.');
    } catch (err: any) {
      console.error('Erro ao excluir jogo:', err);
      showToast('Erro ao excluir a mesa de jogo.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnterGame = (game: Game) => {
    navigate(`/campaigns/${game.campaignId}/games/${game.id}`);
  };

  // Abre o modal de criar sala garantindo uma campanha de vínculo
  const handleOpenCreateGameModal = async () => {
    if (!user?.uid) return;

    if (campaigns.length === 0) {
      try {
        const newCampId = await MasterService.createCampaign(user.uid, {
          identity: {
            name: 'Crônicas de Arton',
            system: 'Tormenta 20',
            shortDescription: 'Campanha principal criada pelo Mestre.',
            fullDescription: 'Campanha principal para gerenciamento de mesas e aventuras.',
            setting: 'Tormenta 20',
            narrativeTone: 'heroic'
          },
          status: {
            state: 'active',
            visibility: 'private',
            isFavorite: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        } as any);
        setSelectedCampaignId(newCampId);
        setIsCreateModalOpen(true);
      } catch (err) {
        console.error('Erro ao criar campanha base:', err);
        navigate('/master/campaigns/new');
      }
    } else {
      if (!selectedCampaignId) {
        setSelectedCampaignId(campaigns[0].id);
      }
      setIsCreateModalOpen(true);
    }
  };

  const renderStatusBadge = (status: GameStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ● ATIVO
          </span>
        );
      case 'lobby':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            ● SALA DE ESPERA
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 border border-stone-600/50 text-stone-300">
            ● PAUSADO
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-950 border border-stone-800 text-stone-400">
            ✓ ENCERRADO
          </span>
        );
      default:
        return null;
    }
  };

  const defaultCover = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 px-2 sm:px-4 animate-in fade-in duration-300 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded bg-gradient-to-r from-amber-950 to-stone-950 border border-amber-500/50 text-amber-200 shadow-2xl text-xs font-cinzel flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check size={16} className="text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BANNER SUPERIOR: ⚔️ GRIMÓRIO DO MESTRE | 👑 MESTRE Matheus Dantas       */}
      {/* ========================================================================= */}
      <div 
        className="rounded border border-amber-800/40 bg-gradient-to-r from-[#17120d] via-[#100d0a] to-[#0c0907] p-4 sm:p-5 shadow-xl relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.15), inset 0 0 20px rgba(0,0,0,0.8), 0 10px 25px rgba(0,0,0,0.7)'
        }}
      >
        <OrnateCorners color="border-amber-600/40" />

        {/* Lado Esquerdo: Título e Subtítulo */}
        <div className="space-y-1 z-10">
          <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-200 tracking-wider flex items-center gap-2 uppercase">
            <span>⚔️</span>
            <span>GRIMÓRIO DO MESTRE</span>
          </h2>
          <p className="text-xs text-amber-300/60 font-serif italic max-w-xl">
            Governe crônicas vivas, forje destinos e comande seus heróis através de Arton.
          </p>
        </div>

        {/* Lado Direito: Badge de Mestre com Coroa e Nome */}
        <div className="z-10 shrink-0">
          <div className="px-3.5 py-1.5 rounded bg-black/50 border border-amber-600/40 flex items-center gap-2.5 shadow-inner">
            <Crown size={15} className="text-amber-400" />
            <div className="text-left">
              <span className="text-[9px] font-cinzel font-bold uppercase tracking-widest text-amber-400/90 block leading-none">
                MESTRE
              </span>
              <span className="text-xs font-cinzel font-bold text-stone-200 block leading-tight">
                {userDisplayName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ÁREA CENTRAL: NENHUMA MESA DE JOGO FORJADA AINDA (OU LISTA DE MESAS)   */}
      {/* ========================================================================= */}
      {loadingGames ? (
        <div className="p-16 rounded border border-amber-900/30 bg-[#0d0a08]/80 flex justify-center">
          <RealmorLoading message="Consultando os anais do Mestre..." size="sm" />
        </div>
      ) : masterGames.length === 0 ? (
        /* Card Centralizado conforme Screenshot de Referência */
        <div 
          className="rounded border border-amber-900/40 bg-[#0c0907]/90 max-w-lg mx-auto text-center p-8 sm:p-12 space-y-5 shadow-2xl relative mt-8"
          style={{
            boxShadow: 'inset 0 0 35px rgba(0,0,0,0.85), 0 15px 40px rgba(0,0,0,0.9)'
          }}
        >
          <OrnateCorners color="border-amber-600/40" />

          {/* Ícone de Espada em Caixa Dourada */}
          <div className="w-12 h-12 rounded bg-[#17120c] border border-amber-600/50 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Sword size={22} className="text-amber-400" />
          </div>

          {/* Título Principal */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-cinzel font-bold text-amber-100 tracking-[0.12em] uppercase">
              NENHUMA MESA DE JOGO FORJADA AINDA
            </h3>
            <p className="text-xs text-stone-400 font-serif italic max-w-sm mx-auto leading-relaxed">
              Forje sua primeira mesa de jogo, convide seus companheiros e dê início a batalhas lendárias.
            </p>
          </div>

          {/* Botão Dourado: + CRIAR PRIMEIRO JOGO */}
          <div className="pt-2">
            <button
              onClick={handleOpenCreateGameModal}
              className="py-2.5 px-6 rounded bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 border border-amber-300/60 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>CRIAR PRIMEIRO JOGO</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grid de Salas Existentes do Mestre */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-cinzel font-bold text-amber-200 uppercase tracking-wider">
              <Sword size={16} className="text-amber-400" />
              <span>MESAS DE JOGO FORJADAS ({masterGames.length})</span>
            </div>

            <button
              onClick={handleOpenCreateGameModal}
              className="py-1.5 px-3.5 rounded bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} className="stroke-[3]" />
              <span>NOVO JOGO</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {masterGames.map((game) => (
              <div
                key={game.id}
                className="group relative rounded border border-amber-900/40 hover:border-amber-600/70 bg-gradient-to-b from-[#18130e] via-[#120e0b] to-[#0a0806] overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <OrnateCorners color="border-amber-600/30" />

                {/* Capa / Topo */}
                <div className="relative h-32 w-full bg-black/60 overflow-hidden border-b border-amber-950/60">
                  <img
                    src={game.coverUrl || defaultCover}
                    alt={game.name}
                    className="w-full h-full object-cover object-center opacity-45 group-hover:opacity-60 transition-all duration-500 filter contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120e0b] via-transparent to-transparent" />
                  
                  {/* Status */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {renderStatusBadge(game.status)}
                  </div>

                  {/* Código da Sala */}
                  <div className="absolute bottom-2 left-2.5 z-10">
                    <span className="font-mono text-[10px] tracking-widest font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-700/50">
                      {game.inviteCode}
                    </span>
                  </div>
                </div>

                {/* Informações da Sala */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 
                      onClick={() => handleEnterGame(game)}
                      className="text-base font-cinzel font-bold text-amber-100 group-hover:text-amber-300 transition-colors truncate cursor-pointer flex items-center gap-1.5"
                    >
                      <span>⚔️</span>
                      <span className="truncate">{game.name}</span>
                    </h4>

                    <p className="text-[11px] font-cinzel text-amber-400/80 flex items-center gap-1.5">
                      <Shield size={11} className="text-amber-500" />
                      <span>{game.system || 'Tormenta 20'}</span>
                    </p>

                    {game.description && (
                      <p className="text-xs text-stone-400 font-serif italic line-clamp-2 pt-0.5">
                        "{game.description}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-amber-950/60 flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center gap-1.5 text-xs text-stone-300">
                      <Users size={12} className="text-amber-400" />
                      <span className="font-mono">Até {game.maxPlayers || 5} jogadores</span>
                    </span>

                    <button
                      onClick={(e) => handleCopyInvite(game, e)}
                      title="Copiar código de convite"
                      className="text-[10px] text-stone-400 hover:text-amber-300 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 border border-amber-950/60 cursor-pointer"
                    >
                      {copiedCode === game.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedCode === game.id ? 'Copiado' : 'Convite'}</span>
                    </button>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="p-3 pt-0 border-t border-amber-950/40 mt-1 flex items-center gap-2">
                  <button
                    onClick={() => handleEnterGame(game)}
                    className="flex-1 py-2 rounded bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogIn size={13} />
                    <span>ENTRAR NA SALA</span>
                  </button>

                  <button
                    onClick={() => setGameToEdit(game)}
                    title="Editar Jogo"
                    className="p-2 rounded bg-black/40 text-stone-400 hover:text-amber-300 border border-amber-950/60 hover:border-amber-800/60 transition-colors cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteGame(game, e)}
                    disabled={actionLoading === game.id}
                    title="Excluir Mesa"
                    className="p-2 rounded bg-black/40 text-stone-500 hover:text-red-400 border border-amber-950/60 hover:border-red-900/60 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAIS DE CRIAÇÃO E EDIÇÃO                                            */}
      {/* ========================================================================= */}
      {selectedCampaignId && (
        <CreateGameModal
          campaignId={selectedCampaignId}
          masterId={user?.uid || ''}
          campaignSystem="Tormenta 20"
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGameCreated={(newGameId) => {
            showToast('Mesa de jogo forjada com sucesso!');
            setIsCreateModalOpen(false);
            navigate(`/campaigns/${selectedCampaignId}/games/${newGameId}`);
          }}
        />
      )}

      {gameToEdit && (
        <EditGameModal
          campaignId={gameToEdit.campaignId}
          game={gameToEdit}
          isOpen={!!gameToEdit}
          onClose={() => setGameToEdit(null)}
          onGameUpdated={() => {
            showToast('Mesa de jogo atualizada com sucesso!');
            setGameToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default NewMasterPage;
