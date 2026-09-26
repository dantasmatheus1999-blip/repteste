import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import app, { firebaseConfig } from './config';

// Inicializa o storage utilizando o bucket padrão configurado no app
const storage = getStorage(app);

// Cache global de URLs resolvidas para evitar chamadas de rede redundantes
const globalStorageUrlCache = new Map<string, string>();

const CANDIDATE_MAP: Record<string, string[]> = {
  '3d/anaogrande-v1.glb': [
    '3d/anaogrande-v1.glb',
    '3d/Anaogrande-v1.glb'
  ],
  '3d/Anaogrande-v1.glb': [
    '3d/anaogrande-v1.glb',
    '3d/Anaogrande-v1.glb'
  ],
  '3d/Arcanista-v1.glb': [
    '3d/Arcanista-v1.glb',
    '3d/arcanista-v1.glb'
  ],
  '3d/arcanista-v1.glb': [
    '3d/Arcanista-v1.glb',
    '3d/arcanista-v1.glb'
  ],
  '3d/Clerigo-v1.glb': [
    '3d/Clerigo-v1.glb',
    '3d/clerigo-v1.glb'
  ],
  '3d/clerigo-v1.glb': [
    '3d/Clerigo-v1.glb',
    '3d/clerigo-v1.glb'
  ],
  '3d/skeleto-v1.glb': [
    '3d/skeleto-v1.glb',
    '3d/Skeleto-v1.glb'
  ],
  '3d/Skeleto-v1.glb': [
    '3d/skeleto-v1.glb',
    '3d/Skeleto-v1.glb'
  ],
  // Sons do Firebase Storage - Mapeamento exato dos nomes físicos
  'sons/Confronto 2.mp3': ['sons/Confronto 2.mp3'],
  'sons/Dungeon 1.mp3': ['sons/Dungeon 1.mp3'],
  'sons/Eniguima.mp3': ['sons/Eniguima.mp3', 'sons/Enigma.mp3'],
  'sons/Musica feliz.mp3': ['sons/Musica feliz.mp3', 'sons/Música feliz.mp3'],
  'sons/Som ambiente tranquilo.mp3': ['sons/Som ambiente tranquilo.mp3'],
  'sons/Taverna.mp3': ['sons/Taverna.mp3'],
  'sons/boss 2.mp3': ['sons/boss 2.mp3', 'sons/Boss 2.mp3'],
  'sons/carverna.mp3': ['sons/carverna.mp3', 'sons/caverna.mp3'],
  'sons/caverna-eco.mp3': ['sons/caverna-eco.mp3', 'sons/caverna eco.mp3', 'sons/Caverna eco.mp3'],
  'sons/confronto 3.mp3': ['sons/confronto 3.mp3', 'sons/Confronto 3.mp3'],
  'sons/confronto de boss.mp3': ['sons/confronto de boss.mp3', 'sons/Confronto de Boss.mp3'],
  'sons/confronto.mp3': ['sons/confronto.mp3', 'sons/Confronto.mp3'],
  'sons/floresta a noite.wav': ['sons/floresta a noite.wav', 'sons/Floresta à noite.wav', 'sons/floresta a noite.mp3'],
  'sons/floresta-calma.mp3': ['sons/floresta-calma.mp3', 'sons/Floresta calma.mp3', 'sons/floresta calma.mp3'],
  'sons/fogo.mp3': ['sons/fogo.mp3', 'sons/Fogo.mp3'],
  'sons/som ambiante aventura.mp3': ['sons/som ambiante aventura.mp3', 'sons/Som ambiente aventura.mp3', 'sons/som ambiente aventura.mp3'],
  'sons/vento.mp3': ['sons/vento.mp3', 'sons/Vento.mp3'],
  '3d/avatar-png/guerreiro.png': [
    '3d/avatar-png/guerreiro.png',
    '3d/avatar-png/Guerreiro.png',
    '3d/avatar-png/anaogrande.png',
    '3d/guerreiro.png'
  ],
  '3d/avatar-png/arcanista.png': [
    '3d/avatar-png/arcanista.png',
    '3d/avatar-png/Arcanista.png',
    '3d/avatar-png/mago.png',
    '3d/arcanista.png'
  ],
  '3d/avatar-png/clerigo.png': [
    '3d/avatar-png/clerigo.png',
    '3d/avatar-png/Clerigo.png',
    '3d/avatar-png/Clérigo.png',
    '3d/clerigo.png'
  ],
  '3d/avatar-png/inventor.png': [
    '3d/avatar-png/inventor.png',
    '3d/avatar-png/Inventor.png',
    '3d/avatar-png/skeleto.png',
    '3d/inventor.png'
  ],
  'img-capas/fundo': [
    'img-capas/fundo',
    'img-capas/fundo.png',
    'img-capas/fundo.jpg',
    'img-capas/fundo.jpeg',
    'img-capas/fundo.webp',
    'img-capas/fundo.PNG',
    'img-capas/fundo.JPG',
    'img-capas/Fundo',
    'img-capas/Fundo.png',
    'img-capas/Fundo.jpg',
    'img-capas/Fundo.jpeg',
    'img-capas/Fundo.webp',
    'img-capas/Fundo.PNG',
    'img-capas/Fundo.JPG'
  ],
  'img-capas/Fundo': [
    'img-capas/fundo',
    'img-capas/fundo.png',
    'img-capas/fundo.jpg',
    'img-capas/fundo.jpeg',
    'img-capas/fundo.webp',
    'img-capas/fundo.PNG',
    'img-capas/fundo.JPG',
    'img-capas/Fundo',
    'img-capas/Fundo.png',
    'img-capas/Fundo.jpg',
    'img-capas/Fundo.jpeg',
    'img-capas/Fundo.webp',
    'img-capas/Fundo.PNG',
    'img-capas/Fundo.JPG'
  ],
  'img-capas/classe-capas/01_arcanista.png': [
    'img-capas/classe-capas/01_arcanista.png',
    'img-capas/classe-capas/arcanista.png',
    'classe-capas/01_arcanista.png',
    'class-capas/01_arcanista.png',
    'img-capas/01_arcanista.png',
    '01_arcanista.png'
  ],
  'img-capas/classe-capas/02_barbaro.png': [
    'img-capas/classe-capas/02_barbaro.png',
    'img-capas/classe-capas/barbaro.png',
    'classe-capas/02_barbaro.png',
    'class-capas/02_barbaro.png',
    'img-capas/02_barbaro.png',
    '02_barbaro.png'
  ],
  'img-capas/classe-capas/03_bardo.png': [
    'img-capas/classe-capas/03_bardo.png',
    'img-capas/classe-capas/bardo.png',
    'classe-capas/03_bardo.png',
    'class-capas/03_bardo.png',
    'img-capas/03_bardo.png',
    '03_bardo.png'
  ],
  'img-capas/classe-capas/04_bucaneiro.png': [
    'img-capas/classe-capas/04_bucaneiro.png',
    'img-capas/classe-capas/bucaneiro.png',
    'classe-capas/04_bucaneiro.png',
    'class-capas/04_bucaneiro.png',
    'img-capas/04_bucaneiro.png',
    '04_bucaneiro.png'
  ],
  'img-capas/classe-capas/05_cacador.png': [
    'img-capas/classe-capas/05_cacador.png',
    'img-capas/classe-capas/cacador.png',
    'classe-capas/05_cacador.png',
    'class-capas/05_cacador.png',
    'img-capas/05_cacador.png',
    '05_cacador.png'
  ],
  'img-capas/classe-capas/06_cavaleiro.png': [
    'img-capas/classe-capas/06_cavaleiro.png',
    'img-capas/classe-capas/cavaleiro.png',
    'classe-capas/06_cavaleiro.png',
    'class-capas/06_cavaleiro.png',
    'img-capas/06_cavaleiro.png',
    '06_cavaleiro.png'
  ],
  'img-capas/classe-capas/07_clerigo.png': [
    'img-capas/classe-capas/07_clerigo.png',
    'img-capas/classe-capas/clerigo.png',
    'classe-capas/07_clerigo.png',
    'class-capas/07_clerigo.png',
    'img-capas/07_clerigo.png',
    '07_clerigo.png'
  ],
  'img-capas/classe-capas/08_druida.png': [
    'img-capas/classe-capas/08_druida.png',
    'img-capas/classe-capas/druida.png',
    'classe-capas/08_druida.png',
    'class-capas/08_druida.png',
    'img-capas/08_druida.png',
    '08_druida.png'
  ],
  'img-capas/classe-capas/09_guerreiro.png': [
    'img-capas/classe-capas/09_guerreiro.png',
    'img-capas/classe-capas/guerreiro.png',
    'classe-capas/09_guerreiro.png',
    'class-capas/09_guerreiro.png',
    'img-capas/09_guerreiro.png',
    '09_guerreiro.png'
  ],
  'img-capas/classe-capas/10_inventor.png': [
    'img-capas/classe-capas/10_inventor.png',
    'img-capas/classe-capas/inventor.png',
    'classe-capas/10_inventor.png',
    'class-capas/10_inventor.png',
    'img-capas/10_inventor.png',
    '10_inventor.png'
  ],
  'img-capas/classe-capas/11_ladino.png': [
    'img-capas/classe-capas/11_ladino.png',
    'img-capas/classe-capas/ladino.png',
    'classe-capas/11_ladino.png',
    'class-capas/11_ladino.png',
    'img-capas/11_ladino.png',
    '11_ladino.png'
  ],
  'img-capas/classe-capas/12_lutador.png': [
    'img-capas/classe-capas/12_lutador.png',
    'img-capas/classe-capas/lutador.png',
    'classe-capas/12_lutador.png',
    'class-capas/12_lutador.png',
    'img-capas/12_lutador.png',
    '12_lutador.png'
  ],
  'img-capas/classe-capas/13_nobre.png': [
    'img-capas/classe-capas/13_nobre.png',
    'img-capas/classe-capas/nobre.png',
    'classe-capas/13_nobre.png',
    'class-capas/13_nobre.png',
    'img-capas/13_nobre.png',
    '13_nobre.png'
  ],
  'img-capas/classe-capas/14_paladino.png': [
    'img-capas/classe-capas/14_paladino.png',
    'img-capas/classe-capas/paladino.png',
    'classe-capas/14_paladino.png',
    'class-capas/14_paladino.png',
    'img-capas/14_paladino.png',
    '14_paladino.png'
  ],
  'img-capas/racas/01_humano.png': [
    'img-capas/racas/01_humano.png',
    'img-capas/racas/humano.png',
    'racas/01_humano.png',
    'racas/humano.png',
    '01_humano.png'
  ],
  'img-capas/racas/02_anao.png': [
    'img-capas/racas/02_anao.png',
    'img-capas/racas/anao.png',
    'racas/02_anao.png',
    'racas/anao.png',
    '02_anao.png'
  ],
  'img-capas/racas/03_dahllan.png': [
    'img-capas/racas/03_dahllan.png',
    'img-capas/racas/dahllan.png',
    'racas/03_dahllan.png',
    'racas/dahllan.png',
    '03_dahllan.png'
  ],
  'img-capas/racas/04_elfo.png': [
    'img-capas/racas/04_elfo.png',
    'img-capas/racas/elfo.png',
    'racas/04_elfo.png',
    'racas/elfo.png',
    '04_elfo.png'
  ],
  'img-capas/racas/05_goblin.png': [
    'img-capas/racas/05_goblin.png',
    'img-capas/racas/goblin.png',
    'racas/05_goblin.png',
    'racas/goblin.png',
    '05_goblin.png'
  ],
  'img-capas/racas/06_lefou.png': [
    'img-capas/racas/06_lefou.png',
    'img-capas/racas/lefou.png',
    'racas/06_lefou.png',
    'racas/lefou.png',
    '06_lefou.png'
  ],
  'img-capas/racas/07_minotauro.png': [
    'img-capas/racas/07_minotauro.png',
    'img-capas/racas/minotauro.png',
    'racas/07_minotauro.png',
    'racas/minotauro.png',
    '07_minotauro.png'
  ],
  'img-capas/racas/08_qareen.png': [
    'img-capas/racas/08_qareen.png',
    'img-capas/racas/qareen.png',
    'racas/08_qareen.png',
    'racas/qareen.png',
    '08_qareen.png'
  ],
  'img-capas/racas/09_golem.png': [
    'img-capas/racas/09_golem.png',
    'img-capas/racas/golem.png',
    'racas/09_golem.png',
    'racas/golem.png',
    '09_golem.png'
  ],
  'img-capas/racas/10_hynne.png': [
    'img-capas/racas/10_hynne.png',
    'img-capas/racas/hynne.png',
    'racas/10_hynne.png',
    'racas/hynne.png',
    '10_hynne.png'
  ],
  'img-capas/racas/11_kliren.png': [
    'img-capas/racas/11_kliren.png',
    'img-capas/racas/kliren.png',
    'racas/11_kliren.png',
    'racas/kliren.png',
    '11_kliren.png'
  ],
  'img-capas/racas/12_medusa.png': [
    'img-capas/racas/12_medusa.png',
    'img-capas/racas/medusa.png',
    'racas/12_medusa.png',
    'racas/medusa.png',
    '12_medusa.png'
  ],
  'img-capas/racas/13_osteon.png': [
    'img-capas/racas/13_osteon.png',
    'img-capas/racas/osteon.png',
    'racas/13_osteon.png',
    'racas/osteon.png',
    '13_osteon.png'
  ],
  'img-capas/racas/14_sereia_tritao.png': [
    'img-capas/racas/14_sereia_tritao.png',
    'img-capas/racas/sereia_tritao.png',
    'img-capas/racas/14_sereia.png',
    'img-capas/racas/sereia.png',
    'racas/14_sereia_tritao.png',
    'racas/sereia_tritao.png',
    '14_sereia_tritao.png'
  ],
  'img-capas/racas/15_silfide.png': [
    'img-capas/racas/15_silfide.png',
    'img-capas/racas/silfide.png',
    'racas/15_silfide.png',
    'racas/silfide.png',
    '15_silfide.png'
  ],
  'img-capas/racas/16_suraggel.png': [
    'img-capas/racas/16_suraggel.png',
    'img-capas/racas/suraggel.png',
    'racas/16_suraggel.png',
    'racas/suraggel.png',
    '16_suraggel.png'
  ],
  'img-capas/racas/17_trog.png': [
    'img-capas/racas/17_trog.png',
    'img-capas/racas/trog.png',
    'racas/17_trog.png',
    'racas/trog.png',
    '17_trog.png'
  ]
};

