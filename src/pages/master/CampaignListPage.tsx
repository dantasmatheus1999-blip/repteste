import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Castle, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Filter,
  MoreVertical,
  Archive,
  Trash2,
  Edit,
  Star,
  Copy,
  LayoutGrid,
  List as ListIcon,
  BookOpen,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { Campaign, CampaignStatus } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { cn } from '../../lib/utils';

export const CampaignListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = MasterService.subscribeToCampaigns(user.uid, (data) => {
        setCampaigns(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.identity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.identity?.system?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status?.state === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'paused': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'finished': return 'text-gold/40 bg-gold/5 border-gold/10';
      case 'archived': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gold/40 bg-gold/5 border-gold/10';
    }
  };

  const getStatusLabel = (status: CampaignStatus) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'finished': return 'Finalizada';
      case 'archived': return 'Arquivada';
      default: return status;
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string, current: boolean) => {
    e.stopPropagation();
    try {
      await MasterService.toggleCampaignFavorite(id, !current);
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  const handleArchive = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    
    setIsProcessing(true);
    try {
      const isArchiving = campaign.status?.state !== 'archived';
      await MasterService.archiveCampaign(id, isArchiving);
      setShowArchiveModal(null);
      setActiveMenu(null);
    } catch (error) {
      console.error("Erro ao arquivar:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      if (user) {
        await MasterService.duplicateCampaign(id, user.uid);
      }
      setActiveMenu(null);
    } catch (error) {
      console.error('Erro ao duplicar:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await MasterService.deleteCampaign(id);
      setShowDeleteModal(null);
      setActiveMenu(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/master')}
            className="group flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.2em] font-bold mb-2"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Grimório
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-4xl font-cinzel text-gold-gradient leading-none">Minhas Campanhas</h2>
              <p className="text-gold/40 text-sm italic mt-1">O registro de todas as suas jornadas épicas.</p>
            </div>
          </div>
        </div>
        <Button 
          icon={Plus} 
          onClick={() => navigate('/master/campaigns/new')}
          className="shadow-lg shadow-gold/10"
        >
          Criar Campanha
        </Button>
      </div>      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-black/40 p-4 rounded-xl border border-gold/10 backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome, sistema ou cenário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 pl-12 pr-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all text-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
            {(['all', 'active', 'paused', 'finished', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] uppercase tracking-widest font-bold border transition-all flex-1 sm:flex-none text-center",
                  statusFilter === status 
                    ? 'bg-gold/20 border-gold text-gold shadow-inner shadow-gold/10' 
                    : 'bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30 hover:text-gold/60'
                )}
              >
                {status === 'all' ? 'Todas' : getStatusLabel(status as CampaignStatus)}
              </button>
            ))}
          </div>
          
          <div className="hidden lg:block h-8 w-[1px] bg-gold/10" />
          
          <div className="flex bg-black/40 rounded-lg p-1 border border-gold/10 w-full sm:w-auto justify-center">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("flex-1 sm:flex-none p-2 rounded-md transition-colors flex justify-center", viewMode === 'grid' ? "bg-gold/10 text-gold" : "text-gold/20 hover:text-gold/40")}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("flex-1 sm:flex-none p-2 rounded-md transition-colors flex justify-center", viewMode === 'list' ? "bg-gold/10 text-gold" : "text-gold/20 hover:text-gold/40")}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold shadow-glow"></div>
          <p className="text-gold/40 font-cinzel animate-pulse">Consultando os registros...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="glass-card p-8 sm:p-20 text-center space-y-8 border-dashed border-2 border-gold/10 bg-gold/5 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto text-gold/20 relative">
            <Castle size={32} className="sm:hidden" />
            <Castle size={48} className="hidden sm:block" />
            <div className="absolute inset-0 animate-ping rounded-full bg-gold/5 scale-150 opacity-20" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl sm:text-3xl font-cinzel text-gold tracking-widest uppercase">Nenhuma campanha encontrada</h3>
            <p className="text-sm sm:text-base text-gold/40 italic max-w-md mx-auto leading-relaxed">
              Você ainda não iniciou nenhuma campanha. Crie uma nova e comece sua jornada como mestre.
            </p>
          </div>
          <Button 
            icon={Plus}
            size="lg"
            onClick={() => navigate('/master/campaigns/new')}
            className="w-full sm:w-auto px-12 py-4 sm:py-6 text-base sm:text-lg shadow-2xl shadow-gold/20"
          >
            Criar Campanha
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCampaigns.map(campaign => (
            <div 
              key={campaign.id}
              onClick={() => navigate(`/master/campaigns/${campaign.id}`)}
              className="group relative bg-black/40 border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5 flex flex-col h-full cursor-pointer"
            >
              {/* Cover Image Placeholder or Real */}
              <div className="h-32 w-full bg-gradient-to-b from-gold/10 to-transparent relative overflow-hidden">
                {campaign.identity?.coverUrl ? (
                  <img 
                    src={campaign.identity.coverUrl} 
                    alt={campaign.identity.name}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gold/5">
                    <Castle size={120} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Top Actions */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                  <span className={cn(
                    "text-[9px] px-3 py-1 rounded-full border uppercase font-bold tracking-widest backdrop-blur-md",
                    getStatusColor(campaign.status?.state || 'active')
                  )}>
                    {getStatusLabel(campaign.status?.state || 'active')}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleToggleFavorite(e, campaign.id, !!campaign.status?.isFavorite)}
                      className={cn(
                        "p-2 rounded-full backdrop-blur-md border transition-all",
                        campaign.status?.isFavorite 
                          ? "bg-red-500/20 border-red-500 text-red-500" 
                          : "bg-black/40 border-gold/10 text-gold/40 hover:text-gold"
                      )}
                    >
                      <Heart size={14} fill={campaign.status?.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === campaign.id ? null : campaign.id);
                        }}
                        className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-gold/10 text-gold/40 hover:text-gold transition-all"
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {activeMenu === campaign.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-stone-900 border border-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={(e) => handleToggleFavorite(e, campaign.id, !!campaign.status?.isFavorite)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors",
                              campaign.status?.isFavorite ? "text-red-500 hover:bg-red-500/10" : "text-gold/60 hover:bg-gold/10 hover:text-gold"
                            )}
                          >
                            <Heart size={14} fill={campaign.status?.isFavorite ? "currentColor" : "none"} /> 
                            {campaign.status?.isFavorite ? 'Remover Favorito' : 'Favoritar'}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/master/campaigns/${campaign.id}/edit`); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gold/60 hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Edit size={14} /> Editar Campanha
                          </button>
                          <button 
                            onClick={(e) => handleDuplicate(e, campaign.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gold/60 hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Copy size={14} /> Duplicar
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowArchiveModal(campaign.id); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gold/60 hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Archive size={14} /> {campaign.status?.state === 'archived' ? 'Desarquivar' : 'Arquivar'}
                          </button>
                          <div className="h-[1px] bg-gold/10" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(campaign.id); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} /> Excluir Permanentemente
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col relative">
                {/* Campaign Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-gold/40 text-[10px] uppercase tracking-widest font-bold">
                    <span>{campaign.identity?.system}</span>
                    <span className="w-1 h-1 rounded-full bg-gold/20" />
                    <span>{campaign.identity?.setting || 'Cenário Próprio'}</span>
                  </div>
                  <h4 className="text-2xl font-cinzel text-gold group-hover:text-yellow-200 transition-colors leading-tight">
                    {campaign.identity?.name}
                  </h4>
                  {campaign.identity?.subtitle && (
                    <p className="text-xs text-gold/60 font-medium italic -mt-1">{campaign.identity.subtitle}</p>
                  )}
                  <p className="text-xs text-gold/30 line-clamp-2 italic leading-relaxed mt-2">
                    {campaign.identity?.shortDescription || "Nenhuma descrição curta registrada para esta jornada..."}
                  </p>
                </div>

                {/* Stats Footer */}
                <div className="mt-6 pt-4 border-t border-gold/5 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[8px] text-gold/20 font-bold uppercase tracking-widest mb-1">Sessões</p>
                    <p className="text-sm font-medieval text-gold/60">{campaign.progress?.totalSessions || 0}</p>
                  </div>
                  <div className="text-center border-x border-gold/5">
                    <p className="text-[8px] text-gold/20 font-bold uppercase tracking-widest mb-1">NPCs</p>
                    <p className="text-sm font-medieval text-gold/60">{campaign.progress?.totalNPCs || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-gold/20 font-bold uppercase tracking-widest mb-1">Nível Médio</p>
                    <p className="text-sm font-medieval text-gold/60">{campaign.progress?.averageGroupLevel || '-'}</p>
                  </div>
                </div>
              </div>
              
              {/* Hover Effect Bar */}
              <div className="h-1 w-0 bg-gold group-hover:w-full transition-all duration-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map(campaign => (
            <div 
              key={campaign.id}
              onClick={() => navigate(`/master/campaigns/${campaign.id}`)}
              className="group bg-black/40 border border-gold/10 rounded-xl p-4 hover:border-gold/40 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/20 group-hover:text-gold/40 transition-colors shrink-0">
                <Castle size={24} className="sm:hidden" />
                <Castle size={32} className="hidden sm:block" />
              </div>
              
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <h4 className="text-lg sm:text-xl font-cinzel text-gold truncate max-w-[200px] sm:max-w-none">{campaign.identity?.name}</h4>
                  <span className={cn(
                    "text-[8px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-widest",
                    getStatusColor(campaign.status?.state || 'active')
                  )}>
                    {getStatusLabel(campaign.status?.state || 'active')}
                  </span>
                  {campaign.status?.isFavorite && <Heart size={12} className="text-red-500 fill-red-500" />}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] text-gold/40 uppercase tracking-widest font-bold">
                  <span>{campaign.identity?.system}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{campaign.progress?.totalSessions || 0} Sessões</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{campaign.progress?.totalPlayers || 0} Jogadores</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pr-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gold/5">
                <div className="text-left sm:text-right">
                  <p className="text-[8px] text-gold/20 font-bold uppercase tracking-widest">Atualização</p>
                  <p className="text-[10px] sm:text-xs text-gold/40">
                    {campaign.status?.updatedAt?.toDate().toLocaleDateString('pt-BR') || 'Recentemente'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === campaign.id ? null : campaign.id);
                      }}
                      className="p-2 rounded-full bg-black/40 border border-gold/10 text-gold/40 hover:text-gold transition-all"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeMenu === campaign.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-stone-900 border border-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <button 
                          onClick={(e) => handleToggleFavorite(e, campaign.id, !!campaign.status?.isFavorite)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors",
                            campaign.status?.isFavorite ? "text-red-500 hover:bg-red-500/10" : "text-gold/60 hover:bg-gold/10 hover:text-gold"
                          )}
                        >
                          <Heart size={14} fill={campaign.status?.isFavorite ? "currentColor" : "none"} /> 
                          {campaign.status?.isFavorite ? 'Remover Favorito' : 'Favoritar'}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/master/campaigns/${campaign.id}/edit`); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gold/60 hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          <Edit size={14} /> Editar
                        </button>
                        <button 
                          onClick={(e) => handleDuplicate(e, campaign.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gold/60 hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          <Copy size={14} /> Duplicar
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowArchiveModal(campaign.id); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gold/60 hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          <Archive size={14} /> {campaign.status?.state === 'archived' ? 'Desarquivar' : 'Arquivar'}
                        </button>
                        <div className="h-[1px] bg-gold/10" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowDeleteModal(campaign.id); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-gold/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(null)} disabled={isProcessing}>Cancelar</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none" onClick={() => handleDelete(showDeleteModal)} disabled={isProcessing}>
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
              <h3 className="text-2xl font-cinzel">
                {campaigns.find(c => c.id === showArchiveModal)?.status?.state === 'archived' ? 'Desarquivar' : 'Arquivar'} Campanha?
              </h3>
            </div>
            <p className="text-gold/60 leading-relaxed">
              {campaigns.find(c => c.id === showArchiveModal)?.status?.state === 'archived' 
                ? 'Esta campanha voltará a ser exibida na sua lista principal.' 
                : 'Esta campanha será movida para o arquivo e não aparecerá na sua lista principal.'}
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowArchiveModal(null)} disabled={isProcessing}>Cancelar</Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-none" onClick={() => handleArchive(showArchiveModal)} disabled={isProcessing}>
                {isProcessing ? 'Processando...' : campaigns.find(c => c.id === showArchiveModal)?.status?.state === 'archived' ? 'Desarquivar' : 'Arquivar'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Click outside to close menu */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};
