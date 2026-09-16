/**
 * Sistema de Diagnóstico e Auditoria em Memória para Firestore
 * Exclusivo para modo desenvolvimento - Zero persistência externa / Zero impacto funcional
 */

export type OperationType = 'READ' | 'WRITE' | 'DELETE' | 'LISTENER';
export type DiagnosticCategory = 'MAP' | 'MARKER' | 'FOG' | 'GRID' | 'TV' | 'LOBBY' | 'CHARACTER' | 'OTHER';

export interface DiagnosticEntry {
  id: number;
  type: OperationType;
  collection: string;
  document: string;
  caller: string;
  reason: string;
  timestamp: string;
  rawTime: number;
  category: DiagnosticCategory;
}

export interface DiagnosticStats {
  writes: number;
  reads: number;
  listeners: number;
  deletes: number;
  activeListeners: number;
  writesPerMinute: number;
  readsPerMinute: number;
  activityLevel: 'IDLE' | 'ACTIVITY' | 'HIGH';
  categories: Record<DiagnosticCategory, number>;
}

class FirestoreDiagnosticTracker {
  private writeCounter = 0;
  private readCounter = 0;
  private listenerCounter = 0;
  private deleteCounter = 0;
  private activeListenersCount = 0;

  private categoryCounts: Record<DiagnosticCategory, number> = {
    MAP: 0,
    MARKER: 0,
    FOG: 0,
    GRID: 0,
    TV: 0,
    LOBBY: 0,
    CHARACTER: 0,
    OTHER: 0,
  };

  private logs: DiagnosticEntry[] = [];
  private listeners: Array<(stats: DiagnosticStats, logs: DiagnosticEntry[]) => void> = [];
  private operationTimestamps: Array<{ type: OperationType; time: number }> = [];

  constructor() {
    // Limpeza de timestamps antigos a cada 5s para cálculo de taxa por minuto
    if (typeof window !== 'undefined') {
      setInterval(() => {
        const now = Date.now();
        this.operationTimestamps = this.operationTimestamps.filter(op => now - op.time < 60000);
        this.notify();
      }, 3000);
    }
  }

  public subscribe(callback: (stats: DiagnosticStats, logs: DiagnosticEntry[]) => void) {
    this.listeners.push(callback);
    callback(this.getStats(), [...this.logs]);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    const stats = this.getStats();
    const currentLogs = [...this.logs];
    this.listeners.forEach(cb => {
      try {
        cb(stats, currentLogs);
      } catch {}
    });
  }

  public getStats(): DiagnosticStats {
    const now = Date.now();
    const lastMinuteOps = this.operationTimestamps.filter(op => now - op.time < 60000);
    const writesPerMinute = lastMinuteOps.filter(op => op.type === 'WRITE').length;
    const readsPerMinute = lastMinuteOps.filter(op => op.type === 'READ').length;

    // Mede atividade nos últimos 2000ms
    const recentOps = this.operationTimestamps.filter(op => now - op.time < 2000).length;
    let activityLevel: 'IDLE' | 'ACTIVITY' | 'HIGH' = 'IDLE';
    if (recentOps >= 4) {
      activityLevel = 'HIGH';
    } else if (recentOps > 0) {
      activityLevel = 'ACTIVITY';
    }

    return {
      writes: this.writeCounter,
      reads: this.readCounter,
      listeners: this.listenerCounter,
      deletes: this.deleteCounter,
      activeListeners: this.activeListenersCount,
      writesPerMinute,
      readsPerMinute,
      activityLevel,
      categories: { ...this.categoryCounts },
    };
  }

  public getLogs(): DiagnosticEntry[] {
    return [...this.logs];
  }

  public clear() {
    this.writeCounter = 0;
    this.readCounter = 0;
    this.listenerCounter = 0;
    this.deleteCounter = 0;
    this.activeListenersCount = 0;
    this.logs = [];
    this.operationTimestamps = [];
    this.categoryCounts = {
      MAP: 0,
      MARKER: 0,
      FOG: 0,
      GRID: 0,
      TV: 0,
      LOBBY: 0,
      CHARACTER: 0,
      OTHER: 0,
    };
    console.clear();
    console.log('%c[Firestore DIAGNOSTIC] Contadores e histórico reiniciados com sucesso.', 'color: #10b981; font-weight: bold;');
    this.notify();
  }

  private categorize(collection: string, reason: string, caller: string): DiagnosticCategory {
    const text = `${collection} ${reason} ${caller}`.toLowerCase();
    if (text.includes('marker')) return 'MARKER';
    if (text.includes('fog') || text.includes('névoa')) return 'FOG';
    if (text.includes('grid') || text.includes('grade')) return 'GRID';
    if (text.includes('tv') || collection === 'test_tv_sync') return 'TV';
    if (text.includes('testmaps') || collection === 'testMaps') return 'MAP';
    if (text.includes('game') || text.includes('lobby') || text.includes('player') || text.includes('presence')) return 'LOBBY';
    if (text.includes('character') || text.includes('participant') || text.includes('sheet') || text.includes('dossiê')) return 'CHARACTER';
    return 'OTHER';
  }

