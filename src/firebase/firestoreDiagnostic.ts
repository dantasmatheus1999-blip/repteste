/**
 * Sistema de Diagnóstico e Auditoria em Memória para Firestore
 * Exclusivo para modo desenvolvimento - Zero persistência externa / Zero impacto funcional
 */

export type OperationType = 'READ' | 'WRITE' | 'DELETE' | 'LISTENER';
export type DiagnosticCategory = 'MAP' | 'MARKER' | 'FOG' | 'GRID' | 'TV' | 'LOBBY' | 'CHARACTER' | 'OTHER';
export type DiagnosticMode = 'master' | 'player' | 'tv' | 'auth' | 'app';

export interface AppInstanceInfo {
  instanceId: string;
  appVersion: string;
  buildId: string;
  startedAt: string;
  mode: DiagnosticMode;
  pathname: string;
}

export interface DiagnosticEntry {
  id: number;
  type: OperationType;
  instanceId: string;
  version: string;
  mode: DiagnosticMode;
  pathname: string;
  collection: string;
  document: string;
  caller: string;
  reason: string;
  timestamp: string;
  rawTime: number;
  category: DiagnosticCategory;
}

export interface DiagnosticStats {
  instanceId: string;
  appVersion: string;
  buildId: string;
  startedAt: string;
  mode: DiagnosticMode;
  pathname: string;
  writes: number;
  reads: number;
  listeners: number;
  deletes: number;
  activeListeners: number;
  writesPerMinute: number;
  readsPerMinute: number;
  writesLastSecond: number;
  isWriteStorm: boolean;
  activityLevel: 'IDLE' | 'ACTIVITY' | 'HIGH' | 'STORM';
  categories: Record<DiagnosticCategory, number>;
}

const APP_VERSION = 'dev';
const BUILD_ID = '2026-09-16-01';

function generateInstanceId(): string {
  if (typeof window === 'undefined') return 'server-inst';
  try {
    const existing = sessionStorage.getItem('REALMOR_DIAGNOSTIC_INSTANCE_ID');
    if (existing && existing.length >= 8) {
      return existing;
    }
    // Gerar um identificador único de aba (8 caracteres hex aleatórios + sufixo aleatório)
    const randomHex = Math.random().toString(16).substring(2, 10);
    const timeSegment = (Date.now() % 10000).toString(16);
    const newId = `${randomHex}-${timeSegment}`;
    sessionStorage.setItem('REALMOR_DIAGNOSTIC_INSTANCE_ID', newId);
    return newId;
  } catch {
    return Math.random().toString(16).substring(2, 10);
  }
}

function getSessionStartTime(): string {
  if (typeof window === 'undefined') return new Date().toISOString();
  try {
    const existing = sessionStorage.getItem('REALMOR_DIAGNOSTIC_STARTED_AT');
    if (existing) return existing;
    const nowIso = new Date().toISOString();
    sessionStorage.setItem('REALMOR_DIAGNOSTIC_STARTED_AT', nowIso);
    return nowIso;
  } catch {
    return new Date().toISOString();
  }
}

export function detectAppMode(): { mode: DiagnosticMode; pathname: string } {
  if (typeof window === 'undefined') {
    return { mode: 'app', pathname: '/' };
  }
  const pathname = window.location.pathname || '/';
  if (pathname.startsWith('/tv')) {
    return { mode: 'tv', pathname };
  }
  if (pathname.startsWith('/player') || pathname.startsWith('/characters') || pathname.startsWith('/fichas')) {
    return { mode: 'player', pathname };
  }
  if (
    pathname.startsWith('/master') ||
    pathname.startsWith('/maps') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/tactical') ||
    pathname.startsWith('/campanhas')
  ) {
    return { mode: 'master', pathname };
  }
  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return { mode: 'auth', pathname };
  }
  return { mode: 'app', pathname };
}

class FirestoreDiagnosticTracker {
  private instanceId = generateInstanceId();
  private startedAt = getSessionStartTime();
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
  private writeTimestamps: number[] = [];

  constructor() {
    // Log inicial de boot da instância no console
    const { mode, pathname } = detectAppMode();
    console.log(
      `%c[Firestore DIAGNOSTIC] Instância Ativa Inicializada\n` +
      `INSTANCE_ID: ${this.instanceId}\n` +
      `BUILD_ID: ${BUILD_ID} (${APP_VERSION})\n` +
      `MODE: ${mode}\n` +
      `PATH: ${pathname}\n` +
      `STARTED_AT: ${this.startedAt}`,
      'color: #06b6d4; font-weight: bold;'
    );

    // Limpeza de timestamps antigos a cada 2s para cálculo de taxa por minuto/segundo
    if (typeof window !== 'undefined') {
      setInterval(() => {
        const now = Date.now();
        this.operationTimestamps = this.operationTimestamps.filter(op => now - op.time < 60000);
        this.writeTimestamps = this.writeTimestamps.filter(t => now - t < 5000);
        this.notify();
      }, 2000);
    }
  }

