"use client";

import {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useState,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePathname } from "next/navigation";
import vertexShader from "@graphics/Trail/trail.vert";
import fragmentShader from "@graphics/Trail/trail.frag";

// Constants

const TRAIL_LENGTH = 25;
const TRAIL_RADIUS = 80;
const DEFAULT_THEME = "strawberry-matcha";
const VALID_THEMES = [
  "strawberry-matcha",
  "blueberry-lemon",
  "neopolitan-ice-cream",
] as const;

type Theme = (typeof VALID_THEMES)[number];

const THEME_VALUES: Record<Theme, { saturation: number; brightness: number }> =
  {
    "strawberry-matcha": { saturation: 0.2, brightness: 1.0 },
    "blueberry-lemon": { saturation: 0.5, brightness: 1.0 },
    "neopolitan-ice-cream": { saturation: 0.3, brightness: 1.0 },
  };

const INTERACTIVE_SELECTOR = "button, a, input, textarea";

// Helpers: color conversion, device detection, theme detection

function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  h /= 360;
  const c = b * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = b - c;
  const [r, g, blue] =
    h < 1 / 6
      ? [c, x, 0]
      : h < 2 / 6
        ? [x, c, 0]
        : h < 3 / 6
          ? [0, c, x]
          : h < 4 / 6
            ? [0, x, c]
            : h < 5 / 6
              ? [x, 0, c]
              : [c, 0, x];
  return [r + m, g + m, blue + m];
}

function isMobileDevice(): boolean {
  return (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
      navigator.userAgent.toLowerCase(),
    ) ||
    "ontouchstart" in window ||
    window.innerWidth <= 768
  );
}

function getActiveTheme(): Theme {
  const found = Array.from(document.documentElement.classList).find(
    (cls): cls is Theme => (VALID_THEMES as readonly string[]).includes(cls),
  );
  return found ?? DEFAULT_THEME;
}

// Hooks: theme detection and pointer tracking

function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    setTheme(getActiveTheme());

    const observer = new MutationObserver(() => setTheme(getActiveTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function usePointer(): React.MutableRefObject<{ x: number; y: number }> {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouch, { passive: true });
    document.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouch);
      document.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return pointer;
}

// MouseTrail component: sets up canvas and global event handling

const MouseTrail = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const theme = useTheme();
  const pointer = usePointer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (pathname === "/graphics" || !mounted) return null;

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1000], zoom: 1 }}
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <TrailSystem theme={theme} pointer={pointer} />
        </Canvas>
      </Suspense>
    </div>
  );
};

// TrailSystem component: handles the trail logic and rendering

const TrailSystem = ({
  theme,
  pointer,
}: {
  theme: Theme;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const { size, viewport } = useThree();

  const [mobile, setMobile] = useState(false);
  const [hue, setHue] = useState(300);

  const trailPoints = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 })),
  );
  const worldPos = useRef({ x: 0, y: 0 });
  const lastFrameTime = useRef(0);

  // Device detection - only on mount, resize-aware
  useEffect(() => {
    const check = () => setMobile(isMobileDevice());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Randomise hue on click/tap, skip interactive elements
  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
      setHue(Math.ceil(Math.random() * 357 - 1));
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("touchend", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchend", handleClick);
    };
  }, []);

  // GPU buffers - stable across renders
  const { positions, opacities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(TRAIL_LENGTH * 3);
    const opacities = new Float32Array(TRAIL_LENGTH);
    const colors = new Float32Array(TRAIL_LENGTH * 3);
    const sizes = new Float32Array(TRAIL_LENGTH);

    for (let i = 0; i < TRAIL_LENGTH; i++) {
      opacities[i] = ((TRAIL_LENGTH - i) * 1.25) / 100;
      sizes[i] = TRAIL_RADIUS;
    }
    return { positions, opacities, colors, sizes };
  }, []);

  // Recompute colours whenever hue or theme changes
  useEffect(() => {
    const { saturation, brightness } = THEME_VALUES[theme];
    const [r, g, b] = hsbToRgb(hue, saturation, brightness);
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    if (meshRef.current?.geometry.attributes.color) {
      meshRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [hue, theme, colors]);

  // Per-frame trail update
  useFrame(({ clock }) => {
    const now = clock.elapsedTime * 1000;
    if (mobile && now - lastFrameTime.current < 16.67) return;
    lastFrameTime.current = now;

    // Client to NDC to world space
    const ndcX = (pointer.current.x / size.width) * 2 - 1;
    const ndcY = -(pointer.current.y / size.height) * 2 + 1;
    worldPos.current.x = (ndcX * viewport.width) / 2;
    worldPos.current.y = (ndcY * viewport.height) / 2;

    const ease = mobile ? 0.7 : 0.6;
    let leader = { ...worldPos.current };

    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const pt = trailPoints.current[i];
      pt.x += (leader.x - pt.x) * ease;
      pt.y += (leader.y - pt.y) * ease;
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      leader = { x: pt.x, y: pt.y };
    }

    if (meshRef.current?.geometry.attributes.position) {
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );

  return (
    <points ref={meshRef} material={material}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[opacities, 1]} attach="attributes-opacity" />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" />
        <bufferAttribute args={[sizes, 1]} attach="attributes-size" />
      </bufferGeometry>
    </points>
  );
};

export default MouseTrail;
