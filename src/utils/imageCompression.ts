/**
 * Utilitário de compressão e otimização de imagens para avatares e fichas do REALMOR.
 * Reduz imagens grandes (fotos de celular de 2MB-10MB) para avatares otimizados de ~15KB-30KB,
 * prevenindo o estouro do limite estrito de 1MB por documento do Firestore.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  cropToSquare?: boolean;
}

/**
 * Comprime um arquivo de imagem (File) via HTML5 Canvas
 * e retorna uma string data URL JPEG otimizada.
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 300,
    maxHeight = 300,
    quality = 0.8,
    cropToSquare = true
  } = options;

  return new Promise((resolve, reject) => {
    // Se o arquivo for SVG, preservamos se for razoavelmente pequeno
    if (file.type === 'image/svg+xml' && file.size < 50000) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const compressed = renderToCompressedDataUrl(img, maxWidth, maxHeight, quality, cropToSquare);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Falha ao carregar a imagem para compressão'));
    };

    img.src = objectUrl;
  });
}

/**
 * Recomprime uma string Data URL existente se ela for muito grande (> 40KB).
 */
export async function compressDataUrl(
  dataUrl: string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 300,
    maxHeight = 300,
    quality = 0.8,
    cropToSquare = true
  } = options;

  // Se já for pequena (menos de ~40KB base64), não precisa recomprimir
  if (dataUrl.length < 40000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const compressed = renderToCompressedDataUrl(img, maxWidth, maxHeight, quality, cropToSquare);
        resolve(compressed);
      } catch {
        resolve(dataUrl); // Fallback seguro
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

/**
 * Garante que qualquer URL ou Data URL de avatar esteja otimizada para o Firestore.
 */
export async function optimizeAvatar(urlOrDataUrl: string | undefined | null): Promise<string> {
  if (!urlOrDataUrl || typeof urlOrDataUrl !== 'string') {
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80';
  }

  // URLs http/https externas não ocupam espaço no documento do Firestore
  if (urlOrDataUrl.startsWith('http://') || urlOrDataUrl.startsWith('https://')) {
    return urlOrDataUrl;
  }

  // Data URLs grandes precisam ser comprimidas
  if (urlOrDataUrl.startsWith('data:image/')) {
    if (urlOrDataUrl.length > 40000) {
      try {
        return await compressDataUrl(urlOrDataUrl, { maxWidth: 280, maxHeight: 280, quality: 0.78 });
      } catch (err) {
        console.warn('Erro ao otimizar avatar data-url:', err);
        return urlOrDataUrl;
      }
    }
  }

  return urlOrDataUrl;
}

/**
 * Função interna para desenhar a imagem no Canvas com corte quadrado central e exportar como JPEG
 */
function renderToCompressedDataUrl(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  cropToSquare: boolean
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível obter o contexto 2D do Canvas');
  }

  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  if (cropToSquare) {
    // Corte quadrado centralizado para avatares
    const size = Math.min(srcWidth, srcHeight);
    const startX = (srcWidth - size) / 2;
    const startY = (srcHeight - size) / 2;

    const targetSize = Math.min(maxWidth, maxHeight, size);
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Fundo neutro caso a imagem tenha transparência
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, targetSize, targetSize);

    ctx.drawImage(
      img,
      startX,
      startY,
      size,
      size,
      0,
      0,
      targetSize,
      targetSize
    );
  } else {
    // Redimensionamento proporcional
    let targetWidth = srcWidth;
    let targetHeight = srcHeight;

    if (targetWidth > maxWidth) {
      targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
      targetWidth = maxWidth;
    }

    if (targetHeight > maxHeight) {
      targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
      targetHeight = maxHeight;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }

  return canvas.toDataURL('image/jpeg', quality);
}
