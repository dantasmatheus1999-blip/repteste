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
 * Lê automaticamente todos os arquivos .png dentro de mostro/ no Firebase Storage
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
    // 1. Obter o token atual do usuário se autenticado
    let userToken = '';
    try {
      if (auth.currentUser) {
        userToken = await auth.currentUser.getIdToken();
      }
    } catch (tokenErr) {
      console.warn('[MonsterStorageService] Aviso ao obter token do usuário:', tokenErr);
    }

    // 2. Tentar ler diretamente da pasta 'mostro' no Firebase Storage via cliente SDK
    const currentBucket = (storage as any)._bucket?.bucket || (storage.app.options as any)?.storageBucket || 'gen-lang-client-0150741197.firebasestorage.app';
    const searchedPath = 'mostro';

    try {
      const mostroRef = ref(storage, searchedPath);
      const result = await listAll(mostroRef);

      const allItems = [...result.items];

      // Se houver subpastas dentro de mostro/, lê seus arquivos também
      for (const prefix of result.prefixes) {
        try {
          const subResult = await listAll(prefix);
          allItems.push(...subResult.items);
        } catch (subErr: any) {
          console.warn('[MonsterStorageService] Aviso ao listar subpasta:', prefix.name, subErr?.message);
        }
      }

      // Filtrar estritamente arquivos .png
      const pngItems = allItems.filter(item => item.name.toLowerCase().endsWith('.png'));

      if (pngItems.length > 0) {
        const monsterPromises = pngItems.map(async (item) => {
          try {
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
          } catch (itemErr) {
            console.warn('[MonsterStorageService] Aviso ao obter URL para:', item.name, itemErr);
            return null;
          }
        });

        const resolved = await Promise.all(monsterPromises);
        const validMonsters = resolved.filter((m): m is StorageMonster => m !== null);

        if (validMonsters.length > 0) {
          validMonsters.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
          cachedLibrary = validMonsters;
          currentLibraryStatus = 'success';
          currentStatusMessage = `${validMonsters.length} monstros carregados.`;
          return validMonsters;
        }
      }
    } catch (directErr: any) {
      // Registrar status sem poluir o console com erros fatais
      const errorCode = directErr?.code || '';
      if (errorCode === 'storage/unauthorized') {
        currentLibraryStatus = 'permission_denied';
        currentStatusMessage = 'Acesso não autorizado às regras do Firebase Storage para a pasta mostro/.';
      } else {
        currentLibraryStatus = 'empty';
        currentStatusMessage = directErr?.message || 'Falha ao consultar pasta no Firebase Storage.';
      }
      console.info(`[MonsterStorageService] Consulta direta ao Storage: ${currentLibraryStatus} (${errorCode || 'desconhecido'}).`);
    }

    // 3. Contingência via endpoint do servidor (Node.js contorna restrições de CORS e aplica autenticação)
    try {
      const headers: Record<string, string> = {};
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const queryParam = userToken ? `?token=${encodeURIComponent(userToken)}` : '';
      const endpoint = typeof window !== 'undefined'
        ? `/api/storage/mostro-monsters${queryParam}`
        : `http://localhost:3000/api/storage/mostro-monsters${queryParam}`;

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.monsters) && data.monsters.length > 0) {
          const mappedMonsters: StorageMonster[] = data.monsters.map((m: any) => ({
            id: m.id || m.fullPath || m.fileName,
            name: m.name || formatMonsterNameFromFilename(m.fileName),
            fileName: m.fileName,
            url: m.url,
            fullPath: m.fullPath || `mostro/${m.fileName}`,
            category: m.category || inferCategoryFromName(m.name || m.fileName)
          }));

          mappedMonsters.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
          cachedLibrary = mappedMonsters;
          currentLibraryStatus = 'success';
          currentStatusMessage = `${mappedMonsters.length} monstros carregados via contingência.`;
          return mappedMonsters;
        } else if (data.status === 'permission_denied') {
          currentLibraryStatus = 'permission_denied';
          currentStatusMessage = data.message || currentStatusMessage;
        }
      }
    } catch (apiErr: any) {
      console.info('[MonsterStorageService] Informação da contingência /api/storage/mostro-monsters:', apiErr?.message);
    }

    if (cachedLibrary && cachedLibrary.length > 0) {
      currentLibraryStatus = 'success';
      return cachedLibrary;
    }

    if (currentLibraryStatus === 'loading') {
      currentLibraryStatus = 'empty';
    }

    return [];
  })();

  try {
    return await fetchPromise;
  } finally {
    fetchPromise = null;
  }
}
