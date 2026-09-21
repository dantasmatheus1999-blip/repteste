import * as THREE from 'three';
import { DiceMeshInfo } from './diceGeometries';
import { diceAudio } from './diceAudio';

export interface TableBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface RollAnimationParams {
  diceInfo: DiceMeshInfo;
  targetValue: number | string;
  camera?: THREE.PerspectiveCamera;
  startPosition?: THREE.Vector3;
  bounds?: TableBounds;
  duration?: number;
  onUpdate?: (pos: THREE.Vector3, quat: THREE.Quaternion, scale: number) => void;
  onBounce?: (intensity: number) => void;
  onComplete?: () => void;
}

/**
 * Calculates dynamically the safe floor boundaries in world space for a given camera & floor plane.
 * Guarantees the die is 100% visible on any screen aspect ratio (mobile portrait, tablet, desktop).
 */
export function calculateTableBounds(
  camera: THREE.PerspectiveCamera,
  floorY: number,
  diceRadius: number
): TableBounds {
  const raycaster = new THREE.Raycaster();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY);

  const getPlaneIntersection = (ndcX: number, ndcY: number): THREE.Vector3 => {
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(floorPlane, target);
    return hit || new THREE.Vector3(ndcX * 1.5, floorY, ndcY * 1.5);
  };

  // Safe NDC margins (keeping die fully within screen boundaries and above bottom banner)
  // Tighter horizontal NDC on narrow mobile portrait screens
  const isNarrowMobile = camera.aspect < 0.6;
  const safeNDCLeft = isNarrowMobile ? -0.68 : -0.74;
  const safeNDCRight = isNarrowMobile ? 0.68 : 0.74;
  const safeNDCTop = 0.65;
  const safeNDCBottom = -0.52;

  const topLeft = getPlaneIntersection(safeNDCLeft, safeNDCTop);
  const topRight = getPlaneIntersection(safeNDCRight, safeNDCTop);
  const bottomLeft = getPlaneIntersection(safeNDCLeft, safeNDCBottom);
  const bottomRight = getPlaneIntersection(safeNDCRight, safeNDCBottom);

  const minX = Math.min(topLeft.x, bottomLeft.x) + diceRadius * 0.5;
  const maxX = Math.max(topRight.x, bottomRight.x) - diceRadius * 0.5;
  const minZ = Math.min(topLeft.z, topRight.z) + diceRadius * 0.5;
  const maxZ = Math.max(bottomLeft.z, bottomRight.z) - diceRadius * 0.5;

  return {
    minX: Math.min(minX, -0.4),
    maxX: Math.max(maxX, 0.4),
    minZ: Math.min(minZ, -0.4),
    maxZ: Math.max(maxZ, 0.4)
  };
}

export class DicePhysicsEngine {
  private diceInfo: DiceMeshInfo | null = null;
  private targetValue: number | string = 20;
  private isSimulating = false;

  private camera: THREE.PerspectiveCamera | null = null;
  private frustum = new THREE.Frustum();
  private projScreenMatrix = new THREE.Matrix4();

  private pos = new THREE.Vector3();
  private vel = new THREE.Vector3();
  private quat = new THREE.Quaternion();
  private angularVel = new THREE.Vector3();

  private targetQuat = new THREE.Quaternion();

  private startTime = 0;
  private totalDuration = 2.15; // Natural 4-phase physical duration
  private lastTime = 0;
  private bounceCount = 0;

  private onUpdate?: (pos: THREE.Vector3, quat: THREE.Quaternion, scale: number) => void;
  private onBounce?: (intensity: number) => void;
  private onComplete?: () => void;

  private bounds: TableBounds = {
    minX: -1.2,
    maxX: 1.2,
    minZ: -1.2,
    maxZ: 0.8
  };

  public setCamera(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.updateFrustum();
  }

  private updateFrustum() {
    if (!this.camera) return;
    this.camera.updateMatrixWorld();
    this.projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }

  /**
   * Returns current or final simulated position
   */
  public getPosition(): THREE.Vector3 {
    return this.pos.clone();
  }

