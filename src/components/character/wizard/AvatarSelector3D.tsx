import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Check, 
  Box, 
  ShieldAlert, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { storage, ref, getDownloadURL, resolveStorageUrlWithFallback, firebaseConfig } from '../../../firebase/storage';
import { getOptimizedGLTFLoader, cloneGLTFScene, loadGLTFModel } from '../../../utils/gltfLoader';

export interface Avatar3DOption {
  id: string;
  name: string;
  category: string;
  storagePath: string; // Caminho no Firebase Storage (ex: '3d/Arcanista-v1.glb', '3d/anaogrande-v1.glb')
  pngPath: string;     // Caminho da imagem PNG (ex: '3d/avatar-png/guerreiro.png')
  description?: string;
  previewUrl?: string;
}

// Catálogo de avatares 3D disponíveis no Firebase Storage
export const AVAILABLE_3D_AVATARS: Avatar3DOption[] = [
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    category: 'Guerreiro',
    storagePath: '3d/anaogrande-v1.glb',
    pngPath: '3d/avatar-png/guerreiro.png',
    description: 'Um combatente imponente e robusto forjado para a linha de frente da batalha.'
  },
  {
    id: 'arcanista',
    name: 'Arcanista',
    category: 'Arcanista',
    storagePath: '3d/Arcanista-v1.glb',
    pngPath: '3d/avatar-png/arcanista.png',
    description: 'Um conjurador mestre das artes arcanas e feitiços primordiais.'
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    category: 'Clérigo',
    storagePath: '3d/Clerigo-v1.glb',
    pngPath: '3d/avatar-png/clerigo.png',
    description: 'Um devoto sagrado abençoado pelos deuses do Panteão.'
  },
  {
    id: 'inventor',
    name: 'Inventor',
    category: 'Inventor',
    storagePath: '3d/skeleto-v1.glb',
    pngPath: '3d/avatar-png/inventor.png',
    description: 'Um engenhoso artífice e inventor impulsionado pela ciência e magia de Arton.'
  }
];

// Cache global em memória para instâncias GLTF já carregadas (evita downloads repetidos)
const gltfGlobalCache = new Map<string, any>();
const downloadUrlCache = new Map<string, string>();

interface AvatarSelector3DProps {
  selectedAvatarId?: string;
  selectedModelPath?: string;
  onSelectAvatar?: (avatar: Avatar3DOption, resolvedUrl: string) => void;
}

