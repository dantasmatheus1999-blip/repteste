import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Camera, 
  Maximize2, 
  Sun, 
  Layers, 
  Sparkles, 
  Activity, 
  User, 
  Eye, 
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  GenderType, 
  ViewMode, 
  SKIN_TONES, 
  EYE_COLORS, 
  BODY_PRESETS, 
  ASSET_LICENSES 
} from '../../data/makehuman/presets';
import { 
  HAIR_STYLES, 
  HAIR_COLORS, 
  FACIAL_HAIR_OPTIONS 
} from '../../data/makehuman/hairstyles';
import { 
  loadMakeHumanGLTF, 
  loadMakeHumanTexture, 
  disposeClonedHierarchy 
} from '../../services/makehuman/makeHumanAssetCache';

export interface CharacterViewerProps {
  gender: GenderType;
  hairStyleId: string;
  hairColorId: string;
  skinToneId: string;
  eyeColorId: string;
  facialHairId: string;
  bodyPresetId: string;
  viewMode: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export const CharacterViewer3D: React.FC<CharacterViewerProps> = ({
  gender,
  hairStyleId,
  hairColorId,
  skinToneId,
  eyeColorId,
  facialHairId,
  bodyPresetId,
  viewMode,
  onViewModeChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Model object references
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const bodyMeshRef = useRef<THREE.Group | null>(null);
  const headMeshRef = useRef<THREE.Group | null>(null);
  const hairGroupRef = useRef<THREE.Group | null>(null);

  // Cached textures & GLTF models
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const gltfCacheRef = useRef<Map<string, any>>(new Map());

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isBaseLoaded, setIsBaseLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Inicializando Three.js...');
  const [fps, setFps] = useState(60);
  const [trianglesCount, setTrianglesCount] = useState(0);
  const [drawCallsCount, setDrawCallsCount] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [lightingMode, setLightingMode] = useState<'cinematic' | 'studio' | 'neutral'>('cinematic');
  const [showTechInfo, setShowTechInfo] = useState(false);

  // Helper to load texture with cache
  const loadTexture = useCallback((path: string): Promise<THREE.Texture> => {
    if (textureCacheRef.current.has(path)) {
      return Promise.resolve(textureCacheRef.current.get(path)!);
    }
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        path,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.flipY = false;
          textureCacheRef.current.set(path, tex);
          resolve(tex);
        },
        undefined,
        () => {
          // Fallback texture
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, 64, 64);
          }
          const fbTex = new THREE.CanvasTexture(canvas);
          resolve(fbTex);
        }
      );
    });
  }, []);

  // Update camera position based on viewMode
  const updateCameraTarget = useCallback((mode: ViewMode, animate: boolean = true) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    let targetPos = new THREE.Vector3(0, 1.0, 2.5);
    let lookTarget = new THREE.Vector3(0, 1.0, 0);

    if (mode === 'face') {
      // Close up on Head / Eyes (Vitruvian head is at Y ≈ 1.70m)
      targetPos = new THREE.Vector3(0, 1.70, 0.65);
      lookTarget = new THREE.Vector3(0, 1.68, 0);
    } else if (mode === 'torso') {
      targetPos = new THREE.Vector3(0, 1.35, 1.4);
      lookTarget = new THREE.Vector3(0, 1.30, 0);
    } else {
      // Full Body
      targetPos = new THREE.Vector3(0, 0.95, 2.6);
      lookTarget = new THREE.Vector3(0, 0.95, 0);
    }

    if (!animate) {
      camera.position.copy(targetPos);
      controls.target.copy(lookTarget);
      controls.update();
    } else {
      // Smooth interpolation
      const startCamPos = camera.position.clone();
      const startTarget = controls.target.clone();
      const startTime = performance.now();
      const duration = 650; // ms

      const step = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        // EaseInOutCubic
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(startCamPos, targetPos, ease);
        controls.target.lerpVectors(startTarget, lookTarget, ease);
        controls.update();

        if (progress < 1.0) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  }, []);

  // Setup Three.js Scene, Renderer and Lighting
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a090f);
    scene.fog = new THREE.FogExp2(0x0a090f, 0.18);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.95, 2.6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.45;
    controls.maxDistance = 5.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go below floor
    controls.target.set(0, 0.95, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig (Cinematic 3-Point Lighting)
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.65);
    ambientLight.name = 'ambient_light';
    scene.add(ambientLight);

    // Key Light (Warm golden sunlight)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(1.8, 3.2, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 8;
    keyLight.shadow.camera.left = -1.2;
    keyLight.shadow.camera.right = 1.2;
    keyLight.shadow.camera.top = 2.2;
    keyLight.shadow.camera.bottom = -0.2;
    keyLight.shadow.bias = -0.0005;
    keyLight.name = 'key_light';
    scene.add(keyLight);

    // Fill Light (Cool bluish soft shadow fill)
    const fillLight = new THREE.DirectionalLight(0x7ca8df, 0.95);
    fillLight.position.set(-2.2, 1.8, 1.5);
    fillLight.name = 'fill_light';
    scene.add(fillLight);

    // Rim Light (Sharp back highlight for character silhouette)
    const rimLight = new THREE.DirectionalLight(0xe4c37e, 1.8);
    rimLight.position.set(0.0, 2.6, -2.4);
    rimLight.name = 'rim_light';
    scene.add(rimLight);

    // Subtle Eye Specular Light (Soft reflection on iris)
    const eyeCatchLight = new THREE.PointLight(0xffffff, 0.8, 2.5);
    eyeCatchLight.position.set(0, 1.72, 0.9);
    eyeCatchLight.name = 'eye_catch_light';
    scene.add(eyeCatchLight);

    // 6. Character Master Group
    const charGroup = new THREE.Group();
    charGroup.name = 'makehuman_character_master';
    scene.add(charGroup);
    characterGroupRef.current = charGroup;

    // 7. Pedestal & Floor (Dark cinematic circular stage with subtle runes)
    const pedestalGeo = new THREE.CylinderGeometry(1.1, 1.2, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x14121a,
      roughness: 0.65,
      metalness: 0.35
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Golden Rune Ring
    const ringGeo = new THREE.RingGeometry(0.98, 1.04, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.25,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    ring.receiveShadow = true;
    scene.add(ring);

    // Ground Shadow Catcher Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 8. Animation & Render Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;

    const animate = (time: number) => {
      reqIdRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // FPS tracking
      frameCount++;
      fpsTimer += delta;
      if (fpsTimer >= 0.5) {
        setFps(Math.round(frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;

        if (rendererRef.current) {
          setTrianglesCount(rendererRef.current.info.render.triangles);
          setDrawCallsCount(rendererRef.current.info.render.calls);
        }
      }

      // Auto rotation
      if (autoRotate && charGroup) {
        charGroup.rotation.y += delta * 0.4;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // 9. Resize Observer
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
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [autoRotate]);

  // Load Base Character Models (Body + Head)
  useEffect(() => {
    let isCancelled = false;

    const loadCharacter = async () => {
      if (!characterGroupRef.current) return;
      setIsLoading(true);
      setLoadingStep('Carregando modelo base MakeHuman / Vitruvian...');

      try {
        // 1. Texturas PBR da Cabeça e Corpo
        setLoadingStep('Carregando mapas PBR de textura facial e corporal...');
        const [
          bodyBc, bodyN, bodyRough,
          faceBc, faceN, faceRough,
          irisTex, scleraTex, mouthTex, lashTex
        ] = await Promise.all([
          loadMakeHumanTexture('/models/vitruvian/vit_body_bc.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_body_n.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_body_rough.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_face_bc.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_face_n.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_face_rough.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_iris.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_sclera.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_mouth.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_lash_atlas.png')
        ]);

        if (isCancelled) return;

        // Clean existing character group children
        const charGroup = characterGroupRef.current;
        while (charGroup.children.length > 0) {
          const child = charGroup.children[0];
          charGroup.remove(child);
          disposeClonedHierarchy(child);
        }

        // 2. Load Body GLB
        setLoadingStep('Instanciando geometria corporal (vitruvian_body.glb)...');
        const bodyGltf = await loadMakeHumanGLTF('/models/vitruvian/vitruvian_body.glb');

        if (isCancelled) return;

        const bodyScene = bodyGltf.scene.clone(true);
        bodyScene.name = 'makehuman_body';

        // Apply PBR Materials to Body
        bodyScene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const skinMat = new THREE.MeshStandardMaterial({
              map: bodyBc,
              normalMap: bodyN,
              roughnessMap: bodyRough,
              roughness: 0.62,
              metalness: 0.02,
              name: 'MakeHuman_Body_PBR'
            });
            child.material = skinMat;
          }
        });

        charGroup.add(bodyScene);
        bodyMeshRef.current = bodyScene;

        // 3. Load Head GLB
        setLoadingStep('Instanciando geometria facial e olhos (vitruvian_head.glb)...');
        const headGltf = await loadMakeHumanGLTF('/models/vitruvian/vitruvian_head.glb');

        if (isCancelled) return;

        const headScene = headGltf.scene.clone(true);
        headScene.name = 'makehuman_head';

        headScene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const mName = (child.name || '').toLowerCase();
            const matName = (child.material && !Array.isArray(child.material) ? child.material.name : '').toLowerCase();

            if (matName.includes('iris') || mName.includes('iris') || (mName.includes('eye') && matName.includes('iris'))) {
              // Iris Material
              child.material = new THREE.MeshStandardMaterial({
                map: irisTex,
                roughness: 0.15,
                metalness: 0.02,
                name: 'MakeHuman_Eye_Iris_PBR'
              });
            } else if (matName.includes('sclera') || mName.includes('sclera')) {
              // Sclera Material
              child.material = new THREE.MeshStandardMaterial({
                map: scleraTex,
                roughness: 0.12,
                metalness: 0.0,
                name: 'MakeHuman_Eye_Sclera_PBR'
              });
            } else if (matName.includes('cornea') || mName.includes('cornea')) {
              // Cornea Material
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                roughness: 0.03,
                transmission: 0.95,
                thickness: 0.015,
                transparent: true,
                opacity: 0.5,
                ior: 1.376,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                name: 'MakeHuman_Eye_Cornea_Physical'
              });
            } else if (matName.includes('mouth') || mName.includes('mouth') || matName.includes('teeth')) {
              // Mouth / Teeth Material
              child.material = new THREE.MeshStandardMaterial({
                map: mouthTex,
                roughness: 0.35,
                metalness: 0.05,
                name: 'MakeHuman_Mouth_PBR'
              });
            } else if (matName.includes('lash') || mName.includes('lash')) {
              // Eyelash Atlas
              child.material = new THREE.MeshStandardMaterial({
                map: lashTex,
                transparent: true,
                alphaTest: 0.3,
                roughness: 0.85,
                side: THREE.DoubleSide,
                name: 'MakeHuman_Lashes_PBR'
              });
            } else {
              // Main Face Skin Material
              child.material = new THREE.MeshStandardMaterial({
                map: faceBc,
                normalMap: faceN,
                roughnessMap: faceRough,
                roughness: 0.58,
                metalness: 0.02,
                name: 'MakeHuman_Face_PBR'
              });
            }
          }
        });

        charGroup.add(headScene);
        headMeshRef.current = headScene;

        // Position model centered on stage (Vitruvian feet at Y ≈ 0)
        charGroup.position.set(0, 0, 0);

        setLoadingStep('Personagem MakeHuman carregado com sucesso!');
        setIsBaseLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar modelo base:', err);
        setLoadingStep('Falha ao carregar modelo base MakeHuman.');
        setIsLoading(false);
      }
    };

    loadCharacter();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Load and Attach Modular Hair Layer
  useEffect(() => {
    let isCancelled = false;

    const loadHair = async () => {
      if (!characterGroupRef.current || !isBaseLoaded) return;
      const charGroup = characterGroupRef.current;

      const hairOption = HAIR_STYLES.find(h => h.id === hairStyleId);
      if (!hairOption || !hairOption.glbAsset || hairOption.id === 'none') {
        // Remove hair if set to Bald / None
        if (hairGroupRef.current) {
          charGroup.remove(hairGroupRef.current);
          disposeClonedHierarchy(hairGroupRef.current);
          hairGroupRef.current = null;
        }
        return;
      }

      try {
        const [hairDiff, hairNorm, hairOpac, hairAo, lashTex] = await Promise.all([
          loadMakeHumanTexture('/models/vitruvian/vit_hair_diffuse.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_hair_normal.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_hair_opacity.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_hair_ao.png'),
          loadMakeHumanTexture('/models/vitruvian/vit_lash_atlas.png')
        ]);

        if (isCancelled) return;

        // Load GLB with global single-flight cache to prevent duplicate fetches
        const hairGltf = await loadMakeHumanGLTF(hairOption.glbAsset);

        if (isCancelled) return;

        // Remove previous hair mesh cleanly before attaching new one
        if (hairGroupRef.current) {
          charGroup.remove(hairGroupRef.current);
          disposeClonedHierarchy(hairGroupRef.current);
          hairGroupRef.current = null;
        }

        const hairScene: THREE.Group = hairGltf.scene.clone(true);
        hairScene.name = 'makehuman_hair_layer';

        const activeHairColor = HAIR_COLORS.find(c => c.id === hairColorId);
        const hairColor = activeHairColor ? new THREE.Color(activeHairColor.threeColor) : new THREE.Color(0x3d2618);

        hairScene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const mName = (child.name || '').toLowerCase();
            if (mName.includes('brow')) {
              // Eyebrow Material
              child.material = new THREE.MeshStandardMaterial({
                map: lashTex,
                alphaMap: hairOpac,
                transparent: true,
                alphaTest: 0.22,
                roughness: 0.85,
                metalness: 0.02,
                color: hairColor,
                side: THREE.DoubleSide,
                name: 'MakeHuman_Eyebrow_PBR'
              });
            } else {
              // Main Hair Strands Material
              child.material = new THREE.MeshStandardMaterial({
                map: hairDiff,
                normalMap: hairNorm,
                alphaMap: hairOpac,
                aoMap: hairAo,
                transparent: true,
                alphaTest: 0.22,
                roughness: 0.72,
                metalness: 0.05,
                color: hairColor,
                side: THREE.DoubleSide,
                name: 'MakeHuman_Hair_PBR'
              });
            }
          }
        });

        if (isCancelled) {
          disposeClonedHierarchy(hairScene);
          return;
        }

        charGroup.add(hairScene);
        hairGroupRef.current = hairScene;
      } catch (err) {
        if (!isCancelled) {
          console.warn('Aviso ao carregar cabelo modular:', err);
        }
      }
    };

    loadHair();

    return () => {
      isCancelled = true;
    };
  }, [hairStyleId, isBaseLoaded]);

  // Apply Hair Color (Instant O(1) Material Update without Reloading Mesh)
  useEffect(() => {
    if (!hairGroupRef.current) return;
    const activeHairColor = HAIR_COLORS.find(c => c.id === hairColorId);
    const hairColor = activeHairColor ? new THREE.Color(activeHairColor.threeColor) : new THREE.Color(0x3d2618);

    hairGroupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => {
            if (m && m.color) {
              m.color.copy(hairColor);
              m.needsUpdate = true;
            }
          });
        } else if (child.material.color) {
          child.material.color.copy(hairColor);
          child.material.needsUpdate = true;
        }
      }
    });
  }, [hairColorId]);

  // Apply Skin Tone (Tint & Warmth Modulation)
  useEffect(() => {
    const skinTone = SKIN_TONES.find(s => s.id === skinToneId);
    if (!skinTone || !characterGroupRef.current) return;

    const toneColor = new THREE.Color(skinTone.threeColor);

    characterGroupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const matName = (mat.name || '').toLowerCase();

        if (matName.includes('face') || matName.includes('body')) {
          // Adjust skin color tint
          mat.color.copy(toneColor);
          mat.roughness = 0.55 + skinTone.warmth * 0.08;
          mat.needsUpdate = true;
        }
      }
    });
  }, [skinToneId]);

  // Apply Eye Iris Color
  useEffect(() => {
    const eyeColor = EYE_COLORS.find(e => e.id === eyeColorId);
    if (!eyeColor || !characterGroupRef.current) return;

    const irisColor = new THREE.Color(eyeColor.threeColor);

    characterGroupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const matName = (mat.name || '').toLowerCase();

        if (matName.includes('iris') || (child.name || '').toLowerCase().includes('iris')) {
          mat.color.copy(irisColor);
          mat.needsUpdate = true;
        }
      }
    });
  }, [eyeColorId]);

  // Apply Body Proportion Presets & Gender Scaling
  useEffect(() => {
    if (!characterGroupRef.current) return;
    const charGroup = characterGroupRef.current;

    const bodyPreset = BODY_PRESETS.find(b => b.id === bodyPresetId) || BODY_PRESETS[0];

    // Gender base adjustments
    const genderHeightMult = gender === 'female' ? 0.94 : 1.0;
    const genderShoulderMult = gender === 'female' ? 0.92 : 1.0;
    const genderHipMult = gender === 'female' ? 1.05 : 1.0;

    const scaleX = bodyPreset.shoulderScale * genderShoulderMult;
    const scaleY = bodyPreset.heightScale * genderHeightMult;
    const scaleZ = bodyPreset.muscleScale * genderHipMult;

    charGroup.scale.set(scaleX, scaleY, scaleZ);
  }, [bodyPresetId, gender]);

  // Handle ViewMode camera transitions
  useEffect(() => {
    updateCameraTarget(viewMode, true);
  }, [viewMode, updateCameraTarget]);

  // Handle Wireframe toggle
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => { m.wireframe = showWireframe; });
        } else {
          child.material.wireframe = showWireframe;
        }
      }
    });
  }, [showWireframe]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      updateCameraTarget(viewMode, true);
      controlsRef.current.reset();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[420px] sm:min-h-[520px] lg:min-h-[640px] bg-[#0c0b12] overflow-hidden rounded-2xl border border-amber-900/30 select-none shadow-2xl flex flex-col"
    >
      {/* 3D WebGL Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing outline-none block"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-[#0a090f]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4 text-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
            <Sparkles size={20} className="absolute inset-0 m-auto text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-300 uppercase tracking-widest">
              Carregando Modelo MakeHuman 3D
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              {loadingStep}
            </p>
          </div>
        </div>
      )}

      {/* Top Left: Performance HUD & Model Info */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-amber-900/40 px-2.5 py-1 rounded-lg text-[11px] font-mono text-stone-300 shadow-md">
          <div className={`w-2 h-2 rounded-full ${fps >= 50 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{fps} FPS</span>
          <span className="text-stone-500">•</span>
          <span>{trianglesCount.toLocaleString()} tris</span>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-amber-900/30 px-2.5 py-1 rounded-lg text-[10px] font-cinzel text-amber-300/90 shadow-sm">
          <span>MakeHuman / MPFB Topology Base</span>
        </div>
      </div>

      {/* Top Right: View Controls (Full Body vs Face vs Torso) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-amber-900/40 p-1 rounded-xl shadow-lg">
        <button
          onClick={() => onViewModeChange && onViewModeChange('full_body')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1 ${
            viewMode === 'full_body'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
          title="Ver corpo inteiro"
        >
          <User size={13} />
          <span className="hidden sm:inline">Corpo Inteiro</span>
        </button>

        <button
          onClick={() => onViewModeChange && onViewModeChange('torso')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1 ${
            viewMode === 'torso'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
          title="Ver busto / torso"
        >
          <Layers size={13} />
          <span className="hidden sm:inline">Busto</span>
        </button>

        <button
          onClick={() => onViewModeChange && onViewModeChange('face')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1 ${
            viewMode === 'face'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
          title="Ver rosto em close-up"
        >
          <Eye size={13} />
          <span className="hidden sm:inline">Rosto</span>
        </button>
      </div>

      {/* Floating Toolbar at Bottom Left of Viewport */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-amber-900/40 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            autoRotate 
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' 
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
          title={autoRotate ? 'Parar rotação automática' : 'Ativar rotação automática'}
        >
          <RotateCw size={15} className={autoRotate ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-all cursor-pointer"
          title="Resetar Câmera"
        >
          <RefreshCw size={15} />
        </button>

        <button
          onClick={() => setShowWireframe(!showWireframe)}
          className={`p-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            showWireframe 
              ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50' 
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
          title="Alternar Wireframe"
        >
          <Layers size={15} />
        </button>

        <button
          onClick={() => setShowTechInfo(!showTechInfo)}
          className={`p-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            showTechInfo 
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' 
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
          title="Informações técnicas de licença & assets"
        >
          <Info size={15} />
        </button>
      </div>

      {/* Floating Instructions at Bottom Right */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-stone-800 px-3 py-1 rounded-full text-[10px] text-stone-400 font-mono">
        <span>Arraste para girar</span>
        <span>•</span>
        <span>Scroll / Pinça para zoom</span>
      </div>

      {/* Technical Info Modal Overlay */}
      {showTechInfo && (
        <div 
          className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto flex flex-col justify-between animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTechInfo(false); }}
        >
          <div className="space-y-4 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-300 uppercase flex items-center gap-2">
                <Info size={16} className="text-amber-400" />
                <span>Ecossistema MakeHuman / MPFB & Registro de Licenças</span>
              </h3>
              <button 
                onClick={() => setShowTechInfo(false)}
                className="text-stone-400 hover:text-stone-200 text-xs font-mono px-2 py-1 rounded bg-stone-900 border border-stone-800 cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Este protótipo renderiza modelos humanos realistas baseados na topologia oficial e padrões do <strong>MakeHuman / MPFB (MakeHuman Plugin For Blender)</strong>. Os arquivos 3D são carregados nativamente em formato <strong>Binary GLTF (.glb)</strong> com pipeline PBR completo no Three.js.
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-cinzel font-bold text-amber-200 uppercase">Assets e Licenças Registradas:</h4>
              <div className="space-y-2 text-[11px] font-mono">
                {ASSET_LICENSES.map((asset, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-200">
                      <span>{asset.assetName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {asset.license}
                      </span>
                    </div>
                    <div className="text-stone-400 text-[10px]">Autor: {asset.author} • Uso Comercial: {asset.commercialUseAllowed ? 'Permitido (CC0)' : 'Restrito'}</div>
                    <p className="text-stone-300 text-[10px] font-sans">{asset.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
