import { RoundedBox } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, SRGBColorSpace, type Group, type Mesh, type MeshStandardMaterial } from "three";
import type { ProjetoRepo } from "@/lib/data";
import { gsap } from "@/lib/motion";
import { getState, setState, subscribe } from "@/lib/store";
import { playClick } from "@/lib/sound";

/* Disquete 3,5" procedural (escala ×10): corpo, janela metálica que desliza e etiqueta em CanvasTexture. */
const W = 0.9;
const D = 0.94;
const T = 0.034;
const BODY_COLORS = ["#1b1c1e", "#20242b", "#1b1c1e", "#2a2620", "#1d2120", "#1b1c1e"];

function labelTexture(name: string, i: number) {
  const c = document.createElement("canvas");
  c.width = 720;
  c.height = 500;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "#ece6d8";
  ctx.fillRect(0, 0, 720, 500);
  // faixa colorida e pautas, como uma etiqueta de verdade
  ctx.fillStyle = ["#3e8f5a", "#a9742c", "#3e6a8f", "#8f3e4e"][i % 4];
  ctx.fillRect(0, 0, 720, 46);
  ctx.strokeStyle = "rgba(40,60,120,0.28)";
  ctx.lineWidth = 3;
  for (let y = 150; y < 500; y += 92) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(690, y);
    ctx.stroke();
  }
  // nome "à mão" em mono, levemente torto, perto da borda de baixo (que aparece na pilha)
  const text = name.length > 18 ? `${name.slice(0, 17)}…` : name;
  ctx.save();
  ctx.translate(44, 430);
  ctx.rotate(-0.018 + (i % 3) * 0.012);
  ctx.fillStyle = "#1c2a6e";
  let size = 64;
  ctx.font = `${size}px "Departure Mono", monospace`;
  while (ctx.measureText(text).width > 630 && size > 28) {
    size -= 2;
    ctx.font = `${size}px "Departure Mono", monospace`;
  }
  ctx.fillText(text, 0, 0);
  ctx.restore();
  ctx.font = '30px "Departure Mono", monospace';
  ctx.fillStyle = "rgba(28,42,110,0.7)";
  ctx.fillText(`DISK ${String(i + 1).padStart(2, "0")}  1.44MB`, 44, 120);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function Floppy({ repo, index, count }: { repo: ProjetoRepo; index: number; count: number }) {
  const group = useRef<Group>(null);
  const shutter = useRef<Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  const label = useMemo(() => labelTexture(repo.name, index), [repo.name, index]);
  useEffect(() => () => label.dispose(), [label]);

  // pilha em escada: os de baixo ficam mais para frente, mostrando a etiqueta
  const fromTop = count - 1 - index;
  const base = useMemo(
    () => ({ x: Math.sin(index * 2.1) * 0.05, y: index * (T + 0.012), z: fromTop * 0.15, ry: Math.sin(index * 1.7) * 0.05 }),
    [index, fromTop],
  );
  const state = useRef({ out: 0, inserting: false, opened: false });
  const insertRef = useRef<(onDone?: () => void) => void>(() => {});

  // hover/foco sincronizado com os cards HTML: o disquete sai da pilha e a janela desliza
  useEffect(() => {
    /** Entra no drive (~0,65 s). */
    const insert = (onDone?: () => void) => {
      const g = group.current;
      if (!g || state.current.inserting) return onDone?.();
      state.current.inserting = true;
      gsap
        .timeline({ onUpdate: invalidate, onComplete: onDone })
        .to(g.position, { y: base.y + 0.5, z: base.z + 0.55, duration: 0.2, ease: "out" })
        .to(g.rotation, { y: 0, duration: 0.2, ease: "out" }, 0)
        .to(g.position, { x: 0, y: -0.27, z: 2.0, duration: 0.24, ease: "inOut" })
        .to(g.position, { z: 1.55, duration: 0.18, ease: "power2.in" });
    };
    insertRef.current = insert;

    const apply = () => {
      const s = getState();
      const active = s.hoverProjeto === repo.name || s.projeto === repo.name;
      const g = group.current;
      const sh = shutter.current;
      if (!g || !sh) return;
      if (s.projeto === repo.name) {
        state.current.opened = true;
        if (!state.current.inserting) insert();
        return;
      }
      if (state.current.opened && state.current.inserting) {
        state.current.inserting = false;
        state.current.opened = false;
        gsap
          .timeline({ onUpdate: invalidate })
          .to(g.position, { z: 2.1, duration: 0.18, ease: "out" })
          .to(g.position, { x: base.x, y: base.y, z: base.z, duration: 0.36, ease: "inOut" })
          .to(g.rotation, { y: base.ry, duration: 0.36, ease: "inOut" }, "<");
        gsap.to(sh.position, { x: -0.06, duration: 0.2, ease: "out", onUpdate: invalidate });
        state.current.out = 0;
        return;
      }
      if (state.current.inserting) return;
      const target = active ? 1 : 0;
      if (target === state.current.out) return;
      state.current.out = target;
      gsap.to(g.position, { z: base.z + target * 0.2, y: base.y + target * 0.03, duration: 0.2, ease: "out", onUpdate: invalidate, overwrite: "auto" });
      gsap.to(sh.position, { x: -0.06 + target * 0.17, duration: 0.2, ease: "out", onUpdate: invalidate, overwrite: "auto" });
    };
    return subscribe(apply) as () => void;
  }, [repo.name, base, invalidate]);

  return (
    <group
      ref={group}
      position={[base.x, base.y, base.z]}
      rotation={[0, base.ry, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        setState({ hoverProjeto: repo.name });
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
        if (getState().hoverProjeto === repo.name) setState({ hoverProjeto: null });
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (getState().sound) playClick();
        // abre o Dialog depois que o disquete entra no drive
        insertRef.current(() => setState({ projeto: repo.name }));
      }}
    >
      <RoundedBox args={[W, T, D]} radius={0.012} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={BODY_COLORS[index % BODY_COLORS.length]} roughness={0.55} />
      </RoundedBox>
      {/* etiqueta */}
      <mesh position={[0, T / 2 + 0.0008, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.72, 0.5]} />
        <meshStandardMaterial map={label} roughness={0.85} />
      </mesh>
      {/* recesso escuro sob a janela */}
      <mesh position={[0.06, T / 2 + 0.0004, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 0.28]} />
        <meshStandardMaterial color="#0b0b0c" roughness={0.6} />
      </mesh>
      {/* janela metálica que desliza */}
      <mesh ref={shutter} position={[-0.06, T / 2 + 0.002, -0.3]} castShadow>
        <boxGeometry args={[0.44, 0.004, 0.34]} />
        <meshStandardMaterial color="#b9bcc0" metalness={0.9} roughness={0.32} />
      </mesh>
    </group>
  );
}

