import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Layers, 
  Eye, 
  Shield, 
  Sword, 
  User, 
  Crown,
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { CharacterVisualState, VISUAL_LAYERS_ORDER } from '../../../types/characterCustomizer';

interface CharacterVisualStageProps {
  visualState: CharacterVisualState;
  activeCategory: string;
}

export const CharacterVisualStage: React.FC<CharacterVisualStageProps> = ({
  visualState,
  activeCategory
}) => {
  const [showLayersInspector, setShowLayersInspector] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'full' | 'portrait'>('full');

  // Determinar tons e gradientes dinâmicos
  const skinColor = visualState.skinTone;
  const hairColor = visualState.hairColor;
  const outfitColor = visualState.outfitColor;

  const auraStyles: Record<string, { ring: string; glow: string; text: string }> = {
    dourada: {
      ring: 'rgba(217, 119, 6, 0.4)',
      glow: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 50%, transparent 70%)',
      text: 'text-amber-400'
    },
    arcana: {
      ring: 'rgba(99, 102, 241, 0.45)',
      glow: 'radial-gradient(circle, rgba(129, 140, 248, 0.18) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
      text: 'text-indigo-400'
    },
    sombria: {
      ring: 'rgba(168, 85, 247, 0.35)',
      glow: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(88, 28, 135, 0.05) 50%, transparent 70%)',
      text: 'text-purple-400'
    },
    nenhuma: {
      ring: 'rgba(255, 255, 255, 0.05)',
      glow: 'transparent',
      text: 'text-stone-400'
    }
  };

  const currentAura = auraStyles[visualState.auraEffect] || auraStyles.dourada;

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center select-none overflow-hidden py-2">
      {/* Moldura Medieval de Exibição */}
      <div className="relative w-full max-w-sm aspect-[4/5] sm:aspect-square max-h-[360px] sm:max-h-[400px] flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#131118]/90 via-[#0a090e]/95 to-[#060508] border border-amber-900/40 shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(245,158,11,0.15)] overflow-hidden">
        
        {/* Fundo Atmosférico com Brilho / Aura */}
        <div 
          className="absolute inset-0 transition-all duration-700 pointer-events-none"
          style={{ background: currentAura.glow }}
        />

        {/* Grade Rúnica e Pedestal de Invocação */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Círculo Mágico de Fundo */}
        <div 
          className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-dashed border-amber-500/20 pointer-events-none animate-[spin_60s_linear_infinite]"
        />
        <div 
          className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-amber-500/10 pointer-events-none"
        />

        {/* Pedestal de Pedra / Base */}
        <div className="absolute bottom-4 w-44 h-9 bg-gradient-to-t from-stone-950 via-stone-900 to-amber-950/40 rounded-[100%] border border-amber-900/50 shadow-[0_0_20px_rgba(0,0,0,0.9)] opacity-80" />

        {/* ============================================================ */}
        {/* RENDERIZADOR DINÂMICO DE CAMADAS (SVG Layered Canvas)        */}
        {/* ============================================================ */}
        <div 
          className={`relative z-10 w-full h-full flex items-center justify-center transition-all duration-500 ${
            zoomLevel === 'portrait' ? 'scale-130 translate-y-12' : 'scale-100'
          }`}
        >
          <svg
            viewBox="0 0 200 240"
            className="w-full h-full max-h-[310px] sm:max-h-[350px] drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Definições de Gradientes e Filtros */}
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={skinColor} />
                <stop offset="100%" stopColor={skinColor} stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={hairColor} />
                <stop offset="100%" stopColor="#120c08" />
              </linearGradient>

              <linearGradient id="outfitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={outfitColor} />
                <stop offset="100%" stopColor="#0a0f18" />
              </linearGradient>

              <linearGradient id="armorMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                {visualState.armorMaterial === 'ouro' ? (
                  <>
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="50%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#713f12" />
                  </>
                ) : visualState.armorMaterial === 'bronze' ? (
                  <>
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </>
                ) : visualState.armorMaterial === 'ferro_negro' ? (
                  <>
                    <stop offset="0%" stopColor="#3f3f46" />
                    <stop offset="100%" stopColor="#18181b" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="50%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </>
                )}
              </linearGradient>

              <filter id="glowArcane" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* CAMADA 1: CAPA / MANTO (COSTAS) */}
            {visualState.cloakStyle !== 'nenhuma' && (
              <g id="layer-cloak-back" opacity="0.9">
                <path
                  d="M 68 85 C 50 120 45 180 50 215 C 75 220 125 220 150 215 C 155 180 150 120 132 85 Z"
                  fill="#450a0a"
                  stroke="#7f1d1d"
                  strokeWidth="1.5"
                />
                <path
                  d="M 58 130 C 56 165 60 210 65 218 M 142 130 C 144 165 140 210 135 218"
                  stroke="#991b1b"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </g>
            )}

            {/* CAMADA 2 & 3: CORPO & PELE (Silhueta Anatômica) */}
            <g id="layer-body-base">
              {/* Sombra / Aura de Contorno */}
              <ellipse cx="100" cy="215" rx="36" ry="6" fill="#000000" opacity="0.6" />

              {/* Pernas / Calças Base */}
              <path
                d="M 82 155 L 77 215 L 93 215 L 96 165 L 104 165 L 107 215 L 123 215 L 118 155 Z"
                fill="#18181b"
                stroke="#27272a"
                strokeWidth="1.5"
              />
              {/* Botas */}
              <path
                d="M 75 200 L 75 217 L 95 217 L 94 200 Z M 105 200 L 105 217 L 125 217 L 124 200 Z"
                fill="#271c19"
                stroke="#451a03"
                strokeWidth="1"
              />

              {/* Tronco / Torso */}
              <path
                d={
                  visualState.bodyType === 'robusto'
                    ? "M 66 85 C 66 85 70 145 74 160 C 85 163 115 163 126 160 C 130 145 134 85 134 85 C 120 80 80 80 66 85 Z"
                    : visualState.bodyType === 'esbelto'
                    ? "M 74 88 C 74 88 78 145 81 160 C 90 162 110 162 119 160 C 122 145 126 88 126 88 C 115 84 85 84 74 88 Z"
                    : "M 70 85 C 70 85 75 145 78 160 C 88 163 112 163 122 160 C 125 145 130 85 130 85 C 118 82 82 82 70 85 Z"
                }
                fill="url(#bodyGrad)"
                stroke="#78350f"
                strokeWidth="1"
              />

              {/* Braços e Mãos */}
              <path
                d="M 70 88 C 55 105 52 135 55 155 C 58 158 64 158 66 153 C 66 138 68 115 76 96 Z"
                fill="url(#bodyGrad)"
                stroke="#78350f"
                strokeWidth="0.8"
              />
              <path
                d="M 130 88 C 145 105 148 135 145 155 C 142 158 136 158 134 153 C 134 138 132 115 124 96 Z"
                fill="url(#bodyGrad)"
                stroke="#78350f"
                strokeWidth="0.8"
              />
            </g>

            {/* CAMADA 4: ROSTO & CABEÇA */}
            <g id="layer-head-face">
              {/* Pescoço */}
              <path
                d="M 92 78 L 92 90 C 96 92 104 92 108 90 L 108 78 Z"
                fill="url(#bodyGrad)"
                stroke="#78350f"
                strokeWidth="0.8"
              />

              {/* Cabeça / Formato do Rosto */}
              <path
                d={
                  visualState.faceShape === 'angular'
                    ? "M 82 52 C 82 36 118 36 118 52 C 118 68 110 80 100 83 C 90 80 82 68 82 52 Z"
                    : visualState.faceShape === 'marcado'
                    ? "M 81 50 C 81 35 119 35 119 50 C 119 66 112 82 100 84 C 88 82 81 66 81 50 Z"
                    : "M 83 50 C 83 35 117 35 117 50 C 117 66 109 81 100 82 C 91 81 83 66 83 50 Z"
                }
                fill="url(#bodyGrad)"
                stroke="#78350f"
                strokeWidth="1"
              />

              {/* Olhos Expressivos */}
              <ellipse cx="93" cy="54" rx="2.5" ry="1.5" fill="#ffffff" />
              <circle cx="93.5" cy="54" r="1.2" fill={visualState.eyeColor} />
              
              <ellipse cx="107" cy="54" rx="2.5" ry="1.5" fill="#ffffff" />
              <circle cx="106.5" cy="54" r="1.2" fill={visualState.eyeColor} />

              {/* Sobrancelhas por Expressão */}
              {visualState.expression === 'determinado' && (
                <path d="M 89 50 L 96 52 M 111 50 L 104 52" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
              )}
              {visualState.expression === 'sereno' && (
                <path d="M 89 51 L 96 51 M 111 51 L 104 51" stroke="#451a03" strokeWidth="1" strokeLinecap="round" />
              )}
              {visualState.expression === 'feroz' && (
                <path d="M 88 48 L 96 52 M 112 48 L 104 52" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
              )}
              {visualState.expression === 'astuto' && (
                <path d="M 89 51 L 96 50 M 111 50 L 104 52" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
              )}

              {/* Nariz e Boca */}
              <path d="M 100 55 L 99 62 L 102 62" stroke="#78350f" strokeWidth="0.9" fill="none" strokeLinecap="round" />
              <path d="M 96 68 C 98 70 102 70 104 68" stroke="#451a03" strokeWidth="1" fill="none" strokeLinecap="round" />

              {/* Marcas de Rosto */}
              {visualState.faceMarking === 'cicatriz' && (
                <path d="M 106 48 L 109 60" stroke="#991b1b" strokeWidth="1" strokeLinecap="round" />
              )}
              {visualState.faceMarking === 'runa' && (
                <path d="M 100 42 L 100 47 M 98 44 L 102 44" stroke="#6366f1" strokeWidth="1" filter="url(#glowArcane)" />
              )}
              {visualState.faceMarking === 'pintura' && (
                <path d="M 90 58 L 95 64 M 110 58 L 105 64" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </g>

            {/* CAMADA 5: CABELO */}
            <g id="layer-hair">
              {visualState.hairStyle === 'curto' && (
                <path
                  d="M 80 48 C 78 30 122 30 120 48 C 117 38 108 34 100 35 C 92 34 83 38 80 48 Z"
                  fill="url(#hairGrad)"
                  stroke="#1c1917"
                  strokeWidth="1"
                />
              )}
              {visualState.hairStyle === 'longo' && (
                <path
                  d="M 78 50 C 76 28 124 28 122 50 C 126 80 128 115 125 125 C 120 115 118 70 117 55 C 108 36 92 36 83 55 C 82 70 80 115 75 125 C 72 115 74 80 78 50 Z"
                  fill="url(#hairGrad)"
                  stroke="#1c1917"
                  strokeWidth="1"
                />
              )}
              {visualState.hairStyle === 'coque' && (
                <g>
                  <circle cx="100" cy="27" r="8" fill="url(#hairGrad)" stroke="#1c1917" strokeWidth="1" />
                  <path
                    d="M 80 48 C 78 32 122 32 120 48 C 115 40 108 36 100 36 C 92 36 85 40 80 48 Z"
                    fill="url(#hairGrad)"
                    stroke="#1c1917"
                    strokeWidth="1"
                  />
                  <line x1="94" y1="24" x2="106" y2="30" stroke="#d97706" strokeWidth="1.5" />
                </g>
              )}
              {visualState.hairStyle === 'trancas' && (
                <path
                  d="M 80 46 C 78 30 122 30 120 46 C 125 70 127 105 122 120 C 118 100 117 65 116 52 C 108 36 92 36 84 52 C 83 65 82 100 78 120 C 73 105 75 70 80 46 Z"
                  fill="url(#hairGrad)"
                  stroke="#1c1917"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
              )}
              {visualState.hairStyle === 'raspado' && (
                <path
                  d="M 82 46 C 81 36 119 36 118 46 Z"
                  fill="url(#hairGrad)"
                  opacity="0.6"
                />
              )}
              {visualState.hairStyle === 'selvagem' && (
                <path
                  d="M 77 52 L 74 38 L 84 42 L 88 28 L 98 36 L 102 26 L 112 36 L 116 28 L 120 42 L 126 38 L 123 52 C 120 42 108 38 100 38 C 92 38 80 42 77 52 Z"
                  fill="url(#hairGrad)"
                  stroke="#1c1917"
                  strokeWidth="1"
                />
              )}
            </g>

            {/* CAMADA 6: ROUPA / VESTIMENTA */}
            <g id="layer-outfit">
              <path
                d="M 75 90 L 68 135 L 80 135 L 79 160 L 121 160 L 120 135 L 132 135 L 125 90 C 112 95 88 95 75 90 Z"
                fill="url(#outfitGrad)"
                stroke="#334155"
                strokeWidth="1"
              />
              {/* Detalhe de Gola em V */}
              <path
                d="M 90 90 L 100 108 L 110 90"
                stroke="#d97706"
                strokeWidth="1.2"
                fill="none"
              />
              {/* Cinto com Fivela Dourada */}
              <rect x="76" y="152" width="48" height="7" fill="#29180e" stroke="#451a03" strokeWidth="0.8" />
              <rect x="96" y="150" width="8" height="11" fill="#ca8a04" stroke="#fef08a" strokeWidth="0.8" rx="1" />
            </g>

            {/* CAMADA 7: ARMADURA */}
            {visualState.armorStyle !== 'nenhuma' && (
              <g id="layer-armor">
                {visualState.armorStyle === 'couro' && (
                  <g>
                    <path
                      d="M 74 92 C 74 92 77 140 80 150 C 90 152 110 152 120 150 C 123 140 126 92 126 92 C 114 96 86 96 74 92 Z"
                      fill="#3d2117"
                      stroke="#78350f"
                      strokeWidth="1.2"
                    />
                    <line x1="84" y1="100" x2="116" y2="142" stroke="#78350f" strokeWidth="1" />
                    <line x1="116" y1="100" x2="84" y2="142" stroke="#78350f" strokeWidth="1" />
                  </g>
                )}

                {visualState.armorStyle === 'malha' && (
                  <g>
                    <path
                      d="M 73 90 C 73 90 77 145 80 152 C 90 154 110 154 120 152 C 123 145 127 90 127 90 Z"
                      fill="#475569"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                    />
                  </g>
                )}

                {(visualState.armorStyle === 'placas' || visualState.armorStyle === 'guardiao') && (
                  <g>
                    {/* Peitoral Metálico Curvado */}
                    <path
                      d="M 74 92 L 78 148 L 122 148 L 126 92 C 114 95 86 95 74 92 Z"
                      fill="url(#armorMetalGrad)"
                      stroke="#0f172a"
                      strokeWidth="1.2"
                    />
                    {/* Ombreiras de Placas */}
                    <path
                      d="M 64 86 C 60 92 66 108 76 106 C 78 96 76 88 64 86 Z"
                      fill="url(#armorMetalGrad)"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <path
                      d="M 136 86 C 140 92 134 108 124 106 C 122 96 124 88 136 86 Z"
                      fill="url(#armorMetalGrad)"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    {/* Linha Central Heroica do Peitoral */}
                    <line x1="100" y1="94" x2="100" y2="146" stroke="#0f172a" strokeWidth="1.2" />
                    <circle cx="100" cy="115" r="3" fill="#ca8a04" stroke="#fef08a" strokeWidth="0.8" />
                  </g>
                )}
              </g>
            )}

            {/* CAMADA 8: ARMA / SILHUETA EMPUNHADA */}
            {visualState.weaponSilhouette !== 'nenhuma' && (
              <g id="layer-weapon">
                {visualState.weaponSilhouette === 'espada' && (
                  <g transform="translate(138, 70) rotate(15)">
                    {/* Lâmina */}
                    <path d="M 0 0 L 3 -70 L 6 0 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
                    {/* Guarda e Empunhadura */}
                    <rect x="-6" y="0" width="18" height="3" fill="#ca8a04" rx="1" />
                    <rect x="1" y="3" width="4" height="14" fill="#3d2117" />
                    <circle cx="3" cy="18" r="3" fill="#ca8a04" />
                  </g>
                )}

                {visualState.weaponSilhouette === 'cajado' && (
                  <g transform="translate(142, 40)">
                    {/* Haste de Madeira */}
                    <rect x="0" y="0" width="4" height="175" fill="#451a03" stroke="#29180e" strokeWidth="0.8" rx="1" />
                    {/* Cristal Arcano no Topo */}
                    <polygon points="2,-15 10,-2 2,12 -6,-2" fill="#818cf8" stroke="#c7d2fe" strokeWidth="1" filter="url(#glowArcane)" />
                  </g>
                )}

                {visualState.weaponSilhouette === 'adagas' && (
                  <g transform="translate(56, 140) rotate(-25)">
                    <path d="M 0 0 L 2 -25 L 4 0 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="0.6" />
                    <rect x="-3" y="0" width="10" height="2" fill="#ca8a04" />
                    <rect x="0" y="2" width="4" height="7" fill="#18181b" />
                  </g>
                )}
              </g>
            )}

            {/* CAMADA 9: ACESSÓRIOS (Medalhões, Auras) */}
            {visualState.accessoryType !== 'nenhum' && (
              <g id="layer-accessory">
                {visualState.accessoryType === 'medalao_sagrado' && (
                  <g>
                    <path d="M 94 92 L 100 102 L 106 92" stroke="#ca8a04" strokeWidth="1" fill="none" />
                    <circle cx="100" cy="103" r="3" fill="#eab308" stroke="#fef08a" strokeWidth="0.8" />
                    <path d="M 98 103 L 102 103 M 100 101 L 100 105" stroke="#713f12" strokeWidth="0.6" />
                  </g>
                )}
                {visualState.accessoryType === 'amuleto_arcano' && (
                  <g>
                    <path d="M 94 92 L 100 104 L 106 92" stroke="#818cf8" strokeWidth="1" fill="none" />
                    <polygon points="100,100 103,105 100,109 97,105" fill="#6366f1" stroke="#e0e7ff" strokeWidth="0.8" filter="url(#glowArcane)" />
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* ============================================================ */}
        {/* BOTÕES FLUTUANTES DO PALCO (Controles Rápidos)               */}
        {/* ============================================================ */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => setZoomLevel(prev => prev === 'full' ? 'portrait' : 'full')}
            className="p-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-amber-900/40 text-amber-300 text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
            title="Alternar Visão de Corpo / Retrato"
          >
            <Eye size={13} className="text-amber-400" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider hidden sm:inline">
              {zoomLevel === 'full' ? 'Zoom Retrato' : 'Corpo Inteiro'}
            </span>
          </button>

          <button
            onClick={() => setShowLayersInspector(prev => !prev)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm ${
              showLayersInspector 
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-200' 
                : 'bg-stone-900/90 hover:bg-stone-800 border-amber-900/40 text-stone-300'
            }`}
            title="Inspecionar Arquitetura de Camadas"
          >
            <Layers size={13} className="text-amber-400" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider hidden sm:inline">
              Camadas
            </span>
          </button>
        </div>

        {/* Badge Indicador de Categoria Atual */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <div className="px-2.5 py-1 rounded-md bg-stone-950/80 border border-amber-900/50 text-[10px] font-cinzel font-bold text-amber-300 tracking-wider uppercase flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Editando: {activeCategory}</span>
          </div>
        </div>

        {/* Legenda de Camadas Conceituais / Drawer Informativo */}
        <AnimatePresence>
          {showLayersInspector && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute inset-x-2 bottom-2 max-h-[85%] bg-[#0d0c12]/95 border border-amber-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md z-30 flex flex-col"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-900/40">
                <div className="flex items-center gap-1.5">
                  <Layers size={14} className="text-amber-400" />
                  <span className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                    Pilha de Renderização em Camadas
                  </span>
                </div>
                <button
                  onClick={() => setShowLayersInspector(false)}
                  className="text-stone-400 hover:text-stone-200 text-xs px-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar text-[11px]">
                <p className="text-stone-400 text-[10px] italic leading-tight pb-1">
                  Arquitetura modular de sobreposição visual preparada para os assets 2D do Helmor:
                </p>
                {VISUAL_LAYERS_ORDER.map((layer, index) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between p-1 rounded bg-stone-900/60 border border-amber-900/20 text-stone-300"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-amber-400 w-4 font-bold">{index + 1}.</span>
                      <span className="font-medium text-stone-200">{layer.name}</span>
                    </div>
                    <span className="text-[9px] text-stone-500 font-mono">z-{layer.zIndex}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dica de Toque Mobile */}
      <p className="text-[10px] text-stone-400 font-sans italic mt-1.5 text-center">
        Selecione uma categoria abaixo para ajustar traços, cores e camadas.
      </p>
    </div>
  );
};
