import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ThemeMode } from '../types';

interface AviationGlobe3DProps {
  theme: ThemeMode;
}

interface HubCoord {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

const AVIATION_HUBS: HubCoord[] = [
  { code: 'DAC', name: 'Dhaka', lat: 23.81, lng: 90.41 },
  { code: 'DXB', name: 'Dubai', lat: 25.25, lng: 55.36 },
  { code: 'LHR', name: 'London', lat: 51.47, lng: -0.45 },
  { code: 'HND', name: 'Tokyo', lat: 35.55, lng: 139.78 },
  { code: 'ICN', name: 'Seoul', lat: 37.46, lng: 126.44 },
  { code: 'JFK', name: 'New York', lat: 40.64, lng: -73.78 },
];

const FLIGHT_ROUTES: [string, string][] = [
  ['DAC', 'DXB'],
  ['DAC', 'LHR'],
  ['DXB', 'LHR'],
  ['DXB', 'HND'],
  ['DAC', 'ICN'],
  ['LHR', 'JFK'],
  ['HND', 'ICN'],
  ['DAC', 'HND'],
];

const GLOBE_RADIUS = 1.65;

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

interface Palette {
  coreColor: number;
  wireColor: number;
  wireOpacity: number;
  dotColor: number;
  arcColor: number;
  arcOpacity: number;
  jetColor: number;
  trailColor: number;
  beaconColor: number;
  atmosphereColor: THREE.Color;
}

function getPalette(theme: ThemeMode): Palette {
  if (theme === 'dark') {
    return {
      coreColor: 0x061326,
      wireColor: 0x264873,
      wireOpacity: 0.24,
      dotColor: 0x94b8e0,
      arcColor: 0xeab308, // Champagne gold
      arcOpacity: 0.52,
      jetColor: 0xfef08a,
      trailColor: 0xeab308,
      beaconColor: 0xeab308,
      atmosphereColor: new THREE.Color(0xd8b774),
    };
  }
  return {
    coreColor: 0x0f2b52,
    wireColor: 0x38bdf8, // Crisp sky-blue grid
    wireOpacity: 0.34,
    dotColor: 0x7dd3fc,
    arcColor: 0xf59e0b, // Rich amber-gold routes
    arcOpacity: 0.65,
    jetColor: 0xfef3c7,
    trailColor: 0xf59e0b,
    beaconColor: 0xfbbf24,
    atmosphereColor: new THREE.Color(0x60a5fa),
  };
}

export const AviationGlobe3D: React.FC<AviationGlobe3DProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<{
    coreMat: THREE.MeshPhongMaterial;
    wireMat: THREE.MeshBasicMaterial;
    dotsMat: THREE.PointsMaterial;
    arcMats: THREE.LineBasicMaterial[];
    jetMats: THREE.MeshBasicMaterial[];
    trailMats: THREE.LineBasicMaterial[];
    beaconMats: THREE.MeshBasicMaterial[];
    ringMats: THREE.MeshBasicMaterial[];
    atmoUniforms: { uColor: { value: THREE.Color } };
  } | null>(null);