function Drive() {
  const led = useRef<MeshStandardMaterial>(null);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(
    () =>
      subscribe(() => {
        if (!led.current) return;
        led.current.emissiveIntensity = getState().projeto ? 2.2 : 0.2;
        invalidate();
      }) as () => void,
    [invalidate],
  );
  return (
    <group position={[0, -0.36, 1.25]}>
      <RoundedBox args={[1.25, 0.26, 0.6]} radius={0.02} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#d6cdb8" roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.04, 0.301]}>
        <planeGeometry args={[0.98, 0.05]} />
        <meshStandardMaterial color="#0d0d0c" roughness={1} />
      </mesh>
      <mesh position={[0.46, -0.07, 0.302]}>
        <planeGeometry args={[0.05, 0.022]} />
        <meshStandardMaterial ref={led} color="#1d3a24" emissive="#5cff8f" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.42, -0.07, 0.302]}>
        <planeGeometry args={[0.18, 0.04]} />
        <meshStandardMaterial color="#b9b09a" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function FloppyShelf({ repos }: { repos: ProjetoRepo[] }) {
  const list = repos.slice(0, 6);
  useEffect(() => () => void (document.body.style.cursor = ""), []);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      shadows="percentage"
      camera={{ fov: 30, position: [0, 3.1, 4.2], near: 0.1, far: 30 }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, -0.05, 0.55);
        gl.setClearColor("#0a0c0a");
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} color="#b8c4d8" />
      <directionalLight position={[-2.5, 4, 2]} intensity={1.6} color="#dfe6f2" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0.8, 0.8, 2.2]} intensity={2.2} distance={5} color="#5cff8f" />
      {/* prateleira */}
      <RoundedBox args={[1.4, 0.06, 1.9]} radius={0.015} position={[0, -0.04, 0.5]} receiveShadow>
        <meshStandardMaterial color="#2b1e15" roughness={0.75} />
      </RoundedBox>
      {list.map((r, i) => (
        <Floppy key={r.name} repo={r} index={i} count={list.length} />
      ))}
      <Drive />
    </Canvas>
  );
}