export const AvatarSelector3D: React.FC<AvatarSelector3DProps> = ({
  selectedAvatarId = 'anaogrande',
  onSelectAvatar
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Instâncias do Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Modelo ativo derivado diretamente da prop (fonte única de verdade)
  const activeAvatar = useMemo(() => {
    return AVAILABLE_3D_AVATARS.find(a => a.id === selectedAvatarId) || AVAILABLE_3D_AVATARS[0];
  }, [selectedAvatarId]);

  // Estados locais apenas para feedback visual do carregador Three.js
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState<number>(0);

  // 1. Obter URL oficial e autenticada do Firebase Storage SDK via getDownloadURL com fallback resiliente
  const resolveStorageUrl = useCallback(async (path: string): Promise<string> => {
    return resolveStorageUrlWithFallback(path || '3d/anaogrande-v1.glb');
  }, []);

  // 2. Inicializar Cena, Iluminação, Pedestal e Câmera Three.js (Executado apenas uma vez na montagem)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    // A. Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0b12);
    scene.fog = new THREE.FogExp2(0x0c0b12, 0.12);
    sceneRef.current = scene;

    // B. Câmera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 2.5);
    cameraRef.current = camera;

    // C. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // D. OrbitControls (360° livre, zoom suave, centrado, sem pan para não sair da câmera)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false; // Mantém o personagem centralizado
    controls.enableZoom = true;
    controls.minDistance = 0.8;
    controls.maxDistance = 4.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.06; // Não descer abaixo do chão
    controls.minPolarAngle = 0.1; // Não inverter no topo
    controls.target.set(0, 0.9, 0);
    controls.update();
    controlsRef.current = controls;

    // E. Iluminação Cinemática 3-Pontos
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.8);
    scene.add(ambientLight);

    // Key Light (Luz Principal Dourada)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(2.0, 3.5, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill Light (Luz de Preenchimento Azulada Suave)
    const fillLight = new THREE.DirectionalLight(0x7ca8df, 1.0);
    fillLight.position.set(-2.5, 2.0, 1.8);
    scene.add(fillLight);

    // Rim Light (Destaque de Silhueta Traseiro)
    const rimLight = new THREE.DirectionalLight(0xe4c37e, 1.8);
    rimLight.position.set(0, 3.0, -2.8);
    scene.add(rimLight);

    // F. Grupo Mestre do Modelo
    const modelGroup = new THREE.Group();
    modelGroup.name = 'avatar_3d_master';
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // G. Pedestal em Pedra Escura e Runa Dourada (Estética Helmor)
    const pedestalGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.06, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x16141e,
      roughness: 0.6,
      metalness: 0.4
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.03;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Anel Dourado Rúnico
    const ringGeo = new THREE.RingGeometry(0.78, 0.83, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    ring.receiveShadow = true;
    scene.add(ring);

    // Sombra suave no chão
    const shadowPlaneGeo = new THREE.PlaneGeometry(6, 6);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // H. Loop de Renderização Contínuo (Personagem Estático, apenas controles reagem)
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // I. Resize Observer para responsividade
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

  // 3. Carregar e Ajustar Modelo 3D (Dispara APENAS quando o caminho do modelo ou retry mudar)
  const currentModelPath = activeAvatar.storagePath;
  useEffect(() => {
    let isCancelled = false;

    const loadModel = async () => {
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
        let modelUrl = '';
        try {
          modelUrl = await resolveStorageUrl(currentModelPath);
        } catch {
          // Arquivo ainda não subido no bucket
        }

        if (isCancelled) return;

        // 2. Carregar GLTF (com cache em memória)
        let loadedScene: THREE.Group | null = null;

        if (modelUrl) {
          if (gltfGlobalCache.has(currentModelPath)) {
            const cachedGltf = gltfGlobalCache.get(currentModelPath);
            loadedScene = cloneGLTFScene(cachedGltf.scene);
          } else {
            const gltf = await loadGLTFModel(modelUrl).catch((err) => {
              console.warn('Erro ao carregar modelo GLTF no seletor:', err);
              return null;
            });
            if (isCancelled) return;
            if (gltf && gltf.scene) {
              gltfGlobalCache.set(currentModelPath, gltf);
              loadedScene = cloneGLTFScene(gltf.scene);
            }
          }
        }

        // Fallback procedural
        if (!loadedScene) {
          loadedScene = createAvatarProceduralStatue(activeAvatar?.name || 'Guerreiro');
        }

        if (!loadedScene || isCancelled) return;

        // Habilita sombras em todos os meshes
        loadedScene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // 3. Centralização Automática por Bounding Box (Mantém modelo centralizado no pedestal)
        const box = new THREE.Box3().setFromObject(loadedScene);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // Alinha os pés na altura Y = 0 e centraliza em X e Z
        loadedScene.position.x = -center.x;
        loadedScene.position.y = -box.min.y;
        loadedScene.position.z = -center.z;

        modelGroup.add(loadedScene);

        // 4. Ajusta distância da câmera e alvo dos controles para enquadramento ideal
        const maxDim = Math.max(size.x, size.y, size.z) || 1.8;
        const targetHeight = size.y * 0.5 || 0.9;

        if (controlsRef.current && cameraRef.current) {
          const controls = controlsRef.current;
          const camera = cameraRef.current;

          controls.target.set(0, targetHeight, 0);
          controls.minDistance = Math.max(maxDim * 0.6, 0.6);
          controls.maxDistance = Math.max(maxDim * 3.5, 3.5);

          camera.position.set(0, targetHeight * 1.1, maxDim * 1.8);
          controls.update();
        }

        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadModel();

    return () => {
      isCancelled = true;
    };
  }, [currentModelPath, retryCounter, resolveStorageUrl]);

  // Manipulador de seleção disparado EXCLUSIVAMENTE por clique do usuário
  const handleSelectAvatarClick = async (avatar: Avatar3DOption) => {
    try {
      const [modelUrl, pngUrl] = await Promise.all([
        resolveStorageUrl(avatar.storagePath),
        resolveStorageUrl(avatar.pngPath).catch(() => '')
      ]);
      const resolvedAvatar = { ...avatar, previewUrl: pngUrl || avatar.previewUrl };
      onSelectAvatar?.(resolvedAvatar, modelUrl);
    } catch {
      onSelectAvatar?.(avatar, '');
    }
  };

  // Controles rápidos de Câmera
  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 1.1, 2.5);
      controlsRef.current.target.set(0, 0.9, 0);
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
    <div className="w-full space-y-3">
      {/* 1. Header do Avatar 3D com indicação visual de status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Avatar 3D do Herói
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
            GLB Interativo
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <Eye className="w-3.5 h-3.5 text-amber-400/80" />
          <span>360° Orbital</span>
        </div>
      </div>

      {/* 2. Container do Visualizador 3D WebGL */}
      <div 
        ref={containerRef}
        className="relative w-full h-[280px] sm:h-[340px] bg-[#0c0b12] rounded-2xl border-2 border-amber-900/50 shadow-2xl overflow-hidden flex flex-col group select-none"
      >
        {/* WebGL Canvas */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full flex-1 cursor-grab active:cursor-grabbing outline-none block touch-none"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-stone-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 space-y-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-5 h-5 absolute inset-0 m-auto text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-amber-200 font-cinzel tracking-wider font-bold">
              Carregando Avatar 3D do Firebase Storage...
            </p>
            <span className="text-[10px] text-stone-400 font-mono">
              {activeAvatar.storagePath}
            </span>
          </div>
        )}

        {/* Error Overlay */}
        {loadError && (
          <div className="absolute inset-0 z-20 bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
            <p className="text-xs font-bold text-red-300 max-w-xs">{loadError}</p>
            <button
              type="button"
              onClick={() => setRetryCounter(c => c + 1)}
              className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}

        {/* Floating Controls Overlay (Zoom & Reset) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-black/60 backdrop-blur-md border border-amber-900/40 p-1 rounded-xl shadow-lg">
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

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-2 inset-x-2 z-10 pointer-events-none flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-amber-900/30 text-[11px] text-stone-300 shadow-md">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-200 font-bold">{activeAvatar.name}</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">{activeAvatar.category}</span>
          </span>
          <span className="text-[10px] text-amber-400/90 font-mono hidden sm:inline">
            Arraste para girar • Scroll para zoom
          </span>
        </div>
      </div>

      {/* 3. Seletor / Catálogo de Modelos 3D (Preparado para expansão futura) */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center justify-between">
          <span>Modelos 3D Disponíveis</span>
          <span className="text-[10px] text-stone-400">{AVAILABLE_3D_AVATARS.length} modelo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVAILABLE_3D_AVATARS.map((avatar) => {
            const isAvatarActive = activeAvatar.id === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleSelectAvatarClick(avatar)}
                className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between group cursor-pointer ${
                  isAvatarActive
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                    : 'bg-stone-900/60 border-stone-800 hover:border-amber-700/60 hover:bg-stone-900'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel text-xs font-bold text-amber-200 group-hover:text-amber-100">
                      {avatar.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {avatar.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 line-clamp-1">
                    {avatar.description || avatar.storagePath}
                  </p>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  isAvatarActive
                    ? 'bg-amber-500 border-amber-400 text-stone-950'
                    : 'border-stone-700 text-transparent group-hover:border-amber-600'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function createAvatarProceduralStatue(name: string): THREE.Group {
  const group = new THREE.Group();

  const isMage = name.toLowerCase().includes('arc') || name.toLowerCase().includes('mago');
  const isCleric = name.toLowerCase().includes('clér') || name.toLowerCase().includes('cler');
  const isInventor = name.toLowerCase().includes('inv');

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
