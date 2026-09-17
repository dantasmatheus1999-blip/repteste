/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Sword, Plus, Dices, ScrollText, Castle, Hourglass, Flame, Compass } from 'lucide-react';
import { useDiceRoller } from './hooks/useDiceRoller';

import { motion, AnimatePresence } from 'motion/react';
import { FirestoreDevHud } from './components/dev/FirestoreDevHud';

const Dashboard = () => {
  const navigate = useNavigate();
  const { roll, history, isRolling, lastResult } = useDiceRoller();

  return (
    <div className="space-y-6 sm:space-y-10 px-1 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel text-gold-gradient drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] tracking-[0.1em] sm:tracking-[0.25em] uppercase break-words">
            Grimório Central <span className="text-[10px] opacity-30 ml-2">v1.1</span>
          </h2>
          <p className="text-gold/60 text-xs sm:text-sm md:text-base font-medium tracking-[0.1em] sm:tracking-[0.15em] italic drop-shadow-sm">"O destino é escrito com sangue e tinta no grande grimório."</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto relative z-10">
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Plus} 
            className="flex-1 sm:flex-none text-[10px] sm:text-xs"
            onClick={() => navigate('/master/campaigns/new')}
          >
            Criar Campanha
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Plus} 
            className="flex-1 sm:flex-none text-[10px] sm:text-xs"
            onClick={() => navigate('/characters/sheet')}
          >
            Novo Herói
          </Button>
          <Button 
            size="sm" 
            icon={Compass} 
            className="flex-1 sm:flex-none text-[10px] sm:text-xs"
            onClick={() => navigate('/master/campaigns')}
          >
            Campanhas
          </Button>
        </div>
        <div className="absolute -top-10 -left-10 w-20 h-20 sm:w-40 sm:h-40 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        <Card title="Minhas Campanhas" subtitle="Você é o mestre em 2 mesas" icon={Castle}>
          <div className="space-y-4">
            <div className="p-5 rounded-sm bg-black/40 border-l-4 border-gold hover:bg-gold/5 transition-all cursor-pointer group relative overflow-hidden border border-gold/10">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <Castle size={40} />
              </div>
              <h4 className="font-cinzel text-lg text-gold group-hover:text-yellow-200 transition-colors">O Despertar de Kallyadranoch</h4>
              <p className="text-[10px] text-gold/50 mt-1 uppercase font-bold tracking-[0.2em]">Tormenta 20 • 4 Jogadores</p>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold/20" />
                ))}
              </div>
            </div>
            <div className="p-5 rounded-sm bg-black/40 border-l-4 border-gold/40 hover:bg-gold/5 transition-all cursor-pointer group relative overflow-hidden border border-gold/10">
              <h4 className="font-cinzel text-lg text-gold/80 group-hover:text-gold transition-colors">Sombras de Valkaria</h4>
              <p className="text-[10px] text-gold/40 mt-1 uppercase font-bold tracking-[0.2em]">Tormenta 20 • 5 Jogadores</p>
            </div>
          </div>
        </Card>

        <Card title="Rolar Dados" subtitle="Teste sua sorte" icon={Dices}>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[4, 6, 8, 10, 12, 20].map(d => (
                <motion.button
                  key={d}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => roll(`1d${d}`)}
                  disabled={isRolling}
                  className="flex flex-col items-center justify-center p-4 rounded-sm bg-mythos-bg border-2 border-gold/20 hover:border-gold text-gold transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] group relative overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors" />
                  <Dices size={24} className="mb-1 opacity-30 group-hover:opacity-100 transition-opacity relative z-10" />
                  <span className="font-bold font-medieval text-xl relative z-10">d{d}</span>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-gold/20 group-hover:border-gold transition-colors" />
                </motion.button>
              ))}
            </div>

            <div className="h-24 flex items-center justify-center bg-black/40 rounded-sm border border-gold/10 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isRolling ? (
                  <motion.div
                    key="rolling"
                    initial={{ rotate: 0, scale: 1 }}
                    animate={{ rotate: 360, scale: 1.2 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    className="text-gold/40"
                  >
                    <Dices size={48} />
                  </motion.div>
                ) : lastResult ? (
                  <motion.div
                    key={lastResult.id}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-[10px] uppercase font-bold text-gold/40 tracking-[0.3em] mb-1">{lastResult.formula}</p>
                    <span className="text-5xl font-medieval text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">
                      {lastResult.result}
                    </span>
                  </motion.div>
                ) : (
                  <p className="text-gold/20 font-cinzel text-xs italic">Aguardando o destino...</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        <Card title="Histórico" subtitle="Últimos resultados" icon={Hourglass}>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {history && history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gold/20">
                <Dices size={40} className="mb-3 opacity-10" />
                <p className="text-sm italic font-cinzel">O destino ainda não foi traçado...</p>
              </div>
            ) : (
              history.map(r => (
                <div key={r.id} className="flex justify-between items-center p-4 rounded-sm bg-black/30 border border-gold/10 hover:border-gold/30 transition-colors group">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gold/40 tracking-widest group-hover:text-gold/60 transition-colors">{r.formula}</p>
                    <p className="text-[10px] text-gold/30 italic">{r.details}</p>
                  </div>
                  <span className="text-3xl font-medieval text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">{r.result}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Seção de Lore/Dica do Dia */}
      <div className="parchment p-8 rounded-sm relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
          <ScrollText size={120} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="text-[#8b5a2b]" size={20} />
            <h3 className="font-cinzel text-xl text-[#2c1e11] font-bold">Crônicas de Arton</h3>
          </div>
          <p className="text-[#4a3728] leading-relaxed italic font-medium">
            "Dizem que nas profundezas das Montanhas Sanguinárias, o próprio Kallyadranoch sussurra segredos proibidos para aqueles que ousam desafiar o frio eterno. Muitos partiram em busca de glória, mas poucos retornaram com mais do que cicatrizes e pesadelos."
          </p>
          <div className="pt-4 flex justify-between items-center border-t border-[#8b5a2b]/20">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b5a2b]">Escriba Real • 16 de Março</span>
            <button className="text-[10px] uppercase font-bold tracking-widest text-[#8b5a2b] hover:text-[#2c1e11] transition-colors">Ler mais crônicas →</button>
          </div>
        </div>
      </div>
    </div>
  );
};


const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
    <div className="w-24 h-24 rounded-sm bg-mythos-card border-2 border-gold/30 flex items-center justify-center text-gold shadow-[0_0_30px_rgba(212,175,55,0.1)] relative">
      <div className="absolute inset-0 border border-gold/10 m-1" />
      <ScrollText size={48} className="opacity-60" />
    </div>
    <div className="space-y-2">
      <h2 className="text-4xl font-cinzel text-gold-gradient">{title}</h2>
      <div className="h-1 w-24 bg-gold/20 mx-auto rounded-full" />
    </div>
    <p className="text-gold/40 max-w-md font-medium italic">
      "As crônicas sobre {title.toLowerCase()} ainda estão sendo escritas pelos escribas reais. Paciência, nobre aventureiro."
    </p>
    <Button variant="secondary" onClick={() => window.history.back()}>Retornar à Jornada</Button>
  </div>
);

