import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase/storage';
import { auth } from '../firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const StorageService = {
  /**
   * Faz o upload de uma imagem a partir de uma URL (geralmente do proxy do Gemini) para o Firebase Storage.
   * @param url URL da imagem a ser baixada e enviada.
   * @param path Caminho de destino no Storage (ex: 'npcs/uid/timestamp.png').
   * @returns URL de download permanente do Firebase Storage.
   */
  async uploadNpcImage(url: string, path: string): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Usuário não autenticado para upload.");
      }

      // 1. Baixar a imagem da URL fornecida
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("O arquivo baixado está vazio.");
      }

      // 2. Criar referência e iniciar upload
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null, // Não precisamos monitorar progresso detalhado em logs de produção
          (error) => {
            console.error('[StorageService] Erro no upload:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    } catch (error: any) {
      // Tratamento de erros específicos de permissão/CORS
      if (error.code === 'storage/unauthorized' || error.message?.includes('403')) {
        const bucket = firebaseConfig.storageBucket;
        throw new Error(`ERRO DE PERMISSÃO: O Firebase Storage negou o acesso. Certifique-se de que as regras de segurança estão configuradas no Console do Firebase para o bucket ${bucket}.`);
      }

      throw error;
    }
  },

  /**
   * Verifica se o erro é relacionado a CORS.
   */
  isCorsError(error: any): boolean {
    return (
      error.message === 'Failed to fetch' || 
      error.code === 'storage/retry-limit-exceeded' ||
      error.code === 'storage/unknown' ||
      (error.name === 'FirebaseError' && error.code === 'storage/unknown')
    );
  },

  /**
   * Retorna uma mensagem amigável para erros de CORS.
   */
  getCorsErrorMessage(): string {
    return `ERRO DE CORS: O upload foi bloqueado pelo navegador. Configure o CORS no seu bucket usando o arquivo 'cors.json' e o comando 'gsutil cors set'.`;
  }
};
