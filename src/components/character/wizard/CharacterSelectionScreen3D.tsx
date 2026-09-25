import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { storage, ref, getDownloadURL, resolveStorageUrlWithFallback, firebaseConfig } from '../../../firebase/storage';
import { getOptimizedGLTFLoader, cloneGLTFScene, loadGLTFModel } from '../../../utils/gltfLoader';
import { WizardData } from './types';

export interface FixedCharacterSlot {
  id: string;
  name: string;
  archetype: string;
  storagePath: string; // Firebase storage path para modelo 3D (ex: 3d/Arcanista-v1.glb, 3d/anaogrande-v1.glb)
  pngPath: string;     // Firebase storage path para miniatura PNG (ex: 3d/avatar-png/guerreiro.png)
  portraitType: 'warrior' | 'mage' | 'cleric' | 'inventor';
}

// Os 4 Personagens Fixos usando os arquivos exatos no Firebase Storage
export const FIXED_4_CHARACTERS: FixedCharacterSlot[] = [
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    archetype: 'Guerreiro',
    storagePath: '3d/anaogrande-v1.glb',
    pngPath: '3d/avatar-png/guerreiro.png',
    portraitType: 'warrior'
  },
  {
    id: 'arcanista',
    name: 'Arcanista',
    archetype: 'Arcanista',
    storagePath: '3d/Arcanista-v1.glb',
    pngPath: '3d/avatar-png/arcanista.png',
    portraitType: 'mage'
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    archetype: 'Clérigo',
    storagePath: '3d/Clerigo-v1.glb',
    pngPath: '3d/avatar-png/clerigo.png',
    portraitType: 'cleric'
  },
  {
    id: 'inventor',
    name: 'Inventor',
    archetype: 'Inventor',
    storagePath: '3d/skeleto-v1.glb',
    pngPath: '3d/avatar-png/inventor.png',
    portraitType: 'inventor'
  }
];

// Cache global em memória para GLTF e URLs
const gltfGlobalCache = new Map<string, any>();
const downloadUrlCache = new Map<string, string>();

interface CharacterSelectionScreen3DProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onExit: () => void;
}