import { ProfileProvider, useProfile } from './context/ProfileContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { WelcomePage } from './pages/WelcomePage';
import { ProfileSelection } from './pages/ProfileSelection';
import { CharacterSheet } from './pages/CharacterSheet';
import { CharacterListPage } from './pages/CharacterListPage';
import { ClassesPage } from './pages/ClassesPage';
import { ClassDetailPage } from './pages/ClassDetailPage';
import { CodexPage } from './pages/CodexPage';
import { RacesPage } from './pages/RacesPage';
import { RaceDetailPage } from './pages/RaceDetailPage';
import { OriginsPage } from './pages/OriginsPage';
import { OriginDetailPage } from './pages/OriginDetailPage';
import { DeitiesPage } from './pages/DeitiesPage';
import { DeityDetailPage } from './pages/DeityDetailPage';
import { PowersPage } from './components/codex/PowersPage';
import { SpellsPage } from './components/codex/SpellsPage';

import { CharacterCreationWizard } from './components/character/CharacterCreationWizard';
import { CharacterSheetView } from './pages/CharacterSheetView';
import { MasterGrimoire } from './pages/master/MasterGrimoire';
import { CampaignListPage } from './pages/master/CampaignListPage';
import { CampaignForm } from './pages/master/CampaignForm';
import { CampaignDetailPage } from './pages/master/CampaignDetailPage';
import { SessionForm } from './pages/master/SessionForm';
import { NPCListPage } from './pages/master/NPCListPage';
import { NPCForm } from './pages/master/NPCForm';
import { NPCGenerator } from './pages/master/NPCGenerator';
import { MasterNotesPage } from './pages/master/MasterNotesPage';
import { LocationForm } from './pages/master/LocationForm';
import { EncounterForm } from './pages/master/EncounterForm';
import { MonsterForm } from './pages/master/MonsterForm';
import { MonsterDetailsPage } from './pages/master/MonsterDetailsPage';

