import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Mosque3DWalkthrough = () => {
  const mountRef = useRef(null);
  const [isInside, setIsInside] = useState(false);
  const [isDayTime, setIsDayTime] = useState(false); // Day / Night mode
  const [isAutoWalking, setIsAutoWalking] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("Outside Grand Entrance");
  const [controlsHint, setControlsHint] = useState(true);

  // Mutable refs for high-fps game loop
  const stateRef = useRef({
    cameraPos: new THREE.Vector3(0, 1.8, 28),
    targetPos: new THREE.Vector3(0, 1.8, 28),
    cameraRot: new THREE.Euler(0, 0, 0, "YXZ"),
    targetRot: new THREE.Euler(0, 0, 0, "YXZ"),
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    keys: {},
    stepCycle: 0,
    speed: 0.18,
  });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // ── 1. Scene & Photorealistic Atmospheric Renderer ──
    const scene = new THREE.Scene();
    const fogColor = isDayTime ? 0x0f172a : 0x030712;
    scene.fog = new THREE.FogExp2(fogColor, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(stateRef.current.cameraPos);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDayTime ? 1.25 : 1.45;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // ── 2. Procedural Photorealistic Textures Generator ──

    // A. High-Resolution Turkish Velvet Carpet (Emerald & Gold Sajadah)
    const carpetCanvas = document.createElement("canvas");
    carpetCanvas.width = 1024;
    carpetCanvas.height = 1024;
    const cCtx = carpetCanvas.getContext("2d");

    // Base deep emerald velvet weave
    cCtx.fillStyle = "#062b1a";
    cCtx.fillRect(0, 0, 1024, 1024);

    // Micro velvet fiber texture
    for (let i = 0; i < 40000; i++) {
      cCtx.fillStyle = Math.random() > 0.5 ? "rgba(10, 54, 34, 0.3)" : "rgba(2, 28, 16, 0.4)";
      cCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }

    // Gold Mihrab Prayer Arch border
    cCtx.strokeStyle = "#eab308";
    cCtx.lineWidth = 14;
    cCtx.strokeRect(32, 32, 960, 960);

    cCtx.lineWidth = 8;
    cCtx.strokeStyle = "#ca8a04";
    cCtx.strokeRect(54, 54, 916, 916);

    // Arch apex
    cCtx.beginPath();
    cCtx.arc(512, 280, 220, Math.PI, 0, false);
    cCtx.strokeStyle = "#facc15";
    cCtx.lineWidth = 10;
    cCtx.stroke();

    // Sacred arabesque floral motif inside arch
    cCtx.fillStyle = "rgba(234, 179, 8, 0.18)";
    cCtx.fill();
    cCtx.beginPath();
    cCtx.arc(512, 280, 60, 0, Math.PI * 2);
    cCtx.fillStyle = "rgba(250, 204, 21, 0.35)";
    cCtx.fill();

    const carpetTex = new THREE.CanvasTexture(carpetCanvas);
    carpetTex.wrapS = THREE.RepeatWrapping;
    carpetTex.wrapT = THREE.RepeatWrapping;
    carpetTex.repeat.set(6, 18);
    carpetTex.anisotropy = 16;

    // B. Real Carrara White & Gold Veined Marble Texture
    const marbleCanvas = document.createElement("canvas");
    marbleCanvas.width = 1024;
    marbleCanvas.height = 1024;
    const mCtx = marbleCanvas.getContext("2d");

    mCtx.fillStyle = "#f8fafc";
    mCtx.fillRect(0, 0, 1024, 1024);

    // Natural grey & gold organic veins
    for (let v = 0; v < 14; v++) {
      mCtx.beginPath();
      let startX = Math.random() * 1024;
      let startY = 0;
      mCtx.moveTo(startX, startY);

      while (startY < 1024) {
        startX += (Math.random() - 0.48) * 45;
        startY += Math.random() * 40;
        mCtx.lineTo(startX, startY);
      }

      mCtx.strokeStyle = v % 2 === 0 ? "rgba(202, 138, 4, 0.25)" : "rgba(148, 163, 184, 0.35)";
      mCtx.lineWidth = 2 + Math.random() * 5;
      mCtx.stroke();
    }

    const marbleTex = new THREE.CanvasTexture(marbleCanvas);
    marbleTex.wrapS = THREE.RepeatWrapping;
    marbleTex.wrapT = THREE.RepeatWrapping;
    marbleTex.repeat.set(2, 6);
    marbleTex.anisotropy = 16;

    // C. Blue Iznik Ceramic Wall Tiles Texture (Mihrab Wall)
    const iznikCanvas = document.createElement("canvas");
    iznikCanvas.width = 512;
    iznikCanvas.height = 512;
    const iCtx = iznikCanvas.getContext("2d");

    iCtx.fillStyle = "#0c4a6e"; // Cobalt Blue
    iCtx.fillRect(0, 0, 512, 512);

    iCtx.strokeStyle = "#38bdf8";
    iCtx.lineWidth = 4;
    iCtx.strokeRect(10, 10, 492, 492);

    // 8-pointed star in center
    iCtx.fillStyle = "#0284c7";
    iCtx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 120 : 60;
      const x = 256 + Math.cos(angle) * r;
      const y = 256 + Math.sin(angle) * r;
      if (i === 0) iCtx.moveTo(x, y);
      else iCtx.lineTo(x, y);
    }
    iCtx.closePath();
    iCtx.fill();
    iCtx.strokeStyle = "#fde047";
    iCtx.lineWidth = 5;
    iCtx.stroke();

    const iznikTex = new THREE.CanvasTexture(iznikCanvas);
    iznikTex.wrapS = THREE.RepeatWrapping;
    iznikTex.wrapT = THREE.RepeatWrapping;
    iznikTex.repeat.set(8, 4);

    // ── 3. Realistic Dynamic Lighting ──
    const ambientLight = new THREE.AmbientLight(
      isDayTime ? 0xfffbeb : 0x1e293b,
      isDayTime ? 1.1 : 0.4
    );
    scene.add(ambientLight);

    // Golden Sanctuary Mihrab Spotlight
    const mihrabSpot = new THREE.SpotLight(0xfef08a, 4.5, 35, Math.PI / 4, 0.4, 1.2);
    mihrabSpot.position.set(0, 9, -15);
    mihrabSpot.target.position.set(0, 3, -24);
    scene.add(mihrabSpot);
    scene.add(mihrabSpot.target);

    // Grand Sun/Moonlight Beam streaming from entrance arch
    const sunBeam = new THREE.DirectionalLight(isDayTime ? 0xfde68a : 0x60a5fa, isDayTime ? 2.4 : 1.2);
    sunBeam.position.set(5, 18, 38);
    sunBeam.castShadow = true;
    sunBeam.shadow.mapSize.width = 1024;
    sunBeam.shadow.mapSize.height = 1024;
    scene.add(sunBeam);

    // ── 4. Architectural Mosque Geometry ──

    // A. Floor (Carpet inside, Polished Marble outside gate)
    const carpetMat = new THREE.MeshStandardMaterial({
      map: carpetTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const insideFloor = new THREE.Mesh(new THREE.PlaneGeometry(24, 52), carpetMat);
    insideFloor.rotation.x = -Math.PI / 2;
    insideFloor.position.set(0, 0, 0);
    insideFloor.receiveShadow = true;
    scene.add(insideFloor);

    // Outside Marble Courtyard Floor
    const outsideMarbleMat = new THREE.MeshStandardMaterial({
      map: marbleTex,
      roughness: 0.15,
      metalness: 0.1,
    });
    const courtyardFloor = new THREE.Mesh(new THREE.PlaneGeometry(36, 30), outsideMarbleMat);
    courtyardFloor.rotation.x = -Math.PI / 2;
    courtyardFloor.position.set(0, -0.05, 38);
    courtyardFloor.receiveShadow = true;
    scene.add(courtyardFloor);

    // B. Marble Columns & Vaulted Arches
    const columnMat = new THREE.MeshStandardMaterial({
      map: marbleTex,
      roughness: 0.25,
      metalness: 0.1,
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x713f12,
      emissiveIntensity: 0.4,
    });

    const pillarZ = [24, 16, 8, 0, -8, -16];
    const animatedLanterns = [];

    pillarZ.forEach((z, idx) => {
      // Left Column
      const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 11, 32), columnMat);
      colL.position.set(-8.5, 5.5, z);
      colL.castShadow = true;
      scene.add(colL);

      const baseL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), goldTrimMat);
      baseL.position.set(-8.5, 0.4, z);
      scene.add(baseL);

      // Right Column
      const colR = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 11, 32), columnMat);
      colR.position.set(8.5, 5.5, z);
      colR.castShadow = true;
      scene.add(colR);

      const baseR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), goldTrimMat);
      baseR.position.set(8.5, 0.4, z);
      scene.add(baseR);

      // Horseshoe Arch Connecting Columns
      const archMesh = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.45, 16, 40, Math.PI), goldTrimMat);
      archMesh.position.set(0, 8.5, z);
      scene.add(archMesh);

      // Hanging Brass Islamic Fanoos Lantern
      const lanternGroup = new THREE.Group();
      const lanternBody = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xeab308,
          emissiveIntensity: 1.8,
          roughness: 0.1,
        })
      );
      lanternGroup.add(lanternBody);

      // Chain
      const chain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 2.5),
        goldTrimMat
      );
      chain.position.y = 1.3;
      lanternGroup.add(chain);

      lanternGroup.position.set(0, 6.2, z);
      scene.add(lanternGroup);
      animatedLanterns.push(lanternGroup);

      // Lantern warm point light
      const pLight = new THREE.PointLight(0xf59e0b, 1.2, 14);
      pLight.position.set(0, 6, z);
      scene.add(pLight);
    });

    // C. Grand Gateway (Bab Al-Salam Arch) at Z = 26
    const entranceGateGroup = new THREE.Group();

    // Massive arched portal
    const grandPortalArch = new THREE.Mesh(
      new THREE.TorusGeometry(7.5, 1.2, 20, 48, Math.PI),
      goldTrimMat
    );
    grandPortalArch.position.set(0, 6.5, 26);
    entranceGateGroup.add(grandPortalArch);

    // Calligraphy Shield at Gate Center
    const crest = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.5, 0),
      goldTrimMat
    );
    crest.position.set(0, 14.2, 26);
    entranceGateGroup.add(crest);
    scene.add(entranceGateGroup);

    // D. Radiant Mihrab & Minbar at the Sanctuary End (Z = -24)
    const mihrabWallGroup = new THREE.Group();

    // Back Wall with Iznik Tiles
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(24, 12, 1),
      new THREE.MeshStandardMaterial({ map: iznikTex, roughness: 0.3 })
    );
    backWall.position.set(0, 6, -24.5);
    mihrabWallGroup.add(backWall);

    // Golden Mihrab Niche
    const mihrabNiche = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 10, 32, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({
        color: 0x065f46,
        emissive: 0x047857,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        side: THREE.BackSide,
      })
    );
    mihrabNiche.rotation.y = Math.PI / 2;
    mihrabNiche.position.set(0, 5, -24.2);
    mihrabWallGroup.add(mihrabNiche);

    // Mihrab Golden Outer Arch
    const mihrabArch = new THREE.Mesh(
      new THREE.TorusGeometry(4, 0.6, 16, 32, Math.PI),
      goldTrimMat
    );
    mihrabArch.position.set(0, 5, -23.8);
    mihrabWallGroup.add(mihrabArch);

    // Minbar (Imam's Wooden Step Pulpit)
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.4,
      metalness: 0.1,
    });
    for (let s = 0; s < 6; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2, 0.45, 0.9), woodMat);
      step.position.set(5.5, 0.25 + s * 0.45, -22.5 + s * 0.75);
      mihrabWallGroup.add(step);
    }
    scene.add(mihrabWallGroup);

    // E. Realistic Multi-Tiered Brass Chandelier
    const chandelierGroup = new THREE.Group();
    for (let t = 0; t < 3; t++) {
      const radius = 3.2 - t * 0.8;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.08, 12, 40),
        goldTrimMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 8.5 - t * 0.7;
      chandelierGroup.add(ring);
    }
    chandelierGroup.position.set(0, 0, -4);
    scene.add(chandelierGroup);

    const chandelierLight = new THREE.PointLight(0xffedd5, 3.2, 28);
    chandelierLight.position.set(0, 7.5, -4);
    scene.add(chandelierLight);

    // F. Volumetric Shimmering Sacred Dust Particles (1,200 Particles)
    const particleCount = 1200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 1] = 0.5 + Math.random() * 9;
      pPos[i * 3 + 2] = -24 + Math.random() * 52;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const dustParticles = new THREE.Points(pGeo, pMat);
    scene.add(dustParticles);

    // ── 5. First-Person Controls (Keyboard + Mouse Drag Look) ──
    const handleKeyDown = (e) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      setControlsHint(false);
    };

    const handleKeyUp = (e) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!stateRef.current.isDragging) return;
      const deltaX = e.clientX - stateRef.current.prevMouse.x;
      const deltaY = e.clientY - stateRef.current.prevMouse.y;

      stateRef.current.targetRot.y -= deltaX * 0.004;
      stateRef.current.targetRot.x -= deltaY * 0.003;

      // Limit pitch to prevent flipping
      stateRef.current.targetRot.x = Math.max(-0.6, Math.min(0.6, stateRef.current.targetRot.x));

      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        stateRef.current.isDragging = true;
        stateRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (!stateRef.current.isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - stateRef.current.prevMouse.x;
      const deltaY = e.touches[0].clientY - stateRef.current.prevMouse.y;

      stateRef.current.targetRot.y -= deltaX * 0.006;
      stateRef.current.targetRot.x -= deltaY * 0.004;
      stateRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    currentMount.addEventListener("mousedown", handleMouseDown);
    currentMount.addEventListener("touchstart", handleTouchStart);
    currentMount.addEventListener("touchmove", handleTouchMove);
    currentMount.addEventListener("touchend", handleMouseUp);

    // ── 6. Responsive Resize ──
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // ── 7. Animation Loop with Footstep Head-Bobbing & Physics ──
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Keyboard Walking Physics
      let isMoving = false;
      const moveVector = new THREE.Vector3();

      if (stateRef.current.keys["w"] || stateRef.current.keys["arrowup"]) {
        moveVector.z -= 1;
        isMoving = true;
      }
      if (stateRef.current.keys["s"] || stateRef.current.keys["arrowdown"]) {
        moveVector.z += 1;
        isMoving = true;
      }
      if (stateRef.current.keys["a"] || stateRef.current.keys["arrowleft"]) {
        moveVector.x -= 1;
        isMoving = true;
      }
      if (stateRef.current.keys["d"] || stateRef.current.keys["arrowright"]) {
        moveVector.x += 1;
        isMoving = true;
      }

      if (isMoving) {
        setIsAutoWalking(false);
        moveVector.normalize();
        moveVector.applyEuler(new THREE.Euler(0, stateRef.current.cameraRot.y, 0));
        stateRef.current.targetPos.addScaledVector(moveVector, stateRef.current.speed);

        // Clamp camera position inside mosque boundaries
        stateRef.current.targetPos.x = Math.max(-9, Math.min(9, stateRef.current.targetPos.x));
        stateRef.current.targetPos.z = Math.max(-21, Math.min(32, stateRef.current.targetPos.z));

        // Walking head-bobbing simulation
        stateRef.current.stepCycle += delta * 10;
        stateRef.current.targetPos.y = 1.8 + Math.sin(stateRef.current.stepCycle) * 0.06;
      } else if (isAutoWalking) {
        // Smooth Auto Cinematic Cruise from outside through gate to Mihrab
        const autoZ = 5 + Math.sin(elapsed * 0.35) * 22;
        stateRef.current.targetPos.z = autoZ;
        stateRef.current.targetPos.y = 1.8;
      }

      // Smooth interpolation for camera position & rotation
      stateRef.current.cameraPos.lerp(stateRef.current.targetPos, 0.08);
      camera.position.copy(stateRef.current.cameraPos);

      stateRef.current.cameraRot.x = THREE.MathUtils.lerp(
        stateRef.current.cameraRot.x,
        stateRef.current.targetRot.x,
        0.08
      );
      stateRef.current.cameraRot.y = THREE.MathUtils.lerp(
        stateRef.current.cameraRot.y,
        stateRef.current.targetRot.y,
        0.08
      );
      camera.rotation.copy(stateRef.current.cameraRot);

      // Location State Calculation
      const currentZ = stateRef.current.cameraPos.z;
      if (currentZ > 25) {
        setCurrentLocation("🚪 Outside Grand Gate (Bab Al-Salam)");
        setIsInside(false);
      } else if (currentZ > 10) {
        setCurrentLocation("🏛️ Entering Grand Marble Archway");
        setIsInside(true);
      } else if (currentZ > -8) {
        setCurrentLocation("🕌 Inside Main Prayer Hall (Under Chandelier)");
        setIsInside(true);
      } else {
        setCurrentLocation("✨ In Front of Sacred Mihrab & Minbar");
        setIsInside(true);
      }

      // Gentle Lantern Floating Physics
      animatedLanterns.forEach((lantern, i) => {
        lantern.rotation.y += 0.008;
        lantern.position.y = 6.2 + Math.sin(elapsed * 2 + i) * 0.05;
      });

      // Chandelier slow rotation
      chandelierGroup.rotation.y += 0.002;

      // Dust Motes slow shimmering drift
      dustParticles.rotation.y -= 0.0006;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      currentMount.removeEventListener("mousedown", handleMouseDown);
      currentMount.removeEventListener("touchstart", handleTouchStart);
      currentMount.removeEventListener("touchmove", handleTouchMove);
      currentMount.removeEventListener("touchend", handleMouseUp);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDayTime, isAutoWalking]);

  // Direct Position Teleports
  const gotoEntrance = () => {
    setIsAutoWalking(false);
    stateRef.current.targetPos.set(0, 1.8, 29);
    stateRef.current.targetRot.set(0, 0, 0);
  };

  const gotoMidway = () => {
    setIsAutoWalking(false);
    stateRef.current.targetPos.set(0, 1.8, 12);
    stateRef.current.targetRot.set(0, 0, 0);
  };

  const gotoMihrab = () => {
    setIsAutoWalking(false);
    stateRef.current.targetPos.set(0, 1.8, -18);
    stateRef.current.targetRot.set(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[640px] rounded-3xl overflow-hidden border-2 border-yellow-500/40 shadow-2xl shadow-black/90 bg-slate-950 select-none">
      {/* Three.js Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Status & Lighting Toggle */}
      <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        {/* Location Badge */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-yellow-500/40 rounded-2xl px-4 py-2.5 text-white shadow-2xl pointer-events-auto flex items-center gap-3">
          <span className="text-2xl animate-pulse">🕌</span>
          <div>
            <p className="text-xs sm:text-sm font-black text-yellow-400 m-0">
              Photorealistic 3D Mosque Walkthrough
            </p>
            <p className="text-[11px] text-gray-300 font-medium m-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {currentLocation}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Day / Night Mode */}
          <button
            type="button"
            onClick={() => setIsDayTime(!isDayTime)}
            className="bg-slate-900/90 hover:bg-slate-800 text-yellow-300 border border-yellow-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
            title="Toggle Day/Night Lighting"
          >
            <span>{isDayTime ? "☀️ Day Sunbeams" : "🌙 Night Lanterns"}</span>
          </button>

          {/* Auto Cruise Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoWalking(!isAutoWalking)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-lg ${
              isAutoWalking
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 animate-pulse"
                : "bg-slate-900/90 text-gray-300 border-white/20 hover:text-white"
            }`}
          >
            {isAutoWalking ? "⏸️ Pause Cruise" : "▶️ Auto Walk"}
          </button>
        </div>
      </div>

      {/* Floating WASD / Arrow Keys Control Hint */}
      {controlsHint && (
        <div className="absolute top-24 left-5 bg-slate-950/90 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-3 text-xs text-white shadow-2xl max-w-xs animate-fade-in hidden sm:block pointer-events-none">
          <p className="font-bold text-yellow-400 mb-1 flex items-center gap-1">
            <span>🎮</span> First-Person Controls:
          </p>
          <p className="text-gray-300 text-[11px] m-0 leading-relaxed">
            • Use <strong>W / A / S / D</strong> or <strong>Arrow Keys</strong> to walk.
            <br />• <strong>Click & Drag</strong> mouse to look around in 360°.
          </p>
        </div>
      )}

      {/* Bottom Walkthrough Teleport Buttons */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-yellow-500/40 rounded-2xl p-2 shadow-2xl flex items-center gap-2 max-w-[95%] overflow-x-auto z-10">
        <button
          type="button"
          onClick={gotoEntrance}
          className="bg-slate-900 hover:bg-slate-800 text-yellow-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-yellow-500/20 whitespace-nowrap active:scale-95"
        >
          🚪 Step Outside Gate
        </button>

        <button
          type="button"
          onClick={gotoMidway}
          className="bg-slate-900 hover:bg-slate-800 text-yellow-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-yellow-500/20 whitespace-nowrap active:scale-95"
        >
          🏛️ Walk Through Pillars
        </button>

        <button
          type="button"
          onClick={gotoMihrab}
          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-lg whitespace-nowrap active:scale-95"
        >
          ✨ Step into Mihrab Sanctuary
        </button>
      </div>

      {/* Look Around Instruction */}
      <div className="absolute bottom-5 right-5 hidden lg:flex items-center gap-2 bg-slate-950/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] text-gray-300 border border-white/10 pointer-events-none">
        <span>👀 Click & Drag to Look 360°</span>
      </div>
    </div>
  );
};

export default Mosque3DWalkthrough;