  public recordWrite(info: {
    collection: string;
    document: string;
    reason?: string;
    caller?: string;
  }) {
    this.writeCounter++;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    const caller = info.caller || detectCaller();
    const reason = info.reason || 'manual or debounced update';
    const category = this.categorize(info.collection, reason, caller);

    this.categoryCounts[category]++;
    this.operationTimestamps.push({ type: 'WRITE', time: now });

    const entry: DiagnosticEntry = {
      id: this.writeCounter,
      type: 'WRITE',
      collection: info.collection,
      document: info.document,
      caller,
      reason,
      timestamp: timeFormatted,
      rawTime: now,
      category,
    };

    this.logs.unshift(entry);
    if (this.logs.length > 500) this.logs.pop();

    // Log exigido rigorosamente no console:
    console.log(
      `%c[Firestore WRITE #${this.writeCounter}]\n` +
      `collection: ${info.collection}\n` +
      `document: ${info.document}\n` +
      `reason: ${reason}\n` +
      `caller: ${caller}\n` +
      `timestamp: ${timeFormatted}`,
      'color: #ef4444; font-weight: bold;'
    );

    this.notify();
  }

  public recordRead(info: {
    collection: string;
    document: string;
    caller?: string;
    reason?: string;
  }) {
    this.readCounter++;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    const caller = info.caller || detectCaller();
    const reason = info.reason || 'fetch or query';
    const category = this.categorize(info.collection, reason, caller);

    this.operationTimestamps.push({ type: 'READ', time: now });

    const entry: DiagnosticEntry = {
      id: this.readCounter,
      type: 'READ',
      collection: info.collection,
      document: info.document,
      caller,
      reason,
      timestamp: timeFormatted,
      rawTime: now,
      category,
    };

    this.logs.unshift(entry);
    if (this.logs.length > 500) this.logs.pop();

    this.notify();
  }

  public recordDelete(info: {
    collection: string;
    document: string;
    caller?: string;
    reason?: string;
  }) {
    this.deleteCounter++;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    const caller = info.caller || detectCaller();
    const reason = info.reason || 'delete action';
    const category = this.categorize(info.collection, reason, caller);

    const entry: DiagnosticEntry = {
      id: this.deleteCounter,
      type: 'DELETE',
      collection: info.collection,
      document: info.document,
      caller,
      reason,
      timestamp: timeFormatted,
      rawTime: now,
      category,
    };

    this.logs.unshift(entry);
    if (this.logs.length > 500) this.logs.pop();

    console.log(
      `%c[Firestore DELETE #${this.deleteCounter}]\n` +
      `collection: ${info.collection}\n` +
      `document: ${info.document}\n` +
      `caller: ${caller}\n` +
      `timestamp: ${timeFormatted}`,
      'color: #f59e0b; font-weight: bold;'
    );

    this.notify();
  }

  public recordListenerOpen(info: {
    collection: string;
    caller?: string;
  }) {
    this.listenerCounter++;
    this.activeListenersCount++;
    const caller = info.caller || detectCaller();

    console.log(
      `%c[Firestore LISTENER OPEN]\n` +
      `collection: ${info.collection}\n` +
      `caller: ${caller}`,
      'color: #3b82f6; font-weight: bold;'
    );

    this.notify();
  }

  public recordListenerClose(info: {
    collection: string;
    caller?: string;
  }) {
    this.activeListenersCount = Math.max(0, this.activeListenersCount - 1);
    const caller = info.caller || detectCaller();

    console.log(
      `%c[Firestore LISTENER CLOSE]\n` +
      `collection: ${info.collection}\n` +
      `caller: ${caller}`,
      'color: #6b7280; font-weight: bold;'
    );

    this.notify();
  }
}

/**
 * Função utilitária para detectar quem chamou a operação analisando o stack trace
 */
function detectCaller(): string {
  try {
    const stack = new Error().stack?.split('\n') || [];
    for (let i = 2; i < stack.length; i++) {
      const line = stack[i];
      if (
        !line.includes('firestoreDiagnostic') &&
        !line.includes('firestore.ts') &&
        !line.includes('node_modules')
      ) {
        const match = line.trim().match(/at\s+([^\s]+)\s+\((.+)\)/) || line.trim().match(/at\s+(.+)/);
        if (match) {
          const fn = match[1] || 'anonymous';
          const fileLoc = match[2] ? match[2].split('/').pop()?.replace(/:\d+:\d+$/, '') : '';
          return fileLoc ? `${fn} (${fileLoc})` : fn;
        }
        return line.trim();
      }
    }
  } catch {}
  return 'component';
}

/**
 * Extrai nome da coleção e documento a partir de referências docRef ou collectionRef
 */
export function extractTargetInfo(target: any): { collection: string; document: string } {
  if (!target) return { collection: 'unknown', document: 'unknown' };

  if (target.path && typeof target.path === 'string') {
    const parts = target.path.split('/');
    if (parts.length % 2 === 0) {
      return {
        collection: parts.slice(0, -1).join('/'),
        document: parts[parts.length - 1],
      };
    }
    return {
      collection: target.path,
      document: '(collection)',
    };
  }

  if (target._query?.path?.segments) {
    return {
      collection: target._query.path.segments.join('/'),
      document: '(query)',
    };
  }

  if (target.id) {
    return {
      collection: target.parent?.id || 'collection',
      document: target.id,
    };
  }

  return { collection: 'unknown', document: 'unknown' };
}

export const firestoreTracker = new FirestoreDiagnosticTracker();