  /**
   * Calculates the exact Quaternion to align the target face normal with the camera's up/view vector.
   */
  public calculateTargetOrientation(diceInfo: DiceMeshInfo, targetValue: number | string): THREE.Quaternion {
    const faceIdx = diceInfo.faceValues.findIndex(v => String(v) === String(targetValue));
    const normal = faceIdx !== -1 ? diceInfo.faceNormals[faceIdx] : diceInfo.faceNormals[0];

    // Desired top normal in world space (tilted slightly towards camera at (0, 4.8, 6.2))
    const targetWorldUp = new THREE.Vector3(0, 0.94, 0.34).normalize();
    const qAlign = new THREE.Quaternion().setFromUnitVectors(normal, targetWorldUp);

    // Subtle random yaw around the normal for natural variety
    const randomYaw = (Math.random() - 0.5) * 0.4;
    const qYaw = new THREE.Quaternion().setFromAxisAngle(targetWorldUp, randomYaw);
    
    return qYaw.multiply(qAlign);
  }

  /**
   * Enforces that the entire 3D volume of the die never penetrates or clips outside the visible viewport.
   * Runs every frame against the 4 camera frustum planes with safe margins.
   */
  private enforceFrustumBounds() {
    if (!this.camera || !this.diceInfo) return;
    this.updateFrustum();

    // Effective outer radius of the rotating 3D die in world space (including vertices during tumble)
    const radius = this.diceInfo.radius * 1.35;

    // Margin configs for each frustum plane:
    // 0: Right, 1: Left, 2: Bottom, 3: Top
    const planeMargins = [
      { plane: this.frustum.planes[0], margin: radius + 0.12 }, // Right edge
      { plane: this.frustum.planes[1], margin: radius + 0.12 }, // Left edge
      { plane: this.frustum.planes[2], margin: radius + 0.48 }, // Bottom edge (clears result banner)
      { plane: this.frustum.planes[3], margin: radius + 0.18 }, // Top edge (clears notch/header)
    ];

    for (let i = 0; i < planeMargins.length; i++) {
      const { plane, margin } = planeMargins[i];
      const dist = plane.distanceToPoint(this.pos);
      if (dist < margin) {
        const penetration = margin - dist;
        // Push die center inward away from the screen edge so no part clips outside
        this.pos.addScaledVector(plane.normal, penetration);

        // Velocity along inward normal
        const normalVel = this.vel.dot(plane.normal);
        if (normalVel < 0) {
          const elapsed = (performance.now() - this.startTime) / 1000;
          const progress = Math.min(elapsed / this.totalDuration, 1.0);

          if (progress < 0.75 && Math.abs(normalVel) > 0.3) {
            // Elastic rebound off the virtual table border during active roll
            this.vel.addScaledVector(plane.normal, -normalVel * 1.5);
            this.vel.multiplyScalar(0.85); // Wall friction

            // Natural rotational reaction on border collision
            this.angularVel.x += (Math.random() - 0.5) * 3.5;
            this.angularVel.y += (Math.random() - 0.5) * 3.5;
            this.angularVel.z += (Math.random() - 0.5) * 3.5;

            if (Math.abs(normalVel) > 0.4) {
              diceAudio.playImpact(0.35);
              this.onBounce?.(0.3);
            }
          } else {
            // In late settling phase: softly absorb normal velocity without jitter
            this.vel.sub(plane.normal.clone().multiplyScalar(normalVel));
            this.vel.multiplyScalar(0.7);
          }
        }
      }
    }
  }