import { MapPage } from './pages/master/MapPage';
import { TacticalMapPage } from './pages/master/TacticalMapPage';
import { TvMapView } from './components/map/TvMapView';

import { BestiaryPage } from './pages/master/BestiaryPage';
import { GameBasicPage } from './pages/master/GameBasicPage';
import { GameInvitePage } from './pages/join/GameInvitePage';

import { ImmersiveRPGPage } from './pages/ImmersiveRPGPage';

// Novo Grimório Central do REALMOR
import { GrimoireCentralPage } from './pages/GrimoireCentralPage';

// Módulo legado preservado como rascunho para consulta futura.
// Não excluir sem autorização.
import { NewMasterPage } from './pages/master/NewMasterPage';
import { NewPlayerPage } from './pages/jogador/NewPlayerPage';

const Home = () => {
  return <GrimoireCentralPage />;
};

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Rota 100% pública e independente da TV - Sem Layout, Sem Menus, Sem Auth, Sem Profile, Sem ProtectedRoute */}
          <Route path="/tv" element={<TvMapView />} />
          <Route path="/tv/*" element={<TvMapView />} />
          <Route path="/tv/mapa-teste" element={<TvMapView />} />

          {/* Todas as demais rotas da aplicação utilizam AuthProvider e ProfileProvider */}
          <Route
            path="/*"
            element={
              <AuthProvider>
                <ProfileProvider>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/join/:inviteCode" element={<AppLayout><GameInvitePage /></AppLayout>} />
                    <Route path="/campaigns/:campaignId/games/:gameId" element={<AppLayout><GameBasicPage /></AppLayout>} />

                    {/* Protected Routes */}
                    <Route path="/welcome" element={
                      <ProtectedRoute>
                        <WelcomePage />
                      </ProtectedRoute>
                    } />

                    <Route path="/*" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Routes>
                            <Route path="/" element={<GrimoireCentralPage />} />
                            <Route path="/grimorio" element={<GrimoireCentralPage />} />
                            <Route path="/select-profile" element={<ProfileSelection />} />
                            
                            {/* Novas rotas principais do REALMOR */}
                            <Route path="/mestre" element={<NewMasterPage />} />
                            <Route path="/jogador" element={<NewPlayerPage />} />

                            {/* Módulos legados preservados como rascunho para consulta futura */}
                            {/* Não excluir sem autorização */}
                            <Route path="/legacy/dashboard" element={<Home />} />
                            <Route path="/legacy/mestre" element={<MasterGrimoire />} />
                            <Route path="/legacy/jogador" element={<Dashboard />} />
                            
                            {/* Codex Routes */}
                            <Route path="/codex" element={<CodexPage />} />
                            <Route path="/codex/classes" element={<ClassesPage />} />
                            <Route path="/codex/classes/:slug" element={<ClassDetailPage />} />
                            <Route path="/codex/racas" element={<RacesPage />} />
                            <Route path="/codex/racas/:slug" element={<RaceDetailPage />} />
                            <Route path="/codex/origens" element={<OriginsPage />} />
                            <Route path="/codex/origens/:slug" element={<OriginDetailPage />} />
                            <Route path="/codex/divindades" element={<DeitiesPage />} />
                            <Route path="/codex/divindades/:slug" element={<DeityDetailPage />} />
                            <Route path="/codex/poderes" element={<PowersPage />} />
                            <Route path="/codex/magias" element={<SpellsPage />} />
                            <Route path="/spells" element={<SpellsPage />} />

                            <Route path="/characters" element={<CharacterListPage />} />
                            <Route path="/characters/sheet" element={<CharacterCreationWizard />} />
                            <Route path="/characters/:id" element={<CharacterSheetView />} />
                            
                            {/* Master Routes */}
                            <Route path="/master" element={<MasterGrimoire />} />
                            <Route path="/master/campaigns" element={<CampaignListPage />} />
                            <Route path="/master/campaigns/new" element={<CampaignForm />} />
                            <Route path="/master/campaigns/:id" element={<CampaignDetailPage />} />
                            <Route path="/master/campaigns/:id/edit" element={<CampaignForm />} />
                            <Route path="/master/campaigns/:campaignId/games/:gameId" element={<GameBasicPage />} />
                            <Route path="/campaigns/:campaignId/games/:gameId" element={<GameBasicPage />} />
                            <Route path="/join/:inviteCode" element={<GameInvitePage />} />
                            <Route path="/master/campaigns/:campaignId/sessions/new" element={<SessionForm />} />
                            <Route path="/master/campaigns/:campaignId/sessions/:sessionId" element={<SessionForm />} />
                            
                            <Route path="/master/npcs" element={<NPCListPage />} />
                            <Route path="/master/npcs/new" element={<NPCForm />} />
                            <Route path="/master/npcs/generator" element={<NPCGenerator />} />
                            <Route path="/master/npcs/:npcId" element={<NPCForm />} />
                            
                            <Route path="/master/monsters" element={<BestiaryPage />} />
                            <Route path="/master/monsters/new" element={<MonsterForm />} />
                            <Route path="/master/monsters/:monsterId" element={<MonsterDetailsPage />} />
                            <Route path="/master/monsters/:monsterId/edit" element={<MonsterForm />} />
                            
                            <Route path="/master/campaigns/:campaignId/monsters" element={<BestiaryPage />} />
                            <Route path="/master/campaigns/:campaignId/monsters/new" element={<MonsterForm />} />
                            <Route path="/master/campaigns/:campaignId/monsters/:monsterId" element={<MonsterDetailsPage />} />
                            <Route path="/master/campaigns/:campaignId/monsters/:monsterId/edit" element={<MonsterForm />} />
                            <Route path="/master/campaigns/:campaignId/npcs" element={<NPCListPage />} />
                            <Route path="/master/campaigns/:campaignId/npcs/new" element={<NPCForm />} />
                            <Route path="/master/campaigns/:campaignId/npcs/generator" element={<NPCGenerator />} />
                            <Route path="/master/campaigns/:campaignId/npcs/:npcId" element={<NPCForm />} />
                            
                            <Route path="/master/campaigns/:campaignId/locations/new" element={<LocationForm />} />
                            <Route path="/master/campaigns/:campaignId/locations/:locationId" element={<LocationForm />} />
                            
                            <Route path="/master/campaigns/:campaignId/encounters/new" element={<EncounterForm />} />
                            <Route path="/master/campaigns/:campaignId/encounters/:encounterId" element={<EncounterForm />} />
                            
                            <Route path="/master/notes" element={<MasterNotesPage />} />
                            <Route path="/master/campaigns/:campaignId/notes" element={<MasterNotesPage />} />

                            {/* Map Routes */}
                            <Route path="/master/maps" element={<MapPage />} />
                            <Route path="/map/test-map" element={<MapPage />} />
                            <Route path="/maps" element={<MapPage />} />
                            <Route path="/map/:roomId" element={<MapPage />} />
                            <Route path="/map/:roomId/tactical" element={<TacticalMapPage />} />

                            <Route path="/immersive-rpg" element={<ImmersiveRPGPage />} />

                            <Route path="/combat" element={<PlaceholderPage title="Combate" />} />
                            <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
                          </Routes>
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </ProfileProvider>
              </AuthProvider>
            }
          />
        </Routes>
        <FirestoreDevHud />
      </Router>
    </ErrorBoundary>
  );
}
