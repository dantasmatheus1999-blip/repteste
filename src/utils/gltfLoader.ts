import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

let sharedLoader: GLTFLoader | null = null;
let meshoptReadyPromise: Promise<void> | null = null;

/**
 * Garante que o decodificador WASM do Meshopt está 100% pronto antes do primeiro parse.
 */
export async function ensureMeshoptReady(): Promise<void> {
  if (!meshoptReadyPromise) {
    if (MeshoptDecoder && MeshoptDecoder.ready) {
      meshoptReadyPromise = Promise.resolve(MeshoptDecoder.ready).then(() => {});
    } else {
      meshoptReadyPromise = Promise.resolve();
    }
  }
  return meshoptReadyPromise;
}

/**
 * Retorna uma instância do GLTFLoader configurada com MeshoptDecoder
 * para suportar EXT_meshopt_compression e KHR_mesh_quantization.
 */
export function getOptimizedGLTFLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader();
    try {
      sharedLoader.setMeshoptDecoder(MeshoptDecoder);
    } catch (err) {
      console.warn('Erro ao configurar MeshoptDecoder no GLTFLoader:', err);
    }
  }
  return sharedLoader;
}

/**
 * Clona com segurança um objeto ou cena Three.js contendo SkinnedMesh e ossos (Skeletons).
 * O método nativo .clone(true) do Three.js corrompe os vínculos de ossos do SkinnedMesh,
 * gerando o efeito de boneco deformado. O SkeletonUtils.clone re-vincula os ossos corretamente.
 */
export function cloneGLTFScene(sourceScene: THREE.Object3D): THREE.Group {
  const cloned = SkeletonUtils.clone(sourceScene) as THREE.Group;

  cloned.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;

      // Otimização de sombras: apenas meshes opacos projetam e recebem sombras
      const isTransparent = mesh.material && (
        Array.isArray(mesh.material)
          ? mesh.material.some((m: any) => m && (m.transparent || m.opacity < 0.95))
          : ((mesh.material as any).transparent || (mesh.material as any).opacity < 0.95)
      );

      if (isTransparent) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      } else {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }

      // Frustum culling: apenas SkinnedMesh com esqueleto flexível precisa de frustumCulled = false
      if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
        const skinned = mesh as THREE.SkinnedMesh;
        skinned.frustumCulled = false;
        if (skinned.skeleton) {
          skinned.skeleton.update();
        }
      } else {
        mesh.frustumCulled = true;
      }

      // Garante DoubleSide em materiais que exigem
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => {
            if (mat) mat.side = THREE.DoubleSide;
          });
        } else {
          mesh.material.side = THREE.DoubleSide;
        }
      }
    }
  });

  return cloned;
}

/**
 * Carrega um modelo GLB/GLTF de forma assíncrona garantindo a prontidão do MeshoptDecoder.
 */
export async function loadGLTFModel(url: string): Promise<any> {
  await ensureMeshoptReady();
  const loader = getOptimizedGLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        // Pré-processa a cena original para assegurar integridade
        if (gltf.scene) {
          gltf.scene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
              const skinned = child as THREE.SkinnedMesh;
              skinned.frustumCulled = false;
              if (skinned.skeleton) {
                skinned.skeleton.update();
              }
            }
          });
        }
        resolve(gltf);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

export { MeshoptDecoder, SkeletonUtils };