export const CharacterSelectionScreen3D: React.FC<CharacterSelectionScreen3DProps> = ({
  data,
  onChange,
  onNext,
  onExit
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

  // Identifica o slot selecionado atualmente
  const selectedSlotIndex = useMemo(() => {
    const idx = FIXED_4_CHARACTERS.findIndex(
      (c) => c.id === data.avatarId || c.storagePath === data.avatarModelPath
    );
    return idx >= 0 ? idx : 0; // Default no primeiro slot (Guerreiro)
  }, [data.avatarId, data.avatarModelPath]);

  const activeCharacter = FIXED_4_CHARACTERS[selectedSlotIndex];

  // Estado de controle e carregamento do modelo 3D
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState<number>(0);
  const [showNamePrompt, setShowNamePrompt] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(data.name || '');
  const [pngUrls, setPngUrls] = useState<Record<string, string>>({});

  // 1. Obter URL oficial e autenticada do Firebase Storage SDK via getDownloadURL() com fallback resiliente
  const resolveStorageUrl = useCallback(async (path: string): Promise<string> => {
    return resolveStorageUrlWithFallback(path);
  }, []);

  // Precarregar miniaturas PNG de cada personagem
  useEffect(() => {
    let isMounted = true;
    FIXED_4_CHARACTERS.forEach(async (char) => {
      try {
        const url = await resolveStorageUrl(char.pngPath);
        if (isMounted) {
          setPngUrls((prev) => ({ ...prev, [char.id]: url }));
          const currentId = data.avatarId || 'guerreiro';
          if (char.id === currentId && (!data.imageUrl || data.imageUrl.includes('.glb') || data.imageUrl === '')) {
            onChange({ imageUrl: url, avatarId: char.id, avatarModelPath: char.storagePath });
          }
        }
      } catch (err) {
        // Fallback silencioso sem travar o app
      }
    });
    return () => {
      isMounted = false;
    };
  }, [resolveStorageUrl, data.avatarId, data.imageUrl, onChange]);

  // 2. Inicializar Cena Three.js (Transparente para integrar com o fundo da Catedral)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // A. Cena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // B. Câmera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 1.25, 3.2);
    cameraRef.current = camera;

    // C. Renderer com Alpha Transparente
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
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // D. OrbitControls (360° horizontal livre, zoom suave, centralizado)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false; // Mantém o personagem rigorosamente centralizado na plataforma
    controls.enableZoom = true;
    controls.minDistance = 1.2;
    controls.maxDistance = 5.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.04; // Não desce abaixo da plataforma
    controls.minPolarAngle = 0.15;
    controls.target.set(0, 0.95, 0);
    controls.update();
    controlsRef.current = controls;

    // E. Iluminação Cinemática da Catedral
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.95);
    scene.add(ambientLight);

    // Tocha Esquerda (Luz Quente Âmbar)
    const leftTorch = new THREE.PointLight(0xff9933, 2.5, 8);
    leftTorch.position.set(-2.8, 1.8, 1.2);
    scene.add(leftTorch);

    // Tocha Direita (Luz Quente Dourada)
    const rightTorch = new THREE.PointLight(0xffaa44, 2.5, 8);
    rightTorch.position.set(2.8, 1.8, 1.2);
    scene.add(rightTorch);

    // Key Light Superior (Luz Solar da Rosácea)
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.4);
    keyLight.position.set(0.5, 4.0, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Rim Light (Destaque de Silhueta Traseiro)
    const rimLight = new THREE.DirectionalLight(0xe5c276, 2.0);
    rimLight.position.set(0, 3.2, -3.0);
    scene.add(rimLight);

    // F. Grupo Mestre do Modelo
    const modelGroup = new THREE.Group();
    modelGroup.name = 'master_character_model';
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // G. Plataforma Circular Medieval de Pedra com Anéis Dourados (Idêntica à Imagem)
    const daisGroup = new THREE.Group();

    // Base de Pedra Escura Chanfrada
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.12, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x18161e,
      roughness: 0.7,
      metalness: 0.3
    });
    const daisBase = new THREE.Mesh(baseGeo, baseMat);
    daisBase.position.y = -0.06;
    daisBase.receiveShadow = true;
    daisGroup.add(daisBase);

    // Degrau Superior
    const stepGeo = new THREE.CylinderGeometry(1.08, 1.15, 0.08, 64);
    const stepMat = new THREE.MeshStandardMaterial({
      color: 0x221f2a,
      roughness: 0.6,
      metalness: 0.35
    });
    const daisStep = new THREE.Mesh(stepGeo, stepMat);
    daisStep.position.y = 0.02;
    daisStep.receiveShadow = true;
    daisGroup.add(daisStep);

    // Anel Dourado Rúnico Externo
    const outerRingGeo = new THREE.RingGeometry(0.98, 1.05, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd69e2e,
      roughness: 0.3,
      metalness: 0.85,
      side: THREE.DoubleSide
    });
    const outerRing = new THREE.Mesh(outerRingGeo, goldMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.061;
    outerRing.receiveShadow = true;
    daisGroup.add(outerRing);

    // Anel Dourado Rúnico Médio
    const midRingGeo = new THREE.RingGeometry(0.72, 0.76, 64);
    const midRing = new THREE.Mesh(midRingGeo, goldMat);
    midRing.rotation.x = -Math.PI / 2;
    midRing.position.y = 0.0615;
    midRing.receiveShadow = true;
    daisGroup.add(midRing);

    // Anel Dourado Rúnico Interno
    const innerRingGeo = new THREE.RingGeometry(0.42, 0.45, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, goldMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.062;
    innerRing.receiveShadow = true;
    daisGroup.add(innerRing);

    // Sombra de Contato Suave
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.063;
    shadowPlane.receiveShadow = true;
    daisGroup.add(shadowPlane);

    scene.add(daisGroup);

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

  // 3. Carregamento e Enquadramento do Modelo 3D
  const currentModelPath = activeCharacter.storagePath;
  useEffect(() => {
    let isCancelled = false;

    const loadModel = async () => {
      if (!modelGroupRef.current || !cameraRef.current || !controlsRef.current) return;
      const modelGroup = modelGroupRef.current;

      setIsLoading(true);
      setLoadError(null);

      // Limpa meshes anteriores
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
        } catch (storageErr) {
          // Arquivo ainda não subido no bucket ou inacessível
        }

        if (isCancelled) return;

        let loadedScene: THREE.Group | null = null;

        if (modelUrl) {
          if (gltfGlobalCache.has(currentModelPath)) {
            const cachedGltf = gltfGlobalCache.get(currentModelPath);
            loadedScene = cloneGLTFScene(cachedGltf.scene);
          } else {
            const gltf = await loadGLTFModel(modelUrl).catch((err) => {
              console.warn('Erro ao carregar modelo GLTF:', err);
              return null;
            });
            if (isCancelled) return;
            if (gltf && gltf.scene) {
              gltfGlobalCache.set(currentModelPath, gltf);
              loadedScene = cloneGLTFScene(gltf.scene);
            }
          }
        }

        // Fallback gracioso: Estátua dourada heróica caso o arquivo GLB ainda não esteja no Storage
        if (!loadedScene) {
          loadedScene = createProceduralHeroStatue(activeCharacter?.archetype || 'Guerreiro');
        }

        if (!loadedScene || isCancelled) return;

        loadedScene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Centralização Automática por Bounding Box sobre a plataforma
        const box = new THREE.Box3().setFromObject(loadedScene);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // Pés em Y = 0.06 (superfície do pedestal)
        loadedScene.position.x = -center.x;
        loadedScene.position.y = -box.min.y + 0.06;
        loadedScene.position.z = -center.z;

        modelGroup.add(loadedScene);

        // Ajuste da Câmera para Apresentação Cinematográfica de Corpo Inteiro
        const maxDim = Math.max(size.x, size.y, size.z) || 1.8;
        const targetHeight = size.y * 0.52 || 1.0;

        if (controlsRef.current && cameraRef.current) {
          const controls = controlsRef.current;
          const camera = cameraRef.current;

          controls.target.set(0, targetHeight, 0);
          controls.minDistance = Math.max(maxDim * 0.7, 0.8);
          controls.maxDistance = Math.max(maxDim * 3.8, 4.0);

          camera.position.set(0, targetHeight * 1.05, maxDim * 1.75);
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

  // Manipulador ao tocar em um dos 4 slots
  const handleSelectSlot = async (character: FixedCharacterSlot) => {
    const existingPngUrl = pngUrls[character.id];
    // Atualiza imediatamente o avatarId e avatarModelPath para feedback instantâneo na UI e na etapa 13
    onChange({
      avatarType: '3d',
      avatarId: character.id,
      avatarModelPath: character.storagePath,
      imageUrl: existingPngUrl || character.pngPath
    });

    try {
      const pngUrl = existingPngUrl || (await resolveStorageUrl(character.pngPath).catch(() => ''));
      if (pngUrl) {
        setPngUrls((prev) => ({ ...prev, [character.id]: pngUrl }));
        onChange({
          avatarType: '3d',
          avatarId: character.id,
          avatarModelPath: character.storagePath,
          imageUrl: pngUrl
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar miniatura do slot:', err);
    }
  };

  // Controles de câmera
  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 1.25, 3.2);
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

  // Avançar para a próxima etapa (Criação de Personagem — Etapa 1/13 — Identidade do Herói)
  const handleProceed = () => {
    if (data.name && data.name.trim()) {
      onNext();
    } else {
      setTempName('');
      setShowNamePrompt(true);
    }
  };

  const handleConfirmName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onChange({ name: tempName.trim() });
      setShowNamePrompt(false);
      onNext();
    }
  };

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#07060a] text-amber-100 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. FUNDO CINEMATOGRÁFICO: CATEDRAL GÓTICA MEDIEVAL, COLUNAS, BANDEIRAS E TOCHAS */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Camada 1: Gradiente Profundo de Pedra e Névoa */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0910] via-[#0e0c15] to-[#060508]" />

        {/* Camada 2: Rosácea / Grande Janela Gótica ao Fundo com Luz Difusa */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[280px] sm:w-[380px] h-[340px] sm:h-[460px] opacity-25">
          <svg viewBox="0 0 200 280" className="w-full h-full text-amber-500/30 stroke-current fill-none">
            {/* Arco Ogival Alto */}
            <path
              d="M 10,280 L 10,120 A 90,90 0 0,1 100,20 A 90,90 0 0,1 190,120 L 190,280"
              strokeWidth="2.5"
            />
            {/* Moldura Interna */}
            <path
              d="M 25,280 L 25,125 A 75,75 0 0,1 100,38 A 75,75 0 0,1 175,125 L 175,280"
              strokeWidth="1.5"
            />
            {/* Rosácea Central */}
            <circle cx="100" cy="100" r="45" strokeWidth="2" />
            <circle cx="100" cy="100" r="30" strokeWidth="1" />
            <circle cx="100" cy="100" r="15" strokeWidth="1" />
            {/* Raios da Rosácea */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="100"
                y1="100"
                x2={100 + 45 * Math.cos((deg * Math.PI) / 180)}
                y2={100 + 45 * Math.sin((deg * Math.PI) / 180)}
                strokeWidth="1"
              />
            ))}
            {/* Nervuras Verticais */}
            <line x1="60" y1="135" x2="60" y2="280" strokeWidth="1.5" />
            <line x1="100" y1="145" x2="100" y2="280" strokeWidth="1.5" />
            <line x1="140" y1="135" x2="140" y2="280" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Brilho Suave da Rosácea */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-500/10 blur-[90px]" />

        {/* Camada 3: Colunas Maciças de Pedra nas Laterais */}
        {/* Coluna Esquerda */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-black via-[#14121a] to-transparent border-r border-amber-950/20" />
        {/* Coluna Direita */}
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-black via-[#14121a] to-transparent border-l border-amber-950/20" />

        {/* Camada 4: Bandeiras Carmesim com Sol Dourado (Laterais da Catedral) */}
        {/* Bandeira Esquerda */}
        <div className="absolute top-[16%] left-2 sm:left-6 w-10 sm:w-16 h-48 sm:h-72 bg-gradient-to-b from-[#4a0d14] via-[#35090f] to-[#1e0508] border border-amber-500/30 rounded-b shadow-[0_10px_25px_rgba(0,0,0,0.9)] flex flex-col items-center pt-4 sm:pt-6 opacity-85">
          <svg viewBox="0 0 100 100" className="w-6 sm:w-10 h-6 sm:h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.7)] fill-amber-400">
            {/* Sol Radiante Dourado */}
            <circle cx="50" cy="50" r="16" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <polygon
                key={deg}
                points="50,15 46,40 54,40"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
          </svg>
        </div>

        {/* Bandeira Direita */}
        <div className="absolute top-[16%] right-2 sm:right-6 w-10 sm:w-16 h-48 sm:h-72 bg-gradient-to-b from-[#4a0d14] via-[#35090f] to-[#1e0508] border border-amber-500/30 rounded-b shadow-[0_10px_25px_rgba(0,0,0,0.9)] flex flex-col items-center pt-4 sm:pt-6 opacity-85">
          <svg viewBox="0 0 100 100" className="w-6 sm:w-10 h-6 sm:h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.7)] fill-amber-400">
            {/* Sol Radiante Dourado */}
            <circle cx="50" cy="50" r="16" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <polygon
                key={deg}
                points="50,15 46,40 54,40"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
          </svg>
        </div>

        {/* Camada 5: Tochas e Brilhos Quentes nas Colunas */}
        {/* Tocha Esquerda */}
        <div className="absolute top-[44%] left-3 sm:left-9 w-6 h-6 rounded-full bg-amber-500 blur-sm animate-pulse shadow-[0_0_35px_rgba(245,158,11,0.9)]" />
        <div className="absolute top-[44%] left-0 w-24 h-48 bg-amber-500/15 blur-[50px]" />

        {/* Tocha Direita */}
        <div className="absolute top-[44%] right-3 sm:right-9 w-6 h-6 rounded-full bg-amber-500 blur-sm animate-pulse shadow-[0_0_35px_rgba(245,158,11,0.9)]" />
        <div className="absolute top-[44%] right-0 w-24 h-48 bg-amber-500/15 blur-[50px]" />

        {/* Piso de Pedra Escura Sombrio no Fundo */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black via-stone-950/90 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TÍTULO NO TOPO (IDÊNTICO À IMAGEM DE REFERÊNCIA) */}
      {/* ========================================================================= */}
      <header className="relative z-20 pt-6 sm:pt-8 px-4 flex flex-col items-center text-center shrink-0">
        {/* Botão Discreto de Sair no Canto Superior Esquerdo */}
        <button
          type="button"
          onClick={onExit}
          className="absolute left-4 top-6 p-2 rounded-full bg-black/40 hover:bg-black/70 border border-amber-900/40 text-amber-200/80 hover:text-amber-100 transition-colors cursor-pointer"
          title="Voltar ao início"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Ornamento em Estrela-Bússola Dourada Superior */}
        <div className="mb-1 text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse">
          <svg viewBox="0 0 64 64" className="w-7 h-7 sm:w-8 sm:h-8 fill-current">
            {/* Estrela de 8 Pontas com Círculo Central */}
            <circle cx="32" cy="32" r="5" className="fill-amber-100" />
            <polygon points="32,2 29,26 32,22 35,26" />
            <polygon points="32,62 29,38 32,42 35,38" />
            <polygon points="2,32 26,29 22,32 26,35" />
            <polygon points="62,32 38,29 42,32 38,35" />
            {/* Pontas Diagonais */}
            <polygon points="11,11 27,25 24,28 25,24" />
            <polygon points="53,11 37,25 40,28 39,24" />
            <polygon points="11,53 27,39 24,36 25,40" />
            <polygon points="53,53 37,39 40,36 39,40" />
          </svg>
        </div>

        {/* Título Principal em 2 Linhas: SELEÇÃO DE / PERSONAGENS */}
        <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-extrabold tracking-[0.18em] leading-tight uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
          SELEÇÃO DE
        </h1>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.22em] leading-tight uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] mt-0.5">
          PERSONAGENS
        </h2>

        {/* Divisor Dourado com Diamante Central */}
        <div className="flex items-center gap-2 mt-1 opacity-80">
          <div className="w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-500" />
          <span className="text-[10px] text-amber-400">◇</span>
          <div className="w-8 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-500" />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. VISUALIZADOR 3D CENTRAL (PLATAFORMA E PERSONAGEM CORPO INTEIRO) */}
      {/* ========================================================================= */}
      <div 
        ref={containerRef}
        className="relative z-10 flex-1 w-full max-w-lg mx-auto flex items-center justify-center overflow-hidden touch-none select-none"
      >
        {/* Canvas WebGL Three.js */}
        <canvas 
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none block"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-5 h-5 absolute inset-0 m-auto text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-amber-300 font-cinzel tracking-widest font-bold drop-shadow">
              Invocando Herói...
            </p>
          </div>
        )}

        {/* Error Overlay */}
        {loadError && (
          <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center p-4 text-center space-y-2">
            <ShieldAlert className="w-7 h-7 text-red-400 animate-pulse" />
            <p className="text-xs font-bold text-red-300">{loadError}</p>
            <button
              type="button"
              onClick={() => setRetryCounter((c) => c + 1)}
              className="px-3 py-1.5 rounded-lg bg-amber-600/40 border border-amber-500/60 text-amber-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}

        {/* Floating Quick Controls (Zoom / Reset) */}
        <div className="absolute top-2 right-3 z-20 flex flex-col gap-1.5 bg-black/50 backdrop-blur-md border border-amber-900/40 p-1 rounded-xl shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Aproximar Câmera"
            className="p-1.5 text-stone-300 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Afastar Câmera"
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
      </div>

      {/* ========================================================================= */}
      {/* 4. OS QUATRO PERSONAGENS NA PARTE INFERIOR (MOLDURAS DOURADAS IDÊNTICAS) */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-lg mx-auto pb-5 sm:pb-6 px-3 sm:px-4 flex flex-col items-center shrink-0 space-y-3">
        {/* Indicador em Diamante Dourado Central sobre o Slot Ativo */}
        <div className="w-full flex justify-around px-2">
          {FIXED_4_CHARACTERS.map((char, index) => (
            <div key={char.id} className="flex-1 flex justify-center">
              {index === selectedSlotIndex ? (
                <div className="text-amber-300 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-bounce">
                  ◆
                </div>
              ) : (
                <div className="h-4" />
              )}
            </div>
          ))}
        </div>

        {/* Grade com os 4 Slots Fixos */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full">
          {FIXED_4_CHARACTERS.map((character, index) => {
            const isSelected = index === selectedSlotIndex;

            return (
              <button
                key={character.id}
                type="button"
                onClick={() => handleSelectSlot(character)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300 flex flex-col items-center justify-center group cursor-pointer ${
                  isSelected
                    ? 'border-2 border-amber-300 ring-2 ring-amber-400/90 shadow-[0_0_22px_rgba(251,191,36,0.7)] scale-105 z-10'
                    : 'border border-amber-900/60 bg-stone-950/80 opacity-70 hover:opacity-100 hover:border-amber-600/80 hover:scale-102'
                }`}
              >
                {/* Retrato / Miniatura PNG Oficial do Arquétipo */}
                <div className="w-full h-full relative bg-stone-950 flex items-center justify-center overflow-hidden">
                  {pngUrls[character.id] ? (
                    <img
                      src={pngUrls[character.id]}
                      alt={character.name}
                      className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
                      loading="eager"
                    />
                  ) : (
                    <CharacterSlotPortrait type={character.portraitType} isSelected={isSelected} />
                  )}

                  {/* Moldura Dourada Clássica com Cantos Decorados */}
                  <div className="absolute inset-0 pointer-events-none border border-amber-400/30">
                    {/* Cantos Dourados */}
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-amber-400" />
                  </div>

                  {/* Nome sutil na base do slot */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent py-0.5 text-center pointer-events-none">
                    <span className={`text-[9px] sm:text-[10px] font-cinzel font-bold tracking-wider uppercase block truncate px-1 ${
                      isSelected ? 'text-amber-200' : 'text-stone-300'
                    }`}>
                      {character.name}
                    </span>
                  </div>

                  {/* Brilho Dourado de Seleção Ativa */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-amber-400/10 pointer-events-none" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Campo: NOME DO HERÓI */}
        <div className="w-full space-y-1 text-left">
          <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 font-cinzel block">
            Nome do Herói
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Digite o nome do seu personagem"
            maxLength={50}
            className="w-full bg-[#0a0910]/95 border border-amber-900/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 font-cinzel transition-all shadow-inner outline-none"
          />
        </div>

        {/* Barra de Ação / Avançar para a Próxima Etapa */}
        <div className="w-full flex items-center justify-between gap-3 pt-0.5">
          {/* Arquétipo Escolhido */}
          <div className="min-w-0 flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-900/40 backdrop-blur-md flex items-center justify-between">
            <div className="truncate text-left">
              <span className="text-[10px] text-stone-400 block leading-tight">ARQUÉTIPO</span>
              <span className="text-xs sm:text-sm font-cinzel font-bold text-amber-200 truncate block">
                {activeCharacter.name}
              </span>
            </div>
          </div>

          {/* Botão de Continuar / PRÓXIMO */}
          <button
            type="button"
            onClick={handleProceed}
            className="px-6 sm:px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-cinzel font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 5. MODAL DE NOME DO PERSONAGEM (SE AINDA NÃO DEFINIDO AO AVANÇAR) */}
      {/* ========================================================================= */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#16131f] to-[#0d0b13] border-2 border-amber-500/80 rounded-2xl p-5 shadow-[0_0_30px_rgba(217,119,6,0.5)] space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-amber-200 uppercase tracking-wide">
                Consagre seu Herói
              </h3>
              <p className="text-xs text-stone-300">
                Informe o nome pelo qual seu aventureiro será temido e louvado em Arton.
              </p>
            </div>

            <form onSubmit={handleConfirmName} className="space-y-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Ex: Roland de Valkaria..."
                autoFocus
                maxLength={50}
                className="w-full bg-stone-950 border-2 border-amber-700/60 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-cinzel font-bold text-base shadow-inner text-center"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNamePrompt(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!tempName.trim()}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-all shadow-md"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// RETRATOS DOS 4 ARQUÉTIPOS (REPRODUZINDO OS 4 SLOTS DA IMAGEM DE REFERÊNCIA)
// =========================================================================
interface SlotPortraitProps {
  type: 'warrior' | 'mage' | 'cleric' | 'inventor';
  isSelected: boolean;
}

export const CharacterSlotPortrait: React.FC<SlotPortraitProps> = ({ type, isSelected }) => {
  if (type === 'warrior') {
    // Slot 1: Guerreiro (Cabelo escuro, barba cheia, armadura de aço com manto de pele)
    return (
      <svg viewBox="0 0 100 133" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="warriorBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a141b" />
            <stop offset="100%" stopColor="#08070a" />
          </linearGradient>
          <linearGradient id="armorSteel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a828e" />
            <stop offset="50%" stopColor="#484f5b" />
            <stop offset="100%" stopColor="#252932" />
          </linearGradient>
        </defs>
        <rect width="100" height="133" fill="url(#warriorBg)" />
        {/* Ombros e Armadura com Peles */}
        <path d="M 5,133 Q 20,80 50,85 Q 80,80 95,133 Z" fill="url(#armorSteel)" stroke="#9ca3af" strokeWidth="0.8" />
        <path d="M 0,133 Q 25,75 50,80 Q 75,75 100,133" fill="#3a2f26" opacity="0.9" />
        {/* Rosto & Barba */}
        <circle cx="50" cy="50" r="22" fill="#caa185" />
        {/* Cabelo Escuro Volumoso */}
        <path d="M 28,45 Q 30,22 50,22 Q 70,22 72,45 Q 75,65 68,75 Q 50,78 32,75 Z" fill="#1c1616" />
        <path d="M 32,35 Q 50,24 68,35 Q 74,48 70,62 Q 62,72 50,72 Q 38,72 30,62 Z" fill="#2a2020" />
        {/* Olhos e Traços */}
        <ellipse cx="44" cy="46" rx="2.5" ry="1.5" fill="#111" />
        <ellipse cx="56" cy="46" rx="2.5" ry="1.5" fill="#111" />
        <path d="M 40,43 L 48,45" stroke="#1c1616" strokeWidth="1.2" />
        <path d="M 52,45 L 60,43" stroke="#1c1616" strokeWidth="1.2" />
        {/* Barba Cheia e Bigode */}
        <path d="M 38,55 Q 50,75 62,55 Q 64,68 50,72 Q 36,68 38,55 Z" fill="#1c1616" />
        <path d="M 43,54 Q 50,58 57,54" stroke="#1c1616" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (type === 'mage') {
    // Slot 2: Mago / Arcanista (Capuz escuro, barba branca, poder arcano azul faiscante)
    return (
      <svg viewBox="0 0 100 133" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="mageBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0c1326" />
            <stop offset="100%" stopColor="#04060d" />
          </linearGradient>
          <radialGradient id="arcaneGlow" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="133" fill="url(#mageBg)" />
        {/* Brilho Arcano Azul Inferior */}
        <rect width="100" height="133" fill="url(#arcaneGlow)" />
        {/* Manto Escuro com Capuz Pontudo */}
        <path d="M 8,133 Q 25,65 50,22 Q 75,65 92,133 Z" fill="#151b2e" stroke="#2563eb" strokeWidth="0.8" />
        {/* Sombra Interior do Capuz */}
        <path d="M 28,52 Q 50,30 72,52 Q 70,82 50,85 Q 30,82 28,52 Z" fill="#080a12" />
        {/* Rosto Sombrio */}
        <ellipse cx="50" cy="54" rx="14" ry="16" fill="#8f7a6a" />
        {/* Olhos Brilhantes */}
        <circle cx="44" cy="50" r="1.8" fill="#93c5fd" />
        <circle cx="56" cy="50" r="1.8" fill="#93c5fd" />
        {/* Barba Longa e Bigode Brancos */}
        <path d="M 38,58 Q 50,96 62,58 Q 58,82 50,86 Q 42,82 38,58 Z" fill="#e2e8f0" />
        {/* Raio Arcano nas Mãos */}
        <circle cx="50" cy="115" r="10" fill="#38bdf8" opacity="0.8" />
        <circle cx="50" cy="115" r="5" fill="#ffffff" />
      </svg>
    );
  }

  if (type === 'cleric') {
    // Slot 3: Clérigo (Cabelo prateado, auréola de sol dourado, vestes brancas e correias)
    return (
      <svg viewBox="0 0 100 133" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="clericBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#25201d" />
            <stop offset="100%" stopColor="#0d0a09" />
          </linearGradient>
          <linearGradient id="whiteRobes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <rect width="100" height="133" fill="url(#clericBg)" />
        {/* Auréola de Raios de Sol Dourada na Cabeça */}
        <g stroke="#eab308" strokeWidth="1.2" opacity="0.9">
          <circle cx="50" cy="40" r="24" fill="none" strokeWidth="0.8" strokeDasharray="3 2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="50"
              y1="40"
              x2={50 + 28 * Math.cos((deg * Math.PI) / 180)}
              y2={40 + 28 * Math.sin((deg * Math.PI) / 180)}
            />
          ))}
        </g>
        {/* Vestes Brancas e Correias Douradas */}
        <path d="M 8,133 Q 25,75 50,78 Q 75,75 92,133 Z" fill="url(#whiteRobes)" />
        <path d="M 28,95 L 72,120" stroke="#78350f" strokeWidth="3.5" />
        <circle cx="50" cy="108" r="4.5" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
        {/* Rosto Nobre */}
        <ellipse cx="50" cy="50" rx="16" ry="19" fill="#d8b49e" />
        {/* Cabelo Prateado/Loiro Claro */}
        <path d="M 30,42 Q 32,22 50,22 Q 68,22 70,42 Q 74,62 66,70 Q 50,68 34,70 Z" fill="#e2e8f0" />
        {/* Olhos e Sobrancelhas */}
        <ellipse cx="44" cy="48" rx="2" ry="1.4" fill="#2d3748" />
        <ellipse cx="56" cy="48" rx="2" ry="1.4" fill="#2d3748" />
        <path d="M 40,44 L 48,46" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M 52,46 L 60,44" stroke="#94a3b8" strokeWidth="1.5" />
      </svg>
    );
  }

  // Slot 4: Inventor (Engrenagens, monóculo de latão, couro e vapor)
  return (
    <svg viewBox="0 0 100 133" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="inventorBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#241a12" />
          <stop offset="100%" stopColor="#0d0906" />
        </linearGradient>
      </defs>
      <rect width="100" height="133" fill="url(#inventorBg)" />
      {/* Engrenagens de latão ao fundo */}
      <circle cx="50" cy="35" r="28" fill="none" stroke="#ca8a04" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
      {/* Colete de Couro e Camisa */}
      <path d="M 10,133 Q 30,78 50,80 Q 70,78 90,133 Z" fill="#451a03" stroke="#78350f" strokeWidth="1" />
      <path d="M 30,90 L 70,90" stroke="#ca8a04" strokeWidth="2" />
      {/* Rosto */}
      <ellipse cx="50" cy="50" rx="15" ry="18" fill="#e8c2a8" />
      {/* Óculos de Proteção / Monóculo */}
      <circle cx="44" cy="48" r="5" fill="#0284c7" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="56" cy="48" r="5" fill="#1e293b" stroke="#ca8a04" strokeWidth="1.5" />
      <line x1="49" y1="48" x2="51" y2="48" stroke="#ca8a04" strokeWidth="2" />
      {/* Cabelo e Bigode Engenhoso */}
      <path d="M 34,40 Q 38,22 50,22 Q 62,22 66,40 Z" fill="#52525b" />
      <path d="M 42,58 Q 50,62 58,58" stroke="#52525b" strokeWidth="2.5" fill="none" />
    </svg>
  );
};

// =========================================================================
// AVATAR PROCEDURAL EM CASO DE RECURSO 3D AINDA NÃO DISPONÍVEL NO STORAGE
// =========================================================================
function createProceduralHeroStatue(archetype: string): THREE.Group {
  const group = new THREE.Group();

  const isMage = archetype.toLowerCase().includes('arc') || archetype.toLowerCase().includes('mago');
  const isCleric = archetype.toLowerCase().includes('clér') || archetype.toLowerCase().includes('cler');
  const isInventor = archetype.toLowerCase().includes('inv');

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
