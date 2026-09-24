import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Sparkles, RotateCw, ZoomIn, ZoomOut, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { storage, ref, getDownloadURL, resolveStorageUrlWithFallback, firebaseConfig } from '../../firebase/storage';
import { getOptimizedGLTFLoader, cloneGLTFScene, loadGLTFModel } from '../../utils/gltfLoader';

// Cache global de GLTF e URLs para carregamento instantâneo entre trocas de slots
const stageGltfCache = new Map<string, any>();
const stageUrlCache = new Map<string, string>();

interface CharacterSelectionStage3DProps {
  modelPath: string; // Ex: '3d/anaogrande-v1.glb', '3d/Arcanista-v1.glb', etc.
  characterName: string;
  onResetCamera?: () => void;
}

export const CharacterSelectionStage3D: React.FC<CharacterSelectionStage3DProps> = ({
  modelPath,
  characterName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Instâncias Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Estados
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  // 1. Obter URL oficial e autenticada do Firebase Storage SDK via getDownloadURL com fallback
  const resolveStorageUrl = useCallback(async (path: string): Promise<string> => {
    return resolveStorageUrlWithFallback(path || '3d/anaogrande-v1.glb');
  }, []);

  // 2. Setup do Ambiente 3D (Cena, Iluminação Cinemática, Pedestal Monumental e Controles)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 560;

    // A. Cena com Fog e Fundo Translúcido para compor com o ambiente gótico
    const scene = new THREE.Scene();
    scene.background = null; // Fundo transparente para mesclar com o cenário medieval
    scene.fog = new THREE.FogExp2(0x06050a, 0.08);
    sceneRef.current = scene;

    // B. Câmera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.25, 2.7);
    cameraRef.current = camera;

    // C. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // D. OrbitControls (360° livre, zoom suave, centrado)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false; // Mantém o personagem rigorosamente centralizado no pedestal
    controls.enableZoom = true;
    controls.minDistance = 1.0;
    controls.maxDistance = 4.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.04; // Não descer abaixo do nível do pedestal
    controls.minPolarAngle = 0.15;
    controls.target.set(0, 0.95, 0);
    controls.update();
    controlsRef.current = controls;

    // E. Iluminação Cinemática Medieval (Tochas, Key Light e Rim Light)
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.7);
    scene.add(ambientLight);

    // Luz Principal Superior / Key Light (Luz Dourada Celestial)
    const keyLight = new THREE.DirectionalLight(0xfff1db, 2.6);
    keyLight.position.set(1.8, 4.0, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Luz de Tocha Esquerda (Amber quente)
    const leftTorch = new THREE.PointLight(0xff8a1e, 2.0, 8);
    leftTorch.position.set(-2.2, 1.8, 1.5);
    scene.add(leftTorch);

    // Luz de Tocha Direita (Amber quente)
    const rightTorch = new THREE.PointLight(0xff8a1e, 2.0, 8);
    rightTorch.position.set(2.2, 1.8, 1.5);
    scene.add(rightTorch);

    // Rim Light Traseira (Realce de Silhueta Dourado)
    const rimLight = new THREE.DirectionalLight(0xd4af37, 2.2);
    rimLight.position.set(0, 3.2, -3.0);
    scene.add(rimLight);

    // Fill Light Azulada Sutil de Catedral
    const fillLight = new THREE.DirectionalLight(0x5577aa, 0.8);
    fillLight.position.set(-2.0, 2.0, 2.0);
    scene.add(fillLight);

    // F. Grupo Mestre do Personagem
    const modelGroup = new THREE.Group();
    modelGroup.name = 'hero_3d_group';
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // G. Pedestal Monumental em Pedra Escura com Gravuras Concéntricas (Fiel à Referência)
    // 1. Base Inferior Larga
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.12, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x14121a,
      roughness: 0.7,
      metalness: 0.3
    });
    const basePedestal = new THREE.Mesh(baseGeo, baseMat);
    basePedestal.position.y = -0.09;
    basePedestal.receiveShadow = true;
    scene.add(basePedestal);

    // 2. Patamar Central com Entalhe
    const centerGeo = new THREE.CylinderGeometry(1.05, 1.15, 0.08, 64);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x1a1722,
      roughness: 0.5,
      metalness: 0.4
    });
    const centerPedestal = new THREE.Mesh(centerGeo, centerMat);
    centerPedestal.position.y = -0.01;
    centerPedestal.receiveShadow = true;
    scene.add(centerPedestal);

    // 3. Anéis Concéntricos Rúnicos Dourados (Inlay metálico entalhado na pedra)
    const outerRingGeo = new THREE.RingGeometry(0.92, 0.98, 64);
    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.28,
      side: THREE.DoubleSide
    });
    const outerRing = new THREE.Mesh(outerRingGeo, goldRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.032;
    outerRing.receiveShadow = true;
    scene.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(0.65, 0.70, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, goldRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.033;
    innerRing.receiveShadow = true;
    scene.add(innerRing);

    // 4. Sombra de Contato Suave
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.6 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.034;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // H. Loop de Renderização
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // I. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // 3. Carregar e Posicionar Modelo 3D (Estático, sem animações, centralizado por Bounding Box)
  useEffect(() => {
    let isCancelled = false;

    const loadHeroModel = async () => {
      if (!modelGroupRef.current || !cameraRef.current || !controlsRef.current) return;
      const modelGroup = modelGroupRef.current;

      setIsLoading(true);
      setLoadError(null);

      // Limpa modelos anteriores
      while (modelGroup.children.length > 0) {
        const child = modelGroup.children[0];
        modelGroup.remove(child);
        child.traverse((node: any) => {
          if (node.isMesh && node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach((m: any) => m && m.dispose && m.dispose());
            } else if (node.material.dispose) {
              node.material.dispose();
            }
          }
        });
      }

      try {
        const targetPath = modelPath || '3d/anaogrande-v1.glb';
        let modelUrl = '';
        try {
          modelUrl = await resolveStorageUrl(targetPath);
        } catch {
          // Arquivo ainda não subido no bucket
        }

        if (isCancelled) return;

        let loadedScene: THREE.Group | null = null;

        if (modelUrl) {
          if (stageGltfCache.has(targetPath)) {
            const cached = stageGltfCache.get(targetPath);
            loadedScene = cloneGLTFScene(cached.scene);
          } else {
            const gltf = await loadGLTFModel(modelUrl).catch((err) => {
              console.warn('Erro ao carregar modelo GLTF do palco:', err);
              return null;
            });
            if (isCancelled) return;
            if (gltf && gltf.scene) {
              stageGltfCache.set(targetPath, gltf);
              loadedScene = cloneGLTFScene(gltf.scene);
            }
          }
        }

        // Fallback procedural de estátua heróica
        if (!loadedScene) {
          loadedScene = createStageProceduralStatue(characterName || 'Guerreiro');
        }

        if (!loadedScene || isCancelled) return;

        // Ativa sombras em todos os meshes
        loadedScene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Bounding Box e Centralização
        const box = new THREE.Box3().setFromObject(loadedScene);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // Alinha os pés no topo do pedestal (Y = 0.035) e centraliza em X e Z
        loadedScene.position.x = -center.x;
        loadedScene.position.y = -box.min.y + 0.035;
        loadedScene.position.z = -center.z;

        modelGroup.add(loadedScene);

        // Enquadramento Ótimo da Câmera
        const maxDim = Math.max(size.x, size.y, size.z) || 1.8;
        const targetHeight = size.y * 0.52 || 0.95;

        if (controlsRef.current && cameraRef.current) {
          const controls = controlsRef.current;
          const camera = cameraRef.current;

          controls.target.set(0, targetHeight, 0);
          controls.minDistance = Math.max(maxDim * 0.7, 0.8);
          controls.maxDistance = Math.max(maxDim * 3.8, 3.8);

          camera.position.set(0, targetHeight * 1.08, maxDim * 1.95);
          controls.update();
        }

        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadHeroModel();

    return () => {
      isCancelled = true;
    };
  }, [modelPath, retryKey, resolveStorageUrl]);

  // Controles Rápidos de Câmera
  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 1.25, 2.7);
      controlsRef.current.target.set(0, 0.95, 0);
      controlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.multiplyScalar(0.85);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.multiplyScalar(1.15);
      controlsRef.current.update();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex-1 flex items-center justify-center select-none overflow-hidden touch-none"
    >
      {/* Canvas 3D */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none block"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 space-y-3 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin shadow-[0_0_20px_rgba(217,119,6,0.4)]" />
            <Sparkles className="w-6 h-6 absolute inset-0 m-auto text-amber-400 animate-pulse" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-cinzel tracking-widest text-amber-200 font-bold uppercase drop-shadow">
              Conjurando {characterName}...
            </p>
            <p className="text-[10px] text-amber-400/60 font-mono">
              Carregando geometria 3D
            </p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-black/80 backdrop-blur-sm">
          <AlertCircle className="w-9 h-9 text-red-400 animate-pulse" />
          <p className="text-xs text-red-300 font-sans max-w-xs">{loadError}</p>
          <button
            type="button"
            onClick={() => setRetryKey(k => k + 1)}
            className="px-4 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-cinzel flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* Floating Controls Overlay (Minimal & Dark Fantasy) */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-15 flex flex-col gap-1.5 bg-black/60 backdrop-blur-md border border-amber-900/40 p-1 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Aproximar (Zoom +)"
          className="p-1.5 text-stone-300 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Afastar (Zoom -)"
          className="p-1.5 text-stone-300 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetCamera}
          title="Recentrar Câmera"
          className="p-1.5 text-stone-300 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors border-t border-amber-900/30 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Dica de Interatividade */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-15 pointer-events-none text-center">
        <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-900/40 text-[10px] sm:text-[11px] text-amber-300/80 font-cinzel tracking-wider flex items-center gap-1.5 shadow-lg">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Gire 360° • Toque/Scroll para Zoom</span>
        </div>
      </div>
    </div>
  );
};

function createStageProceduralStatue(characterName: string): THREE.Group {
  const group = new THREE.Group();

  const isMage = characterName.toLowerCase().includes('arc') || characterName.toLowerCase().includes('mago');
  const isCleric = characterName.toLowerCase().includes('clér') || characterName.toLowerCase().includes('cler');
  const isInventor = characterName.toLowerCase().includes('inv');

  const mainColor = isMage ? 0x3b82f6 : isCleric ? 0xeab308 : isInventor ? 0xf97316 : 0xb45309;

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x292524,
    roughness: 0.4,
    metalness: 0.6
  });

  const armorMaterial = new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: 0.2,
    metalness: 0.8
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.75, 8), armorMaterial);
  torso.position.y = 1.05;
  torso.castShadow = true;
  group.add(torso);

  // Ombreiras
  const pauldronL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), armorMaterial);
  pauldronL.position.set(-0.36, 1.38, 0);
  group.add(pauldronL);

  const pauldronR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), armorMaterial);
  pauldronR.position.set(0.36, 1.38, 0);
  group.add(pauldronR);

  // Braços
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.6, 8), bodyMaterial);
  armL.position.set(-0.38, 1.0, 0);
  group.add(armL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.6, 8), bodyMaterial);
  armR.position.set(0.38, 1.0, 0);
  group.add(armR);

  // Cabeça / Elmo
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), armorMaterial);
  head.position.y = 1.58;
  group.add(head);

  // Pernas
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.7, 8), bodyMaterial);
  legL.position.set(-0.15, 0.4, 0);
  group.add(legL);

  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.7, 8), bodyMaterial);
  legR.position.set(0.15, 0.4, 0);
  group.add(legR);

  return group;
}
