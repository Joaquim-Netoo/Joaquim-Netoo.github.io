import { RoundedBox } from "@react-three/drei";
import { forwardRef, useEffect, useMemo } from "react";
import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshStandardMaterial, type Group, type Mesh, type ShaderMaterial } from "three";
import { createCurvedScreen } from "./screenMaterial";
import { createPlasticTextures } from "./textures";

/** Medidas do monitor (metros) — usadas também pela câmera. */
export const MON = {
  bodyW: 0.56,
  bodyH: 0.5,
  bodyY: 0.33,
  frontZ: 0.17,
  bezelZ: 0.2,
  screenW: 0.4,
  screenH: 0.3,
  screenY: 0.36,
  screenZ: 0.188,
  bulge: 0.018,
};
export const SCREEN_CENTER: [number, number, number] = [0, MON.screenY, MON.screenZ + MON.bulge];

export interface MonitorRefs {
  button: React.RefObject<Mesh | null>;
  led: React.RefObject<MeshStandardMaterial | null>;
}

interface Props {
  screenMaterial: ShaderMaterial;
  refs: MonitorRefs;
  onPower: () => void;
  onHover: (on: boolean) => void;
}

/** CRT bege dos anos 80/90, modelado em código (sem modelo baixado). */
export const Monitor = forwardRef<Group, Props>(function Monitor({ screenMaterial, refs, onPower, onHover }, ref) {
  const { plastic, dark, screenGeo } = useMemo(() => {
    const { map, rough } = createPlasticTextures();
    return {
      plastic: new MeshStandardMaterial({ map, roughnessMap: rough, roughness: 1, metalness: 0, color: new Color("#fff0d2") }),
      dark: new MeshStandardMaterial({ color: "#6f6858", roughness: 0.9 }),
      screenGeo: createCurvedScreen(MON.screenW, MON.screenH, MON.bulge),
    };
  }, []);

  useEffect(
    () => () => {
      plastic.dispose();
      dark.dispose();
      screenGeo.dispose();
    },
    [plastic, dark, screenGeo],
  );

  const openTop = MON.screenY + 0.1575;
  const openBottom = MON.screenY - 0.1575;
  const top = MON.bodyY + MON.bodyH / 2;
  const bottom = MON.bodyY - MON.bodyH / 2;
  const frameDepth = MON.bezelZ - MON.frontZ;
  const frameZ = MON.frontZ + frameDepth / 2;
  const inset = 0.008;

  const vents = useMemo(() => Array.from({ length: 9 }, (_, i) => -0.13 + i * 0.016), []);

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onPower();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
    >
      {/* corpo */}
      <RoundedBox
        args={[MON.bodyW, MON.bodyH, 0.32]}
        radius={0.024}
        smoothness={4}
        position={[0, MON.bodyY, MON.frontZ - 0.16]}
        material={plastic}
        castShadow
        receiveShadow
      />
      {/* traseira do tubo, mais funda */}
      <RoundedBox args={[0.44, 0.38, 0.26]} radius={0.05} smoothness={4} position={[0, MON.bodyY + 0.01, -0.27]} material={plastic} castShadow />
      <RoundedBox args={[0.3, 0.26, 0.12]} radius={0.04} smoothness={3} position={[0, MON.bodyY + 0.01, -0.44]} material={plastic} castShadow />

      {/* moldura do vidro (afundada) */}
      <mesh position={[0, (top + openTop) / 2 - inset / 2, frameZ]} material={plastic} castShadow>
        <boxGeometry args={[MON.bodyW - inset * 2, top - openTop - inset, frameDepth]} />
      </mesh>
      <mesh position={[0, (bottom + openBottom) / 2 + inset / 2, frameZ]} material={plastic} castShadow>
        <boxGeometry args={[MON.bodyW - inset * 2, openBottom - bottom - inset, frameDepth]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (0.21 + (MON.bodyW / 2 - inset - 0.21) / 2), MON.screenY, frameZ]} material={plastic}>
          <boxGeometry args={[MON.bodyW / 2 - inset - 0.21, openTop - openBottom, frameDepth]} />
        </mesh>
      ))}
      {/* chanfro interno escuro ao redor do vidro */}
      <mesh position={[0, MON.screenY, MON.frontZ + 0.004]}>
        <planeGeometry args={[0.425, 0.318]} />
        <meshStandardMaterial color="#14130f" roughness={0.95} />
      </mesh>

      {/* vidro (shader próprio) */}
      <mesh geometry={screenGeo} material={screenMaterial} position={[0, MON.screenY, MON.screenZ]} />

      {/* botão de power + LED */}
      <mesh ref={refs.button} position={[0.205, bottom + 0.06, MON.bezelZ + 0.006]} material={dark} castShadow>
        <boxGeometry args={[0.04, 0.024, 0.014]} />
      </mesh>
      <mesh position={[0.16, bottom + 0.06, MON.bezelZ + 0.002]}>
        <cylinderGeometry args={[0.0055, 0.0055, 0.006, 16]} />
        <meshStandardMaterial ref={refs.led} color="#3a0f08" emissive="#ff4b2b" emissiveIntensity={0.25} roughness={0.4} />
      </mesh>
      {/* knobs de brilho e contraste */}
      {[-0.205, -0.165].map((x) => (
        <mesh key={x} position={[x, bottom + 0.06, MON.bezelZ + 0.007]} rotation={[Math.PI / 2, 0, 0]} material={dark}>
          <cylinderGeometry args={[0.0125, 0.0135, 0.014, 24]} />
        </mesh>
      ))}
      {/* plaquinha do fabricante */}
      <mesh position={[0, bottom + 0.06, MON.bezelZ + 0.001]}>
        <planeGeometry args={[0.07, 0.014]} />
        <meshStandardMaterial color="#9c9480" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* grade de ventilação no topo */}
      {vents.map((z) => (
        <mesh key={z} position={[0, top + 0.0005, z]}>
          <boxGeometry args={[0.32, 0.002, 0.007]} />
          <meshStandardMaterial color="#2a2720" roughness={1} />
        </mesh>
      ))}

      {/* pescoço e base */}
      <mesh position={[0, bottom - 0.016, -0.02]} material={plastic} castShadow>
        <boxGeometry args={[0.22, 0.032, 0.2]} />
      </mesh>
      <RoundedBox args={[0.38, 0.05, 0.32]} radius={0.016} smoothness={3} position={[0, 0.025, -0.02]} material={plastic} castShadow receiveShadow />
    </group>
  );
});