  public startRoll(params: RollAnimationParams) {
    this.diceInfo = params.diceInfo;
    this.targetValue = params.targetValue;
    this.totalDuration = params.duration || 2.15;
    this.onUpdate = params.onUpdate;
    this.onBounce = params.onBounce;
    this.onComplete = params.onComplete;
    this.bounceCount = 0;

    if (params.camera) {
      this.camera = params.camera;
      this.updateFrustum();
    }

    if (params.bounds) {
      this.bounds = params.bounds;
    }

    const radius = this.diceInfo.radius * 0.82;
    const floorY = radius;

    // Calculate exact target landing quaternion
    this.targetQuat = this.calculateTargetOrientation(params.diceInfo, params.targetValue);

    if (params.startPosition) {
      // ----------------------------------------------------
      // Subsequent roll: Launch dynamically across the table from current position
      // ----------------------------------------------------
      this.pos.copy(params.startPosition);
      this.pos.y = Math.max(this.pos.y, floorY);
      this.enforceFrustumBounds();

      // Pick an expansive destination target on the opposite half / diagonal of the screen
      const currentX = this.pos.x;
      const currentZ = this.pos.z;

      // Invert quadrant to ensure large, sweeping cross-screen traversal
      const destX = currentX <= 0
        ? THREE.MathUtils.lerp(this.bounds.maxX * 0.3, this.bounds.maxX * 0.9, 0.2 + Math.random() * 0.8)
        : THREE.MathUtils.lerp(this.bounds.minX * 0.9, this.bounds.minX * 0.3, 0.2 + Math.random() * 0.8);

      const destZ = currentZ <= 0
        ? THREE.MathUtils.lerp(this.bounds.maxZ * 0.2, this.bounds.maxZ * 0.85, 0.2 + Math.random() * 0.8)
        : THREE.MathUtils.lerp(this.bounds.minZ * 0.85, this.bounds.minZ * 0.2, 0.2 + Math.random() * 0.8);

      // High linear impulse across screen (60-75% viewport travel)
      const travelDist = Math.hypot(destX - currentX, destZ - currentZ);
      const flightTime = Math.max(0.45, Math.min(0.65, travelDist * 0.22));

      const vx = (destX - currentX) / flightTime + (Math.random() - 0.5) * 2.0;
      const vy = 5.8 + Math.random() * 2.2; // Energetic upward toss
      const vz = (destZ - currentZ) / flightTime + (Math.random() - 0.5) * 2.0;
      this.vel.set(vx, vy, vz);
    } else {
      // ----------------------------------------------------
      // First roll: Select from varied dynamic launch trajectories spanning 60-75% of viewport
      // ----------------------------------------------------
      const trajectoryMode = Math.floor(Math.random() * 6);
      let startX = 0;
      let startZ = 0;
      let destX = 0;
      let destZ = 0;

      switch (trajectoryMode) {
        case 0: // Top-Left to Bottom-Right sweeping diagonal
          startX = THREE.MathUtils.lerp(this.bounds.minX * 0.8, this.bounds.minX * 0.5, Math.random());
          startZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.8, this.bounds.minZ * 0.5, Math.random());
          destX = THREE.MathUtils.lerp(this.bounds.maxX * 0.4, this.bounds.maxX * 0.85, Math.random());
          destZ = THREE.MathUtils.lerp(this.bounds.maxZ * 0.3, this.bounds.maxZ * 0.8, Math.random());
          break;
        case 1: // Top-Right to Bottom-Left sweeping diagonal
          startX = THREE.MathUtils.lerp(this.bounds.maxX * 0.5, this.bounds.maxX * 0.8, Math.random());
          startZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.8, this.bounds.minZ * 0.5, Math.random());
          destX = THREE.MathUtils.lerp(this.bounds.minX * 0.85, this.bounds.minX * 0.4, Math.random());
          destZ = THREE.MathUtils.lerp(this.bounds.maxZ * 0.3, this.bounds.maxZ * 0.8, Math.random());
          break;
        case 2: // Left to Right wide cross-table cast
          startX = THREE.MathUtils.lerp(this.bounds.minX * 0.9, this.bounds.minX * 0.6, Math.random());
          startZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.3, this.bounds.maxZ * 0.3, Math.random());
          destX = THREE.MathUtils.lerp(this.bounds.maxX * 0.6, this.bounds.maxX * 0.9, Math.random());
          destZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.4, this.bounds.maxZ * 0.6, Math.random());
          break;
        case 3: // Right to Left wide cross-table cast
          startX = THREE.MathUtils.lerp(this.bounds.maxX * 0.6, this.bounds.maxX * 0.9, Math.random());
          startZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.3, this.bounds.maxZ * 0.3, Math.random());
          destX = THREE.MathUtils.lerp(this.bounds.minX * 0.9, this.bounds.minX * 0.6, Math.random());
          destZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.4, this.bounds.maxZ * 0.6, Math.random());
          break;
        case 4: // Bottom-Left to Top-Right rising cast
          startX = THREE.MathUtils.lerp(this.bounds.minX * 0.8, this.bounds.minX * 0.5, Math.random());
          startZ = THREE.MathUtils.lerp(this.bounds.maxZ * 0.4, this.bounds.maxZ * 0.75, Math.random());
          destX = THREE.MathUtils.lerp(this.bounds.maxX * 0.4, this.bounds.maxX * 0.85, Math.random());
          destZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.8, this.bounds.minZ * 0.4, Math.random());
          break;
        default: // Bottom-Right to Top-Left rising cast
          startX = THREE.MathUtils.lerp(this.bounds.maxX * 0.5, this.bounds.maxX * 0.8, Math.random());
          startZ = THREE.MathUtils.lerp(this.bounds.maxZ * 0.4, this.bounds.maxZ * 0.75, Math.random());
          destX = THREE.MathUtils.lerp(this.bounds.minX * 0.85, this.bounds.minX * 0.4, Math.random());
          destZ = THREE.MathUtils.lerp(this.bounds.minZ * 0.8, this.bounds.minZ * 0.4, Math.random());
          break;
      }

      const startY = 3.0 + Math.random() * 1.0;
      this.pos.set(startX, startY, startZ);
      this.enforceFrustumBounds();

      const flightTime = 0.55;
      const vx = (destX - this.pos.x) / flightTime + (Math.random() - 0.5) * 1.5;
      const vy = 3.2 + Math.random() * 1.8;
      const vz = (destZ - this.pos.z) / flightTime + (Math.random() - 0.5) * 1.5;
      this.vel.set(vx, vy, vz);
    }

    // High random angular velocity in 3 axes
    this.angularVel.set(
      (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 12),
      (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 14),
      (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 12)
    );

    // Random starting rotation
    this.quat.set(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();

    this.isSimulating = true;
    this.startTime = performance.now();
    this.lastTime = this.startTime;

    diceAudio.playThrow();
  }

  public update(): boolean {
    if (!this.isSimulating || !this.diceInfo) return false;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.04); // cap at 40ms
    this.lastTime = now;

    const elapsed = (now - this.startTime) / 1000;
    const progress = Math.min(elapsed / this.totalDuration, 1.0);

    const radius = this.diceInfo.radius * 0.82;
    const floorY = radius;
    const gravity = -30.0;

    // =========================================================================
    // 1. LINEAR PHYSICS (Ballistics, Gravity, Floor Bounces, Ground Friction)
    // =========================================================================
    if (progress < 0.82) {
      // Phases 1-3: Ballistic flight, gravity & floor interaction
      this.vel.y += gravity * dt;
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
      this.pos.z += this.vel.z * dt;

      // Floor collision
      if (this.pos.y <= floorY) {
        this.pos.y = floorY;
        if (this.vel.y < 0) {
          const impactSpeed = Math.abs(this.vel.y);
          this.vel.y = -this.vel.y * 0.50; // restitution
          this.vel.x *= 0.93; // ground friction on impact
          this.vel.z *= 0.93;

          // Alter spin on floor bounce
          this.angularVel.x = -this.angularVel.x * 0.65 + (Math.random() - 0.5) * 5;
          this.angularVel.z = -this.angularVel.z * 0.65 + (Math.random() - 0.5) * 5;

          if (impactSpeed > 1.6) {
            this.bounceCount++;
            diceAudio.playImpact(Math.min(impactSpeed / 10, 1.0));
            this.onBounce?.(Math.min(impactSpeed / 8, 1.0));
          }
        } else {
          // Smooth continuous surface rolling friction
          this.vel.x *= Math.max(0, 1 - 0.9 * dt);
          this.vel.z *= Math.max(0, 1 - 0.9 * dt);
        }
      }

      // Linear damping during Phase 3 (smooth deceleration to rest)
      if (progress >= 0.52) {
        const decelProgress = (progress - 0.52) / 0.30;
        const drag = 1.0 + Math.pow(decelProgress, 1.8) * 7.5;
        this.vel.x *= Math.max(0, 1 - drag * dt);
        this.vel.z *= Math.max(0, 1 - drag * dt);
      }
    } else {
      // Phase 4 (0.82 -> 1.0): Final resting settle without artificial bounces or jitter
      this.vel.multiplyScalar(Math.max(0, 1 - 16.0 * dt));
      this.pos.x += this.vel.x * dt;
      this.pos.z += this.vel.z * dt;
      this.pos.y = floorY;
    }

    // =========================================================================
    // 2. VIEWPORT BOUNDARY ENFORCEMENT (Strict Virtual Table Containment)
    // =========================================================================
    this.enforceFrustumBounds();

    // =========================================================================
    // 3. CONTINUOUS ROTATION DYNAMICS & CRITICALLY DAMPED SETTLE
    // =========================================================================
    if (progress < 0.52) {
      // Phase 1 & 2: Free 3D angular tumble with aerodynamic drag
      this.angularVel.multiplyScalar(Math.max(0, 1 - 1.2 * dt));
    } else if (progress < 0.82) {
      // Phase 3 (0.52 -> 0.82): Progressive deceleration with critically damped alignment torque
      const s = (progress - 0.52) / 0.30; // 0 to 1
      const smoothWeight = s * s * (3 - 2 * s); // Smoothstep

      // Calculate shortest rotational error towards winning face orientation
      let qTarget = this.targetQuat.clone();
      if (this.quat.dot(qTarget) < 0) {
        qTarget.set(-qTarget.x, -qTarget.y, -qTarget.z, -qTarget.w);
      }
      const qDiff = qTarget.clone().multiply(this.quat.clone().invert());
      
      let angle = 2 * Math.acos(Math.min(Math.max(qDiff.w, -1), 1));
      if (angle > Math.PI) angle -= 2 * Math.PI;

      const sinHalf = Math.sqrt(Math.max(0, 1 - qDiff.w * qDiff.w));
      const torqueAxis = sinHalf > 0.0001
        ? new THREE.Vector3(qDiff.x / sinHalf, qDiff.y / sinHalf, qDiff.z / sinHalf)
        : new THREE.Vector3(0, 1, 0);

      // Critically damped spring-damper torque: eliminates micro-oscillations & jitter
      const kP = 14.0 * smoothWeight;
      const kD = 2.0 * Math.sqrt(Math.max(0, kP)) + 2.5;
      const alignmentTorque = torqueAxis.multiplyScalar(angle * kP).sub(this.angularVel.clone().multiplyScalar(kD));
      this.angularVel.addScaledVector(alignmentTorque, dt);
      this.angularVel.multiplyScalar(Math.max(0, 1 - (2.0 + 3.0 * smoothWeight) * dt));
    }

    // Integrate angular velocity into orientation for continuous smooth motion
    const angSpeed = this.angularVel.length();
    if (angSpeed > 0.0001 && progress < 0.82) {
      const axis = this.angularVel.clone().normalize();
      const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, angSpeed * dt);
      this.quat.premultiply(deltaQuat);
    }

    if (progress >= 0.82) {
      // Phase 4 (0.82 -> 1.0): Monotonic clean settle directly into target orientation (zero wobble)
      const s = (progress - 0.82) / 0.18; // 0 to 1
      const settleRate = 9.0 + s * 16.0;
      this.quat.slerp(this.targetQuat, Math.min(1.0, settleRate * dt));

      // Threshold stabilization: detect when speeds are near zero and lock peacefully into rest
      const linSpeed = this.vel.length();
      const currentAngSpeed = this.angularVel.length();
      if ((linSpeed < 0.08 && currentAngSpeed < 0.08) || progress >= 0.96) {
        this.vel.set(0, 0, 0);
        this.angularVel.set(0, 0, 0);
      }

      if (progress >= 0.94 && this.bounceCount > 0) {
        this.bounceCount = 0;
        diceAudio.playSettle();
      }
    }

    // Smooth constant animation scale (no artificial size popping)
    const scale = 1.0;

    this.onUpdate?.(this.pos, this.quat, scale);

    if (progress >= 1.0) {
      this.isSimulating = false;
      this.pos.y = floorY;
      this.enforceFrustumBounds();
      this.quat.copy(this.targetQuat);
      this.vel.set(0, 0, 0);
      this.angularVel.set(0, 0, 0);
      this.onUpdate?.(this.pos, this.quat, 1.0);
      this.onComplete?.();
      return false;
    }

    return true;
  }

  public stop() {
    this.isSimulating = false;
  }
}

