/**
 * Realmor Global Asset Preload & Persistent Cache Service
 * Centralized caching and preloading system using Browser CacheStorage API & Image Memory Decoding.
 */

const CACHE_NAME = 'realmor-image-cache-v1';

// 1. Loading Screen Image (MUST be ready before loading animation starts)
export const LOADING_IMAGE_URL = '/icone-main.png';

// 2. Essential First Screen & Primary UI Assets
export const ESSENTIAL_FIRST_SCREEN_IMAGES = [
  LOADING_IMAGE_URL,
  '/icone-main.svg',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
  'https://www.transparenttextures.com/patterns/dark-leather.png',
  'https://www.transparenttextures.com/patterns/stardust.png',
  'https://www.transparenttextures.com/patterns/parchment.png',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
];

// 3. Secondary Assets (Preloaded in background after initial render)
export const SECONDARY_APP_IMAGES = [
  'https://www.transparenttextures.com/patterns/paper-fibers.png',
  'https://www.transparenttextures.com/patterns/dark-matter.png'
];

// In-memory cache mapping original URL -> preloaded URL / Object URL
const memoryUrlMap = new Map<string, string>();
const inFlightPromises = new Map<string, Promise<string>>();

let isLoadingAssetReady = false;
let isEssentialAssetsReady = false;

export const AssetCacheService = {
  /**
   * Checks if loading icon (swordandstaff.png) is ready in memory.
   */
  isLoadingAssetReady(): boolean {
    return isLoadingAssetReady;
  },

  /**
   * Checks if essential first screen assets are preloaded.
   */
  isEssentialAssetsReady(): boolean {
    return isEssentialAssetsReady;
  },

  /**
   * Resolves a cached URL for a given image URL (returns Object URL if available or original URL).
   */
  getCachedUrl(originalUrl: string): string {
    if (!originalUrl) return '';
    return memoryUrlMap.get(originalUrl) || originalUrl;
  },

  /**
   * Preloads a single image into Browser CacheStorage API and decodes its pixels in memory.
   */
  async preloadImage(url: string): Promise<string> {
    if (!url || typeof window === 'undefined') return url;

    // Return from memory cache if already preloaded
    if (memoryUrlMap.has(url)) {
      return memoryUrlMap.get(url)!;
    }

    // Reuse in-flight promise if loading is already in progress
    if (inFlightPromises.has(url)) {
      return inFlightPromises.get(url)!;
    }

    const loadPromise = (async () => {
      try {
        let objectUrl: string | null = null;

        // 1. Persistent Browser CacheStorage Check & Fetch
        if ('caches' in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            let response = await cache.match(url);

            if (!response) {
              try {
                response = await fetch(url, { mode: 'cors' });
              } catch (_) {
                response = await fetch(url, { mode: 'no-cors' });
              }

              if (response && (response.ok || response.type === 'opaque')) {
                await cache.put(url, response.clone()).catch(() => {});
              }
            }

            if (response && response.type !== 'opaque') {
              const blob = await response.blob();
              if (blob.size > 0) {
                objectUrl = URL.createObjectURL(blob);
              }
            }
          } catch (cacheErr) {
            console.debug('[AssetCacheService] CacheStorage fallback:', cacheErr);
          }
        }

        const targetSrc = objectUrl || url;

        // 2. Decode pixels in memory using HTMLImageElement
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          const onDone = () => resolve();
          img.onload = onDone;
          img.onerror = onDone;
          img.src = targetSrc;

          if ('decode' in img && typeof img.decode === 'function') {
            img.decode().then(onDone).catch(onDone);
          }
        });

        const finalUrl = objectUrl || url;
        memoryUrlMap.set(url, finalUrl);
        return finalUrl;
      } catch (err) {
        console.debug('[AssetCacheService] Fallback to direct URL:', url, err);
        memoryUrlMap.set(url, url);
        return url;
      } finally {
        inFlightPromises.delete(url);
      }
    })();

    inFlightPromises.set(url, loadPromise);
    return loadPromise;
  },

  /**
   * Preloads ONLY the loading screen image (swordandstaff.png).
   * Guarantees image is decoded before loading animation starts.
   */
  async preloadLoadingAsset(): Promise<string> {
    const url = await this.preloadImage(LOADING_IMAGE_URL);
    isLoadingAssetReady = true;
    return url;
  },

  /**
   * Preloads all essential first-screen images (logo, covers, background textures).
   * Blocks initial transition until essential assets are cached.
   */
  async preloadEssentialAssets(): Promise<void> {
    await this.preloadLoadingAsset();

    await Promise.allSettled(
      ESSENTIAL_FIRST_SCREEN_IMAGES.map((imgUrl) => this.preloadImage(imgUrl))
    );

    isEssentialAssetsReady = true;

    // Trigger secondary background asset preloading
    this.preloadSecondaryAssetsInBackground();
  },

  /**
   * Preloads secondary screen assets in the background when idle.
   */
  preloadSecondaryAssetsInBackground(): void {
    const startBgPreload = () => {
      SECONDARY_APP_IMAGES.forEach((url) => {
        this.preloadImage(url).catch(() => {});
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(startBgPreload);
    } else {
      setTimeout(startBgPreload, 1500);
    }
  }
};
