import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, UserRole } from '../context/ProfileContext';
import { useLoading } from '../context/LoadingContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Crown, Sword, ChevronRight } from 'lucide-react';

export const ProfileSelection = () => {
  const { selectProfile } = useProfile();
  const { withLoading, setLoaderTheme } = useLoading();
  const navigate = useNavigate();

  const handleSelect = async (role: UserRole) => {
    // Dynamically set loader theme to represent the realm they're entering!
    if (role === 'MASTER') {
      setLoaderTheme('occult');
      await withLoading(
        new Promise<void>(resolve => {
          selectProfile(role);
          setTimeout(resolve, 800);
        }),
        "Canalizando a sabedoria cósmica do Mestre..."
      );
      navigate('/mestre');
    } else {
      setLoaderTheme('compass');
      await withLoading(
        new Promise<void>(resolve => {
          selectProfile(role);
          setTimeout(resolve, 800);
        }),
        "Invocando a astúcia do Investigador..."
      );
      navigate('/jogador');
    }
  };

  return (
    <div className="min-h-screen bg-mythos-bg flex items-center justify-center p-4 sm:p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
      <div className="max-w-4xl w-full space-y-8 sm:space-y-12">
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel text-gold-gradient drop-shadow-2xl break-words">REALMOR</h1>
          <p className="text-gold/40 text-sm sm:text-lg font-medium italic max-w-md mx-auto">"Escolha seu papel nesta jornada. O destino aguarda sua decisão."</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-10">
          {/* Card Mestre */}
          <div 
            onClick={() => handleSelect('MASTER')}
            className="group cursor-pointer transition-all duration-500 hover:-translate-y-1.5"
          >
            <div className="glass-card p-3.5 sm:p-10 h-full border border-gold/15 group-hover:border-gold/50 flex flex-col items-center text-center space-y-3 sm:space-y-8 relative overflow-hidden medieval-border bg-black/60 md:bg-mythos-card/80">
              <div className="absolute top-0 right-0 p-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Crown className="w-16 h-16 sm:w-[160px] sm:h-[160px]" />
              </div>
              
              <div className="w-9 h-9 sm:w-20 sm:h-20 rounded-full sm:rounded-sm bg-gold/5 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-mythos-bg transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <Crown size={16} className="sm:w-10 sm:h-10" />
              </div>
              
              <div className="space-y-1 sm:space-y-3">
                <h2 className="text-sm sm:text-3xl lg:text-4xl font-cinzel text-gold-gradient font-black tracking-wider sm:tracking-normal">Mestre</h2>
                <p className="text-gold/50 text-[9px] sm:text-sm font-sans sm:font-medium leading-tight sm:leading-relaxed max-w-[130px] sm:max-w-none mx-auto">
                  <span className="sm:hidden">Crie campanhas e controle aventuras.</span>
                  <span className="hidden sm:inline">Crie campanhas, gerencie sessões, controle NPCs e narre histórias épicas para seus jogadores.</span>
                </p>
              </div>

              <ul className="hidden sm:flex text-[10px] sm:text-xs text-gold/40 space-y-2 sm:space-y-3 text-left w-full font-medium">
                <li className="flex items-center gap-2 sm:gap-3"><ChevronRight size={12} className="text-gold" /> Grimório de Campanhas</li>
                <li className="flex items-center gap-2 sm:gap-3"><ChevronRight size={12} className="text-gold" /> Bestiário e NPCs</li>
                <li className="flex items-center gap-2 sm:gap-3"><ChevronRight size={12} className="text-gold" /> Controle de Combate</li>
              </ul>

              <Button variant="primary" className="w-full mt-auto h-7 sm:h-10 py-0 text-[10px] sm:text-xs">
                <span className="sm:hidden font-black">Entrar</span>
                <span className="hidden sm:inline">Assumir o Trono</span>
              </Button>
            </div>
          </div>

          {/* Card Jogador */}
          <div 
            onClick={() => handleSelect('PLAYER')}
            className="group cursor-pointer transition-all duration-500 hover:-translate-y-1.5"
          >
            <div className="glass-card p-3.5 sm:p-10 h-full border border-magic/15 group-hover:border-magic/50 flex flex-col items-center text-center space-y-3 sm:space-y-8 relative overflow-hidden medieval-border bg-black/60 md:bg-mythos-card/80" style={{ borderColor: 'rgba(77, 163, 255, 0.15)' }}>
              <div className="absolute top-0 right-0 p-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Sword className="w-16 h-16 sm:w-[160px] sm:h-[160px]" />
              </div>

              <div className="w-9 h-9 sm:w-20 sm:h-20 rounded-full sm:rounded-sm bg-magic/5 border border-magic/20 flex items-center justify-center text-magic group-hover:bg-magic group-hover:text-mythos-bg transition-all duration-500 shadow-[0_0_15px_rgba(77,163,255,0.08)]">
                <Sword size={16} className="sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-1 sm:space-y-3">
                <h2 className="text-sm sm:text-3xl lg:text-4xl font-cinzel text-magic font-black tracking-wider sm:tracking-normal" style={{ textShadow: '0 0 10px rgba(77, 163, 255, 0.2)' }}>Jogador</h2>
                <p className="text-magic/50 text-[9px] sm:text-sm font-sans sm:font-medium leading-tight sm:leading-relaxed max-w-[130px] sm:max-w-none mx-auto">
                  <span className="sm:hidden">Gerencie personagens e acompanhe jornadas.</span>
                  <span className="hidden sm:inline">Crie seus heróis, gerencie suas fichas, inventário e magias enquanto evolui em suas aventuras.</span>
                </p>
              </div>

              <ul className="hidden sm:flex text-[10px] sm:text-xs text-magic/40 space-y-2 sm:space-y-3 text-left w-full font-medium">
                <li className="flex items-center gap-2 sm:gap-3"><ChevronRight size={12} className="text-magic" /> Fichas de Heróis</li>
                <li className="flex items-center gap-2 sm:gap-3"><ChevronRight size={12} className="text-magic" /> Gestão de Inventário</li>
                <li className="flex items-center gap-2 sm:gap-3"><ChevronRight size={12} className="text-magic" /> Diário do Aventureiro</li>
              </ul>

              <Button variant="primary" className="w-full mt-auto h-7 sm:h-10 py-0 text-[10px] sm:text-xs bg-magic hover:bg-blue-400 border-blue-800 text-mythos-bg">
                <span className="sm:hidden font-black">Entrar</span>
                <span className="hidden sm:inline">Iniciar Jornada</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
