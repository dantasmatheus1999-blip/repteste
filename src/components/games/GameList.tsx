import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Users, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Shield, 
  Edit,
  Sparkles,
  Dices,
  LogIn,
  CheckCircle2,
  Clock,
  Pause
} from 'lucide-react';
import { Button } from '../Button';
import { Game, GameStatus } from '../../types/game';
import { GameService } from '../../services/gameService';
import { CreateGameModal } from './CreateGameModal';
import { EditGameModal } from './EditGameModal';

interface GameListProps {
  campaignId: string;
  masterId: string;
  campaignSystem?: string;
  isMaster?: boolean;
}

export const GameList: React.FC<GameListProps> = ({
  campaignId,
  masterId,
  campaignSystem = 'Tormenta 20',
  isMaster = true
}) => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = GameService.subscribeToCampaignGames(campaignId, (loadedGames) => {
      setGames(loadedGames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [campaignId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyInvite = (game: Game, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const inviteUrl = `${window.location.origin}/join/${game.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(game.id);
    showToast(`Convite copiado: ${game.inviteCode}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDeleteGame = async (gameId: string, gameName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Deseja realmente banir a mesa "${gameName}" para o esquecimento? Esta ação é irreversível.`)) {
      return;
    }
    setActionLoading(gameId);
    try {
      await GameService.deleteGame(campaignId, gameId);
      showToast('Mesa de jogo excluída com sucesso.');
    } catch (err: any) {
      console.error('Erro ao excluir jogo:', err);
      showToast('Erro ao excluir a mesa de jogo.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnterGame = (gameId: string) => {
    navigate(`/master/campaigns/${campaignId}/games/${gameId}`);
  };

  const renderStatusBadge = (status: GameStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ● ATIVO
          </span>
        );
      case 'lobby':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            ● LOBBY
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-900/90 border border-stone-600/50 text-stone-300">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            ● PAUSADO
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-950 border border-stone-800 text-stone-400">
            <CheckCircle2 size={12} className="text-stone-400" />
            ✓ ENCERRADO
          </span>
        );
      default:
        return null;
    }
  };

  const defaultCover = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80";

  return (
    <section className="space-y-6">
      {/* Toast Notification Dark Fantasy */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-950 to-stone-950 border border-amber-500/50 text-amber-200 shadow-2xl text-xs font-cinzel flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check size={16} className="text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* Header da Seção 🎲 JOGOS */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl border border-amber-800/40 bg-gradient-to-r from-[#1b1510] via-[#14100c] to-[#0c0907] shadow-xl relative overflow-hidden"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.2), inset 0 0 30px rgba(0,0,0,0.8), 0 15px 35px rgba(0,0,0,0.9)'
        }}
      >
        {/* Cantoneiras forjadas */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-600/40 pointer-events-none" />

        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-700/40 text-amber-400 shadow-inner">
              <Dices className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-100 tracking-wide flex items-center gap-2">
                🎲 JOGOS
              </h3>
              <p className="text-xs text-amber-300/60 font-cinzel mt-0.5">
                Mesas virtuais forjadas exclusivamente para esta campanha
              </p>
            </div>
          </div>
        </div>

        {isMaster && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
            className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-bold border-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.3)] text-xs sm:text-sm px-4 py-2"
          >
            + NOVO JOGO
          </Button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-16 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          <span className="text-xs font-cinzel text-amber-300/60 uppercase tracking-widest">
            Consultando o Tomo de Mesas...
          </span>
        </div>
      ) : games.length === 0 ? (
        /* Empty State Medieval */
        <div 
          className="text-center py-16 px-4 rounded-xl border border-dashed border-amber-900/50 bg-[#120e0b]/60 p-8 space-y-4"
          style={{
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
          }}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-500/80 shadow-inner">
            <Sword size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-cinzel font-bold text-amber-100">
              Nenhuma mesa de jogo criada nesta campanha
            </h4>
            <p className="text-xs text-stone-400 max-w-md mx-auto font-serif">
              Forje um novo jogo para reunir os aventureiros em torno desta crônica e compartilhar o código de convite.
            </p>
          </div>
          {isMaster && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
              className="bg-gradient-to-r from-amber-700 to-amber-600 text-stone-950 font-bold text-xs"
            >
              + NOVO JOGO
            </Button>
          )}
        </div>
      ) : (
        /* Grid de Cards de Jogos */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {games.map(game => (
            <div
              key={game.id}
              className="group relative rounded-xl border border-amber-900/40 hover:border-amber-600/70 bg-gradient-to-b from-[#1c1611] via-[#14100c] to-[#0b0907] overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.95),0_0_25px_rgba(180,120,40,0.15)] flex flex-col justify-between"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.15), 0 10px 25px rgba(0,0,0,0.85)'
              }}
            >
              {/* Cantoneiras decorativas do Card */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-amber-500/40 pointer-events-none z-10" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-amber-500/40 pointer-events-none z-10" />

              {/* Capa / Banner da Mesa */}
              <div className="relative h-32 w-full overflow-hidden bg-black/60 border-b border-amber-950/60">
                <img
                  src={game.coverUrl || defaultCover}
                  alt={game.name}
                  className="w-full h-full object-cover object-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 filter contrast-125 saturate-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14100c] via-transparent to-transparent" />
                
                {/* Status no canto da imagem */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  {renderStatusBadge(game.status)}
                </div>

                {/* Código de convite flutuante */}
                <div className="absolute bottom-2 left-3 z-10">
                  <span className="font-mono text-[10px] tracking-widest font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded border border-amber-900/50">
                    {game.inviteCode}
                  </span>
                </div>
              </div>

              {/* Conteúdo Principal do Card */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  {/* ⚔️ NOME DO JOGO */}
                  <h4 
                    onClick={() => handleEnterGame(game.id)}
                    className="text-base sm:text-lg font-cinzel font-bold text-amber-100 group-hover:text-amber-300 transition-colors leading-snug cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚔️</span>
                    <span className="truncate">{game.name}</span>
                  </h4>

                  {/* Sistema */}
                  <p className="text-xs font-cinzel text-amber-400/80 flex items-center gap-1.5">
                    <Shield size={12} className="text-amber-500 shrink-0" />
                    <span>{game.system}</span>
                  </p>

                  {/* Descrição se houver */}
                  {game.description && (
                    <p className="text-xs text-stone-400 font-serif italic line-clamp-2 pt-1">
                      "{game.description}"
                    </p>
                  )}
                </div>

                {/* Informações de Jogadores */}
                <div className="pt-2 border-t border-amber-950/40 flex items-center justify-between text-xs text-stone-300">
                  {/* 👥 quantidade de jogadores */}
                  <span className="flex items-center gap-1.5 font-cinzel text-stone-300 text-xs">
                    <span>👥</span>
                    <span className="text-amber-200/90 font-mono font-bold">
                      Até {game.maxPlayers} jogadores
                    </span>
                  </span>

                  {/* Botão rápido para copiar link */}
                  <button
                    onClick={(e) => handleCopyInvite(game, e)}
                    title="Copiar Código de Convite"
                    className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-black/30 border border-amber-950/50"
                  >
                    {copiedCode === game.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span className="font-mono">{copiedCode === game.id ? 'Copiado' : 'Convite'}</span>
                  </button>
                </div>
              </div>

              {/* Barra de Ações: [ ENTRAR ] e ferramentas do Mestre */}
              <div className="p-4 sm:p-5 pt-0 border-t border-amber-950/40 mt-1 flex items-center gap-2">
                {/* [ ENTRAR ] */}
                <Button
                  onClick={() => handleEnterGame(game.id)}
                  icon={LogIn}
                  className="flex-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.25)] border-amber-500"
                >
                  ENTRAR
                </Button>

                {isMaster && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setGameToEdit(game)}
                      title="Editar Jogo"
                      className="p-2 rounded-lg bg-black/40 text-stone-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-950/60 hover:border-amber-800/60 transition-colors"
                    >
                      <Edit size={15} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteGame(game.id, game.name, e)}
                      disabled={actionLoading === game.id}
                      title="Excluir Mesa"
                      className="p-2 rounded-lg bg-black/40 text-stone-500 hover:text-red-400 hover:bg-red-950/40 border border-amber-950/60 hover:border-red-900/60 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      <CreateGameModal
        campaignId={campaignId}
        masterId={masterId}
        campaignSystem={campaignSystem}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGameCreated={(newGameId) => {
          showToast('Mesa de jogo forjada com sucesso!');
        }}
      />

      {/* Modal de Edição */}
      {gameToEdit && (
        <EditGameModal
          campaignId={campaignId}
          game={gameToEdit}
          isOpen={!!gameToEdit}
          onClose={() => setGameToEdit(null)}
          onGameUpdated={() => {
            showToast('Mesa de jogo atualizada com sucesso!');
            setGameToEdit(null);
          }}
        />
      )}
    </section>
  );
};
