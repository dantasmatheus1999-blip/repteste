import React, { useState, useEffect } from 'react';
import { firestoreTracker, DiagnosticStats, DiagnosticEntry } from '../../firebase/firestoreDiagnostic';
import { Activity, Trash2, Download, ChevronUp, ChevronDown, Database, ShieldAlert, AlertTriangle } from 'lucide-react';

export const FirestoreDevHud: React.FC = () => {
  const [stats, setStats] = useState<DiagnosticStats>(firestoreTracker.getStats());
  const [logs, setLogs] = useState<DiagnosticEntry[]>(firestoreTracker.getLogs());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    const unsub = firestoreTracker.subscribe((newStats, newLogs) => {
      setStats(newStats);
      setLogs(newLogs);
    });
    return unsub;
  }, []);

  // Permitir fechar ou minimizar
  const handleClear = () => {
    firestoreTracker.clear();
  };

  const handleExport = () => {
    const currentLogs = firestoreTracker.getLogs();
    let content = `=== REALMOR - AUDITORIA FORENSE FIRESTORE ===\n`;
    content += `Data/Hora da Exportação: ${new Date().toLocaleString('pt-BR')}\n`;
    content += `--------------------------------------------\n`;
    content += `DADOS DA INSTÂNCIA:\n`;
    content += `INSTANCE ID: ${stats.instanceId}\n`;
    content += `BUILD ID: ${stats.buildId} (${stats.appVersion})\n`;
    content += `MODE: ${stats.mode.toUpperCase()}\n`;
    content += `PATHNAME: ${stats.pathname}\n`;
    content += `SESSION STARTED AT: ${stats.startedAt}\n`;
    content += `--------------------------------------------\n`;
    content += `TOTAIS:\n`;
    content += `WRITES: ${stats.writes}\n`;
    content += `READS: ${stats.reads}\n`;
    content += `LISTENERS: ${stats.listeners} (Ativos: ${stats.activeListeners})\n`;
    content += `DELETES: ${stats.deletes}\n`;
    content += `Taxas atuais: ${stats.writesPerMinute} writes/min | ${stats.readsPerMinute} reads/min | ${stats.writesLastSecond} writes/sec\n\n`;
    content += `CATEGORIAS:\n`;
    content += `MAP: ${stats.categories.MAP}\n`;
    content += `MARKER: ${stats.categories.MARKER}\n`;
    content += `FOG: ${stats.categories.FOG}\n`;
    content += `GRID: ${stats.categories.GRID}\n`;
    content += `TV: ${stats.categories.TV}\n`;
    content += `LOBBY: ${stats.categories.LOBBY}\n`;
    content += `CHARACTER: ${stats.categories.CHARACTER}\n`;
    content += `OTHER: ${stats.categories.OTHER}\n\n`;
    content += `================ REGISTRO COMPLETO DE OPERAÇÕES ================\n\n`;

    currentLogs.forEach((l) => {
      content += `[Firestore ${l.type} #${l.id}]\n`;
      content += `instance: ${l.instanceId}\n`;
      content += `version: ${l.version}\n`;
      content += `mode: ${l.mode}\n`;
      content += `pathname: ${l.pathname}\n`;
      content += `collection: ${l.collection}\n`;
      content += `document: ${l.document}\n`;
      if (l.type === 'WRITE' && l.reason) {
        content += `reason: ${l.reason}\n`;
      }
      content += `caller: ${l.caller}\n`;
      content += `timestamp: ${l.timestamp}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firestore-audit-${stats.instanceId}-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Indicador de Atividade
  const renderIndicator = () => {
    if (stats.isWriteStorm || stats.activityLevel === 'STORM') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-900 border border-red-400 text-white font-mono text-[11px] font-bold animate-pulse shadow-[0_0_12px_#ef4444]">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_10px_#ffffff]" />
          🔴 POSSÍVEL WRITE STORM
        </div>
      );
    }

    switch (stats.activityLevel) {
      case 'HIGH':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-[11px] font-bold animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            🔴 FIRESTORE HIGH ACTIVITY
          </div>
        );
      case 'ACTIVITY':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            🟡 FIRESTORE ACTIVITY
          </div>
        );
      case 'IDLE':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            🟢 FIRESTORE IDLE
          </div>
        );
    }
  };

  return (
    <aside 
      aria-label="Painel de Diagnóstico Firestore DEV"
      className="hidden"
      style={{ display: 'none' }}
    >
      <div className="bg-neutral-950/95 border border-gold/40 rounded-lg backdrop-blur-md overflow-hidden text-neutral-200 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        {/* Header do HUD */}
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gold" />
            <span className="font-bold text-gold tracking-wide text-[12px]">FIRESTORE AUDIT HUD</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-400 hover:text-white p-0.5 rounded hover:bg-neutral-800 transition-colors"
              title={isExpanded ? 'Recolher HUD' : 'Expandir HUD'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Indicador de Status Visível Sempre */}
        <div className="px-3 py-1.5 bg-neutral-900/50 border-b border-neutral-800/80 flex items-center justify-between">
          {renderIndicator()}
          <div className="text-[10px] text-neutral-400">
            {stats.writesPerMinute} W/min · {stats.readsPerMinute} R/min
          </div>
        </div>

        {/* Alerta de Tempestade de Gravações */}
        {stats.isWriteStorm && (
          <div className="px-3 py-2 bg-red-950 border-b border-red-600/80 text-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-red-300">ALERTA WRITE STORM:</span> Taxa de {stats.writesLastSecond} writes/seg detectada nesta aba!
            </div>
          </div>
        )}

        {/* Conteúdo Expandido */}
        {isExpanded && (
          <div className="p-3 space-y-2.5">
            {/* Bloco 0: Identificação da Instância Atual */}
            <div className="bg-neutral-900/70 p-2 rounded border border-neutral-800/90 space-y-1 text-[11px]">
              <div className="text-[10px] uppercase font-bold text-cyan-400/90 tracking-wider flex items-center justify-between">
                <span>INSTÂNCIA ATUAL</span>
                <span className="px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 rounded text-[9px] font-bold">
                  {stats.mode.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-[10px] text-neutral-300">
                <div>
                  <span className="text-neutral-500">INSTANCE:</span>{' '}
                  <span className="font-mono text-cyan-300 font-semibold">{stats.instanceId}</span>
                </div>
                <div>
                  <span className="text-neutral-500">BUILD:</span>{' '}
                  <span className="font-mono text-neutral-300">{stats.buildId}</span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-neutral-500">PATH:</span>{' '}
                  <span className="font-mono text-neutral-300">{stats.pathname}</span>
                </div>
                <div className="col-span-2 text-[9px] text-neutral-500 truncate">
                  START: {new Date(stats.startedAt).toLocaleTimeString('pt-BR')} ({new Date(stats.startedAt).toLocaleDateString('pt-BR')})
                </div>
              </div>
            </div>

            {/* Bloco 1: Totais Gerais */}
            <div className="grid grid-cols-4 gap-1.5 bg-neutral-900/60 p-2 rounded border border-neutral-800 text-center">
              <div>
                <div className="text-[10px] text-neutral-400">WRITES</div>
                <div className={`text-sm font-bold ${stats.writes > 0 ? 'text-red-400' : 'text-neutral-300'}`}>
                  {stats.writes}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400">READS</div>
                <div className="text-sm font-bold text-blue-400">{stats.reads}</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400">LISTENERS</div>
                <div className="text-sm font-bold text-indigo-400">
                  {stats.activeListeners}
                  <span className="text-[9px] font-normal text-neutral-400 ml-0.5">({stats.listeners})</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400">DELETES</div>
                <div className="text-sm font-bold text-amber-400">{stats.deletes}</div>
              </div>
            </div>

            {/* Bloco 2: Subtotais por Categoria Exigidos */}
            <div className="bg-neutral-900/40 p-2 rounded border border-neutral-800/80">
              <div className="text-[10px] uppercase font-bold text-gold/80 mb-1.5 tracking-wider">
                Detalhamento de Writes
              </div>
              <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400">MAP:</span>
                  <span className={`font-bold ${stats.categories.MAP > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.MAP}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">MARKER:</span>
                  <span className={`font-bold ${stats.categories.MARKER > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.MARKER}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">FOG:</span>
                  <span className={`font-bold ${stats.categories.FOG > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.FOG}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">GRID:</span>
                  <span className={`font-bold ${stats.categories.GRID > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.GRID}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">TV:</span>
                  <span className={`font-bold ${stats.categories.TV > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.TV}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">LOBBY:</span>
                  <span className={`font-bold ${stats.categories.LOBBY > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.LOBBY}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">CHAR:</span>
                  <span className={`font-bold ${stats.categories.CHARACTER > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.CHARACTER}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">OTHER:</span>
                  <span className={`font-bold ${stats.categories.OTHER > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                    {stats.categories.OTHER}
                  </span>
                </div>
              </div>
            </div>

            {/* Última Operação Registrada */}
            {logs.length > 0 && (
              <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-800 text-[10px] space-y-0.5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="font-semibold text-neutral-300">Última Operação:</span>
                  <span className="text-[9px] text-neutral-500">{logs[0].timestamp}</span>
                </div>
                <div className="truncate text-gold/90 font-bold">
                  [{logs[0].type}] {logs[0].collection}/{logs[0].document}
                </div>
                <div className="truncate text-neutral-400 text-[9px]">
                  motivo: {logs[0].reason} | caller: {logs[0].caller}
                </div>
              </div>
            )}

            {/* Ações / Botões Solicitados */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded border border-neutral-700 text-[11px] font-semibold transition-colors"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                LIMPAR CONTADORES
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gold/20 hover:bg-gold/30 text-gold hover:text-gold-light rounded border border-gold/40 text-[11px] font-semibold transition-colors"
              >
                <Download className="w-3 h-3 text-gold" />
                EXPORTAR LOG
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
export default FirestoreDevHud;

