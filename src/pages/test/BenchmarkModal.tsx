import React, { useState } from 'react';
import { 
  Activity, 
  Zap, 
  Layers, 
  Sun, 
  Eye, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Check, 
  Smartphone, 
  Monitor, 
  ShieldAlert, 
  Sparkles,
  Info,
  HelpCircle,
  BarChart3,
  Flame,
  ArrowDownRight
} from 'lucide-react';
import { 
  BenchmarkStageId, 
  BenchmarkResult, 
  SceneBottleneckAudit, 
  PerformancePreset,
  CustomizationAudit3D
} from './benchmarkTypes';
import { BENCHMARK_STAGES, PRESET_CONFIGS } from './benchmarkUtils';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: SceneBottleneckAudit | null;
  onRefreshAudit: () => void;
  onApplyPreset: (preset: PerformancePreset) => void;
  activePreset: PerformancePreset | 'custom';
  onRunBenchmark: () => void;
  isBenchmarkRunning: boolean;
  benchmarkCurrentStage: BenchmarkStageId | null;
  benchmarkProgress: number;
  benchmarkResults: Record<string, BenchmarkResult>;
  onApplyStageSettings: (stageId: BenchmarkStageId) => void;
  vitruvianDiag: any;
  onLoadVitruvianMode: (mode: 'body_and_head' | 'body_only' | 'head_only') => void;
  customizationAudit?: CustomizationAudit3D | null;
  onRunCustomizationTest?: () => { eyeTests: any[]; hairTests: any[]; allPassed: boolean };
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  isOpen,
  onClose,
  audit,
  onRefreshAudit,
  onApplyPreset,
  activePreset,
  onRunBenchmark,
  isBenchmarkRunning,
  benchmarkCurrentStage,
  benchmarkProgress,
  benchmarkResults,
  onApplyStageSettings,
  vitruvianDiag,
  onLoadVitruvianMode,
  customizationAudit,
  onRunCustomizationTest
}) => {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'inspector' | 'presets' | 'modular' | 'customization'>('customization');
  const [testResults, setTestResults] = useState<{ eyeTests: any[]; hairTests: any[]; allPassed: boolean } | null>(null);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-[#0e0d16] border border-amber-900/60 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* ============================================================ */}
        {/* HEADER DO MODAL DE BENCHMARK & DIAGNÓSTICO                   */}
        {/* ============================================================ */}
        <div className="px-4 py-3 bg-[#13111f] border-b border-amber-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <span>Diagnóstico & Benchmark Mobile 3D</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono">
                  Snapdragon 8 Gen 2 Inspector
                </span>
              </h3>
              <p className="text-[10px] text-stone-400 font-mono">
                Investigação de gargalos de renderização WebGL • Three.js • Galaxy S23
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all cursor-pointer"
            title="Fechar Modal"
          >
            ✕
          </button>
        </div>

        {/* ============================================================ */}
        {/* SELETOR DE ABAS PRINCIPAIS                                  */}
        {/* ============================================================ */}
        <div className="px-3 pt-2 pb-1 bg-[#100f1a] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`py-1.5 px-3 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'benchmark'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <BarChart3 size={14} className="text-amber-400" />
            <span>1. Matriz de Benchmark (8 Testes)</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`py-1.5 px-3 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'inspector'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span>2. Inspetor Automático de Gargalos</span>
            {audit?.suspectedBottlenecks && audit.suspectedBottlenecks.length > 0 && (
              <span className="text-[9px] px-1 rounded-full bg-rose-500/30 text-rose-300 font-mono">
                {audit.suspectedBottlenecks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`py-1.5 px-3 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'presets'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Cpu size={14} className="text-amber-400" />
            <span>3. Presets de Desempenho</span>
          </button>

          <button
            onClick={() => setActiveTab('modular')}
            className={`py-1.5 px-3 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'modular'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>4. Diagnóstico Modular Vitruvian</span>
          </button>

          <button
            onClick={() => setActiveTab('customization')}
            className={`py-1.5 px-3 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'customization'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Eye size={14} className="text-amber-400" />
            <span>5. Customização 3D</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* CONTEÚDO SCROLLÁVEL DO MODAL                                */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 custom-scrollbar">
          
          {/* ============================================================ */}
          {/* ABA 1: MATRIZ DE BENCHMARK (8 ETAPAS)                        */}
          {/* ============================================================ */}
          {activeTab === 'benchmark' && (
            <div className="space-y-4 font-mono text-xs">
              
              {/* Barra de Controle do Runner de Benchmark */}
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900/80 to-[#12101d] border border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-amber-400" />
                    <span className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase">
                      Execução Automatizada de Benchmark
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Mede cientificamente 8 cenários de renderização com amostragem de FPS, Frame Time e Draw Calls.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={onRunBenchmark}
                    disabled={isBenchmarkRunning}
                    className={`flex-1 sm:flex-none py-2 px-4 rounded-xl font-cinzel font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md ${
                      isBenchmarkRunning
                        ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed animate-pulse'
                        : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    }`}
                  >
                    {isBenchmarkRunning ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Testando Etapa... ({benchmarkProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="fill-stone-950" />
                        <span>Executar Benchmark Completo</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onRefreshAudit}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                    title="Atualizar Métricas Ao Vivo"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Status do Benchmark em Execução */}
              {isBenchmarkRunning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                    <span>Etapa Ativa: {BENCHMARK_STAGES.find(s => s.id === benchmarkCurrentStage)?.name || 'Iniciando...'}</span>
                    <span>{benchmarkProgress}% Concluído</span>
                  </div>
                  <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                      style={{ width: `${benchmarkProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tabela de Comparação dos 8 Cenários de Teste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={13} className="text-amber-400" />
                    <span>Tabela Comparativa dos 8 Cenários</span>
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    Clique em "Testar" para ativar qualquer configuração individualmente
                  </span>
                </div>

                <div className="border border-amber-900/30 rounded-xl overflow-x-auto custom-scrollbar bg-stone-950/60">
                  <table className="w-full text-left border-collapse text-[10px] sm:text-[11px]">
                    <thead>
                      <tr className="bg-[#151322] text-amber-300 border-b border-amber-900/40 font-cinzel">
                        <th className="py-2 px-2.5">Cenário de Teste</th>
                        <th className="py-2 px-2 text-center">FPS Médio</th>
                        <th className="py-2 px-2 text-center">Mín / Máx</th>
                        <th className="py-2 px-2 text-center">Frame Time</th>
                        <th className="py-2 px-2 text-center">Draw Calls</th>
                        <th className="py-2 px-2 text-center">Triângulos</th>
                        <th className="py-2 px-2 text-center">Resolução Real</th>
                        <th className="py-2 px-2 text-center">Pixel Ratio</th>
                        <th className="py-2 px-2 text-center">Sombras</th>
                        <th className="py-2 px-2 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {BENCHMARK_STAGES.map((stage, idx) => {
                        const res = benchmarkResults[stage.id];
                        const isCurrentTesting = isBenchmarkRunning && benchmarkCurrentStage === stage.id;

                        // Cor de status do FPS
                        const fpsColor = !res 
                          ? 'text-stone-500' 
                          : res.avgFps >= 55 
                            ? 'text-emerald-400' 
                            : res.avgFps >= 40 
                              ? 'text-amber-300' 
                              : 'text-rose-400';

                        return (
                          <tr 
                            key={stage.id}
                            className={`transition-colors ${
                              isCurrentTesting 
                                ? 'bg-amber-500/15 text-amber-200' 
                                : 'hover:bg-stone-900/40'
                            }`}
                          >
                            <td className="py-2.5 px-2.5">
                              <div className="font-bold text-stone-200">{stage.name}</div>
                              <div className="text-[9px] text-stone-400 max-w-xs truncate" title={stage.description}>
                                {stage.description}
                              </div>
                            </td>

                            <td className="py-2 px-2 text-center">
                              {res ? (
                                <span className={`text-xs font-bold ${fpsColor}`}>
                                  {res.avgFps} FPS
                                </span>
                              ) : (
                                <span className="text-stone-500 italic">—</span>
                              )}
                            </td>

                            <td className="py-2 px-2 text-center text-stone-300">
                              {res ? (
                                <span>{res.minFps} / {res.maxFps}</span>
                              ) : (
                                <span className="text-stone-500">—</span>
                              )}
                            </td>

                            <td className="py-2 px-2 text-center">
                              {res ? (
                                <span className={`font-mono ${res.avgFrameTimeMs > 28 ? 'text-rose-400' : 'text-emerald-300'}`}>
                                  {res.avgFrameTimeMs}ms
                                </span>
                              ) : (
                                <span className="text-stone-500">—</span>
                              )}
                            </td>

                            <td className="py-2 px-2 text-center text-stone-300">
                              {res ? res.drawCalls : '—'}
                            </td>

                            <td className="py-2 px-2 text-center text-stone-300">
                              {res ? res.triangles.toLocaleString() : '—'}
                            </td>

                            <td className="py-2 px-2 text-center text-stone-300">
                              {res ? res.canvasRealResolution : '—'}
                            </td>

                            <td className="py-2 px-2 text-center">
                              <span className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-amber-300">
                                {stage.settings.pixelRatio}x
                              </span>
                            </td>

                            <td className="py-2 px-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                stage.settings.shadows 
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                                  : 'bg-stone-900 text-stone-500'
                              }`}>
                                {stage.settings.shadows ? `${stage.settings.shadowMapSize}px` : 'OFF'}
                              </span>
                            </td>

                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => onApplyStageSettings(stage.id)}
                                className="py-1 px-2.5 rounded-lg bg-stone-900 hover:bg-amber-500/20 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-amber-200 text-[10px] font-cinzel font-bold transition-all active:scale-95 cursor-pointer"
                              >
                                Testar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guia Explicativo dos Testes */}
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-300 space-y-2">
                <div className="font-bold text-amber-300 font-cinzel flex items-center gap-1">
                  <Info size={13} className="text-amber-400" />
                  <span>Como Interpretar as Quedas de Desempenho no Snapdragon 8 Gen 2:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[10px] text-stone-400">
                  <li>
                    <strong className="text-stone-200">Queda no Teste 8 (Pixel Ratio 2x) vs Teste 6 (1x):</strong> Indica que o gargalo é a <em>taxa de preenchimento (Fillrate)</em> e a altíssima resolução nativa de tela (1080x2340 / 1440x3088). Reduzir o DPR para 1.0x resolve instantaneamente.
                  </li>
                  <li>
                    <strong className="text-stone-200">Queda no Teste 5 (Physical) vs Teste 4 (Standard PBR):</strong> Indica que o render pass interno de cópia de textura do Three.js para o efeito vítreo da córnea (<code>transmission: 0.95</code>) está quebrando o pipeline Tile-Based da GPU Adreno 740.
                  </li>
                  <li>
                    <strong className="text-stone-200">Queda no Teste 2 (Sombras 2048px) vs Teste 1 (Sem Sombras):</strong> Indica sobrecarga na geração do Depth Map de sombras em tempo real.
                  </li>
                </ul>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 2: INSPETOR AUTOMÁTICO DE GARGALOS                       */}
          {/* ============================================================ */}
          {activeTab === 'inspector' && audit && (
            <div className="space-y-4 font-mono text-xs">
              
              {/* Resumo em Tempo Real da GPU & Renderizador */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[10px] block">FPS Ao Vivo:</span>
                  <div className={`text-base font-bold flex items-center gap-1.5 ${
                    audit.fps >= 55 ? 'text-emerald-400' : audit.fps >= 35 ? 'text-amber-300' : 'text-rose-400'
                  }`}>
                    <Activity size={14} />
                    <span>{audit.fps} FPS</span>
                  </div>
                  <span className="text-[9px] text-stone-500 block">Tempo: {audit.frameTimeMs}ms</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[10px] block">Resolução Real:</span>
                  <div className="text-sm font-bold text-amber-300">{audit.canvasRealResolution}</div>
                  <span className="text-[9px] text-stone-500 block">DPR: {audit.pixelRatio}x (Nat: {audit.devicePixelRatioNative}x)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[10px] block">Draw Calls / Shaders:</span>
                  <div className="text-sm font-bold text-stone-200">{audit.drawCalls} calls</div>
                  <span className="text-[9px] text-stone-500 block">{audit.programsCount} programas de shader</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[10px] block">Triângulos / Malhas:</span>
                  <div className="text-sm font-bold text-stone-200">{audit.triangles.toLocaleString()}</div>
                  <span className="text-[9px] text-stone-500 block">{audit.geometriesCount} geometrias em VRAM</span>
                </div>
              </div>

              {/* Diagnósticos de Gargalos Suspeitos Detectados */}
              <div className="space-y-2">
                <h4 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-400" />
                  <span>Gargalos Suspeitos Detectados Automaticamente</span>
                </h4>

                {audit.suspectedBottlenecks.length > 0 ? (
                  <div className="space-y-2">
                    {audit.suspectedBottlenecks.map((item, idx) => {
                      const isCrit = item.severity === 'critical';
                      const isHigh = item.severity === 'high';
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border space-y-1.5 ${
                            isCrit 
                              ? 'bg-rose-950/40 border-rose-800/80 text-rose-200' 
                              : isHigh 
                                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200' 
                                : 'bg-stone-900/70 border-stone-800 text-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <AlertTriangle size={13} className={isCrit ? 'text-rose-400' : 'text-amber-400'} />
                              <span>{item.title}</span>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                              isCrit ? 'bg-rose-900 text-rose-100' : 'bg-amber-900 text-amber-100'
                            }`}>
                              {item.impact}
                            </span>
                          </div>

                          <p className="text-[11px] opacity-90 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="text-[10px] pt-1 border-t border-white/10 flex items-start gap-1 text-emerald-300">
                            <CheckCircle2 size={12} className="shrink-0 mt-0.5 text-emerald-400" />
                            <span><strong>Recomendação:</strong> {item.recommendation}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 text-center">
                    Nenhum gargalo crítico detectado nas configurações ativas.
                  </div>
                )}
              </div>

              {/* Varredura Detalhada: Luzes e Sombras */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="font-bold text-stone-200 flex items-center gap-1.5 font-cinzel">
                    <Sun size={13} className="text-amber-400" />
                    <span>Luzes & Shadow Casting</span>
                  </span>
                  <span className="text-stone-400 text-[10px]">
                    {audit.activeLightsCount} luzes ativas • {audit.shadowCastingLights.length} com projeção de sombra
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-stone-300">
                  {audit.shadowCastingLights.map((l, i) => (
                    <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                      <div className="text-amber-300 font-bold flex justify-between">
                        <span>{l.name}</span>
                        <span className="text-emerald-400 font-mono">{l.mapSize}</span>
                      </div>
                      <div>• Tipo: {l.type}</div>
                      <div>• Intensidade: {l.intensity.toFixed(2)}x | Bias: {l.bias}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[10px] text-stone-400 pt-1 border-t border-white/5">
                  <span>Malhas que projetam sombra (castShadow): <strong className="text-stone-200">{audit.shadowCastersCount}</strong></span>
                  <span>Malhas que recebem sombra (receiveShadow): <strong className="text-stone-200">{audit.shadowReceiversCount}</strong></span>
                </div>
              </div>

              {/* Varredura Detalhada: MeshPhysicalMaterial & Materiais Transparentes */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="font-bold text-stone-200 flex items-center gap-1.5 font-cinzel">
                    <Eye size={13} className="text-amber-400" />
                    <span>Materiais Físicos (Physical) & Transparência</span>
                  </span>
                  <span className="text-stone-400 text-[10px]">
                    {audit.meshPhysicalCount} MeshPhysical • {audit.transparentMaterialsCount} Transparentes
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] text-stone-300">
                  {audit.meshPhysicalObjects.map((m, i) => (
                    <div key={i} className="p-1.5 rounded bg-black/40 border border-white/5 flex justify-between">
                      <span><strong>{m.meshName}:</strong> {m.materialName}</span>
                      <span className="text-amber-300 font-bold">
                        {m.hasTransmission ? 'Transmission Ativo (Copia Buffer)' : 'Clearcoat'}
                      </span>
                    </div>
                  ))}
                  {audit.transparentObjects.map((t, i) => (
                    <div key={i} className="p-1.5 rounded bg-black/40 border border-white/5 flex justify-between text-stone-400">
                      <span><strong>{t.meshName}:</strong> {t.materialName}</span>
                      <span>{t.doubleSided ? 'DoubleSide (Frente/Verso)' : 'SingleSide'} • Alpha: {t.alphaTest}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Antialiasing & Pós-Processamento */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 space-y-1 text-[11px] text-stone-300">
                <div className="font-bold text-stone-200 font-cinzel pb-1 border-b border-white/5">
                  ⚙️ Configurações do Pipeline WebGL
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>• <strong>Antialiasing (MSAA):</strong> {audit.antialiasEnabled ? 'Ativado (Hardware MSAA)' : 'Desativado'}</div>
                  <div>• <strong>Tone Mapping:</strong> {audit.toneMapping} (Exp: {audit.toneMappingExposure})</div>
                  <div>• <strong>Shadow Map Type:</strong> {audit.shadowMapType}</div>
                  <div>• <strong>Canvas CSS:</strong> {audit.canvasCssResolution}</div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 3: PRESETS DE DESEMPENHO (PERFORMANCE PROFILES)          */}
          {/* ============================================================ */}
          {activeTab === 'presets' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-stone-300 text-[11px] space-y-1">
                <div className="font-bold text-amber-300 font-cinzel flex items-center gap-1.5">
                  <Smartphone size={14} className="text-amber-400" />
                  <span>Comparação Manual de Presets de Desempenho:</span>
                </div>
                <p className="text-[10px] text-stone-400">
                  Os presets abaixo alteram dinamicamente a resolução (Pixel Ratio), o mapa de sombras, a complexidade de iluminação e os shaders de materiais. O preset <strong>Mobile</strong> é conservador para manter 60 FPS estáveis, mas NÃO é imposto automaticamente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(PRESET_CONFIGS) as PerformancePreset[]).map((key) => {
                  const preset = PRESET_CONFIGS[key];
                  const isSelected = activePreset === key;

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                          : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase">
                            {preset.name}
                          </h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            key === 'mobile' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            key === 'ultra' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>

                        <p className="text-[10px] text-stone-400 leading-relaxed">
                          {preset.description}
                        </p>

                        <div className="text-[10px] space-y-0.5 pt-1.5 border-t border-white/5 text-stone-300">
                          <div>• Pixel Ratio: <strong className="text-amber-300">{preset.settings.pixelRatio}x</strong></div>
                          <div>• Sombras: <strong className="text-amber-300">{preset.settings.shadows ? `${preset.settings.shadowMapSize}px` : 'Desativadas'}</strong></div>
                          <div>• Iluminação: <strong className="text-amber-300">{preset.settings.fullLighting ? '6 Luzes de Estúdio' : '3 Luzes Essenciais'}</strong></div>
                          <div>• Materiais: <strong className="text-amber-300">{preset.settings.usePhysicalMaterials ? 'MeshPhysicalMaterial (Transmission)' : 'MeshStandardMaterial'}</strong></div>
                        </div>
                      </div>

                      <button
                        onClick={() => onApplyPreset(key)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-cinzel font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-md'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={13} className="text-stone-950" />
                            <span>Preset Ativo no Momento</span>
                          </>
                        ) : (
                          <span>Aplicar Preset {key.toUpperCase()}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 4: DIAGNÓSTICO MODULAR ORIGINAL VITRUVIAN                */}
          {/* ============================================================ */}
          {activeTab === 'modular' && (
            <div className="space-y-3 font-mono text-xs">
              {/* Repositório e Licença */}
              <div className="p-3 rounded-xl bg-black/50 border border-amber-900/30 space-y-1.5">
                <div className="text-amber-400 font-bold flex items-center justify-between">
                  <span>📍 Repositório & Licença Oficial:</span>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-700/50 text-emerald-300 px-1.5 py-0.5 rounded">
                    Domínio Público (CC0)
                  </span>
                </div>
                <div className="text-stone-300 text-[11px] space-y-0.5">
                  <div>• <strong>Corpo:</strong> <span className="text-emerald-400">godot_project/vitruvian_body.glb</span></div>
                  <div>• <strong>Cabeça:</strong> <span className="text-emerald-400">godot_project/vitruvian_head.glb</span></div>
                  <div>• <strong>Cabelo:</strong> <span className="text-emerald-400">godot_project/vitruvian_hair.glb | hairtool_cards.glb</span></div>
                </div>
                <div className="text-stone-400 text-[10px] pt-1">
                  Repo: <a href="https://github.com/ibrews/VitruvianGodot" target="_blank" rel="noreferrer" className="text-indigo-400 underline">github.com/ibrews/VitruvianGodot</a>
                </div>
              </div>

              {vitruvianDiag && (
                <>
                  {/* Resumo Global & Métricas */}
                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-stone-400">Modo Ativo:</span>
                      <span className="text-amber-300 font-bold uppercase">
                        {vitruvianDiag.mode === 'body_and_head' ? 'Corpo + Cabeça + Cabelo' : vitruvianDiag.mode === 'body_only' ? 'Apenas Corpo' : 'Apenas Cabeça'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-stone-400 block text-[10px]">Altura Total Personagem:</span>
                        <span className="text-emerald-400 font-bold text-sm">{vitruvianDiag.totalHeight} metros</span>
                        <span className="text-[9px] text-stone-500 block">Escala Humano T20 (1.96m)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-stone-400 block text-[10px]">Polígonos Renderizados:</span>
                        <span className="text-amber-300 font-bold text-sm">{vitruvianDiag.totalTriangles.toLocaleString()} tris</span>
                        <span className="text-[9px] text-stone-500 block">{vitruvianDiag.totalMeshes} malhas ativas</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalhamento: Módulo Corpo */}
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200">1. Módulo Corpo (vitruvian_body.glb)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {vitruvianDiag.body.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-300 space-y-0.5 pl-2 border-l border-amber-500/20">
                      <div>• Polígonos: {vitruvianDiag.body.triangles.toLocaleString()} tris ({vitruvianDiag.body.meshCount} malhas)</div>
                      <div>• Texturas: vit_body_bc, vit_body_n, vit_body_rough</div>
                    </div>
                  </div>

                  {/* Detalhamento: Módulo Cabeça */}
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200">2. Módulo Cabeça (vitruvian_head.glb)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {vitruvianDiag.head.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-300 space-y-0.5 pl-2 border-l border-indigo-500/20">
                      <div>• Polígonos: {vitruvianDiag.head.triangles.toLocaleString()} tris ({vitruvianDiag.head.meshCount} malhas)</div>
                      <div>• Texturas: vit_face_bc, vit_face_n, vit_face_rough, vit_iris, vit_sclera, vit_mouth, vit_lash_atlas</div>
                    </div>
                  </div>

                  {/* Detalhamento: Módulo Cabelo */}
                  {vitruvianDiag.hair && (
                    <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-200">3. Camada Cabelo ({vitruvianDiag.hair.name})</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {vitruvianDiag.hair.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-300 space-y-0.5 pl-2 border-l border-amber-500/30">
                        <div>• Polígonos da Camada: {vitruvianDiag.hair.triangles.toLocaleString()} tris</div>
                        <div>• Arquivo: {vitruvianDiag.hair.sourceFile}</div>
                      </div>
                    </div>
                  )}

                  {/* Ações de Modo Rápido */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onLoadVitruvianMode('body_and_head')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center text-[10px] font-cinzel font-bold border transition-all cursor-pointer ${
                        vitruvianDiag.mode === 'body_and_head'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      Corpo + Cabeça
                    </button>
                    <button
                      onClick={() => onLoadVitruvianMode('body_only')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center text-[10px] font-cinzel font-bold border transition-all cursor-pointer ${
                        vitruvianDiag.mode === 'body_only'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      Apenas Corpo
                    </button>
                    <button
                      onClick={() => onLoadVitruvianMode('head_only')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center text-[10px] font-cinzel font-bold border transition-all cursor-pointer ${
                        vitruvianDiag.mode === 'head_only'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      Apenas Cabeça
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 5: DIAGNÓSTICO DE CUSTOMIZAÇÃO 3D                       */}
          {/* ============================================================ */}
          {activeTab === 'customization' && (
            <div className="space-y-4 font-mono text-xs">
              
              {/* Card Principal: CUSTOMIZAÇÃO 3D */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900/90 to-[#141224] border border-amber-900/60 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-300">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider">
                        Diagnóstico de Customização 3D
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        Auditoria de malhas, materiais e alvos de cor no Three.js
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-amber-500/30 text-amber-300 font-mono">
                    Three.js PBR Sync
                  </span>
                </div>

                {customizationAudit ? (
                  <div className="space-y-3">
                    {/* Seção Cabelo */}
                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                      <div className="font-cinzel font-bold text-amber-300 text-xs flex items-center justify-between">
                        <span>💇 Camada de Cabelo (Hair Layer)</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          customizationAudit.hairAsset.status === 'loaded'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : customizationAudit.hairAsset.status === 'none'
                              ? 'bg-stone-800 text-stone-300 border border-stone-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {customizationAudit.hairAsset.status === 'loaded' ? 'Carregado' : customizationAudit.hairAsset.status === 'none' ? 'Desativado / Careca' : 'Não Carregado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-300 pt-1 border-t border-white/5">
                        <div>• <strong>Hair Asset:</strong> <span className="text-amber-200">{customizationAudit.hairAsset.name}</span></div>
                        <div>• <strong>Hair Meshes:</strong> <span className="text-emerald-400 font-bold">{customizationAudit.hairMeshesCount} malha(s)</span></div>
                        <div>• <strong>Hair Materials:</strong> <span className="text-emerald-400 font-bold">{customizationAudit.hairMaterialsCount} material(is)</span></div>
                        <div className="flex items-center gap-1.5">
                          • <strong>Hair Color Target:</strong>
                          <span className={customizationAudit.hairColorTarget.found ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {customizationAudit.hairColorTarget.found ? 'Encontrado' : 'Não encontrado'}
                          </span>
                          {customizationAudit.hairColorTarget.currentColorHex && (
                            <span 
                              className="w-3 h-3 rounded-full border border-white/50 inline-block shadow-sm" 
                              style={{ backgroundColor: customizationAudit.hairColorTarget.currentColorHex }} 
                              title={customizationAudit.hairColorTarget.currentColorHex}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seção Olhos */}
                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
                      <div className="font-cinzel font-bold text-sky-300 text-xs flex items-center justify-between">
                        <span>👁️ Camada Ocular (Eyes / Iris Layer)</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          customizationAudit.eyeIrisMesh.found && customizationAudit.eyeIrisMaterial.found
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {customizationAudit.eyeIrisMesh.found && customizationAudit.eyeIrisMaterial.found ? 'Sincronizado' : 'Incompleto'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-300 pt-1 border-t border-white/5">
                        <div>
                          • <strong>Eye Iris Mesh:</strong>{' '}
                          <span className={customizationAudit.eyeIrisMesh.found ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {customizationAudit.eyeIrisMesh.found ? `Encontrado (${customizationAudit.eyeIrisMesh.names.join(', ') || 'Ok'})` : 'Não encontrado'}
                          </span>
                        </div>
                        <div>
                          • <strong>Eye Iris Material:</strong>{' '}
                          <span className={customizationAudit.eyeIrisMaterial.found ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {customizationAudit.eyeIrisMaterial.found ? `Encontrado (${customizationAudit.eyeIrisMaterial.names.join(', ') || 'VitHead_Iris_PBR'})` : 'Não encontrado'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          • <strong>Eye Color Target:</strong>{' '}
                          <span className={customizationAudit.eyeColorTarget.found ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {customizationAudit.eyeColorTarget.found ? `Encontrado (Cor: ${customizationAudit.eyeColorTarget.activeColor})` : 'Não encontrado'}
                          </span>
                          {customizationAudit.eyeIrisMaterial.currentColorHex && (
                            <span 
                              className="w-3 h-3 rounded-full border border-white/50 inline-block shadow-sm" 
                              style={{ backgroundColor: customizationAudit.eyeIrisMaterial.currentColorHex }}
                              title={customizationAudit.eyeIrisMaterial.currentColorHex}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seção Barba (Fase 1: Preparada) */}
                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1.5">
                      <div className="font-cinzel font-bold text-stone-300 text-xs flex items-center justify-between">
                        <span>🧔 Camada de Barba (Beard Layer)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-stone-800 text-amber-300 border border-stone-700">
                          Fase 1: Preparada
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        Asset 3D nativo não presente no repositório oficial VitruvianGodot. A interface e a arquitetura Three.js estão prontas para anexar a geometria assim que o modelo for fornecido.
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-4 text-stone-400">
                    Carregando auditoria de customização...
                  </div>
                )}
              </div>

              {/* Seção: TESTE AUTOMÁTICO DE CUSTOMIZAÇÃO */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div>
                    <div className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 uppercase flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-400" />
                      <span>Teste Automático de Materiais</span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Cicla automaticamente entre as cores dos olhos (castanho → azul → verde → âmbar → cinza) e cabelo e valida os materiais no Three.js.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onRunCustomizationTest) {
                        const results = onRunCustomizationTest();
                        setTestResults(results);
                      }
                    }}
                    className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs cursor-pointer shadow-md active:scale-95 shrink-0"
                  >
                    Executar Teste de Customização
                  </button>
                </div>

                {testResults && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-stone-200">Resultado Geral:</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        testResults.allPassed 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {testResults.allPassed ? '✓ TODOS OS MATERIAIS RESPONDERAM COM SUCESSO' : '✕ FALHA EM ALGUNS MATERIAIS'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      {/* Olhos */}
                      <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-1">
                        <span className="font-cinzel font-bold text-sky-300 block">Teste de Cores dos Olhos:</span>
                        {testResults.eyeTests.map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between text-stone-300">
                            <span>{t.color}:</span>
                            <span className="font-mono text-[9px]">{t.hexFound}</span>
                            <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {t.passed ? 'OK' : 'ERRO'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Cabelo */}
                      <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-1">
                        <span className="font-cinzel font-bold text-amber-300 block">Teste de Cores de Cabelo:</span>
                        {testResults.hairTests.map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between text-stone-300">
                            <span>{t.color}:</span>
                            <span className="font-mono text-[9px]">{t.hexFound}</span>
                            <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {t.passed ? 'OK' : 'ERRO'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* ============================================================ */}
        {/* FOOTER DO MODAL                                             */}
        {/* ============================================================ */}
        <div className="px-4 py-2.5 bg-[#12101e] border-t border-amber-900/40 flex items-center justify-between shrink-0">
          <div className="text-[10px] font-mono text-stone-400 hidden sm:block">
            Página de Teste 3D • Diagnósticos não alteram configurações de produção permanentemente
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="py-1.5 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-cinzel text-xs font-bold transition-all active:scale-95 cursor-pointer shadow"
            >
              Fechar Diagnóstico
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
