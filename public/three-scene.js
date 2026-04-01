// ============================================
// MALIK IRTEZA AI - Cinematic Three.js Engine
// ============================================

class CinematicEngine {
    constructor() {
        this.canvas = document.getElementById('three-canvas');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });

        this.clock = new THREE.Clock();
        this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        this.isLoaderMode = true;
        this.groups = {};

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        this.camera.position.set(0, 0, 8);

        // Create all cinematic layers
        this.createNebulaField();
        this.createStarField();
        this.createCosmicDust();
        this.createLightStreaks();
        this.createOrbitalRings();
        this.createFloatingGeometry();
        this.createEnergyCore();
        this.createAuroraPlanes();
        this.createGridFloor();
        this.createDNAHelix();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouse(e));
        window.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                this.mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        this.animate();
    }

    // === PARTICLE TEXTURE GENERATOR ===
    makeTexture(r, g, b, softness = 0.5) {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(softness * 0.3, `rgba(${r},${g},${b},0.8)`);
        grad.addColorStop(softness, `rgba(${r},${g},${b},0.2)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    }

    // === 1. NEBULA FIELD - Deep space clouds ===
    createNebulaField() {
        const group = new THREE.Group();
        const count = 600;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const nebColors = [
            [0.05, 0.15, 0.6], [0.4, 0.05, 0.6], [0.0, 0.4, 0.7],
            [0.6, 0.1, 0.3], [0.1, 0.5, 0.5], [0.2, 0.0, 0.8]
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const r = 20 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            pos[i3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i3 + 2] = r * Math.cos(phi) - 30;
            const c = nebColors[Math.floor(Math.random() * nebColors.length)];
            cols[i3] = c[0]; cols[i3 + 1] = c[1]; cols[i3 + 2] = c[2];
            sizes[i] = 2 + Math.random() * 8;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            size: 4,
            map: this.makeTexture(255, 255, 255, 0.8),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
            opacity: 0.25,
            sizeAttenuation: true
        });

        this.nebulaParticles = new THREE.Points(geo, mat);
        group.add(this.nebulaParticles);
        this.groups.nebula = group;
        this.scene.add(group);
    }

    // === 2. STAR FIELD - Thousands of stars ===
    createStarField() {
        const layers = [
            { count: 3000, minR: 15, maxR: 100, size: 0.08, opacity: 0.9 },
            { count: 1500, minR: 5, maxR: 50, size: 0.15, opacity: 0.7 },
            { count: 500, minR: 3, maxR: 25, size: 0.25, opacity: 1.0 }
        ];

        this.starLayers = [];

        layers.forEach(layer => {
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(layer.count * 3);
            const cols = new Float32Array(layer.count * 3);

            const starColors = [
                [1, 1, 1], [0.8, 0.9, 1], [1, 0.9, 0.7],
                [0.6, 0.8, 1], [1, 0.7, 0.6], [0.7, 0.7, 1]
            ];

            for (let i = 0; i < layer.count; i++) {
                const i3 = i * 3;
                const r = layer.minR + Math.random() * (layer.maxR - layer.minR);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                pos[i3] = r * Math.sin(phi) * Math.cos(theta);
                pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                pos[i3 + 2] = r * Math.cos(phi) - 20;

                const c = starColors[Math.floor(Math.random() * starColors.length)];
                cols[i3] = c[0]; cols[i3 + 1] = c[1]; cols[i3 + 2] = c[2];
            }

            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

            const mat = new THREE.PointsMaterial({
                size: layer.size,
                map: this.makeTexture(255, 255, 255, 0.3),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                vertexColors: true,
                opacity: layer.opacity,
                sizeAttenuation: true
            });

            const points = new THREE.Points(geo, mat);
            this.starLayers.push(points);
            this.scene.add(points);
        });
    }

    // === 3. COSMIC DUST - Flowing particles ===
    createCosmicDust() {
        const count = 2000;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        this.dustVelocities = [];

        const dustColors = [
            [0.0, 0.5, 1.0], [0.0, 0.8, 1.0], [0.5, 0.2, 1.0],
            [0.0, 1.0, 0.8], [0.3, 0.3, 1.0]
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3] = (Math.random() - 0.5) * 50;
            pos[i3 + 1] = (Math.random() - 0.5) * 30;
            pos[i3 + 2] = (Math.random() - 0.5) * 30 - 5;

            const c = dustColors[Math.floor(Math.random() * dustColors.length)];
            cols[i3] = c[0]; cols[i3 + 1] = c[1]; cols[i3 + 2] = c[2];

            this.dustVelocities.push({
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.01 + 0.005,
                vz: (Math.random() - 0.5) * 0.01,
                speed: 0.5 + Math.random(),
                phase: Math.random() * Math.PI * 2,
                amp: 0.5 + Math.random() * 2
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.12,
            map: this.makeTexture(255, 255, 255, 0.4),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
            opacity: 0.7,
            sizeAttenuation: true
        });

        this.dustParticles = new THREE.Points(geo, mat);
        this.scene.add(this.dustParticles);
    }

    // === 4. LIGHT STREAKS - Moving lines of light ===
    createLightStreaks() {
        this.streaks = [];
        const streakColors = [0x007bff, 0x00d4ff, 0x7c3aed, 0x0099ff, 0xec4899];

        for (let i = 0; i < 15; i++) {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: 6 }, () => new THREE.Vector3(
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 25,
                    (Math.random() - 0.5) * 20 - 5
                ))
            );

            const points = curve.getPoints(80);
            const geo = new THREE.BufferGeometry().setFromPoints(points);

            const mat = new THREE.LineBasicMaterial({
                color: streakColors[i % streakColors.length],
                transparent: true,
                opacity: 0.08 + Math.random() * 0.12,
                blending: THREE.AdditiveBlending
            });

            const line = new THREE.Line(geo, mat);
            line.userData = {
                speed: 0.1 + Math.random() * 0.3,
                rotAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize(),
                phase: Math.random() * Math.PI * 2
            };

            this.streaks.push(line);
            this.scene.add(line);
        }
    }

    // === 5. ORBITAL RINGS ===
    createOrbitalRings() {
        this.orbitalRings = [];
        const ringColors = [0x007bff, 0x00d4ff, 0x7c3aed, 0x0099ff];

        for (let i = 0; i < 4; i++) {
            const radius = 3 + i * 1.5;
            const geo = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 128);
            const mat = new THREE.MeshBasicMaterial({
                color: ringColors[i],
                transparent: true,
                opacity: 0.15 + i * 0.03,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            ring.rotation.y = Math.random() * Math.PI;
            ring.userData = {
                speed: 0.15 + Math.random() * 0.2,
                wobble: Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2
            };
            this.orbitalRings.push(ring);
            this.scene.add(ring);
        }
    }

    // === 6. FLOATING GEOMETRY ===
    createFloatingGeometry() {
        this.floatingShapes = [];
        const colors = [0x007bff, 0x00d4ff, 0x7c3aed, 0x00ff88, 0xec4899];

        const geometries = [
            new THREE.IcosahedronGeometry(0.2, 0),
            new THREE.OctahedronGeometry(0.2, 0),
            new THREE.TetrahedronGeometry(0.25, 0),
            new THREE.BoxGeometry(0.25, 0.25, 0.25),
            new THREE.DodecahedronGeometry(0.18, 0)
        ];

        for (let i = 0; i < 25; i++) {
            const geo = geometries[i % geometries.length];
            const mat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.15,
                blending: THREE.AdditiveBlending
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15 - 5
            );
            mesh.userData = {
                basePos: mesh.position.clone(),
                rotSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                floatSpeed: 0.2 + Math.random() * 0.5,
                floatAmp: 0.5 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: 1 + Math.random() * 2
            };
            this.floatingShapes.push(mesh);
            this.scene.add(mesh);
        }
    }

    // === 7. ENERGY CORE - Central glowing orb ===
    createEnergyCore() {
        this.coreGroup = new THREE.Group();

        // Inner core
        const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.6
        });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.coreGroup.add(this.core);

        // Glow layers
        const glowSizes = [0.8, 1.2, 1.8, 2.5];
        const glowOpacities = [0.15, 0.08, 0.04, 0.02];
        const glowColors = [0x00d4ff, 0x007bff, 0x7c3aed, 0x0099ff];

        glowSizes.forEach((size, i) => {
            const gGeo = new THREE.SphereGeometry(size, 24, 24);
            const gMat = new THREE.MeshBasicMaterial({
                color: glowColors[i],
                transparent: true,
                opacity: glowOpacities[i],
                blending: THREE.AdditiveBlending
            });
            const gMesh = new THREE.Mesh(gGeo, gMat);
            this.coreGroup.add(gMesh);
        });

        // Core particles orbiting
        const pCount = 200;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pCols = new Float32Array(pCount * 3);
        this.coreParticleData = [];

        for (let i = 0; i < pCount; i++) {
            const i3 = i * 3;
            const orbitR = 1 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            const yOff = (Math.random() - 0.5) * 2;
            pPos[i3] = Math.cos(angle) * orbitR;
            pPos[i3 + 1] = yOff;
            pPos[i3 + 2] = Math.sin(angle) * orbitR;

            const brightness = 0.5 + Math.random() * 0.5;
            pCols[i3] = 0.0; pCols[i3 + 1] = brightness * 0.8; pCols[i3 + 2] = brightness;

            this.coreParticleData.push({
                radius: orbitR,
                angle: angle,
                yOffset: yOff,
                speed: 0.3 + Math.random() * 0.8,
                ySpeed: (Math.random() - 0.5) * 0.3
            });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(pCols, 3));

        const pMat = new THREE.PointsMaterial({
            size: 0.06,
            map: this.makeTexture(255, 255, 255, 0.3),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
            opacity: 0.9,
            sizeAttenuation: true
        });

        this.coreParticles = new THREE.Points(pGeo, pMat);
        this.coreGroup.add(this.coreParticles);

        this.coreGroup.position.z = -2;
        this.scene.add(this.coreGroup);
    }

    // === 8. AURORA PLANES ===
    createAuroraPlanes() {
        this.auroras = [];
        const auroraColors = [
            [0x007bff, 0x00d4ff],
            [0x7c3aed, 0xec4899],
            [0x00d4ff, 0x00ff88]
        ];

        for (let i = 0; i < 3; i++) {
            const width = 30 + i * 10;
            const height = 8 + i * 3;
            const geo = new THREE.PlaneGeometry(width, height, 60, 20);
            const mat = new THREE.MeshBasicMaterial({
                color: auroraColors[i][0],
                transparent: true,
                opacity: 0.03 + i * 0.01,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                wireframe: false
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(0, 5 + i * 3, -20 - i * 5);
            mesh.rotation.x = -0.3;
            mesh.userData = {
                speed: 0.3 + i * 0.1,
                phase: i * 2,
                originalPositions: geo.attributes.position.array.slice()
            };
            this.auroras.push(mesh);
            this.scene.add(mesh);
        }
    }

    // === 9. GRID FLOOR ===
    createGridFloor() {
        const size = 60;
        const div = 40;
        const geo = new THREE.PlaneGeometry(size, size, div, div);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x0a2a5e,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });
        this.gridFloor = new THREE.Mesh(geo, mat);
        this.gridFloor.rotation.x = -Math.PI / 2;
        this.gridFloor.position.y = -6;
        this.gridFloor.position.z = -10;
        this.gridFloor.userData.originalPositions = geo.attributes.position.array.slice();
        this.scene.add(this.gridFloor);
    }

    // === 10. DNA HELIX ===
    createDNAHelix() {
        this.helixGroup = new THREE.Group();
        const helixParticleCount = 300;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(helixParticleCount * 3);
        const cols = new Float32Array(helixParticleCount * 3);

        for (let i = 0; i < helixParticleCount; i++) {
            const i3 = i * 3;
            const t = (i / helixParticleCount) * Math.PI * 6;
            const strand = i % 2;
            const r = 1.5;
            pos[i3] = Math.cos(t + strand * Math.PI) * r;
            pos[i3 + 1] = (i / helixParticleCount - 0.5) * 15;
            pos[i3 + 2] = Math.sin(t + strand * Math.PI) * r;

            if (strand === 0) {
                cols[i3] = 0.0; cols[i3 + 1] = 0.5; cols[i3 + 2] = 1.0;
            } else {
                cols[i3] = 0.5; cols[i3 + 1] = 0.15; cols[i3 + 2] = 0.9;
            }
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.1,
            map: this.makeTexture(255, 255, 255, 0.3),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.helixParticles = new THREE.Points(geo, mat);
        this.helixGroup.add(this.helixParticles);
        this.helixGroup.position.set(8, 0, -5);
        this.scene.add(this.helixGroup);
    }

    // === TRANSITION TO BACKGROUND ===
    transitionToBackground() {
        this.isLoaderMode = false;
        const duration = 2500;
        const start = Date.now();

        const animate = () => {
            const p = Math.min((Date.now() - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 4);

            // Reduce intensities
            if (this.nebulaParticles) {
                this.nebulaParticles.material.opacity = 0.25 - ease * 0.1;
            }
            if (this.dustParticles) {
                this.dustParticles.material.opacity = 0.7 - ease * 0.35;
            }
            this.starLayers?.forEach(sl => {
                sl.material.opacity = sl.material.opacity * (1 - ease * 0.2);
            });
            if (this.coreGroup) {
                this.coreGroup.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity *= (1 - ease * 0.4);
                    }
                });
            }
            this.orbitalRings?.forEach(ring => {
                ring.material.opacity *= (1 - ease * 0.3);
            });
            this.floatingShapes?.forEach(s => {
                s.material.opacity *= (1 - ease * 0.2);
            });
            if (this.helixParticles) {
                this.helixParticles.material.opacity = 0.6 - ease * 0.3;
            }
            this.auroras?.forEach(a => {
                a.material.opacity *= (1 - ease * 0.3);
            });

            if (p < 1) requestAnimationFrame(animate);
        };
        animate();
    }

    // === ANIMATION LOOP ===
    animate() {
        requestAnimationFrame(() => this.animate());
        const t = this.clock.getElapsedTime();
        const dt = this.clock.getDelta();

        this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;

        const parallax = this.isLoaderMode ? 1.2 : 0.4;

        // Camera
        this.camera.position.x += (this.mouse.x * parallax - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * parallax * 0.6 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, -5);

        // Nebula rotation
        if (this.nebulaParticles) {
            this.nebulaParticles.rotation.y = t * 0.008;
            this.nebulaParticles.rotation.x = Math.sin(t * 0.005) * 0.05;
        }

        // Star layers parallax rotation
        this.starLayers?.forEach((layer, i) => {
            layer.rotation.y = t * (0.002 + i * 0.002);
            layer.rotation.x = Math.sin(t * 0.003 + i) * 0.02;
        });

        // Cosmic dust flow
        if (this.dustParticles) {
            const positions = this.dustParticles.geometry.attributes.position.array;
            for (let i = 0; i < this.dustVelocities.length; i++) {
                const i3 = i * 3;
                const v = this.dustVelocities[i];
                positions[i3] += v.vx + Math.sin(t * v.speed + v.phase) * 0.005;
                positions[i3 + 1] += v.vy * 0.3;
                positions[i3 + 2] += v.vz + Math.cos(t * v.speed * 0.7 + v.phase) * 0.003;

                // Reset particles that go too far
                if (positions[i3 + 1] > 15) positions[i3 + 1] = -15;
                if (positions[i3] > 25) positions[i3] = -25;
                if (positions[i3] < -25) positions[i3] = 25;
            }
            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Light streaks rotation
        this.streaks?.forEach(streak => {
            const d = streak.userData;
            streak.rotation.x += Math.sin(t * d.speed + d.phase) * 0.001;
            streak.rotation.y += d.speed * 0.003;
            streak.rotation.z += Math.cos(t * d.speed * 0.5) * 0.0005;
            streak.material.opacity = 0.06 + Math.sin(t * d.speed * 2 + d.phase) * 0.04;
        });

        // Orbital rings
        this.orbitalRings?.forEach((ring, i) => {
            const d = ring.userData;
            ring.rotation.z += d.speed * 0.005;
            ring.rotation.x = Math.PI / 2 + Math.sin(t * d.wobble + d.phase) * 0.2;
            const scale = 1 + Math.sin(t * 0.5 + i) * 0.05;
            ring.scale.setScalar(scale);
        });

        // Floating geometry
        this.floatingShapes?.forEach(shape => {
            const d = shape.userData;
            shape.rotation.x += d.rotSpeed.x;
            shape.rotation.y += d.rotSpeed.y;
            shape.rotation.z += d.rotSpeed.z;
            shape.position.x = d.basePos.x + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp * 0.3;
            shape.position.y = d.basePos.y + Math.cos(t * d.floatSpeed * 0.7 + d.phase) * d.floatAmp * 0.5;
            shape.position.z = d.basePos.z + Math.sin(t * d.floatSpeed * 0.4 + d.phase * 2) * d.floatAmp * 0.2;
            const pulse = 1 + Math.sin(t * d.pulseSpeed) * 0.3;
            shape.scale.setScalar(pulse);
        });

        // Energy core
        if (this.core) {
            const pulse = 1 + Math.sin(t * 2) * 0.15;
            this.core.scale.setScalar(pulse);
            this.coreGroup.rotation.y = t * 0.1;

            // Core orbiting particles
            if (this.coreParticles) {
                const pp = this.coreParticles.geometry.attributes.position.array;
                for (let i = 0; i < this.coreParticleData.length; i++) {
                    const i3 = i * 3;
                    const d = this.coreParticleData[i];
                    d.angle += d.speed * 0.01;
                    pp[i3] = Math.cos(d.angle) * d.radius;
                    pp[i3 + 1] = d.yOffset + Math.sin(t * d.ySpeed + d.angle) * 0.5;
                    pp[i3 + 2] = Math.sin(d.angle) * d.radius;
                }
                this.coreParticles.geometry.attributes.position.needsUpdate = true;
            }
        }

        // Aurora wave
        this.auroras?.forEach(aurora => {
            const d = aurora.userData;
            const positions = aurora.geometry.attributes.position.array;
            const origPositions = d.originalPositions;
            for (let i = 0; i < positions.length; i += 3) {
                const ox = origPositions[i];
                const oy = origPositions[i + 1];
                positions[i + 2] = Math.sin(ox * 0.3 + t * d.speed + d.phase) *
                    Math.cos(oy * 0.5 + t * d.speed * 0.7) * 2;
                positions[i + 1] = origPositions[i + 1] +
                    Math.sin(ox * 0.2 + t * d.speed * 0.5) * 0.5;
            }
            aurora.geometry.attributes.position.needsUpdate = true;
        });

        // Grid floor wave
        if (this.gridFloor) {
            const positions = this.gridFloor.geometry.attributes.position.array;
            const orig = this.gridFloor.userData.originalPositions;
            for (let i = 0; i < positions.length; i += 3) {
                const ox = orig[i];
                const oy = orig[i + 1];
                positions[i + 2] = Math.sin(ox * 0.15 + t * 0.8) *
                    Math.cos(oy * 0.15 + t * 0.6) * 1.5;
            }
            this.gridFloor.geometry.attributes.position.needsUpdate = true;
        }

        // DNA Helix rotation
        if (this.helixGroup) {
            this.helixGroup.rotation.y = t * 0.3;

            const pp = this.helixParticles.geometry.attributes.position.array;
            const count = pp.length / 3;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const tt = (i / count) * Math.PI * 6 + t * 0.5;
                const strand = i % 2;
                const r = 1.5 + Math.sin(t + i * 0.1) * 0.1;
                pp[i3] = Math.cos(tt + strand * Math.PI) * r;
                pp[i3 + 2] = Math.sin(tt + strand * Math.PI) * r;
            }
            this.helixParticles.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouse(e) {
        this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    }
}

// Initialize
let threeScene;
document.addEventListener('DOMContentLoaded', () => {
    try { threeScene = new CinematicEngine(); }
    catch (e) { console.warn('Three.js init failed:', e); }
});