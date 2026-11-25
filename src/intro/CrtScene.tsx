import { ContactShadows, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, Color, PerspectiveCamera, PointLight, Vector3, type MeshStandardMaterial, type Mesh } from "three";
import { perfil } from "@/content/perfil";
import { gsap } from "@/lib/motion";
import { getState } from "@/lib/store";
import { playClick, playPowerOn, startHum } from "@/lib/sound";
import { createBootScreen } from "./bootCanvas";
import { Keyboard, MON, Monitor, SCREEN_CENTER } from "./Monitor";
import { createScreenMaterial } from "./screenMaterial";
import { createWoodTexture, disposeSharedTextures } from "./textures";

export type Quality = "high" | "medium" | "low";
export type IntroMode = "full" | "short" | "still";

export interface CrtSceneProps {
  mode: IntroMode;
  initialQuality: Quality;
  repoCount: number;
  /** 0..1 do carregamento real (fontes, chunk dos disquetes, capas) */
  getProgress: () => number;
  waitAssets: () => Promise<void>;
  onReady: (api: { power: () => void }) => void;
  onPowered: () => void;
  onCross: () => void;
}

const PHOSPHOR_HEX = { green: "#5cff8f", amber: "#ffb547" } as const;

/* ─── Quarto ───────────────────────────────────────────────────────── */
function Room({ quality }: { quality: Quality }) {
  const wood = useMemo(() => {
    const t = createWoodTexture();
    t.repeat.set(2, 1);
    return t;
  }, []);
  useEffect(() => () => wood.dispose(), [wood]);

  return (
    <group>
      {/* mesa de madeira escura */}
      <mesh position={[0, -0.025, 0.1]} receiveShadow>
        <boxGeometry args={[2.6, 0.05, 1.3]} />
        <meshStandardMaterial map={wood} roughness={0.72} />
      </mesh>
      {/* parede e chão quase pretos */}
      <mesh position={[0, 1.2, -0.95]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#0b0d0c" roughness={1} />
      </mesh>
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#050605" roughness={1} />
      </mesh>
      {/* janela: um retângulo frio e fraco na parede */}
      <group position={[-1.25, 1.0, -0.94]}>
        <mesh>
          <planeGeometry args={[0.8, 1.0]} />
          <meshBasicMaterial color="#141c2b" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[0.03, 1.0]} />
          <meshBasicMaterial color="#070809" />
        </mesh>
        <mesh position={[0, 0.05, 0.002]}>
          <planeGeometry args={[0.8, 0.03]} />
          <meshBasicMaterial color="#070809" />
        </mesh>
      </group>
      {/* luminária apagada no fundo */}
      <group position={[-0.82, 0, -0.42]}>
        <mesh position={[0, 0.012, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.024, 24]} />
          <meshStandardMaterial color="#1b1c1a" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0.06, 0.25, 0]} rotation={[0, 0, -0.25]}>
          <cylinderGeometry args={[0.007, 0.007, 0.5, 8]} />
          <meshStandardMaterial color="#1b1c1a" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0.15, 0.5, 0.02]} rotation={[0.2, 0, 2.2]}>
          <coneGeometry args={[0.09, 0.14, 24, 1, true]} />
          <meshStandardMaterial color="#232421" roughness={0.6} metalness={0.4} side={2} />
        </mesh>
      </group>

      {/* luz fria da janela desenhando o volume do monitor */}
      <directionalLight
        position={[-2.4, 2.1, 0.9]}
        intensity={0.6}
        color="#9db4e6"
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[1.8, 1.2, -1.6]} intensity={0.35} color="#5b6b8c" />
      <ambientLight intensity={0.06} color="#8899aa" />
      <ContactShadows position={[0, 0.001, 0]} scale={2.2} blur={2.6} opacity={0.65} far={0.8} resolution={quality === "low" ? 256 : 512} frames={1} />
    </group>
  );
}

