import { ref, getDownloadURL, uploadBytesResumable, uploadBytes, deleteObject } from 'firebase/storage';
import { collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { storage } from '../firebase/storage';
import { db } from '../firebase/firestore';
import { auth } from '../firebase/auth';
import { UserFileMetadata, UploadOptions, FileCategory } from '../types/files';
import firebaseConfig from '../../firebase-applet-config.json';

export const StorageService = {
  /**
   * Uploads any file or blob permanently to Firebase Storage and registers its metadata in Firestore.
   */
  async uploadFile(file: File | Blob, options: UploadOptions): Promise<UserFileMetadata> {
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid || options.userId || 'anonymous';
    
    const originalName = (file as File).name || options.name || `file_${Date.now()}`;
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = options.folder || `${options.category}s`;
    const storagePath = `${folder}/${userId}/${Date.now()}_${cleanName}`;
    const mimeType = file.type || 'application/octet-stream';
    const size = file.size;

    let downloadUrl = '';

    // 1. Tentar upload direto no Firebase Storage
    try {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, { contentType: mimeType });
      downloadUrl = await getDownloadURL(snapshot.ref);
    } catch (directError: any) {
      console.warn('[StorageService] Falha no upload direto via cliente, utilizando contingência permanente do servidor...', directError);
      
      // 2. Contingência via servidor: envia para /api/upload-file (que persiste permanentemente no disco e tenta Firebase Storage)
      try {
        const formData = new FormData();
        formData.append('file', file, cleanName);
        formData.append('category', options.category);
        formData.append('storagePath', storagePath);

        const headers: Record<string, string> = {};
        if (currentUser) {
          try {
            const token = await currentUser.getIdToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
          } catch (tErr) {
            console.warn('[StorageService] Não foi possível obter token do usuário para o upload:', tErr);
          }
        }

        const uploadEndpoint = typeof window !== 'undefined' 
          ? '/api/upload-file' 
          : 'http://localhost:3000/api/upload-file';

        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers,
          body: formData
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(`Servidor falhou no upload permanente: ${errBody.error || response.statusText}`);
        }

        const data = await response.json();
        if (!data.url) {
          throw new Error('Servidor não retornou URL do arquivo');
        }
        downloadUrl = data.url;
      } catch (fallbackError: any) {
        console.error('[StorageService] Erro em ambos os caminhos de upload:', fallbackError);
        throw fallbackError;
      }
    }

    // 3. Persistir metadados permanentemente no Firestore na coleção 'user_files'
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const metadata: UserFileMetadata = {
      id: fileId,
      userId,
      name: options.name || originalName.replace(/\.[^/.]+$/, ''),
      originalName,
      storagePath,
      url: downloadUrl,
      mimeType,
      size,
      category: options.category,
      relatedEntityId: options.relatedEntityId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, 'user_files', fileId);
      const firestoreData: Record<string, any> = {
        id: fileId,
        userId,
        name: metadata.name,
        originalName: metadata.originalName,
        storagePath: metadata.storagePath,
        url: metadata.url,
        mimeType: metadata.mimeType,
        size: metadata.size,
        category: metadata.category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      if (metadata.relatedEntityId) {
        firestoreData.relatedEntityId = metadata.relatedEntityId;
      }
      await setDoc(docRef, firestoreData);
    } catch (firestoreError) {
      console.warn('[StorageService] Erro ao gravar metadados no Firestore (mas o arquivo está salvo no Storage):', firestoreError);
    }

    return metadata;
  },

  /**
   * Baixa uma imagem/arquivo de uma URL ou data URL e faz o upload definitivo no Firebase Storage com metadados no Firestore.
   */
  async uploadFromUrl(url: string, options: UploadOptions): Promise<UserFileMetadata> {
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid || options.userId || 'anonymous';
    let blob: Blob | null = null;

    try {
      if (url.startsWith('data:')) {
        // Converte data URL para Blob
        const response = await fetch(url);
        blob = await response.blob();
      } else {
        // Baixa via fetch direto no navegador
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Falha ao baixar imagem remota: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
      }

      if (blob && blob.size > 0) {
        const ext = blob.type.split('/')[1] || 'png';
        const cleanFileName = `${options.name || options.category}_${Date.now()}.${ext}`;
        const file = new File([blob], cleanFileName, { type: blob.type });
        return await this.uploadFile(file, options);
      }
    } catch (clientErr: any) {
      console.warn('[StorageService] Falha no fetch direto no navegador (possível CORS). Acionando rota /api/upload-from-url...', clientErr);
    }

    // Fallback: Aciona endpoint no servidor para baixar contornando CORS e salvar no storage
    const serverRes = await fetch('/api/upload-from-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        category: options.category || 'monster',
        name: options.name || 'monster'
      })
    });

    if (!serverRes.ok) {
      const errJson = await serverRes.json().catch(() => ({}));
      throw new Error(errJson.error || 'Falha ao processar e salvar imagem no armazenamento permanente.');
    }

    const data = await serverRes.json();
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const metadata: UserFileMetadata = {
      id: fileId,
      userId,
      name: options.name || 'monster',
      originalName: `${options.name || 'monster'}.png`,
      storagePath: data.storagePath || `monsters/${fileId}.png`,
      url: data.url,
      mimeType: data.mimeType || 'image/png',
      size: data.size || 0,
      category: options.category || 'monster',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, 'user_files', fileId);
      await setDoc(docRef, {
        ...metadata,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('[StorageService] Imagem salva permanentemente e registrada no Firestore user_files:', metadata.id);
    } catch (fErr) {
      console.warn('[StorageService] Aviso ao persistir metadados no Firestore user_files:', fErr);
    }

    return metadata;
  },

  /**
   * Mantém compatibilidade com fluxos existentes de NPC/Monstros, garantindo armazenamento permanente e metadados no Firestore usando StorageService.uploadFile.
   */
  async uploadNpcImage(url: string, path: string): Promise<string> {
    const fileName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'npc_image';
    const metadata = await this.uploadFromUrl(url, {
      category: 'monster',
      name: fileName,
      storagePath: path
    });
    return metadata.url;
  },

  /**
   * Garante que uma URL seja permanente no Firebase Storage ou no servidor.
   * Se já for do Firebase Storage, do servidor (/uploads/) ou externa válida, retorna sem duplicar uploads.
   * Se for data: ou blob:, faz upload permanente via uploadFile e retorna a URL permanente.
   */
  async ensurePermanentUrl(urlOrData: string, options: UploadOptions): Promise<string> {
    if (!urlOrData) return '';
    
    // Se já é uma URL permanente do Firebase Storage, do servidor local (/uploads/) ou URL externa pública, preserva sem re-upload
    if (
      urlOrData.includes('firebasestorage.googleapis.com') ||
      urlOrData.startsWith('/uploads/') ||
      urlOrData.startsWith('http://') ||
      (urlOrData.startsWith('https://') && !urlOrData.includes('blob:'))
    ) {
      return urlOrData;
    }

    // Se for data URI ou blob local, envia para armazenamento permanente via uploadFromUrl
    if (urlOrData.startsWith('data:') || urlOrData.startsWith('blob:')) {
      const meta = await this.uploadFromUrl(urlOrData, options);
      return meta.url;
    }

    return urlOrData;
  },

  /**
   * Exclui um arquivo do Firebase Storage e seus metadados no Firestore (Ação explícita do usuário - Regra 6).
   */
  async deleteUserFile(fileId: string, storagePath?: string): Promise<void> {
    try {
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef).catch((e) => console.warn('Erro ao excluir no Storage:', e));
      }
      await deleteDoc(doc(db, 'user_files', fileId));
    } catch (error) {
      console.error('[StorageService] Erro ao excluir arquivo:', error);
      throw error;
    }
  },

  /**
   * Lista os arquivos salvos do usuário a partir do Firestore.
   */
  async getUserFiles(userId: string, category?: FileCategory): Promise<UserFileMetadata[]> {
    try {
      let q = query(collection(db, 'user_files'), where('userId', '==', userId));
      if (category) {
        q = query(collection(db, 'user_files'), where('userId', '==', userId), where('category', '==', category));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as UserFileMetadata);
    } catch (error) {
      console.warn('[StorageService] Erro ao carregar arquivos do Firestore:', error);
      return [];
    }
  },

  isCorsError(error: any): boolean {
    return (
      error.message === 'Failed to fetch' || 
      error.code === 'storage/retry-limit-exceeded' ||
      error.code === 'storage/unknown' ||
      (error.name === 'FirebaseError' && error.code === 'storage/unknown')
    );
  },

  getCorsErrorMessage(): string {
    return `ERRO DE CORS: O upload foi bloqueado pelo navegador. Configure o CORS no seu bucket usando o arquivo 'cors.json'.`;
  }
};