  public getInstanceInfo(): AppInstanceInfo {
    const { mode, pathname } = detectAppMode();
    return {
      instanceId: this.instanceId,
      appVersion: APP_VERSION,
      buildId: BUILD_ID,
      startedAt: this.startedAt,
      mode,
      pathname,
    };
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
    const { mode, pathname } = detectAppMode();

    const lastMinuteOps = this.operationTimestamps.filter(op => now - op.time < 60000);
    const writesPerMinute = lastMinuteOps.filter(op => op.type === 'WRITE').length;
    const readsPerMinute = lastMinuteOps.filter(op => op.type === 'READ').length;

    // Mede writes no último segundo (1000ms)
    const writesLastSecond = this.writeTimestamps.filter(t => now - t <= 1000).length;
    const isWriteStorm = writesLastSecond >= 10;

    // Mede atividade geral nos últimos 2000ms
    const recentOps = this.operationTimestamps.filter(op => now - op.time < 2000).length;
    let activityLevel: 'IDLE' | 'ACTIVITY' | 'HIGH' | 'STORM' = 'IDLE';
    if (isWriteStorm) {
      activityLevel = 'STORM';
    } else if (recentOps >= 4) {
      activityLevel = 'HIGH';
    } else if (recentOps > 0) {
      activityLevel = 'ACTIVITY';
    }

    return {
      instanceId: this.instanceId,
      appVersion: APP_VERSION,
      buildId: BUILD_ID,
      startedAt: this.startedAt,
      mode,
      pathname,
      writes: this.writeCounter,
      reads: this.readCounter,
      listeners: this.listenerCounter,
      deletes: this.deleteCounter,
      activeListeners: this.activeListenersCount,
      writesPerMinute,
      readsPerMinute,
      writesLastSecond,
      isWriteStorm,
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
    this.writeTimestamps = [];
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

    const { mode, pathname } = detectAppMode();
    const caller = info.caller || detectCaller();
    const reason = info.reason || 'manual or debounced update';
    const category = this.categorize(info.collection, reason, caller);

    this.categoryCounts[category]++;
    this.operationTimestamps.push({ type: 'WRITE', time: now });
    this.writeTimestamps.push(now);

    const entry: DiagnosticEntry = {
      id: this.writeCounter,
      type: 'WRITE',
      instanceId: this.instanceId,
      version: BUILD_ID,
      mode,
      pathname,
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

    // Log detalhado com identificação de instância e origem
    console.log(
      `%c[Firestore WRITE #${this.writeCounter}]\n` +
      `instance: ${this.instanceId}\n` +
      `version: ${BUILD_ID}\n` +
      `mode: ${mode}\n` +
      `pathname: ${pathname}\n` +
      `collection: ${info.collection}\n` +
      `document: ${info.document}\n` +
      `reason: ${reason}\n` +
      `caller: ${caller}\n` +
      `timestamp: ${timeFormatted}`,
      'color: #ef4444; font-weight: bold;'
    );

    // Alerta de Write Storm (>= 10 writes em 1 segundo)
    const recentWritesIn1s = this.writeTimestamps.filter(t => now - t <= 1000).length;
    if (recentWritesIn1s >= 10) {
      const writesLastMinute = this.operationTimestamps.filter(op => op.type === 'WRITE' && now - op.time < 60000).length;
      console.warn(
        `%c🔴 [Firestore WRITE STORM DETECTADO!]\n` +
        `instance: ${this.instanceId}\n` +
        `version: ${BUILD_ID}\n` +
        `mode: ${mode}\n` +
        `pathname: ${pathname}\n` +
        `writesLastSecond: ${recentWritesIn1s}\n` +
        `writesLastMinute: ${writesLastMinute}\n` +
        `timestamp: ${timeFormatted}`,
        'background: #991b1b; color: #ffffff; font-weight: bold; font-size: 13px; padding: 4px;'
      );
    }

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

    const { mode, pathname } = detectAppMode();
    const caller = info.caller || detectCaller();
    const reason = info.reason || 'fetch or query';
    const category = this.categorize(info.collection, reason, caller);

    this.operationTimestamps.push({ type: 'READ', time: now });

    const entry: DiagnosticEntry = {
      id: this.readCounter,
      type: 'READ',
      instanceId: this.instanceId,
      version: BUILD_ID,
      mode,
      pathname,
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

    const { mode, pathname } = detectAppMode();
    const caller = info.caller || detectCaller();
    const reason = info.reason || 'delete action';
    const category = this.categorize(info.collection, reason, caller);

    const entry: DiagnosticEntry = {
      id: this.deleteCounter,
      type: 'DELETE',
      instanceId: this.instanceId,
      version: BUILD_ID,
      mode,
      pathname,
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
      `instance: ${this.instanceId}\n` +
      `version: ${BUILD_ID}\n` +
      `mode: ${mode}\n` +
      `pathname: ${pathname}\n` +
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
    const { mode, pathname } = detectAppMode();
    const caller = info.caller || detectCaller();

    console.log(
      `%c[Firestore LISTENER OPEN]\n` +
      `instance: ${this.instanceId}\n` +
      `version: ${BUILD_ID}\n` +
      `mode: ${mode}\n` +
      `pathname: ${pathname}\n` +
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
    const { mode, pathname } = detectAppMode();
    const caller = info.caller || detectCaller();

    console.log(
      `%c[Firestore LISTENER CLOSE]\n` +
      `instance: ${this.instanceId}\n` +
      `version: ${BUILD_ID}\n` +
      `mode: ${mode}\n` +
      `pathname: ${pathname}\n` +
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