/* ─── Cena + timeline ──────────────────────────────────────────────── */
function Scene(props: CrtSceneProps & { quality: Quality; setQuality: (q: Quality) => void }) {
  const { mode } = props;
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  const phosphorHex = PHOSPHOR_HEX[getState().phosphor];
  const boot = useMemo(
    () => createBootScreen({ nome: perfil.nomeCurto, phosphor: phosphorHex, repos: props.repoCount }),
    [phosphorHex, props.repoCount],
  );
  const screen = useMemo(() => createScreenMaterial(boot.texture), [boot]);
  useEffect(
    () => () => {
      boot.dispose();
      screen.material.dispose();
    },
    [boot, screen],
  );

  const buttonRef = useRef<Mesh>(null);
  const ledRef = useRef<MeshStandardMaterial>(null);
  const screenLight = useRef<PointLight>(null);
  const powered = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bootState = useRef({ typed: 0, bar: 0, cursor: true });
  const fps = useRef({ frames: 0, start: 0, lowStreak: 0, samples: [] as number[] });

  // Enquadramento: retrato (mobile) fica mais perto e mais vertical.
  const portrait = size.width / size.height < 0.9;
  const path = useMemo(() => {
    const start = portrait ? new Vector3(0.12, 0.5, 1.65) : new Vector3(0.36, 0.6, 1.5);
    const mid = portrait ? new Vector3(0.06, 0.42, 0.85) : new Vector3(0.2, 0.44, 0.85);
    const end = new Vector3(SCREEN_CENTER[0], SCREEN_CENTER[1], SCREEN_CENTER[2] + 0.075);
    return {
      curve: new CatmullRomCurve3([start, mid, end], false, "centripetal"),
      lookFrom: new Vector3(0, 0.3, 0),
      lookTo: new Vector3(...SCREEN_CENTER),
      fovFrom: portrait ? 46 : 34,
      fovTo: portrait ? 58 : 50,
    };
  }, [portrait]);

  const cam = useRef({ t: 0, back: 0 });
  const tmp = useMemo(() => ({ p: new Vector3(), l: new Vector3(), d: new Vector3() }), []);

  const placeCamera = () => {
    const { t, back } = cam.current;
    path.curve.getPoint(t, tmp.p);
    tmp.l.copy(path.lookFrom).lerp(path.lookTo, gsap.parseEase("inOut")(t));
    tmp.d.copy(tmp.p).sub(tmp.l).normalize().multiplyScalar(back);
    camera.position.copy(tmp.p).add(tmp.d);
    camera.lookAt(tmp.l);
    const k = gsap.utils.clamp(0, 1, (t - 0.55) / 0.45);
    camera.fov = path.fovFrom + (path.fovTo - path.fovFrom) * k * k;
    camera.near = 0.01;
    camera.updateProjectionMatrix();
  };

  useEffect(placeCamera, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── timeline única com labels ──
  useEffect(() => {
    const u = screen.uniforms;
    const led = ledRef.current;
    const btn = buttonRef.current;
    const light = screenLight.current;
    if (!led || !btn || !light) return;
    const phosphor = new Color(phosphorHex);
    const drawBoot = () => {
      const b = bootState.current;
      boot.draw(b.typed, Math.min(b.bar, props.getProgress()), b.cursor);
    };

    if (mode === "still") {
      u.uPower.value = 1;
      bootState.current = { typed: 1, bar: 0.64, cursor: true };
      boot.draw(1, 0.64, true);
      led.emissiveIntensity = 3;
      led.color.set("#ff4b2b");
      light.intensity = 0.3;
      light.color.copy(phosphor);
      invalidate();
      const id = window.setTimeout(() => ((window as unknown as { __stillReady: boolean }).__stillReady = true), 600);
      return () => window.clearTimeout(id);
    }

    const short = mode === "short";
    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    tl.addLabel("power")
      .to(btn.position, { z: btn.position.z - 0.006, duration: 0.07, ease: "power2.out", yoyo: true, repeat: 1 }, "power")
      .to(led, { emissiveIntensity: 3, duration: 0.12, ease: "out" }, "power")
      .call(() => led.color.set("#ff4b2b"), [], "power")
      .to(cam.current, { back: short ? 0 : 0.04, duration: 0.22, ease: "out", onUpdate: placeCamera }, "power")
      .to(cam.current, { back: 0, duration: 0.5, ease: "inOut", onUpdate: placeCamera }, "power+=0.22")
      .addLabel("liga", "power+=0.1")
      .to(u.uPower, { value: 1, duration: short ? 0.45 : 0.9, ease: "none" }, "liga")
      .to(light, { intensity: 0.3, duration: short ? 0.3 : 0.6, ease: "out" }, short ? "liga+=0.15" : "liga+=0.35")
      .call(() => light.color.copy(phosphor), [], "liga");

    if (short) {
      bootState.current = { typed: 1, bar: 1, cursor: false };
      tl.call(() => boot.draw(1, 1, false), [], "liga").addLabel("mergulho", "liga+=0.4");
    } else {
      tl.addLabel("boot", "liga+=0.9")
        .to(bootState.current, { typed: 1, duration: 1.05, ease: "none", onUpdate: drawBoot }, "boot")
        .to(bootState.current, { bar: 1, duration: 0.45, ease: "none", onUpdate: drawBoot }, "boot+=1.05")
        .addLabel("mergulho", "boot+=1.5")
        // espera o carregamento real terminar (no máximo 3 s) antes de mergulhar
        .addPause("mergulho", () => {
          const resume = () => {
            bootState.current.bar = 1;
            drawBoot();
            tl.play();
          };
          if (props.getProgress() >= 1) return resume();
          Promise.race([props.waitAssets(), new Promise((r) => setTimeout(r, 3000))]).then(resume);
        });
    }

    const dive = short ? 0.62 : 1.2;
    tl.to(cam.current, { t: 1, duration: dive, ease: "inOut", onUpdate: placeCamera }, "mergulho")
      .to(u.uCurvature, { value: 0.16, duration: dive, ease: "inOut" }, "mergulho")
      .to(u.uScanline, { value: 0.3, duration: dive, ease: "inOut" }, "mergulho")
      .to(u.uChromatic, { value: 0.012, duration: dive, ease: "inOut" }, "mergulho")
      .to(u.uGlass, { value: 0, duration: dive * 0.6, ease: "out" }, "mergulho")
      .to(u.uFade, { value: 1, duration: dive * 0.45, ease: "inOut" }, `mergulho+=${dive * 0.5}`)
      .addLabel("atravessa", `mergulho+=${dive - 0.08}`)
      .call(() => props.onCross(), [], "atravessa");

    // versão curta: liga sozinha
    if (short) {
      const id = window.setTimeout(() => {
        powered.current = true;
        props.onPowered();
        tl.play(0);
      }, 120);
      return () => {
        window.clearTimeout(id);
        tl.kill();
      };
    }
    return () => {
      tl.kill();
    };
  }, [mode, boot, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // API de power para o IntroGate (clique no botão ou Enter)
  const power = () => {
    if (powered.current || mode !== "full") return;
    powered.current = true;
    if (getState().sound) {
      playClick();
      playPowerOn();
      startHum();
    }
    props.onPowered();
    fps.current = { frames: 0, start: performance.now(), lowStreak: 0, samples: [] };
    tlRef.current?.play(0);
  };

  useEffect(() => {
    // espera 2 frames para garantir que algo já foi desenhado
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => props.onReady({ power }));
    });
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [hover, setHover] = useState(false);
  useEffect(() => {
    gl.domElement.style.cursor = hover && !powered.current && mode === "full" ? "pointer" : "default";
  }, [hover, gl, mode]);

  useFrame((state, delta) => {
    const u = screen.uniforms;
    u.uTime.value += delta;
    // LED pulsando devagar (0,5 Hz) antes de ligar
    if (!powered.current && ledRef.current && mode === "full") {
      ledRef.current.emissiveIntensity = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * Math.PI));
      if (buttonRef.current) {
        const mat = buttonRef.current.material as MeshStandardMaterial;
        mat.emissive.set(hover ? "#3a3528" : "#000000");
      }
    }
    // cursor do POST piscando a 1 Hz
    if (powered.current && mode === "full") {
      const on = Math.floor(state.clock.elapsedTime * 2) % 2 === 0;
      if (on !== bootState.current.cursor) {
        bootState.current.cursor = on;
        boot.draw(bootState.current.typed, Math.min(bootState.current.bar, props.getProgress()), on);
      }
    }
    // medição de fps (registrada em window.__introFps para o DECISOES.md)
    if (powered.current) {
      const f = fps.current;
      f.frames++;
      const now = performance.now();
      if (now - f.start >= 500) {
        const v = (f.frames * 1000) / (now - f.start);
        f.samples.push(v);
        (window as unknown as { __introFps: number[] }).__introFps = f.samples;
        f.frames = 0;
        f.start = now;
        // abaixo de ~30 fps: qualidade baixa e pula para a versão curta (vai direto ao mergulho)
        if (v < 30) f.lowStreak++;
        else f.lowStreak = 0;
        const tl = tlRef.current;
        if (f.lowStreak >= 2 && tl && mode === "full") {
          props.setQuality("low");
          const m = tl.labels.mergulho;
          if (tl.time() < m) {
            bootState.current = { typed: 1, bar: 1, cursor: false };
            boot.draw(1, 1, false);
            tl.seek(m).timeScale(1.35).play();
          }
          f.lowStreak = -999;
        }
      }
    }
  });

  return (
    <>
      <Room quality={props.quality} />
      <Monitor
        screenMaterial={screen.material}
        refs={{ button: buttonRef, led: ledRef }}
        onPower={power}
        onHover={setHover}
      />
      <Keyboard />
      {/* luz do fósforo: projetada para a frente (mesa e teclado), não no próprio gabinete */}
      <pointLight ref={screenLight} position={[0, MON.screenY - 0.05, 1.0]} intensity={0} distance={3} decay={2} color={phosphorHex} />
    </>
  );
}