/** Teclado mecânico simples à frente do monitor. */
export function Keyboard() {
  const { keys, base } = useMemo(() => {
    const { map, rough } = createPlasticTextures();
    const base = new MeshStandardMaterial({ map, roughnessMap: rough, roughness: 1 });
    const keyMat = new MeshStandardMaterial({ color: "#c9c0aa", roughness: 0.85 });
    // 4 fileiras de 15 teclas + última fileira: 4 teclas, barra de espaço, 4 teclas
    const slots: [number, number, number][] = []; // [x, z, escalaX]
    for (let r = 0; r < 4; r++) for (let c = 0; c < 15; c++) slots.push([(c - 7) * 0.03, (r - 2) * 0.03, 1]);
    for (const c of [0, 1, 2, 3, 11, 12, 13, 14]) slots.push([(c - 7) * 0.03, 0.06, 1]);
    slots.push([0, 0.06, 6.8]);
    const mesh = new InstancedMesh(new BoxGeometry(0.026, 0.012, 0.026), keyMat, slots.length);
    const m = new Matrix4();
    slots.forEach(([x, z, sx], i) => {
      m.makeScale(sx, 1, 1);
      m.setPosition(x, 0, z);
      mesh.setMatrixAt(i, m);
    });
    mesh.castShadow = true;
    return { keys: mesh, base };
  }, []);
  useEffect(
    () => () => {
      base.dispose();
      keys.geometry.dispose();
      (keys.material as MeshStandardMaterial).dispose();
      keys.dispose();
    },
    [base, keys],
  );

  return (
    <group position={[0, 0, 0.47]} rotation={[0.06, 0, 0]}>
      <RoundedBox args={[0.5, 0.026, 0.18]} radius={0.008} smoothness={2} position={[0, 0.013, 0]} material={base} castShadow receiveShadow />
      <primitive object={keys} position={[0, 0.032, 0]} />
    </group>
  );
}
