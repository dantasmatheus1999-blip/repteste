import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Global single-flight caches to prevent duplicate downloads and race conditions
const parsedGltfCache = new Map<string, any>();
const pendingGltfPromises = new Map<string, Promise<any>>();
const textureCache = new Map<string, THREE.Texture>();
const pendingTexturePromises = new Map<string, Promise<THREE.Texture>>();

/**
 * Loads a texture with global memoization and single-flight in-flight deduplication.
 */
export async function loadMakeHumanTexture(url: string): Promise<THREE.Texture> {
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }
  if (pendingTexturePromises.has(url)) {
    return pendingTexturePromises.get(url)!;
  }

  const promise = new Promise<THREE.Texture>((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = false;
        textureCache.set(url, tex);
        resolve(tex);
      },
      undefined,
      () => {
        // Fallback placeholder texture (64x64 neutral gray)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#605850';
          ctx.fillRect(0, 0, 64, 64);
        }
        const fbTex = new THREE.CanvasTexture(canvas);
        fbTex.colorSpace = THREE.SRGBColorSpace;
        fbTex.flipY = false;
        textureCache.set(url, fbTex);
        resolve(fbTex);
      }
    );
  });

  pendingTexturePromises.set(url, promise);

  try {
    const tex = await promise;
    return tex;
  } finally {
    pendingTexturePromises.delete(url);
  }
}

/**
 * Loads and parses a GLTF/GLB asset with global deduplication and single-flight networking.
 * Even if called 10 times simultaneously, only 1 network fetch will execute.
 */
export async function loadMakeHumanGLTF(url: string): Promise<any> {
  if (parsedGltfCache.has(url)) {
    return parsedGltfCache.get(url);
  }
  if (pendingGltfPromises.has(url)) {
    return pendingGltfPromises.get(url)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ao carregar asset 3D: ${url}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const loader = new GLTFLoader();
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.parse(
          arrayBuffer,
          url,
          (parsed) => resolve(parsed),
          (err) => reject(err)
        );
      });

      parsedGltfCache.set(url, gltf);
      return gltf;
    } catch (err) {
      throw err;
    }
  })();

  pendingGltfPromises.set(url, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingGltfPromises.delete(url);
  }
}

/**
 * Disposes of cloned materials on an unmounted or replaced Three.js hierarchy.
 */
export function disposeClonedHierarchy(object: THREE.Object3D | null) {
  if (!object) return;
  object.traverse((child: any) => {
    if (child.isMesh) {
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: THREE.Material) => mat && mat.dispose && mat.dispose());
        } else if (child.material.dispose) {
          child.material.dispose();
        }
      }
    }
  });
}