function Effects({ quality }: { quality: Quality }) {
  if (quality === "low") return null;
  if (quality === "medium")
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
      </EffectComposer>
    );
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.5} luminanceSmoothing={0.2} />
      <Vignette offset={0.3} darkness={0.75} />
      <Noise opacity={0.035} premultiply />
    </EffectComposer>
  );
}

const DPR: Record<Quality, number | [number, number]> = { high: [1, 2], medium: 1.5, low: 1 };
const DOWN: Record<Quality, Quality> = { high: "medium", medium: "low", low: "low" };
const UP: Record<Quality, Quality> = { high: "high", medium: "high", low: "medium" };

export default function CrtScene(props: CrtSceneProps) {
  const [quality, setQuality] = useState<Quality>(props.initialQuality);
  // ao desmontar (fim da intro), libera as texturas procedurais compartilhadas;
  // o Canvas do R3F também descarta o renderer e força a perda de contexto WebGL
  useEffect(() => () => disposeSharedTextures(), []);
  return (
    <Canvas
      dpr={DPR[quality]}
      shadows={quality === "high" ? "percentage" : false}
      gl={{ antialias: quality !== "low", powerPreference: "high-performance", preserveDrawingBuffer: props.mode === "still" }}
      camera={{ fov: 34, near: 0.01, far: 20, position: [0.36, 0.6, 1.5] }}
      onCreated={({ gl }) => gl.setClearColor("#050605")}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => setQuality((q) => DOWN[q])}
        onIncline={() => setQuality((q) => (q === props.initialQuality ? q : UP[q]))}
        flipflops={3}
        onFallback={() => setQuality("low")}
      />
      <Scene {...props} quality={quality} setQuality={setQuality} />
      <Effects quality={quality} />
    </Canvas>
  );
}
