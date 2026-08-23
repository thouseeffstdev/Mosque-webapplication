import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Kaaba3DExperience = () => {
  const mountRef = useRef(null);
  const [isDayTime, setIsDayTime] = useState(true); // Default to bright panoramic daylight matching the photo
  const [cameraView, setCameraView] = useState("panoramic"); // 'panoramic' | 'tawaf' | 'bridge' | 'ground'
  const [pilgrimDensity, setPilgrimDensity] = useState("ultra");

  const stateRef = useRef({
    cameraPos: new THREE.Vector3(0, 22, 54),
    targetLookAt: new THREE.Vector3(0, 6, 0),
    targetCameraPos: new THREE.Vector3(0, 22, 54),
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    orbitAngle: 0.15,
    orbitRadius: 54,
    orbitHeight: 22,
    orbitSpeed: 0.06,
  });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // ── 1. Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    const skyColor = isDayTime ? 0x60a5fa : 0x020617;
    scene.fog = new THREE.FogExp2(skyColor, 0.005);

    const camera = new THREE.PerspectiveCamera(
      62, // Wide-Angle Panoramic FOV matching the reference photo
      currentMount.clientWidth / currentMount.clientHeight,
      0.5,
      2500
    );
    camera.position.set(0, 22, 54);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDayTime ? 1.35 : 1.55;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // ── 2. Realistic Makkah Daylight & Night Lighting ──
    const ambientLight = new THREE.AmbientLight(
      isDayTime ? 0xfffbeb : 0x1e293b,
      isDayTime ? 1.4 : 0.65
    );
    scene.add(ambientLight);

    // Bright Mediterranean/Arabian Desert Sunlight casting crisp soft shadows
    const mainSun = new THREE.DirectionalLight(
      isDayTime ? 0xfef08a : 0x38bdf8,
      isDayTime ? 3.6 : 2.0
    );
    mainSun.position.set(45, 80, 45);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.camera.near = 10;
    mainSun.shadow.camera.far = 300;
    mainSun.shadow.camera.left = -70;
    mainSun.shadow.camera.right = 70;
    mainSun.shadow.camera.top = 70;
    mainSun.shadow.camera.bottom = -70;
    scene.add(mainSun);

    // Kaaba Center Highlight Spotlight
    const kaabaSpotlight = new THREE.SpotLight(0xfef08a, 4.5, 90, Math.PI / 3, 0.4);
    kaabaSpotlight.position.set(20, 35, 30);
    kaabaSpotlight.target.position.set(0, 6, 0);
    scene.add(kaabaSpotlight);
    scene.add(kaabaSpotlight.target);

    // Green Night Minaret Beacons
    const greenBeacons = [
      new THREE.Vector3(-45, 52, -45),
      new THREE.Vector3(45, 52, -45),
      new THREE.Vector3(-45, 52, 45),
      new THREE.Vector3(45, 52, 45),
      new THREE.Vector3(0, 58, -65),
    ];
    greenBeacons.forEach((pos) => {
      const gLight = new THREE.PointLight(0x10b981, isDayTime ? 0.6 : 3.8, 65);
      gLight.position.copy(pos);
      scene.add(gLight);
    });

    // ── 3. High-Resolution Textures ──

    // A. Kiswah Black Silk with Golden Calligraphy Belt
    const kiswahCanvas = document.createElement("canvas");
    kiswahCanvas.width = 1024;
    kiswahCanvas.height = 1024;
    const kCtx = kiswahCanvas.getContext("2d");

    kCtx.fillStyle = "#09090b";
    kCtx.fillRect(0, 0, 1024, 1024);

    // Silk weave pattern
    kCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    kCtx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 32) {
      kCtx.beginPath();
      kCtx.moveTo(x, 0);
      kCtx.lineTo(x + 1024, 1024);
      kCtx.stroke();
      kCtx.beginPath();
      kCtx.moveTo(x, 1024);
      kCtx.lineTo(x + 1024, 0);
      kCtx.stroke();
    }

    // Golden Calligraphy Belt (Hizam)
    kCtx.fillStyle = "rgba(234, 179, 8, 0.25)";
    kCtx.fillRect(0, 240, 1024, 140);
    kCtx.strokeStyle = "#facc15";
    kCtx.lineWidth = 8;
    kCtx.strokeRect(0, 240, 1024, 140);
    kCtx.strokeStyle = "#ca8a04";
    kCtx.lineWidth = 4;
    kCtx.strokeRect(0, 255, 1024, 110);

    kCtx.fillStyle = "#fde047";
    kCtx.font = "bold 30px serif";
    kCtx.textAlign = "center";
    for (let c = 80; c < 1024; c += 170) {
      kCtx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", c, 320);
    }
    const kiswahTex = new THREE.CanvasTexture(kiswahCanvas);

    // B. Bab al-Kaaba (Gold Door)
    const doorCanvas = document.createElement("canvas");
    doorCanvas.width = 512;
    doorCanvas.height = 1024;
    const dCtx = doorCanvas.getContext("2d");
    dCtx.fillStyle = "#eab308";
    dCtx.fillRect(0, 0, 512, 1024);
    dCtx.strokeStyle = "#78350f";
    dCtx.lineWidth = 14;
    dCtx.strokeRect(16, 16, 480, 992);
    for (let p = 60; p < 980; p += 140) {
      dCtx.strokeRect(36, p, 440, 110);
      dCtx.fillStyle = "rgba(250, 204, 21, 0.45)";
      dCtx.fillRect(36, p, 440, 110);
    }
    const doorTex = new THREE.CanvasTexture(doorCanvas);

    // C. White Thassos Marble (Gleaming Panoramic Courtyard)
    const marbleCanvas = document.createElement("canvas");
    marbleCanvas.width = 1024;
    marbleCanvas.height = 1024;
    const mCtx = marbleCanvas.getContext("2d");
    mCtx.fillStyle = "#fdfdfd"; // Pure Thassos crystalline white
    mCtx.fillRect(0, 0, 1024, 1024);

    // Radial concentric guidelines
    mCtx.strokeStyle = "rgba(226, 232, 240, 0.7)";
    mCtx.lineWidth = 3;
    for (let r = 50; r < 500; r += 40) {
      mCtx.beginPath();
      mCtx.arc(512, 512, r, 0, Math.PI * 2);
      mCtx.stroke();
    }
    const matafMarbleTex = new THREE.CanvasTexture(marbleCanvas);
    matafMarbleTex.wrapS = THREE.RepeatWrapping;
    matafMarbleTex.wrapT = THREE.RepeatWrapping;
    matafMarbleTex.repeat.set(8, 8);

    // ── 4. PANORAMIC ARCHITECTURE OF MASJID AL-HARAM ──

    const haramGroup = new THREE.Group();
    scene.add(haramGroup);

    // A. The Holy Kaaba
    const kaabaWidth = 10;
    const kaabaHeight = 13;
    const kaabaDepth = 11;

    const kaabaMat = new THREE.MeshStandardMaterial({
      map: kiswahTex,
      roughness: 0.85,
      metalness: 0.15,
    });
    const kaabaMesh = new THREE.Mesh(
      new THREE.BoxGeometry(kaabaWidth, kaabaHeight, kaabaDepth),
      kaabaMat
    );
    kaabaMesh.position.set(0, kaabaHeight / 2 + 0.4, 0);
    kaabaMesh.castShadow = true;
    kaabaMesh.receiveShadow = true;
    haramGroup.add(kaabaMesh);

    // Marble Base (Shadherwan)
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.18,
      metalness: 0.1,
    });
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(kaabaWidth + 1.2, 0.8, kaabaDepth + 1.2),
      marbleMat
    );
    baseMesh.position.set(0, 0.4, 0);
    baseMesh.receiveShadow = true;
    haramGroup.add(baseMesh);

    // Golden Door (Bab al-Kaaba)
    const doorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 5.4),
      new THREE.MeshStandardMaterial({
        map: doorTex,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x78350f,
        emissiveIntensity: 0.4,
      })
    );
    doorMesh.position.set(2.2, 5.6, kaabaDepth / 2 + 0.05);
    haramGroup.add(doorMesh);

    // Hajar al-Aswad (Black Stone)
    const blackStone = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.22, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 })
    );
    blackStone.position.set(kaabaWidth / 2 + 0.05, 1.8, kaabaDepth / 2 + 0.05);
    blackStone.rotation.y = Math.PI / 4;
    haramGroup.add(blackStone);

    // Hijr Ismail (Hateem)
    const hateem = new THREE.Mesh(
      new THREE.TorusGeometry(5.8, 0.45, 16, 40, Math.PI),
      marbleMat
    );
    hateem.rotation.x = Math.PI / 2;
    hateem.rotation.z = Math.PI;
    hateem.position.set(0, 0.8, -kaabaDepth / 2 - 2.8);
    hateem.castShadow = true;
    haramGroup.add(hateem);

    // Maqam Ibrahim
    const maqam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 })
    );
    maqam.position.set(6, 0.9, 11);
    haramGroup.add(maqam);

    // B. Vast White Marble Mataf (Panoramic Courtyard Floor)
    const matafFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220),
      new THREE.MeshStandardMaterial({
        map: matafMarbleTex,
        roughness: 0.15, // Gleaming polished marble mirror reflection
        metalness: 0.12,
      })
    );
    matafFloor.rotation.x = -Math.PI / 2;
    matafFloor.position.set(0, 0, 0);
    matafFloor.receiveShadow = true;
    haramGroup.add(matafFloor);

    // C. Elevated Multi-Tier Circular Tawaf Ring Bridges (Suspended Mataf Bridges)
    const goldCapitalMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.15 });

    // Level 1 Elevated Tawaf Bridge
    const bridge1Radius = 24;
    const bridge1Width = 6;
    const bridge1Height = 4.2;

    const bridge1Ring = new THREE.Mesh(
      new THREE.RingGeometry(bridge1Radius - bridge1Width / 2, bridge1Radius + bridge1Width / 2, 64),
      marbleMat
    );
    bridge1Ring.rotation.x = -Math.PI / 2;
    bridge1Ring.position.set(0, bridge1Height, 0);
    bridge1Ring.receiveShadow = true;
    haramGroup.add(bridge1Ring);

    // Bridge 1 Safety Balustrades (Inner & Outer)
    const balustrade1Inner = new THREE.Mesh(
      new THREE.TorusGeometry(bridge1Radius - bridge1Width / 2, 0.12, 8, 64),
      goldCapitalMat
    );
    balustrade1Inner.rotation.x = Math.PI / 2;
    balustrade1Inner.position.y = bridge1Height + 0.7;
    haramGroup.add(balustrade1Inner);

    const balustrade1Outer = new THREE.Mesh(
      new THREE.TorusGeometry(bridge1Radius + bridge1Width / 2, 0.12, 8, 64),
      goldCapitalMat
    );
    balustrade1Outer.rotation.x = Math.PI / 2;
    balustrade1Outer.position.y = bridge1Height + 0.7;
    haramGroup.add(balustrade1Outer);

    // Slender Pillars Supporting Bridge 1
    const supportColCount = 18;
    for (let c = 0; c < supportColCount; c++) {
      const angle = (c / supportColCount) * Math.PI * 2;
      const x = Math.cos(angle) * bridge1Radius;
      const z = Math.sin(angle) * bridge1Radius;

      const supportCol = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.45, bridge1Height, 16),
        marbleMat
      );
      supportCol.position.set(x, bridge1Height / 2, z);
      supportCol.castShadow = true;
      haramGroup.add(supportCol);
    }

    // D. Outer Multi-Tiered Colonnades & Ottoman White Domes
    const colonnadeRadius = 50;
    const archCount = 44;

    for (let tier = 0; tier < 3; tier++) {
      const tierHeight = 0.5 + tier * 7.5;
      const tierRadius = colonnadeRadius + tier * 10;

      for (let a = 0; a < archCount; a++) {
        const theta = (a / archCount) * Math.PI * 2;
        const x = Math.cos(theta) * tierRadius;
        const z = Math.sin(theta) * tierRadius;

        // Marble Pillar
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.75, 0.85, 7.5, 16),
          marbleMat
        );
        col.position.set(x, tierHeight + 3.75, z);
        col.castShadow = true;
        haramGroup.add(col);

        // Golden Horseshoe Arch
        const arch = new THREE.Mesh(
          new THREE.TorusGeometry(3.8, 0.38, 12, 24, Math.PI),
          goldCapitalMat
        );
        arch.position.set(x, tierHeight + 7.5, z);
        arch.rotation.y = -theta + Math.PI / 2;
        haramGroup.add(arch);

        // Pristine White Ottoman Dome on Top Tier
        if (tier === 2 && a % 2 === 0) {
          const domeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            marbleMat
          );
          domeMesh.position.set(x, tierHeight + 8.5, z);

          const finial = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 8), goldCapitalMat);
          finial.position.set(x, tierHeight + 11.2, z);
          haramGroup.add(domeMesh);
          haramGroup.add(finial);
        }
      }

      // Tier Gallery Balustrade Terrace
      const terrace = new THREE.Mesh(
        new THREE.RingGeometry(tierRadius - 5, tierRadius + 5, 56),
        marbleMat
      );
      terrace.rotation.x = -Math.PI / 2;
      terrace.position.set(0, tierHeight + 7.6, 0);
      terrace.receiveShadow = true;
      haramGroup.add(terrace);
    }

    // E. 7 Majestic Minarets of Masjid al-Haram
    const minaretPositions = [
      { x: -52, z: -52 },
      { x: 52, z: -52 },
      { x: -52, z: 52 },
      { x: 52, z: 52 },
      { x: 0, z: -72 },
      { x: -72, z: 0 },
      { x: 72, z: 0 },
    ];

    minaretPositions.forEach((pos) => {
      const minaretGroup = new THREE.Group();

      const baseTower = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 36, 8), marbleMat);
      baseTower.position.y = 18;
      baseTower.castShadow = true;
      minaretGroup.add(baseTower);

      const bal1 = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 1.4, 16), goldCapitalMat);
      bal1.position.y = 36.5;
      minaretGroup.add(bal1);

      const midTower = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.5, 20, 16), marbleMat);
      midTower.position.y = 47;
      midTower.castShadow = true;
      minaretGroup.add(midTower);

      const bal2 = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 1.2, 16), goldCapitalMat);
      bal2.position.y = 57.5;
      minaretGroup.add(bal2);

      const dome = new THREE.Mesh(new THREE.ConeGeometry(2.0, 7, 16), goldCapitalMat);
      dome.position.y = 61.5;
      minaretGroup.add(dome);

      const crescentCrest = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), goldCapitalMat);
      crescentCrest.position.y = 65.5;
      minaretGroup.add(crescentCrest);

      minaretGroup.position.set(pos.x, 0, pos.z);
      haramGroup.add(minaretGroup);
    });

    // F. Makkah Royal Clock Tower (Abraj al-Bait) in Background
    const clockTowerGroup = new THREE.Group();
    const towerBody = new THREE.Mesh(
      new THREE.BoxGeometry(26, 110, 26),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 })
    );
    towerBody.position.y = 55;
    clockTowerGroup.add(towerBody);

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(8.5, 32),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: isDayTime ? 0.6 : 3.0,
      })
    );
    clockFace.position.set(0, 85, 13.2);
    clockTowerGroup.add(clockFace);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(6, 38, 8), goldCapitalMat);
    spire.position.y = 129;
    clockTowerGroup.add(spire);

    const giantCrescent = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.7, 16, 32, Math.PI * 1.5), goldCapitalMat);
    giantCrescent.position.set(0, 149, 0);
    clockTowerGroup.add(giantCrescent);

    clockTowerGroup.position.set(0, 0, -135);
    haramGroup.add(clockTowerGroup);

    // ── 5. THOUSANDS OF 3D PILGRIMS IN WHITE IHRAM PERFORMING TAWAF ──
    const groundPilgrimCount = pilgrimDensity === "ultra" ? 3800 : 2400;
    const bridgePilgrimCount = pilgrimDensity === "ultra" ? 800 : 400;
    const totalPilgrims = groundPilgrimCount + bridgePilgrimCount;

    const pilgrimBodyGeo = new THREE.CylinderGeometry(0.24, 0.32, 1.4, 8);
    const ihramMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.05,
    });
    const pilgrimsMesh = new THREE.InstancedMesh(pilgrimBodyGeo, ihramMat, totalPilgrims);
    pilgrimsMesh.castShadow = true;
    pilgrimsMesh.receiveShadow = true;
    scene.add(pilgrimsMesh);

    // Simulation Data
    const pRadius = new Float32Array(totalPilgrims);
    const pAngle = new Float32Array(totalPilgrims);
    const pSpeed = new Float32Array(totalPilgrims);
    const pBaseY = new Float32Array(totalPilgrims);
    const pScaleY = new Float32Array(totalPilgrims);
    const pDummy = new THREE.Object3D();

    // 1. Ground Mataf Pilgrims
    for (let i = 0; i < groundPilgrimCount; i++) {
      const radius = 8 + Math.pow(Math.random(), 1.3) * 36;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.22 + Math.random() * 0.28) / (radius * 0.12);
      const scaleY = 0.9 + Math.random() * 0.2;

      pRadius[i] = radius;
      pAngle[i] = angle;
      pSpeed[i] = speed;
      pBaseY[i] = 0.7 * scaleY;
      pScaleY[i] = scaleY;

      pDummy.position.set(radius * Math.cos(angle), 0.7 * scaleY, radius * Math.sin(angle));
      pDummy.scale.set(1, scaleY, 1);
      pDummy.updateMatrix();
      pilgrimsMesh.setMatrixAt(i, pDummy.matrix);
    }

    // 2. Elevated Bridge Tawaf Pilgrims (Level 1 Bridge)
    for (let i = groundPilgrimCount; i < totalPilgrims; i++) {
      const radius = bridge1Radius - 2 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.18 + Math.random() * 0.15;
      const scaleY = 0.9 + Math.random() * 0.2;

      pRadius[i] = radius;
      pAngle[i] = angle;
      pSpeed[i] = speed;
      pBaseY[i] = bridge1Height + 0.7 * scaleY;
      pScaleY[i] = scaleY;

      pDummy.position.set(radius * Math.cos(angle), bridge1Height + 0.7 * scaleY, radius * Math.sin(angle));
      pDummy.scale.set(1, scaleY, 1);
      pDummy.updateMatrix();
      pilgrimsMesh.setMatrixAt(i, pDummy.matrix);
    }
    pilgrimsMesh.instanceMatrix.needsUpdate = true;

    // ── 6. Mouse Look & Interactive Orbiting ──
    const handleMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!stateRef.current.isDragging) return;

      const deltaX = e.clientX - stateRef.current.prevMouse.x;
      const deltaY = e.clientY - stateRef.current.prevMouse.y;

      stateRef.current.orbitAngle += deltaX * 0.007;
      stateRef.current.orbitHeight = Math.max(
        3,
        Math.min(52, stateRef.current.orbitHeight - deltaY * 0.08)
      );

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
      stateRef.current.orbitAngle += deltaX * 0.01;
      stateRef.current.orbitHeight = Math.max(
        3,
        Math.min(52, stateRef.current.orbitHeight - deltaY * 0.09)
      );
      stateRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    currentMount.addEventListener("mousedown", handleMouseDown);
    currentMount.addEventListener("touchstart", handleTouchStart);
    currentMount.addEventListener("touchmove", handleTouchMove);
    currentMount.addEventListener("touchend", handleMouseUp);

    // ── 7. Responsive Resize ──
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // ── 8. Continuous Tawaf & Animation Loop ──
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Panoramic / Tawaf Camera Orbit
      if (cameraView === "tawaf" || cameraView === "panoramic") {
        stateRef.current.orbitAngle += delta * stateRef.current.orbitSpeed;
      }

      const camX = Math.sin(stateRef.current.orbitAngle) * stateRef.current.orbitRadius;
      const camZ = Math.cos(stateRef.current.orbitAngle) * stateRef.current.orbitRadius;
      const camY = stateRef.current.orbitHeight;

      stateRef.current.targetCameraPos.set(camX, camY, camZ);
      stateRef.current.cameraPos.lerp(stateRef.current.targetCameraPos, 0.06);

      camera.position.copy(stateRef.current.cameraPos);
      camera.lookAt(stateRef.current.targetLookAt);

      // Animate Thousands of 3D Pilgrims on Ground & Elevated Bridge
      for (let i = 0; i < totalPilgrims; i++) {
        pAngle[i] += delta * pSpeed[i];

        const x = pRadius[i] * Math.sin(pAngle[i]);
        const z = pRadius[i] * Math.cos(pAngle[i]);

        pDummy.position.set(x, pBaseY[i], z);
        pDummy.rotation.y = pAngle[i] + Math.PI / 2;
        pDummy.scale.set(1, pScaleY[i], 1);
        pDummy.updateMatrix();
        pilgrimsMesh.setMatrixAt(i, pDummy.matrix);
      }
      pilgrimsMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
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
  }, [isDayTime, pilgrimDensity, cameraView]);

  // Viewpoint Presets
  const setPanoramicView = () => {
    setCameraView("panoramic");
    stateRef.current.orbitRadius = 58;
    stateRef.current.orbitHeight = 24;
    stateRef.current.targetLookAt.set(0, 5, 0);
  };

  const setBridgeView = () => {
    setCameraView("bridge");
    stateRef.current.orbitRadius = 26;
    stateRef.current.orbitHeight = 6.8;
    stateRef.current.targetLookAt.set(0, 5, 0);
  };

  const setGroundView = () => {
    setCameraView("ground");
    stateRef.current.orbitRadius = 18;
    stateRef.current.orbitHeight = 3.5;
    stateRef.current.targetLookAt.set(0, 4.5, 0);
  };

  return (
    <div className="relative w-full h-[560px] sm:h-[680px] rounded-3xl overflow-hidden border-2 border-yellow-500/40 shadow-2xl shadow-black/90 bg-slate-950 select-none">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Overlay */}
      <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="bg-slate-950/85 backdrop-blur-md border border-yellow-500/40 rounded-2xl px-4 py-2.5 text-white shadow-2xl pointer-events-auto flex items-center gap-3">
          <span className="text-2xl animate-pulse">🕋</span>
          <div>
            <p className="text-xs sm:text-sm font-black text-yellow-400 m-0">
              Panoramic Masjid al-Haram & Holy Kaaba (Makkah)
            </p>
            <p className="text-[11px] text-gray-300 font-medium m-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Vast White Marble Mataf · Elevated Bridges · 4,600+ Pilgrims</span>
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Day / Night Toggle */}
          <button
            type="button"
            onClick={() => setIsDayTime(!isDayTime)}
            className="bg-slate-900/90 hover:bg-slate-800 text-yellow-300 border border-yellow-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
          >
            <span>{isDayTime ? "☀️ Bright Makkah Sunlight" : "🌙 Night Haram Lights"}</span>
          </button>

          {/* Crowd Density Toggle */}
          <button
            type="button"
            onClick={() => setPilgrimDensity(pilgrimDensity === "high" ? "ultra" : "high")}
            className="bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg hidden sm:flex items-center gap-1"
          >
            <span>👥 {pilgrimDensity === "ultra" ? "Hajj Peak (4,600+ People)" : "Standard Umrah (2,800 People)"}</span>
          </button>
        </div>
      </div>

      {/* Bottom Camera Viewpoint Presets Toolbar */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-yellow-500/40 rounded-2xl p-2 shadow-2xl flex items-center gap-2 max-w-[95%] overflow-x-auto z-10">
        <button
          type="button"
          onClick={setPanoramicView}
          className={`text-xs font-black px-4 py-2 rounded-xl transition-all shadow-lg whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
            cameraView === "panoramic"
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950"
              : "bg-slate-900 text-yellow-300 hover:bg-slate-800 border border-yellow-500/20"
          }`}
        >
          <span>📸</span>
          <span>Panoramic Wide Courtyard View</span>
        </button>

        <button
          type="button"
          onClick={setBridgeView}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all border whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
            cameraView === "bridge"
              ? "bg-yellow-500 text-slate-950 border-yellow-400 font-black"
              : "bg-slate-900 text-yellow-300 hover:bg-slate-800 border-yellow-500/20"
          }`}
        >
          <span>🌉</span>
          <span>Elevated Tawaf Bridge View</span>
        </button>

        <button
          type="button"
          onClick={setGroundView}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all border whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
            cameraView === "ground"
              ? "bg-yellow-500 text-slate-950 border-yellow-400 font-black"
              : "bg-slate-900 text-yellow-300 hover:bg-slate-800 border-yellow-500/20"
          }`}
        >
          <span>🚶</span>
          <span>Ground Pilgrim Eye-Level View</span>
        </button>
      </div>

      {/* 360° Drag Hint */}
      <div className="absolute bottom-5 right-5 hidden xl:flex items-center gap-2 bg-slate-950/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] text-gray-300 border border-white/10 pointer-events-none">
        <span>👀 Click & Drag to Orbit 360°</span>
      </div>
    </div>
  );
};

export default Kaaba3DExperience;