/**
 * Resolve a URL de download autenticada do Firebase Storage tentando caminhos alternativos
 * conhecidos (maiúsculas/minúsculas/aliases) para máxima resiliência.
 */
export async function resolveStorageUrlWithFallback(
  targetPath: string,
  extraCandidates: string[] = []
): Promise<string> {
  if (!targetPath) return '';
  if (globalStorageUrlCache.has(targetPath)) {
    return globalStorageUrlCache.get(targetPath)!;
  }

  // Se já for uma URL HTTP direta ou blob
  if (targetPath.startsWith('http://') || targetPath.startsWith('https://') || targetPath.startsWith('blob:') || targetPath.startsWith('data:')) {
    return targetPath;
  }

  const cleanPath = targetPath.trim().replace(/^\/+/, '');
  const candidateList = Array.from(
    new Set([
      cleanPath,
      ...(CANDIDATE_MAP[cleanPath] || []),
      ...extraCandidates,
      cleanPath.toLowerCase()
    ])
  );

  let lastError: any = null;

  const bucketList = [
    undefined,
    'gs://gen-lang-client-0150741197',
    'gen-lang-client-0150741197.appspot.com',
    'gen-lang-client-0150741197.firebasestorage.app'
  ];

  for (const candidate of candidateList) {
    if (globalStorageUrlCache.has(candidate)) {
      const cached = globalStorageUrlCache.get(candidate)!;
      globalStorageUrlCache.set(targetPath, cached);
      return cached;
    }

    for (const bucket of bucketList) {
      try {
        const storageInstance = bucket ? getStorage(app, bucket) : storage;
        const fileRef = ref(storageInstance, candidate);
        const url = await getDownloadURL(fileRef);
        if (url) {
          globalStorageUrlCache.set(targetPath, url);
          globalStorageUrlCache.set(candidate, url);
          return url;
        }
      } catch (err: any) {
        lastError = err;
        // Continua para o próximo candidato silenciosamente
      }
    }
  }

  throw lastError || new Error(`Objeto '${targetPath}' não encontrado no Firebase Storage.`);
}

export { 
  storage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll, 
  firebaseConfig 
};
