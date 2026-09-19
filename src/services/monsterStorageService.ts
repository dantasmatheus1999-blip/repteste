import { storage, ref, listAll, getDownloadURL } from '../firebase/storage';
import { auth } from '../firebase/auth';

export interface StorageMonster {
  id: string;
  name: string;
  fileName: string;
  url: string;
  fullPath: string;
  category?: string;
}

/**
 * Converte o nome do arquivo para o nome canônico do monstro:
 * - Remove a extensão .png (case-insensitive)
 * - Converte underscores (_) e hífens (-) em espaços
 * - Capitaliza as palavras mantendo a legibilidade
 */
export function formatMonsterNameFromFilename(filename: string): string {
  if (!filename) return 'Monstro';
  
  // Remove extensão .png
  const withoutExt = filename.replace(/\.png$/i, '');
  
  // Converte _ e - para espaços
  const withSpaces = withoutExt.replace(/[_-]+/g, ' ').trim();
  
  if (!withSpaces) return 'Monstro';

  // Capitaliza a primeira letra de cada palavra
  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map(word => {
      // Se a palavra já tiver maiúsculas no meio, preserva, senão capitaliza a primeira letra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Inferir categoria básica a partir do nome para compatibilidade com filtros
export function inferCategoryFromName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('drag') || n.includes('wyvern') || n.includes('serpe')) return 'dragão';
  if (n.includes('morto') || n.includes('esqueleto') || n.includes('zumbi') || n.includes('lich') || n.includes('vampir') || n.includes('fantasma') || n.includes('espectro')) return 'morto-vivo';
  if (n.includes('dem') || n.includes('diabo') || n.includes('abissal') || n.includes('íncubo') || n.includes('súcubo')) return 'demônio';
  if (n.includes('aber') || n.includes('tentacul') || n.includes('olho') || n.includes('devorador') || n.includes('flagelo')) return 'aberração';
  if (n.includes('lobo') || n.includes('urso') || n.includes('aranha') || n.includes('serpente') || n.includes('fera') || n.includes('javali') || n.includes('águia')) return 'animal';
  if (n.includes('golem') || n.includes('construto') || n.includes('autômato') || n.includes('armadura')) return 'construto';
  if (n.includes('elemental') || n.includes('fogo') || n.includes('gelo') || n.includes('terra') || n.includes('trov') || n.includes('raio') || n.includes('água')) return 'elemental';
  if (n.includes('orc') || n.includes('goblin') || n.includes('humano') || n.includes('elfo') || n.includes('anão') || n.includes('ladino') || n.includes('cultista') || n.includes('guerreiro') || n.includes('cavaleiro')) return 'humanoide';
  return 'monstro';
}

// Cache em memória para evitar requisições repetidas ao Firebase Storage
let cachedLibrary: StorageMonster[] | null = null;
let fetchPromise: Promise<StorageMonster[]> | null = null;

export type StorageLibraryStatus = 'idle' | 'loading' | 'success' | 'permission_denied' | 'empty';

let currentLibraryStatus: StorageLibraryStatus = 'idle';
let currentStatusMessage: string = '';

export function getStorageLibraryStatus(): { status: StorageLibraryStatus; message: string } {
  return { status: currentLibraryStatus, message: currentStatusMessage };
}

/**
 * Lê automaticamente todos os arquivos .png dentro de monstro/ no Firebase Storage
 */
export async function fetchStorageMonsterLibrary(forceRefresh = false): Promise<StorageMonster[]> {
  if (!forceRefresh && cachedLibrary && cachedLibrary.length > 0) {
    currentLibraryStatus = 'success';
    return cachedLibrary;
  }

  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }

  currentLibraryStatus = 'loading';

  fetchPromise = (async () => {
    // 1. Garantir que o estado de autenticação do Firebase esteja pronto
    if (typeof auth.authStateReady === 'function') {
      try {
        await auth.authStateReady();
      } catch (authReadyErr) {
        console.warn('[MonsterStorageService] Aviso ao aguardar authStateReady:', authReadyErr);
      }
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      const unauthErr = new Error('Usuário não autenticado no Firebase. Faça login para acessar a biblioteca de monstros.');
      (unauthErr as any).code = 'storage/unauthorized';
      currentLibraryStatus = 'permission_denied';
      currentStatusMessage = unauthErr.message;
      console.error('[MonsterStorageService]', unauthErr.message);
      throw unauthErr;
    }

    console.log(`[MonsterStorageService] Consultando pasta "monstro/" diretamente via Firebase Storage SDK (Usuário: ${currentUser.email})`);

    try {
      // 2. Consulta direta via Firebase Storage SDK no navegador
      const monstroRef = ref(storage, 'monstro');

      // Função recursiva para listar todos os arquivos .png dentro de monstro/ e quaisquer subpastas
      async function collectPngItems(folderRef: any): Promise<any[]> {
        const result = await listAll(folderRef);
        const pngs = result.items.filter((item: any) => 
          typeof item.name === 'string' && item.name.toLowerCase().endsWith('.png')
        );

        if (result.prefixes && result.prefixes.length > 0) {
          for (const subPrefix of result.prefixes) {
            try {
              const subPngs = await collectPngItems(subPrefix);
              pngs.push(...subPngs);
            } catch (subErr) {
              console.warn('[MonsterStorageService] Aviso ao listar subpasta:', subPrefix.name, subErr);
            }
          }
        }

        return pngs;
      }

      const pngItems = await collectPngItems(monstroRef);

      if (pngItems.length === 0) {
        cachedLibrary = [];
        currentLibraryStatus = 'empty';
        currentStatusMessage = 'Nenhum arquivo .png encontrado na pasta monstro/.';
        return [];
      }

      // 3. Obter URLs de download para cada arquivo PNG
      const monsterPromises = pngItems.map(async (item) => {
        const url = await getDownloadURL(item);
        const name = formatMonsterNameFromFilename(item.name);
        const category = inferCategoryFromName(name);
        return {
          id: item.fullPath || item.name,
          name,
          fileName: item.name,
          url,
          fullPath: item.fullPath,
          category
        } as StorageMonster;
      });

      const resolvedMonsters = await Promise.all(monsterPromises);
      resolvedMonsters.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      cachedLibrary = resolvedMonsters;
      currentLibraryStatus = 'success';
      currentStatusMessage = `${resolvedMonsters.length} monstros carregados do Firebase Storage.`;
      return resolvedMonsters;
    } catch (sdkErr: any) {
      console.error('[MonsterStorageService] Erro real retornado pelo Firebase Storage SDK:', sdkErr);
      const isUnauthorized = 
        sdkErr?.code === 'storage/unauthorized' || 
        String(sdkErr?.message).toLowerCase().includes('permission') || 
        String(sdkErr?.message).toLowerCase().includes('unauthorized');

      currentLibraryStatus = isUnauthorized ? 'permission_denied' : 'empty';
      currentStatusMessage = sdkErr?.message || 'Erro ao carregar acervo do Firebase Storage.';

      // Lança o erro real para ser exibido na interface do usuário
      throw sdkErr;
    }
  })();

  try {
    return await fetchPromise;
  } finally {
    fetchPromise = null;
  }
}
