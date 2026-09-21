import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Castle, 
  ChevronLeft,
  Users,
  ScrollText,
  MapPin,
  Swords,
  Notebook,
  Settings,
  Calendar,
  MoreVertical,
  ChevronRight,
  Edit,
  ExternalLink,
  Heart,
  Trash2,
  Archive,
  Copy,
  UserPlus,
  BookOpen,
  Globe,
  Scroll,
  Crown,
  AlertTriangle,
  Dices,
  Sword
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { Campaign, Session, NPC, Location, Encounter, MasterNote, CampaignPlayer } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { cn } from '../../lib/utils';
import { GameList } from '../../components/games/GameList';
import { RealmorLoading } from '../../components/common/RealmorLoading';

export const CampaignDetailPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [notes, setNotes] = useState<MasterNote[]>([]);
  const [players, setPlayers] = useState<CampaignPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'sessions' | 'npcs' | 'locations' | 'encounters' | 'notes'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    let unsubCampaign: () => void;
    let unsubSessions: () => void;
    let unsubNpcs: () => void;
    let unsubLocations: () => void;
    let unsubEncounters: () => void;
    let unsubNotes: () => void;
    let unsubPlayers: () => void;

    const fetchData = async () => {
      try {
        const campaignData = await MasterService.getCampaign(id);
        if (campaignData) {
          setCampaign(campaignData);
          
          // Subscribe to related data
          unsubCampaign = MasterService.subscribeToCampaign(id, setCampaign);
          unsubSessions = MasterService.subscribeToSessions(id, setSessions);
          unsubNpcs = MasterService.subscribeToNPCs(id, setNpcs);
          unsubLocations = MasterService.subscribeToLocations(id, setLocations);
          unsubEncounters = MasterService.subscribeToEncounters(id, setEncounters);
          unsubNotes = MasterService.subscribeToMasterNotes(id, setNotes);
          unsubPlayers = MasterService.subscribeToPlayers(id, setPlayers);

          setLoading(false);
        } else {
          setLoading(false);
          navigate('/master/campaigns');
        }
      } catch (error) {
        console.error("Erro ao carregar campanha:", error);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      unsubCampaign?.();
      unsubSessions?.();
      unsubNpcs?.();
      unsubLocations?.();
      unsubEncounters?.();
      unsubNotes?.();
      unsubPlayers?.();
    };
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <RealmorLoading message="Carregando crônicas da campanha..." subtitle="Consultando anotações e fichas do mestre" size="lg" />
      </div>
    );
  }

  if (!campaign) return null;

  const handleToggleFavorite = async () => {
    if (!id) return;
    try {
      await MasterService.toggleCampaignFavorite(id, !campaign.status.isFavorite);
      setCampaign(prev => prev ? {
        ...prev,
        status: { ...prev.status, isFavorite: !prev.status.isFavorite }
      } : null);
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  const handleArchive = async () => {
    if (!id || !campaign) return;
    setIsProcessing(true);
    try {
      const isArchiving = campaign.status.state !== 'archived';
      await MasterService.archiveCampaign(id, isArchiving);
      setCampaign(prev => prev ? {
        ...prev,
        status: { ...prev.status, state: isArchiving ? 'archived' : 'active' }
      } : null);
      setShowArchiveModal(false);
    } catch (error) {
      console.error("Erro ao arquivar:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    if (!id || !user) return;
    setIsProcessing(true);
    try {
      const newId = await MasterService.duplicateCampaign(id, user.uid);
      if (newId) {
        navigate(`/master/campaigns/${newId}`);
      }
    } catch (error) {
      console.error("Erro ao duplicar:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      await MasterService.deleteCampaign(id);
      navigate('/master/campaigns');
    } catch (error) {
      console.error("Erro ao excluir:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !id) return;
    setIsProcessing(true);
    try {
      await MasterService.addPlayerToCampaign(id, {
        name: inviteEmail.split('@')[0], // Use email prefix as name for now
        status: 'invited',
        roleAtTable: 'Jogador',
        masterObservations: `Convidado via e-mail: ${inviteEmail}`
      });
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error("Erro ao convidar:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Castle },
    { id: 'games', label: '🎲 JOGOS', icon: Dices },
    { id: 'sessions', label: 'Sessões', icon: Calendar },
    { id: 'npcs', label: 'NPCs', icon: Users },
    { id: 'locations', label: 'Locais', icon: MapPin },
    { id: 'encounters', label: 'Encontros', icon: Swords },
    { id: 'notes', label: 'Notas', icon: Notebook },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="relative min-h-[320px] md:h-80 rounded-2xl overflow-hidden border border-gold/10 group shadow-2xl">
        <img 
          src={campaign.identity.bannerUrl || campaign.identity.coverUrl || "https://picsum.photos/seed/fantasy-landscape/1920/1080?blur=2"} 
          alt={campaign.identity.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        
        <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-end space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3 w-full lg:w-auto">
              <button 
                onClick={() => navigate('/master/campaigns')}
                className="group flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.2em] font-bold mb-2"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Lista
              </button>
              <div className="space-y-1">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-cinzel text-gold-gradient leading-tight break-words">{campaign.identity.name}</h2>
                {campaign.identity.subtitle && (
                  <p className="text-base sm:text-lg text-gold/60 font-cinzel italic">{campaign.identity.subtitle}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gold/40 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1.5"><BookOpen size={12} /> {campaign.identity.system}</span>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-gold/20" />
                <span className="flex items-center gap-1.5"><Globe size={12} /> {campaign.identity.setting || 'Cenário Próprio'}</span>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-gold/20" />
                <span className={cn(
                  "px-2 py-0.5 rounded-full border",
                  campaign.status.state === 'active' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                  campaign.status.state === 'paused' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                  "text-gold/40 border-gold/10 bg-gold/5"
                )}>
                  {campaign.status.state === 'active' ? 'Ativa' : campaign.status.state === 'paused' ? 'Pausada' : 'Finalizada'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={cn("flex-1 sm:flex-none", campaign.status.isFavorite && "text-red-500 border-red-500/20 bg-red-500/5")}
                >
                  <Heart size={18} fill={campaign.status.isFavorite ? "currentColor" : "none"} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon"
                  onClick={handleDuplicate}
                  disabled={isProcessing}
                  title="Duplicar Campanha"
                  className="flex-1 sm:flex-none"
                >
                  <Copy size={18} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon"
                  onClick={() => setShowArchiveModal(true)}
                  className={cn("flex-1 sm:flex-none", campaign.status.state === 'archived' && "text-amber-500 border-amber-500/20 bg-amber-500/5")}
                >
                  <Archive size={18} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 sm:flex-none text-red-500/60 hover:text-red-500 hover:border-red-500/40"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
              <div className="hidden sm:block w-[1px] h-10 bg-gold/10 mx-1" />
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button variant="secondary" icon={Dices} onClick={() => setActiveTab('games')} className="flex-1 sm:flex-none text-amber-300 border-amber-800/40 font-cinzel">🎲 JOGOS</Button>
                <Button variant="secondary" icon={Edit} onClick={() => navigate(`/master/campaigns/${id}/edit`)} className="flex-1 sm:flex-none">Editar</Button>
                <Button icon={Plus} onClick={() => navigate(`/master/campaigns/${id}/sessions/new`)} className="flex-1 sm:flex-none">Nova Sessão</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-gold/10 sticky top-0 bg-stone-950/80 backdrop-blur-md z-30 -mx-4 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? 'border-gold text-gold bg-gold/5' 
                : 'border-transparent text-gold/40 hover:text-gold/60 hover:bg-gold/5'
            )}
          >
            <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Seção 🎲 JOGOS integrada na Campanha */}
            <GameList 
              campaignId={id!} 
              masterId={user?.uid || campaign.masterId} 
              campaignSystem={campaign.identity?.system || 'Tormenta 20'} 
              isMaster={user?.uid === campaign.masterId} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <Card title="Sinopse da Campanha" icon={ScrollText}>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-gold/80 italic leading-relaxed whitespace-pre-wrap font-serif text-base sm:text-lg">
                    {campaign.identity.shortDescription}
                  </p>
                  <div className="h-[1px] bg-gold/10 w-full" />
                  <p className="text-gold/60 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                    {campaign.identity.fullDescription || "Nenhuma descrição detalhada registrada."}
                  </p>
                </div>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card title="Premissa Narrativa" icon={Scroll}>
                  <p className="text-xs sm:text-sm text-gold/60 italic leading-relaxed whitespace-pre-wrap">
                    {campaign.narrative.premise || "Sem premissa registrada..."}
                  </p>
                </Card>
                <Card title="Objetivo Principal" icon={Crown}>
                  <p className="text-xs sm:text-sm text-gold/60 italic leading-relaxed whitespace-pre-wrap">
                    {campaign.narrative.mainObjective || "Sem objetivo principal definido..."}
                  </p>
                </Card>
              </div>

              <Card title="Notas do Mestre" icon={Notebook}>
                <div className="space-y-4">
                  <p className="text-sm text-gold/40 whitespace-pre-wrap leading-relaxed">
                    {campaign.narrative.narrativeNotes || "Sem notas registradas..."}
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={Plus} 
                    className="w-full"
                    onClick={() => navigate(`/master/campaigns/${id}/notes`)}
                  >
                    Criar Nota
                  </Button>
                </div>
              </Card>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <Card title="Jogadores" icon={Users}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {players.map(player => (
                      <div key={player.id} className="flex items-center gap-2 p-1.5 sm:p-2 rounded-lg bg-gold/5 border border-gold/10">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold/20 flex items-center justify-center text-[9px] sm:text-[10px] text-gold">
                          {player.name.charAt(0)}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gold/60">{player.name}</span>
                      </div>
                    ))}
                    {players.length === 0 && (
                      <p className="text-[10px] text-gold/30 italic">Nenhum jogador adicionado.</p>
                    )}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={UserPlus} 
                    className="w-full"
                    onClick={() => setShowInviteModal(true)}
                  >
                    Adicionar Jogador
                  </Button>
                </div>
              </Card>

              <Card title="Progresso" icon={Calendar}>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-black/20 border border-gold/10 rounded-xl text-center">
                      <p className="text-[7px] sm:text-[8px] uppercase tracking-widest font-bold text-gold/40 mb-1">Sessões</p>
                      <p className="text-xl sm:text-2xl font-medieval text-gold">{campaign.progress.totalSessions}</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-black/20 border border-gold/10 rounded-xl text-center">
                      <p className="text-[7px] sm:text-[8px] uppercase tracking-widest font-bold text-gold/40 mb-1">Nível Médio</p>
                      <p className="text-xl sm:text-2xl font-medieval text-gold">{campaign.progress.averageGroupLevel || '-'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-gold/40">
                      <span>Últimas Sessões</span>
                      <button onClick={() => setActiveTab('sessions')} className="hover:text-gold transition-colors">Ver Todas</button>
                    </div>
                    {sessions.slice(0, 3).map(session => (
                      <div key={session.id} className="p-2.5 sm:p-3 bg-black/20 border border-gold/5 rounded-lg flex justify-between items-center group cursor-pointer hover:border-gold/20 transition-all">
                        <div className="space-y-0.5 sm:space-y-1">
                          <p className="text-[11px] sm:text-xs font-bold text-gold/60 group-hover:text-gold transition-colors truncate max-w-[120px] sm:max-w-none">Sessão {session.number}: {session.title}</p>
                          <p className="text-[9px] sm:text-[10px] text-gold/30">{new Date(session.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <ChevronRight size={12} className="text-gold/20 group-hover:text-gold transition-colors shrink-0" />
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <p className="text-[10px] text-gold/30 text-center py-4 italic">Nenhuma sessão registrada.</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card title="Elementos da Trama" icon={Swords}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[8px] uppercase tracking-widest font-bold text-gold/40">Conflitos</p>
                    <div className="flex flex-wrap gap-2">
                      {(campaign.narrative?.centralConflicts || []).map(c => (
                        <span key={c} className="px-2 py-1 bg-gold/5 border border-gold/10 rounded text-[10px] text-gold/60">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[8px] uppercase tracking-widest font-bold text-gold/40">Temas</p>
                    <div className="flex flex-wrap gap-2">
                      {(campaign.narrative?.themes || []).map(t => (
                        <span key={t} className="px-2 py-1 bg-gold/5 border border-gold/10 rounded text-[10px] text-gold/60">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[8px] uppercase tracking-widest font-bold text-gold/40">Perigos</p>
                    <div className="flex flex-wrap gap-2">
                      {(campaign.narrative?.centralDangers || []).map(d => (
                        <span key={d} className="px-2 py-1 bg-red-500/5 border border-red-500/20 rounded text-[10px] text-red-500/60">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'games' && (
          <GameList 
            campaignId={id!} 
            masterId={user?.uid || campaign.masterId} 
            campaignSystem={campaign.identity?.system || 'Tormenta 20'} 
            isMaster={user?.uid === campaign.masterId} 
          />
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-cinzel text-gold">Diário de Sessões</h3>
              <Button icon={Plus} size="sm" onClick={() => navigate(`/master/campaigns/${id}/sessions/new`)}>Nova Sessão</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {sessions.sort((a, b) => b.number - a.number).map(session => (
                <div 
                  key={session.id}
                  onClick={() => navigate(`/master/campaigns/${id}/sessions/${session.id}`)}
                  className="glass-card p-4 sm:p-6 border border-gold/10 hover:border-gold/30 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-sm bg-gold/5 border border-gold/10 flex flex-col items-center justify-center text-gold/40 group-hover:text-gold transition-colors shrink-0">
                      <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-tighter">Sessão</span>
                      <span className="text-xl sm:text-2xl font-medieval">{session.number}</span>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <h4 className="text-lg sm:text-xl font-cinzel text-gold group-hover:text-yellow-200 transition-colors truncate">{session.title}</h4>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gold/40 italic">
                        <span className="flex items-center gap-1"><Calendar size={10} className="sm:w-3 sm:h-3" /> {new Date(session.date).toLocaleDateString('pt-BR')}</span>
                        <span className="w-1 h-1 rounded-full bg-gold/20" />
                        <span>XP: {session.xpAwarded || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-md hidden sm:block">
                    <p className="text-xs text-gold/30 line-clamp-2 italic">{session.summary || "Sem resumo registrado..."}</p>
                  </div>
                  <div className="flex items-center justify-end gap-4">
                    <button className="p-2 text-gold/20 hover:text-gold transition-colors">
                      <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <ChevronRight size={18} className="text-gold/20 group-hover:text-gold transition-colors sm:w-5 sm:h-5" />
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-20 border border-dashed border-gold/10 rounded-sm space-y-4">
                  <Calendar size={40} className="mx-auto text-gold/10" />
                  <p className="text-gold/40 italic">"O tempo em Arton ainda não começou a ser contado."</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/master/campaigns/${id}/sessions/new`)}>Iniciar Primeira Sessão</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs placeholders */}
        {activeTab === 'npcs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-cinzel text-gold">Personagens Não Jogadores</h3>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => navigate(`/master/campaigns/${id}/npcs/generator`)}>Gerador</Button>
                <Button icon={Plus} size="sm" onClick={() => navigate(`/master/campaigns/${id}/npcs/new`)}>Novo NPC</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {npcs.map(npc => (
                <div 
                  key={npc.id} 
                  onClick={() => navigate(`/master/campaigns/${id}/npcs/${npc.id}`)}
                  className="glass-card p-4 border border-gold/10 hover:border-gold/30 transition-all cursor-pointer group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/40">
                    <Users size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-cinzel text-gold">{npc.name}</h4>
                    <p className="text-[10px] text-gold/40 uppercase tracking-widest">{npc.race} • {npc.role}</p>
                  </div>
                  <ChevronRight size={14} className="text-gold/20 group-hover:text-gold transition-colors" />
                </div>
              ))}
              {npcs.length === 0 && (
                <div className="col-span-full text-center py-20 border border-dashed border-gold/10 rounded-sm space-y-4">
                  <Users size={40} className="mx-auto text-gold/10" />
                  <p className="text-gold/40 italic">"Nenhuma alma cruza seu caminho ainda."</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/master/campaigns/${id}/npcs/new`)}>Criar Primeiro NPC</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-cinzel text-gold">Atlas Geográfico</h3>
              <Button icon={Plus} size="sm" onClick={() => navigate(`/master/campaigns/${id}/locations/new`)}>Novo Local</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(loc => (
                <div 
                  key={loc.id} 
                  onClick={() => navigate(`/master/campaigns/${id}/locations/${loc.id}`)}
                  className="glass-card p-4 border border-gold/10 hover:border-gold/30 transition-all cursor-pointer group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/40">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-cinzel text-gold">{loc.name}</h4>
                    <p className="text-[10px] text-gold/40 uppercase tracking-widest">{loc.type}</p>
                  </div>
                  <ChevronRight size={14} className="text-gold/20 group-hover:text-gold transition-colors" />
                </div>
              ))}
              {locations.length === 0 && (
                <div className="col-span-full text-center py-20 border border-dashed border-gold/10 rounded-sm space-y-4">
                  <MapPin size={40} className="mx-auto text-gold/10" />
                  <p className="text-gold/40 italic">"O mapa de Arton ainda é uma folha em branco."</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/master/campaigns/${id}/locations/new`)}>Registrar Local</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-cinzel text-gold">Encontros e Desafios</h3>
              <Button icon={Plus} size="sm" onClick={() => navigate(`/master/campaigns/${id}/encounters/new`)}>Novo Encontro</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {encounters.map(encounter => (
                <div 
                  key={encounter.id} 
                  onClick={() => navigate(`/master/campaigns/${id}/encounters/${encounter.id}`)}
                  className="glass-card p-4 border border-gold/10 hover:border-gold/30 transition-all cursor-pointer group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/40">
                    <Swords size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-cinzel text-gold">{encounter.title}</h4>
                    <p className="text-[10px] text-gold/40 uppercase tracking-widest">{encounter.difficulty} • {encounter.type}</p>
                  </div>
                  <ChevronRight size={14} className="text-gold/20 group-hover:text-gold transition-colors" />
                </div>
              ))}
              {encounters.length === 0 && (
                <div className="col-span-full text-center py-20 border border-dashed border-gold/10 rounded-sm space-y-4">
                  <Swords size={40} className="mx-auto text-gold/10" />
                  <p className="text-gold/40 italic">"Nenhum perigo espreita nas sombras... por enquanto."</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/master/campaigns/${id}/encounters/new`)}>Preparar Encontro</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-cinzel text-gold">Notas do Grimoire</h3>
              <Button icon={Plus} size="sm" onClick={() => navigate(`/master/campaigns/${id}/notes`)}>Gerenciar Notas</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <div key={note.id} className="glass-card p-4 border border-gold/10 hover:border-gold/40 transition-all cursor-pointer group flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-gold/5 border border-gold/10 text-gold/40 uppercase font-bold tracking-widest">
                      {note.category}
                    </span>
                    <ChevronRight size={14} className="text-gold/20 group-hover:text-gold transition-colors" />
                  </div>
                  <h4 className="font-cinzel text-gold">{note.title}</h4>
                  <p className="text-[10px] text-gold/30 line-clamp-2 italic">{note.content}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="col-span-full text-center py-20 border border-dashed border-gold/10 rounded-sm space-y-4">
                  <Notebook size={40} className="mx-auto text-gold/10" />
                  <p className="text-gold/40 italic">"Suas anotações foram perdidas no tempo."</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/master/campaigns/${id}/notes`)}>Escrever Nota</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 border border-red-500/20 space-y-6">
            <div className="flex items-center gap-4 text-red-500">
              <AlertTriangle size={32} />
              <h3 className="text-2xl font-cinzel">Excluir Campanha?</h3>
            </div>
            <p className="text-gold/60 leading-relaxed">
              Esta ação é permanente e destruirá todos os registros desta jornada. Tem certeza que deseja prosseguir?
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)} disabled={isProcessing}>Cancelar</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none" onClick={handleDelete} disabled={isProcessing}>
                {isProcessing ? 'Excluindo...' : 'Sim, Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 border border-amber-500/20 space-y-6">
            <div className="flex items-center gap-4 text-amber-500">
              <Archive size={32} />
              <h3 className="text-2xl font-cinzel">{campaign.status.state === 'archived' ? 'Desarquivar' : 'Arquivar'} Campanha?</h3>
            </div>
            <p className="text-gold/60 leading-relaxed">
              {campaign.status.state === 'archived' 
                ? 'Esta campanha voltará a ser exibida na sua lista principal.' 
                : 'Esta campanha será movida para o arquivo e não aparecerá na sua lista principal.'}
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowArchiveModal(false)} disabled={isProcessing}>Cancelar</Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-none" onClick={handleArchive} disabled={isProcessing}>
                {isProcessing ? 'Processando...' : campaign.status.state === 'archived' ? 'Desarquivar' : 'Arquivar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 border border-gold/20 space-y-6">
            <div className="flex items-center gap-4 text-gold">
              <UserPlus size={32} />
              <h3 className="text-2xl font-cinzel">Convidar Jogador</h3>
            </div>
            <form onSubmit={handleInvitePlayer} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">E-mail do Jogador</label>
                <input 
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
              <p className="text-[10px] text-gold/30 italic">
                O jogador receberá um convite para se juntar a esta jornada.
              </p>
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowInviteModal(false)} disabled={isProcessing}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={isProcessing}>
                  {isProcessing ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
