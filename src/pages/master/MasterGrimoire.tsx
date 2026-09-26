import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Castle, 
  Users, 
  Sword, 
  Dices, 
  Map, 
  Compass, 
  Navigation, 
  StickyNote, 
  Zap, 
  Plus, 
  ChevronRight, 
  Play, 
  History, 
  UserPlus, 
  User, 
  Skull, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { Campaign } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DiceRollerPanel } from '../../components/master/dice-roller/DiceRollerPanel';
import { CreateGameModal } from '../../components/games/CreateGameModal';

export const MasterGrimoire: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  useEffect(() => {
    if (user) {
      const unsubscribe = MasterService.subscribeToCampaigns(user.uid, (data) => {
        setCampaigns(data);
        if (data.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(data[0].id);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleOpenCreateRoom = async () => {
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
        setIsCreateRoomOpen(true);
      } catch (err) {
        console.error('Erro ao criar campanha:', err);
        navigate('/master/campaigns/new');
      }
    } else {
      if (!selectedCampaignId) {
        setSelectedCampaignId(campaigns[0].id);
      }
      setIsCreateRoomOpen(true);
    }
  };

  const menuItems = [
    { id: 'create-room', label: 'Criar Nova Sala', icon: Plus, color: 'text-emerald-500', action: () => handleOpenCreateRoom() },
    { id: 'maps', label: 'Mapas', icon: Map, color: 'text-gold', path: '/map/test-map' },
    { id: 'campaigns', label: 'Campanhas & Jogos', icon: Compass, color: 'text-gold', path: '/master/campaigns' },
    { id: 'bestiary', label: 'Bestiário', icon: Skull, color: 'text-red-500', path: '/master/monsters' },
    { id: 'npcs', label: 'NPCs', icon: Users, color: 'text-gold', path: '/master/npcs' },
    { id: 'locations', label: 'Locais', icon: Navigation, color: 'text-gold', path: '/master/locations' },
    { id: 'encounters', label: 'Encontros', icon: Sword, color: 'text-gold', path: '/master/encounters' },
    { id: 'dice-roller', label: 'Rolar Dados', icon: Dices, color: 'text-gold', action: () => setShowDiceRoller(true) },
    { id: 'notes', label: 'Notas', icon: StickyNote, color: 'text-gold', path: '/master/notes' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto px-1 sm:px-4 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-8 border-b border-gold/10 pb-8 sm:pb-10 relative">
        <div className="space-y-3 sm:space-y-4 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-cinzel text-gold-gradient tracking-[0.1em] font-black drop-shadow-2xl break-words leading-tight">
              Grimório do Mestre
            </h2>
            <div className="w-fit px-2 py-0.5 sm:px-3 sm:py-1 rounded-sm bg-gold/5 border border-gold/20 text-[8px] sm:text-[10px] text-gold/40 uppercase font-black tracking-[0.3em]">
              Codex Arton
            </div>
          </div>
          <p className="text-gold/40 font-cinzel italic text-sm sm:text-lg max-w-2xl leading-relaxed">
            "As crônicas de Arton aguardam sua pena. Molde o destino, mestre, pois o mundo respira sob seu comando."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
          <Button 
            size="lg" 
            variant="secondary" 
            icon={Plus} 
            onClick={handleOpenCreateRoom}
            className="w-full sm:w-auto bg-black/40 text-sm sm:text-base"
          >
            Criar Nova Sala
          </Button>
          <Button 
            size="lg" 
            icon={Compass} 
            onClick={() => navigate('/master/campaigns')}
            className="w-full sm:w-auto shadow-[0_0_30px_rgba(212,175,55,0.2)] text-sm sm:text-base"
          >
            Campanhas & Jogos
          </Button>
        </div>
      </div>

      {/* Quick Tools Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-cinzel text-gold/60 tracking-[0.2em] font-bold flex items-center gap-3">
            <Sword size={24} className="text-gold/40" /> Ferramentas Rápidas
          </h3>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent ml-6" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ y: -5, scale: 1.05, boxShadow: '0 10px 30px -10px rgba(212,175,55,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => item.action ? item.action() : navigate(item.path!)}
              className="flex flex-col items-center justify-center p-3 sm:p-6 rounded-sm bg-mythos-card/30 border border-gold/10 hover:border-gold/40 hover:bg-gold/5 transition-all group relative overflow-hidden min-w-0 aspect-square sm:aspect-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 transition-all relative z-10">
                <item.icon className={`w-4 h-4 sm:w-7 sm:h-7 ${item.color} opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110`} />
              </div>
              <span className="text-[7px] sm:text-[10px] uppercase font-black tracking-[0.1em] sm:tracking-[0.2em] text-gold/30 group-hover:text-gold transition-colors relative z-10 text-center truncate w-full px-1">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content: Campaigns */}
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-cinzel text-gold/60 tracking-[0.2em] font-bold flex items-center gap-3">
                <Castle size={24} className="text-gold/40" /> Campanhas Ativas
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent ml-6" />
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="glass-card p-12 text-center space-y-4 border-dashed border-2 border-gold/10">
                <Book size={48} className="mx-auto text-gold/20" />
                <p className="text-gold/40 italic">Nenhuma campanha registrada no grimório.</p>
                <Button variant="secondary" size="sm" onClick={handleOpenCreateRoom}>
                  Começar Primeira Jornada
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.filter(c => c.status?.state === 'active' || !c.status?.state).slice(0, 4).map(campaign => (
                  <Card 
                    key={campaign.id}
                    title={campaign.identity?.name || 'Campanha'}
                    subtitle={`${campaign.identity?.system || 'Tormenta 20'} • ${campaign.status?.state || 'Ativa'}`}
                    icon={Castle}
                    onClick={() => navigate(`/master/campaigns/${campaign.id}`)}
                    className="group cursor-pointer hover:border-gold/40 transition-all"
                  >
                    <div className="space-y-4">
                      <p className="text-gold/60 text-sm line-clamp-2 italic">
                        {campaign.identity?.shortDescription || "Nenhuma descrição registrada para esta crônica."}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gold/5">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-mythos-bg border border-gold/20 flex items-center justify-center text-[10px] text-gold/40">
                              <User size={12} />
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] uppercase font-black text-gold/30 tracking-widest">
                          {campaign.relations?.playerIds?.length || 0} Aventureiros
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Recent Activity & Notes */}
        <div className="lg:col-span-4 space-y-8">
          <Card title="Notas Rápidas" icon={StickyNote} className="bg-mythos-card/20">
            <div className="space-y-4">
              <textarea 
                placeholder="Uma ideia súbita, um nome de NPC, um segredo..."
                className="w-full h-32 bg-black/40 border border-gold/10 rounded-sm p-4 text-gold font-cinzel text-sm resize-none focus:border-gold/30 outline-none placeholder:text-gold/10"
              />
              <Button size="sm" fullWidth icon={Plus} onClick={() => navigate('/master/notes')}>Guardar Nota</Button>
            </div>
          </Card>

          <Card title="Últimas Rolagens" icon={Dices} className="bg-mythos-card/20">
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 rounded-sm bg-black/40 border border-gold/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gold/40 font-medieval">d20:</span>
                    <span className="text-gold font-bold text-lg">{14 + i * 2}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-gold/20">{i * 2}m atrás</span>
                </div>
              ))}
              <Button variant="ghost" size="sm" fullWidth className="text-[10px] uppercase tracking-widest" onClick={() => setShowDiceRoller(true)}>
                Ver Histórico Completo
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Criar Nova Sala */}
      {selectedCampaignId && (
        <CreateGameModal
          campaignId={selectedCampaignId}
          masterId={user?.uid || ''}
          campaignSystem="Tormenta 20"
          isOpen={isCreateRoomOpen}
          onClose={() => setIsCreateRoomOpen(false)}
          onGameCreated={(newGameId) => {
            setIsCreateRoomOpen(false);
            navigate(`/campaigns/${selectedCampaignId}/games/${newGameId}`);
          }}
        />
      )}

      {/* Dice Roller Modal */}
      <AnimatePresence>
        {showDiceRoller && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDiceRoller(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl bg-mythos-bg border border-gold/20 rounded-sm shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-mythos-bg/80 backdrop-blur-md border-b border-gold/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center">
                    <Dices className="text-gold" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-cinzel text-gold tracking-widest uppercase font-black">Grimório de Rolagens</h2>
                    <p className="text-[10px] text-gold/40 uppercase tracking-[0.2em]">Ferramenta do Mestre</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDiceRoller(false)}
                  className="w-10 h-10 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/40 hover:text-gold hover:border-gold/40 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <DiceRollerPanel />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterGrimoire;
