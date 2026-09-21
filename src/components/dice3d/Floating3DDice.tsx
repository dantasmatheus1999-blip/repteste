import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useDice3D } from './Dice3DContext';
import { createDiceMeshWithMaterial, getDiceGeometry, DiceMeshInfo } from './DiceGeometryRegistry';
import { getDiceMaterial, getDiceMaterialSync } from './DiceTextureLoader';
import { DicePhysicsEngine, calculateTableBounds } from './DicePhysicsEngine';
import { DiceOptionsDrawer } from './DiceOptionsDrawer';
import { DiceRollResult, DiceSkinConfig } from './types';
import { Sparkles, Skull, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { DICE_SKINS } from './diceSkins';
import { createSafeWebGLRenderer, draw2DFallbackDie } from './webglHelper';
import { diceAudio } from './diceAudio';
import { subscribeToCustomSkins } from './DiceSkinService';

// Visual scale helper for the rolling 3D dice animation (approx 50% of previous size, responsive for mobile & desktop)
function getRollingDiceScale(width: number, height: number): number {
  const aspect = width / Math.max(height, 1);
  if (aspect < 0.6) {
    // Narrow mobile portrait - narrow horizontal FOV requires ~0.48 to leave 50%+ of screen visible
    return 0.48;
  }
  if (aspect < 1.0) {
    // Tablet portrait
    return 0.50;
  }
  // Desktop / Landscape
  return 0.52;
}

export const Floating3DDice: React.FC = () => {
  const {
    activeDiceType,
    activeSkin,
    isRolling,
    pendingRollRequest,
    roll3DDice,
    setIsOptionsOpen
  } = useDice3D();

  const [availableSkins, setAvailableSkins] = useState<DiceSkinConfig[]>([]);

  useEffect(() => {
    const unsub = subscribeToCustomSkins(activeDiceType, (skins) => {
      setAvailableSkins(skins);
    });
    return () => unsub();
  }, [activeDiceType]);

  // Mini Idle Canvas Ref & State
  const idleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const idleSceneRef = useRef<THREE.Scene | null>(null);
  const idleCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const idleRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const idleMeshInfoRef = useRef<DiceMeshInfo | null>(null);
  const idleAnimFrameRef = useRef<number | null>(null);

  // Full Screen Toss Roll Canvas Ref & State
  const tossCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tossSceneRef = useRef<THREE.Scene | null>(null);
  const tossCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const tossRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tossMeshInfoRef = useRef<DiceMeshInfo | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const tossAnimFrameRef = useRef<number | null>(null);
  const physicsEngineRef = useRef<DicePhysicsEngine>(new DicePhysicsEngine());
  const lastRestingPosRef = useRef<THREE.Vector3 | null>(null);
  const last2DPosRef = useRef<{ x: number; y: number } | null>(null);

  const [isTossActive, setIsTossActive] = useState(false);
  const [activeRollDisplay, setActiveRollDisplay] = useState<DiceRollResult | null>(null);
  const [showResultBanner, setShowResultBanner] = useState(false);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Long press detection for mobile
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  // ----------------------------------------------------
  // 1. INITIALIZE MINI IDLE 3D DICE CANVAS
  // ----------------------------------------------------
  useEffect(() => {
    const canvas = idleCanvasRef.current;
    if (!canvas) return;

    const width = 48;
    const height = 48;

    const renderer = createSafeWebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });

    if (renderer) {
      const scene = new THREE.Scene();
      idleSceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
      camera.position.set(0, 0, 3.2);
      idleCameraRef.current = camera;

      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      idleRendererRef.current = renderer;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffeedd, 2.0);
      dirLight.position.set(3, 4, 3);
      scene.add(dirLight);

      const backLight = new THREE.DirectionalLight(0x6688ff, 0.8);
      backLight.position.set(-2, -2, -2);
      scene.add(backLight);

      // Create 3D Mesh using Unified Geometry & Texture Architecture
      const initialMat = getDiceMaterialSync(activeDiceType, activeSkin);
      const diceInfo = createDiceMeshWithMaterial(activeDiceType, initialMat, 0.95);
      idleMeshInfoRef.current = diceInfo;
      scene.add(diceInfo.mesh);

      // Async load high-res texture if applicable
      getDiceMaterial(activeDiceType, activeSkin).then((mat) => {
        if (diceInfo.mesh) {
          diceInfo.mesh.material = mat;
        }
      });

      // Gentle idle spin loop
      let angle = 0;
      const animateIdle = () => {
        angle += 0.015;
        if (diceInfo.mesh) {
          diceInfo.mesh.rotation.x = Math.sin(angle * 0.7) * 0.4 + 0.3;
          diceInfo.mesh.rotation.y = angle;
        }
        renderer.render(scene, camera);
        idleAnimFrameRef.current = requestAnimationFrame(animateIdle);
      };

      idleAnimFrameRef.current = requestAnimationFrame(animateIdle);

      return () => {
        if (idleAnimFrameRef.current) cancelAnimationFrame(idleAnimFrameRef.current);
        if (diceInfo.mesh) {
          scene.remove(diceInfo.mesh);
        }
        renderer.dispose();
      };
    } else {
      // 2D Smooth Fallback rendering if WebGL is unavailable
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let angle = 0;
      const animate2D = () => {
        angle += 0.02;
        draw2DFallbackDie(ctx, width, height, activeDiceType, activeSkin as any, angle);
        idleAnimFrameRef.current = requestAnimationFrame(animate2D);
      };

      idleAnimFrameRef.current = requestAnimationFrame(animate2D);

      return () => {
        if (idleAnimFrameRef.current) cancelAnimationFrame(idleAnimFrameRef.current);
      };
    }
  }, [activeDiceType, activeSkin]);

  // ----------------------------------------------------
  // 2. INITIALIZE FULL SCREEN TOSS ROLL SCENE
  // ----------------------------------------------------
  useEffect(() => {
    if (!isTossActive) return;

    const canvas = tossCanvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = createSafeWebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    if (renderer) {
      const scene = new THREE.Scene();
      tossSceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 4.8, 6.2);
      camera.lookAt(0, 0.5, 0);
      tossCameraRef.current = camera;

      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      tossRendererRef.current = renderer;

      // Atmospheric RPG Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
      mainLight.position.set(4, 10, 5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 25;
      mainLight.shadow.bias = -0.001;
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0x8899bb, 0.8);
      fillLight.position.set(-5, 4, -3);
      scene.add(fillLight);

      // Dynamic Contact Shadow on Floor Plane (scaled for ~50% visual size)
      const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const shadowCtx = shadowCanvas.getContext('2d');
      if (shadowCtx) {
        const grad = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
        grad.addColorStop(0, 'rgba(0,0,0,0.65)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        shadowCtx.fillStyle = grad;
        shadowCtx.fillRect(0, 0, 128, 128);
      }
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.02;
      scene.add(shadowMesh);
      shadowMeshRef.current = shadowMesh;

      // Resize handler
      const handleResize = () => {
        if (!tossCanvasRef.current || !tossCameraRef.current || !tossRendererRef.current) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        tossCameraRef.current.aspect = w / h;
        tossCameraRef.current.updateProjectionMatrix();
        tossRendererRef.current.setSize(w, h, false);
        physicsEngineRef.current.setCamera(tossCameraRef.current);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (tossAnimFrameRef.current) cancelAnimationFrame(tossAnimFrameRef.current);
        renderer.dispose();
      };
    } else {
      // 2D Fallback toss canvas setup
      canvas.width = width;
      canvas.height = height;
    }
  }, [isTossActive]);

  // ----------------------------------------------------
  // 3. EXECUTE 3D ROLL WHEN REQUESTED
  // ----------------------------------------------------
  const executeRoll = useCallback((req = pendingRollRequest) => {
    const diceType = req?.diceType || activeDiceType;
    const skin = req?.skin || activeSkin;
    const modifier = req?.modifier || 0;
    const label = req?.label || 'Rolagem de D20';
    const formula = req?.formula || `1${diceType}`;

    // 1. Determine natural mathematical roll value
    let sides = 20;
    if (diceType === 'd4') sides = 4;
    else if (diceType === 'd6') sides = 6;
    else if (diceType === 'd8') sides = 8;
    else if (diceType === 'd10') sides = 10;
    else if (diceType === 'd12') sides = 12;
    else if (diceType === 'd100') sides = 10;

    let naturalRoll = req?.forcedValue ?? Math.floor(Math.random() * sides) + 1;
    let targetFaceValue: number | string = naturalRoll;

    if (diceType === 'd100') {
      const tens = (naturalRoll - 1) * 10;
      targetFaceValue = tens === 0 ? '00' : String(tens);
    }

    const total = naturalRoll + modifier;
    const isNat20 = diceType === 'd20' && naturalRoll === 20;
    const isNat1 = diceType === 'd20' && naturalRoll === 1;

    const result: DiceRollResult = {
      id: `roll_${Date.now()}`,
      diceType,
      skin,
      naturalRoll,
      modifier,
      total,
      formula: modifier !== 0 ? `${formula} ${modifier >= 0 ? '+' : ''}${modifier}` : formula,
      label,
      isNat20,
      isNat1,
      timestamp: Date.now()
    };

    setIsTossActive(true);
    setShowResultBanner(false);
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);

    // Wait for toss canvas mount
    setTimeout(async () => {
      const scene = tossSceneRef.current;
      const renderer = tossRendererRef.current;
      const camera = tossCameraRef.current;
      const canvas = tossCanvasRef.current;

      if (scene && renderer && camera) {
        // --- 3D WebGL Physics Flow ---
        // Clean old dice mesh if any
        if (tossMeshInfoRef.current?.mesh) {
          scene.remove(tossMeshInfoRef.current.mesh);
        }

        // Create new 3D dice mesh with skin material scaled responsively to ~50% of previous size
        const mat = await getDiceMaterial(diceType, skin);
        const rollScale = getRollingDiceScale(window.innerWidth, window.innerHeight);
        const diceMeshInfo = createDiceMeshWithMaterial(diceType, mat, rollScale);
        tossMeshInfoRef.current = diceMeshInfo;
        scene.add(diceMeshInfo.mesh);

        // Calculate dynamic safe table bounds on the floor plane based on the active viewport & camera
        const floorY = diceMeshInfo.radius * 0.82;
        const tableBounds = calculateTableBounds(camera, floorY, rollScale);

        // Reference distance for perspective scaling:
        // Top of the visible table area serves as the reference distance
        const refTopPoint = new THREE.Vector3(0, floorY, tableBounds.minZ);
        const refDistance = camera.position.distanceTo(refTopPoint);

        // Start physics simulation starting from previous resting spot if available
        physicsEngineRef.current.startRoll({
          diceInfo: diceMeshInfo,
          targetValue: targetFaceValue,
          camera: camera,
          bounds: tableBounds,
          startPosition: lastRestingPosRef.current ? lastRestingPosRef.current.clone() : undefined,
          onUpdate: (pos, quat, animScale) => {
            if (diceMeshInfo.mesh) {
              diceMeshInfo.mesh.position.copy(pos);
              diceMeshInfo.mesh.quaternion.copy(quat);

              // Dynamic perspective compensation: Keeps apparent screen size constant from top to bottom
              const currentDist = camera.position.distanceTo(pos);
              const perspectiveComp = refDistance > 0 ? (currentDist / refDistance) : 1.0;
              const effectiveScale = animScale * rollScale * perspectiveComp;

              diceMeshInfo.mesh.scale.setScalar(effectiveScale);

              // Update contact shadow matching the compensated visual scale
              if (shadowMeshRef.current) {
                shadowMeshRef.current.position.x = pos.x;
                shadowMeshRef.current.position.z = pos.z;
                const heightAboveFloor = Math.max(0, pos.y - diceMeshInfo.radius * 0.8);
                const shadowScale = THREE.MathUtils.lerp(1.0, 0.3, Math.min(heightAboveFloor / 3, 1)) * perspectiveComp;
                shadowMeshRef.current.scale.setScalar(shadowScale);
                (shadowMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 
                  THREE.MathUtils.lerp(0.7, 0.1, Math.min(heightAboveFloor / 3, 1));
              }
            }
          },
          onComplete: () => {
            // Keep dice in exact resting position with constant visual scale
            if (diceMeshInfo.mesh) {
              const currentPos = physicsEngineRef.current.getPosition();
              const currentDist = camera.position.distanceTo(currentPos);
              const perspectiveComp = refDistance > 0 ? (currentDist / refDistance) : 1.0;
              diceMeshInfo.mesh.scale.setScalar(rollScale * perspectiveComp);
            }
            lastRestingPosRef.current = physicsEngineRef.current.getPosition();
            setActiveRollDisplay(result);
            setShowResultBanner(true);
            req?.onComplete?.(result);

            // Auto-fade banner after 3.8 seconds
            resultTimerRef.current = setTimeout(() => {
              setShowResultBanner(false);
              setTimeout(() => {
                setIsTossActive(false);
              }, 300);
            }, 3800);
          }
        });

        // Physics animation loop
        const runPhysicsLoop = () => {
          const isRunning = physicsEngineRef.current.update();
          renderer.render(scene, camera);
          if (isRunning || isTossActive) {
            tossAnimFrameRef.current = requestAnimationFrame(runPhysicsLoop);
          }
        };

        if (tossAnimFrameRef.current) cancelAnimationFrame(tossAnimFrameRef.current);
        tossAnimFrameRef.current = requestAnimationFrame(runPhysicsLoop);
      } else if (canvas) {
        // --- 2D Fallback Toss Physics Flow ---
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;

        const dieSize = Math.min(w, h) * 0.12;
        const marginX = dieSize * 0.8;
        const marginYTop = dieSize * 1.0;
        const marginYBottom = h * 0.35; // keep space for bottom result banner

        let startX = last2DPosRef.current
          ? THREE.MathUtils.clamp(last2DPosRef.current.x, marginX, w - marginX)
          : w * (0.3 + Math.random() * 0.4);
        let currentY = last2DPosRef.current
          ? THREE.MathUtils.clamp(last2DPosRef.current.y, marginYTop, h - marginYBottom)
          : h * 0.2;

        let speedY = -4; // upward jump on subsequent roll
        let speedX = (Math.random() - 0.5) * 4;
        let rotation = 0;
        let bounces = 0;
        const targetFloorY = Math.min(h - marginYBottom, Math.max(h * 0.45, currentY + (Math.random() - 0.5) * 100));

        diceAudio.playToss();

        const animate2DToss = () => {
          ctx.clearRect(0, 0, w, h);
          currentY += speedY;
          startX += speedX;
          speedY += 0.8; // gravity
          rotation += 0.2;

          // Side wall bounds check
          if (startX <= marginX) {
            startX = marginX;
            speedX = -speedX * 0.6;
          } else if (startX >= w - marginX) {
            startX = w - marginX;
            speedX = -speedX * 0.6;
          }

          if (currentY >= targetFloorY) {
            currentY = targetFloorY;
            speedY = -speedY * 0.55;
            speedX *= 0.75;
            bounces++;
            diceAudio.playBounce(Math.max(0.2, 1 - bounces * 0.3));
          }

          const displayVal = bounces >= 2 ? targetFaceValue : Math.floor(Math.random() * sides) + 1;

          ctx.save();
          ctx.translate(startX, currentY);
          draw2DFallbackDie(ctx, dieSize, dieSize, diceType, skin as any, rotation, displayVal);
          ctx.restore();

          if (bounces < 3 || Math.abs(speedY) > 0.5) {
            tossAnimFrameRef.current = requestAnimationFrame(animate2DToss);
          } else {
            last2DPosRef.current = { x: startX, y: currentY };
            diceAudio.playStop();
            setActiveRollDisplay(result);
            setShowResultBanner(true);
            req?.onComplete?.(result);

            resultTimerRef.current = setTimeout(() => {
              setShowResultBanner(false);
              setTimeout(() => {
                setIsTossActive(false);
              }, 300);
            }, 3800);
          }
        };

        if (tossAnimFrameRef.current) cancelAnimationFrame(tossAnimFrameRef.current);
        tossAnimFrameRef.current = requestAnimationFrame(animate2DToss);
      }
    }, 40);
  }, [activeDiceType, activeSkin, pendingRollRequest, isTossActive]);

  // React to pending roll requests from context
  useEffect(() => {
    if (pendingRollRequest) {
      executeRoll(pendingRollRequest);
    }
  }, [pendingRollRequest]);

  // Handle touch interactions on floating die
  const handleTouchStart = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsOptionsOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLongPressRef.current) return;
    roll3DDice();
  };

  const skinConfig = availableSkins.find(s => s.id === activeSkin) || DICE_SKINS[activeSkin as keyof typeof DICE_SKINS] || DICE_SKINS.black_obsidian;

  return (
    <>
      {/* ----------------------------------------------------
          1. SMALL FLOATING 3D DICE WIDGET (Always Discreetly on Right Edge)
          ---------------------------------------------------- */}
      <div 
        id="realmor-floating-3d-dice-container"
        className="fixed right-3.5 bottom-20 sm:bottom-6 z-40 flex flex-col items-center gap-1 select-none pointer-events-auto"
      >
        <div className="relative group">
          {/* Touch Area / Glow Ring */}
          <button
            id="floating-3d-dice-trigger"
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            disabled={isRolling}
            className={`w-13 h-13 rounded-full flex items-center justify-center relative cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-105 shadow-[0_6px_20px_rgba(0,0,0,0.65)] border border-[#3b4252] bg-gradient-to-b from-[#181d26] to-[#0d1017] ${
              isRolling ? 'opacity-40' : ''
            }`}
            title="Tocar para rolar dado 3D | Segurar para opções"
          >
            {/* Real 3D Mini Canvas */}
            <canvas
              ref={idleCanvasRef}
              width={48}
              height={48}
              className="w-11 h-11 pointer-events-none rounded-full"
            />

            {/* Subtle glow aura */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
              style={{
                boxShadow: `inset 0 0 8px ${skinConfig?.highlightColor || '#eab308'}66`
              }}
            />
          </button>

          {/* Small options gear toggle */}
          <button
            id="floating-dice-options-gear"
            onClick={(e) => {
              e.stopPropagation();
              setIsOptionsOpen(true);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1e232d] hover:bg-[#2c3340] border border-[#3a4354] text-stone-300 flex items-center justify-center text-[10px] shadow-sm cursor-pointer hover:text-white transition-colors"
            title="Escolher tipo de dado / skins"
          >
            <SlidersHorizontal size={10} />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          2. FULL-SCREEN 3D TOSS ROLL LAYER
          ---------------------------------------------------- */}
      {isTossActive && (
        <div
          id="realmor-3d-dice-overlay"
          className="fixed inset-0 z-50 pointer-events-auto flex flex-col justify-between"
          onClick={() => {
            if (showResultBanner) {
              setShowResultBanner(false);
              setTimeout(() => setIsTossActive(false), 200);
            }
          }}
        >
          {/* Transparent 3D Canvas Layer */}
          <canvas
            ref={tossCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Top Quick Dismiss Button */}
          <div className="relative p-4 flex justify-end z-10 pointer-events-auto">
            <button
              onClick={() => {
                setShowResultBanner(false);
                setIsTossActive(false);
              }}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-stone-400 hover:text-white border border-white/10 backdrop-blur-xs transition-colors cursor-pointer"
              title="Fechar rolagem"
            >
              <X size={18} />
            </button>
          </div>

          {/* ----------------------------------------------------
              3. ELEGANT RESULT BANNER (Style matching reference video)
              ---------------------------------------------------- */}
          {showResultBanner && activeRollDisplay && (
            <div className="relative pb-8 px-4 flex justify-center z-10 animate-in slide-in-from-bottom-6 fade-in duration-200 pointer-events-auto">
              <div 
                className="bg-[#12151c]/95 border border-[#2a313d] rounded-2xl p-4 max-w-sm w-full shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md space-y-2 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Roll Label & Formula */}
                <div className="flex items-center justify-between text-[11px] font-sans text-stone-400 border-b border-[#21262d] pb-1.5">
                  <span className="font-semibold uppercase tracking-wider truncate max-w-[190px]">
                    {activeRollDisplay.label}
                  </span>
                  <span className="font-cinzel text-stone-400">{activeRollDisplay.formula}</span>
                </div>

                {/* Big Total Value & Mathematical Breakdown */}
                <div className="py-1 flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`text-4xl sm:text-5xl font-cinzel font-bold leading-none tracking-tight ${
                      activeRollDisplay.isNat20 
                        ? 'text-[#f6d860] drop-shadow-[0_0_12px_rgba(246,216,96,0.5)]' 
                        : activeRollDisplay.isNat1 
                        ? 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.5)]' 
                        : 'text-stone-100'
                    }`}>
                      {activeRollDisplay.total}
                    </span>
                  </div>
                </div>

                {/* Critical / Fumble Alert */}
                {activeRollDisplay.isNat20 && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#f6d860] font-sans font-bold uppercase tracking-wider animate-pulse">
                    <Sparkles size={14} />
                    <span>20 Natural • Sucesso Crítico!</span>
                  </div>
                )}
                {activeRollDisplay.isNat1 && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-sans font-bold uppercase tracking-wider">
                    <Skull size={14} />
                    <span>1 Natural • Falha Crítica!</span>
                  </div>
                )}

                {/* Details calculation breakdown */}
                <div className="text-[11px] text-stone-400 font-sans">
                  <span>Dado: </span>
                  <strong className="text-stone-200 font-cinzel">{activeRollDisplay.naturalRoll}</strong>
                  {activeRollDisplay.modifier !== 0 && (
                    <span> {activeRollDisplay.modifier >= 0 ? `+ ${activeRollDisplay.modifier}` : `- ${Math.abs(activeRollDisplay.modifier)}`} = <strong className="text-stone-100">{activeRollDisplay.total}</strong></span>
                  )}
                </div>

                {/* Action Buttons: Roll Again & Close */}
                <div className="pt-2 flex items-center gap-2 border-t border-[#21262d]">
                  <button
                    onClick={() => executeRoll()}
                    className="flex-1 py-2 rounded-lg bg-[#8b1e1e] hover:bg-[#a32222] text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    <RotateCcw size={12} />
                    <span>Rolar Novamente</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowResultBanner(false);
                      setIsTossActive(false);
                    }}
                    className="py-2 px-3 rounded-lg bg-[#1a202a] hover:bg-[#252c38] text-stone-300 font-sans text-xs font-semibold uppercase transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          4. DICE OPTIONS & SKIN SELECTOR DRAWER
          ---------------------------------------------------- */}
      <DiceOptionsDrawer />
    </>
  );
};
