import { useEffect, useRef } from "react";
import * as THREE from "three";

const palette = {
  teal: 0x157a7b,
  coral: 0xe0644b,
  sun: 0xf5b942,
  leaf: 0x3f8f5f,
  paper: 0xfffdf8,
  ink: 0x253238
};

function ThreePlayBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldSkipCanvas = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;

    if (shouldSkipCanvas) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    const rootGroup = new THREE.Group();
    const clock = new THREE.Clock();

    camera.position.set(0, 0, 12);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.15));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 7, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf5b942, 1.1);
    fillLight.position.set(-6, -2, 6);
    scene.add(fillLight);
    scene.add(rootGroup);

    const toys = [
      createBlock("A", palette.coral, [-5.8, 2.35, -1.5], 0.95),
      createBlock("B", palette.teal, [5.8, -2.05, -1.1], 1),
      createBlock("1", palette.sun, [4.6, 2.15, -2], 0.86, palette.ink),
      createBall([-5.4, -1.45, -1.8], 0.62),
      createStackingRings([5.15, 0.35, -1.7], 0.78),
      createAbacus([-3.4, 0.15, -2.4], 0.75),
      createPencil([2.35, -2.5, -2.2], 0.82),
      createHoop([-0.6, 2.4, -2.7], 0.68)
    ];

    toys.forEach((toy, index) => {
      toy.userData = {
        baseY: toy.position.y,
        baseX: toy.position.x,
        speed: 0.35 + index * 0.045,
        phase: index * 0.85
      };
      rootGroup.add(toy);
    });

    function resize() {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      rootGroup.scale.setScalar(clientWidth < 720 ? 0.78 : 1);
    }

    let isScrolling = false;
    let scrollEndTimer = 0;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 24;

    function handleScroll() {
      isScrolling = true;
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        isScrolling = false;
      }, 140);
    }

    function render(frameTime = 0) {
      animationFrame = window.requestAnimationFrame(render);

      if (document.hidden || isScrolling || frameTime - lastFrameTime < frameInterval) {
        return;
      }

      lastFrameTime = frameTime;
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        rootGroup.rotation.y = Math.sin(elapsed * 0.12) * 0.08;
        rootGroup.rotation.x = Math.sin(elapsed * 0.09) * 0.035;

        toys.forEach((toy) => {
          const { baseX, baseY, phase, speed } = toy.userData;
          toy.position.y = baseY + Math.sin(elapsed * speed + phase) * 0.22;
          toy.position.x = baseX + Math.cos(elapsed * speed * 0.7 + phase) * 0.1;
          toy.rotation.x += 0.0025 + speed * 0.001;
          toy.rotation.y += 0.004 + speed * 0.0015;
        });
      }

      renderer.render(scene, camera);
    }

    let animationFrame = 0;
    resize();
    render();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollEndTimer);
      window.cancelAnimationFrame(animationFrame);
      rootGroup.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            material.map?.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      mount.replaceChildren();
    };
  }, []);

  return <div className="three-play-bg" ref={mountRef} aria-hidden="true" />;
}

function createBlock(label, color, position, scale = 1, textColor = 0xffffff) {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.05 });
  const mesh = new THREE.Mesh(geometry, material);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));

  group.add(mesh, edges, createLabel(label, textColor));
  group.position.set(...position);
  group.scale.setScalar(scale);
  group.rotation.set(0.28, -0.45, 0.18);

  return group;
}

function createLabel(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  context.font = "900 78px Baloo 2, Nunito, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 64, 67);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.set(0, 0, 0.53);
  sprite.scale.set(0.82, 0.82, 1);

  return sprite;
}

function createBall(position, radius) {
  const geometry = new THREE.SphereGeometry(radius, 32, 24);
  const material = new THREE.MeshStandardMaterial({
    color: palette.sun,
    roughness: 0.38,
    metalness: 0.02,
    emissive: 0xe0644b,
    emissiveIntensity: 0.08
  });
  const ball = new THREE.Mesh(geometry, material);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.92, 0.035, 10, 80),
    new THREE.MeshStandardMaterial({ color: palette.teal, roughness: 0.35 })
  );

  ring.rotation.x = Math.PI / 2.6;
  ball.add(ring);
  ball.position.set(...position);

  return ball;
}

function createStackingRings(position, scale) {
  const group = new THREE.Group();
  const colors = [palette.teal, palette.coral, palette.sun, palette.leaf];

  colors.forEach((color, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72 - index * 0.11, 0.055, 16, 80),
      new THREE.MeshStandardMaterial({ color, roughness: 0.42 })
    );
    ring.position.y = index * 0.2;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  });

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 1.25, 18),
    new THREE.MeshStandardMaterial({ color: palette.ink, roughness: 0.55 })
  );
  pole.position.y = 0.32;
  group.add(pole);
  group.position.set(...position);
  group.scale.setScalar(scale);
  group.rotation.set(0.25, 0.45, -0.2);

  return group;
}

function createAbacus(position, scale) {
  const group = new THREE.Group();
  const frameMaterial = new THREE.MeshStandardMaterial({ color: palette.teal, roughness: 0.42 });
  const beadColors = [palette.coral, palette.sun, palette.leaf, palette.teal];

  [[-0.9, 0], [0.9, 0], [0, 0.58], [0, -0.58]].forEach(([x, y], index) => {
    const bar = new THREE.Mesh(
      index < 2 ? new THREE.BoxGeometry(0.08, 1.35, 0.08) : new THREE.BoxGeometry(1.9, 0.08, 0.08),
      frameMaterial
    );
    bar.position.set(x, y, 0);
    group.add(bar);
  });

  [-0.3, 0.05, 0.4].forEach((y, rowIndex) => {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.52, 12),
      new THREE.MeshStandardMaterial({ color: palette.ink, roughness: 0.45 })
    );
    rod.rotation.z = Math.PI / 2;
    rod.position.y = y;
    group.add(rod);

    [-0.55, -0.15, 0.25, 0.55].forEach((x, beadIndex) => {
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 20, 14),
        new THREE.MeshStandardMaterial({ color: beadColors[(rowIndex + beadIndex) % beadColors.length], roughness: 0.4 })
      );
      bead.position.set(x, y, 0.02);
      group.add(bead);
    });
  });

  group.position.set(...position);
  group.scale.setScalar(scale);
  group.rotation.set(-0.15, -0.3, 0.08);

  return group;
}

function createPencil(position, scale) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 2.2, 18),
    new THREE.MeshStandardMaterial({ color: palette.sun, roughness: 0.36 })
  );
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.36, 18),
    new THREE.MeshStandardMaterial({ color: 0xf7d6a0, roughness: 0.5 })
  );
  const eraser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.28, 18),
    new THREE.MeshStandardMaterial({ color: palette.coral, roughness: 0.42 })
  );

  body.rotation.z = Math.PI / 2;
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = -1.27;
  eraser.rotation.z = Math.PI / 2;
  eraser.position.x = 1.22;
  group.add(body, tip, eraser);
  group.position.set(...position);
  group.scale.setScalar(scale);
  group.rotation.set(0.35, 0.2, -0.45);

  return group;
}

function createHoop(position, scale) {
  const hoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.07, 16, 96),
    new THREE.MeshStandardMaterial({ color: palette.leaf, roughness: 0.32 })
  );
  hoop.position.set(...position);
  hoop.scale.setScalar(scale);
  hoop.rotation.set(0.8, -0.4, 0.1);

  return hoop;
}

export default ThreePlayBackground;