  // Dynamically sync colors when user switches Dark <-> Light mode without recreating WebGL context
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats) return;
    const p = getPalette(theme);
    mats.coreMat.color.setHex(p.coreColor);
    mats.wireMat.color.setHex(p.wireColor);
    mats.wireMat.opacity = p.wireOpacity;
    mats.dotsMat.color.setHex(p.dotColor);
    mats.arcMats.forEach((m) => {
      m.color.setHex(p.arcColor);
      m.opacity = p.arcOpacity;
    });
    mats.jetMats.forEach((m) => m.color.setHex(p.jetColor));
    mats.trailMats.forEach((m) => m.color.setHex(p.trailColor));
    mats.beaconMats.forEach((m) => m.color.setHex(p.beaconColor));
    mats.ringMats.forEach((m) => m.color.setHex(p.beaconColor));
    mats.atmoUniforms.uColor.value.copy(p.atmosphereColor);
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const palette = getPalette(theme);

    const scene = new THREE.Scene();
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 5.1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Subtle Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xe2ecff, 1.15);
    dirLight.position.set(5, 4, 6);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xeab308, 0.45);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Master rotating globe group — oriented initially toward South Asia / Middle East / Europe
    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -2.45;
    globeGroup.rotation.x = 0.28;
    scene.add(globeGroup);

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    // 1. Deep Navy Core Sphere
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 48);
    const coreMat = new THREE.MeshPhongMaterial({
      color: palette.coreColor,
      shininess: 18,
      transparent: true,
      opacity: 0.94,
    });
    disposableGeometries.push(coreGeo);
    disposableMaterials.push(coreMat);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 2. Subtle Wireframe Cartography Grid
    const wireGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 0.008, 28, 20);
    const wireMat = new THREE.MeshBasicMaterial({
      color: palette.wireColor,
      wireframe: true,
      transparent: true,
      opacity: palette.wireOpacity,
    });
    disposableGeometries.push(wireGeo);
    disposableMaterials.push(wireMat);
    globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // 3. Fibonacci Dotted Surface Points
    const dotCount = 1300;
    const dotPositions = new Float32Array(dotCount * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < dotCount; i++) {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const rr = GLOBE_RADIUS + 0.014;
      dotPositions[i * 3] = Math.cos(theta) * r * rr;
      dotPositions[i * 3 + 1] = y * rr;
      dotPositions[i * 3 + 2] = Math.sin(theta) * r * rr;
    }
    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotsMat = new THREE.PointsMaterial({
      color: palette.dotColor,
      size: 0.022,
      transparent: true,
      opacity: 0.65,
    });
    disposableGeometries.push(dotsGeo);
    disposableMaterials.push(dotsMat);
    globeGroup.add(new THREE.Points(dotsGeo, dotsMat));

    // 4. Soft Atmospheric Rim Glow (Fresnel Shader)
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.13, 48, 48);
    const atmoUniforms = {
      uColor: { value: palette.atmosphereColor.clone() },
    };
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: atmoUniforms,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
          gl_FragColor = vec4(uColor, clamp(intensity, 0.0, 0.65));
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    disposableGeometries.push(atmoGeo);
    disposableMaterials.push(atmoMat);
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // 5. Hub Beacons & Pulsing Rings
    const hubMap = new Map<string, THREE.Vector3>();
    const beaconMats: THREE.MeshBasicMaterial[] = [];
    const ringMats: THREE.MeshBasicMaterial[] = [];
    const pulseRings: { mesh: THREE.Mesh; offset: number }[] = [];

    const beaconGeo = new THREE.SphereGeometry(0.036, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.048, 0.068, 24);
    disposableGeometries.push(beaconGeo, ringGeo);

    AVIATION_HUBS.forEach((hub, idx) => {
      const pos = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS + 0.02);
      hubMap.set(hub.code, pos);

      const bMat = new THREE.MeshBasicMaterial({ color: palette.beaconColor });
      beaconMats.push(bMat);
      disposableMaterials.push(bMat);

      const beacon = new THREE.Mesh(beaconGeo, bMat);
      beacon.position.copy(pos);
      globeGroup.add(beacon);

      const rMat = new THREE.MeshBasicMaterial({
        color: palette.beaconColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      ringMats.push(rMat);
      disposableMaterials.push(rMat);

      const ring = new THREE.Mesh(ringGeo, rMat);
      ring.position.copy(pos.clone().multiplyScalar(1.005));
      ring.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(ring);
      pulseRings.push({ mesh: ring, offset: idx * 0.9 });
    });

    // 6. Curved 3D Flight Arcs (QuadraticBezierCurve3) + Animated Aircraft & Light Trails
    const arcMats: THREE.LineBasicMaterial[] = [];
    const jetMats: THREE.MeshBasicMaterial[] = [];
    const trailMats: THREE.LineBasicMaterial[] = [];

    const jetConeGeo = new THREE.ConeGeometry(0.028, 0.11, 6);
    jetConeGeo.rotateX(Math.PI / 2); // Point cone tip along +Z for lookAt()
    disposableGeometries.push(jetConeGeo);

    interface AnimatedFlight {
      curve: THREE.QuadraticBezierCurve3;
      jetMesh: THREE.Mesh;
      trailLine: THREE.Line;
      trailGeo: THREE.BufferGeometry;
      progress: number;
      speed: number;
    }

    const animatedFlights: AnimatedFlight[] = [];
    const TRAIL_SEGMENTS = 18;

    FLIGHT_ROUTES.forEach(([fromCode, toCode], idx) => {
      const start = hubMap.get(fromCode);
      const end = hubMap.get(toCode);
      if (!start || !end) return;

      const dist = start.distanceTo(end);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const arcAltitude = GLOBE_RADIUS + Math.min(0.82, 0.24 + dist * 0.26);
      mid.normalize().multiplyScalar(arcAltitude);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const arcPoints = curve.getPoints(56);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: palette.arcColor,
        transparent: true,
        opacity: palette.arcOpacity,
      });
      disposableGeometries.push(arcGeo);
      disposableMaterials.push(arcMat);
      arcMats.push(arcMat);
      globeGroup.add(new THREE.Line(arcGeo, arcMat));

      // Sleek 3D Aircraft Cone Marker
      const jMat = new THREE.MeshBasicMaterial({ color: palette.jetColor });
      disposableMaterials.push(jMat);
      jetMats.push(jMat);
      const jetMesh = new THREE.Mesh(jetConeGeo, jMat);
      globeGroup.add(jetMesh);

      // Dynamic Glowing Light Trail behind each aircraft
      const trailPositions = new Float32Array(TRAIL_SEGMENTS * 3);
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMat = new THREE.LineBasicMaterial({
        color: palette.trailColor,
        transparent: true,
        opacity: 0.92,
      });
      disposableGeometries.push(trailGeo);
      disposableMaterials.push(trailMat);
      trailMats.push(trailMat);
      const trailLine = new THREE.Line(trailGeo, trailMat);
      globeGroup.add(trailLine);

      animatedFlights.push({
        curve,
        jetMesh,
        trailLine,
        trailGeo,
        progress: (idx * 0.17) % 1,
        speed: 0.095 + (idx % 3) * 0.022,
      });
    });

    materialsRef.current = {
      coreMat,
      wireMat,
      dotsMat,
      arcMats,
      jetMats,
      trailMats,
      beaconMats,
      ringMats,
      atmoUniforms,
    };

    // Pointer / Touch Drag Rotation with Smooth Inertia
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;

    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'pan-y';

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      canvas.style.cursor = 'grabbing';
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      velY = dx * 0.0065;
      velX = dy * 0.0045;
      globeGroup.rotation.y += velY;
      globeGroup.rotation.x = Math.max(-0.85, Math.min(0.85, globeGroup.rotation.x + velX));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      canvas.style.cursor = 'grab';
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(200, Math.floor(entry.contentRect.width));
        const h = Math.max(200, Math.floor(entry.contentRect.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // 60fps Animation Loop
    let rafId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      rafId = window.requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!isDragging) {
        // Gentle idle auto-rotation + smooth inertia damping
        globeGroup.rotation.y += 0.14 * dt + velY;
        globeGroup.rotation.x = Math.max(
          -0.85,
          Math.min(0.85, globeGroup.rotation.x + velX)
        );
        velX *= 0.92;
        velY *= 0.92;
      }

      // Pulse hub beacon rings
      const tSec = now * 0.0022;
      for (const ring of pulseRings) {
        const wave = ((tSec + ring.offset) % 2) / 2;
        const scale = 1 + wave * 1.15;
        ring.mesh.scale.set(scale, scale, 1);
        (ring.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - wave) * 0.65;
      }

      // Animate 3D aircraft & trails along QuadraticBezierCurve3 arcs
      for (const f of animatedFlights) {
        f.progress = (f.progress + f.speed * dt) % 1;
        const pos = f.curve.getPoint(f.progress);
        const lookT = Math.min(0.999, f.progress + 0.015);
        const nextPos = f.curve.getPoint(lookT);

        f.jetMesh.position.copy(pos);
        f.jetMesh.lookAt(
          globeGroup.localToWorld(nextPos.clone())
        );

        const attr = f.trailGeo.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < TRAIL_SEGMENTS; i++) {
          const trailT = Math.max(0, f.progress - (i / TRAIL_SEGMENTS) * 0.16);
          const tp = f.curve.getPoint(trailT);
          attr.setXYZ(i, tp.x, tp.y, tp.z);
        }
        attr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    rafId = window.requestAnimationFrame(animate);

    // Proper WebGL Cleanup on Unmount
    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);

      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      renderer.dispose();
      materialsRef.current = null;
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-[290px] sm:h-[340px] lg:h-[430px] select-none">
      <div ref={containerRef} className="w-full h-full" aria-label="Interactive 3D Intrega Wings Global Flight Network Globe" />

      {/* Subtle Hub Legend & Drag Hint */}
      <div className="pointer-events-none absolute bottom-1 inset-x-0 flex flex-wrap items-center justify-center gap-2 px-3">
        <span className="px-2.5 py-1 rounded-full bg-[#070F1D]/65 backdrop-blur-sm border border-[#D8B774]/30 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D8B774]">
          Drag to Rotate &bull; DAC &bull; DXB &bull; LHR &bull; HND &bull; ICN &bull; JFK
        </span>
      </div>
    </div>
  );
};
