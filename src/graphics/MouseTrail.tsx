"use client";

import React, { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePathname } from "next/navigation";

interface MouseTrailProps {
  children: React.ReactNode;
  className?: string;
}

const MouseTrail = ({ children, className }: MouseTrailProps) => {
  const pathname = usePathname();
  const [theme, setTheme] = useState<string>("strawberry-matcha");
  const [isMounted, setIsMounted] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Get initial theme from class list
    const htmlElement = document.documentElement;
    const classList = Array.from(htmlElement.classList);
    const themeClass = classList.find((cls) =>
      ["strawberry-matcha", "blueberry-lemon", "neopolitan-ice-cream"].includes(
        cls
      )
    );
    const initialTheme = themeClass || "strawberry-matcha";
    setTheme(initialTheme);
    console.log("Mouse trail initial theme:", initialTheme);

    // Watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const classList = Array.from(htmlElement.classList);
          const themeClass = classList.find((cls) =>
            [
              "strawberry-matcha",
              "blueberry-lemon",
              "neopolitan-ice-cream",
            ].includes(cls)
          );
          const newTheme = themeClass || "strawberry-matcha";
          setTheme(newTheme);
          console.log("Mouse trail theme changed to:", newTheme);
        }
      });
    });

    observer.observe(htmlElement, { attributes: true });
    return () => observer.disconnect();
  }, [isMounted]);

  // Add mouse tracking with touch support
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mousePosition.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mousePosition.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isMounted]);

  // Don't render the trail if we're on the graphics page
  if (pathname === "/graphics") {
    return <div className={className}>{children}</div>;
  }

  // Don't render on server side
  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative w-full min-h-screen ${className || ""}`}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Suspense fallback={null}>
          <Canvas
            orthographic
            camera={{ position: [0, 0, 1000], zoom: 1 }}
            style={{
              width: "100%",
              height: "100%",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none",
            }}
          >
            <TrailSystem theme={theme} mousePosition={mousePosition} />
          </Canvas>
        </Suspense>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
};

const TrailSystem = ({
  theme,
  mousePosition,
}: {
  theme: string;
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const { size, viewport, gl } = useThree();

  // Mobile-optimized parameters
  const [isMobile, setIsMobile] = useState(false);
  const [supportsWebGL, setSupportsWebGL] = useState(true);

  // Adaptive parameters based on device
  const num = isMobile ? 15 : 25; // Fewer points on mobile
  const radius = isMobile ? 60 : 90; // Smaller radius on mobile
  const [hue, setHue] = useState<number>(300);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
          userAgent
        ) ||
        "ontouchstart" in window ||
        window.innerWidth <= 768;

      setIsMobile(isMobileDevice);

      // Check WebGL support
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        setSupportsWebGL(!!context);
      } catch (e) {
        setSupportsWebGL(false);
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Mouse position in world coordinates
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastUpdateTime = useRef<number>(0);

  // Trail points
  const points = useRef<{ x: number; y: number }[]>(
    Array(num)
      .fill(null)
      .map(() => ({ x: 0, y: 0 }))
  );

  // Update points array when num changes (mobile vs desktop)
  useEffect(() => {
    const newLength = num;
    if (points.current.length !== newLength) {
      points.current = Array(newLength)
        .fill(null)
        .map((_, i) => points.current[i] || { x: 0, y: 0 });
    }
  }, [num]);

  // Fallback for devices without WebGL
  if (!supportsWebGL) {
    return null; // Gracefully degrade
  }

  const getThemeValues = () => {
    switch (theme) {
      case "blueberry-lemon":
        return { saturation: 0.75, brightness: 0.75 }; // Match p5.js values
      case "neopolitan-ice-cream":
        return { saturation: 0.3, brightness: 1.0 };
      case "strawberry-matcha":
      default:
        return { saturation: 0.2, brightness: 1.0 }; // Match p5.js values
    }
  };

  // Convert HSB to RGB (matching p5.js HSB color mode)
  const hsbToRgb = (
    h: number,
    s: number,
    b: number
  ): [number, number, number] => {
    h = h / 360;
    const c = b * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = b - c;
    let r: number, g: number, blue: number;
    if (h < 1 / 6) [r, g, blue] = [c, x, 0];
    else if (h < 2 / 6) [r, g, blue] = [x, c, 0];
    else if (h < 3 / 6) [r, g, blue] = [0, c, x];
    else if (h < 4 / 6) [r, g, blue] = [0, x, c];
    else if (h < 5 / 6) [r, g, blue] = [x, 0, c];
    else [r, g, blue] = [c, 0, x];
    return [r + m, g + m, blue + m];
  };

  // Instance data for positioning and opacity
  const { positions, opacities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(num * 3);
    const opacities = new Float32Array(num);
    const colors = new Float32Array(num * 3);
    const sizes = new Float32Array(num);

    for (let i = 0; i < num; i++) {
      positions[i * 3] = 0; // x
      positions[i * 3 + 1] = 0; // y
      positions[i * 3 + 2] = 0; // z

      // Match p5.js alpha calculation: (num - i) * 1.25 / 100
      opacities[i] = ((num - i) * 1.25) / 100;
      sizes[i] = radius;
    }
    return { positions, opacities, colors, sizes };
  }, [num, radius]);

  // Update colors when theme or hue changes
  useEffect(() => {
    const { saturation, brightness } = getThemeValues();
    const [r, g, b] = hsbToRgb(hue, saturation, brightness);

    for (let i = 0; i < num; i++) {
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    if (meshRef.current?.geometry.attributes.color) {
      meshRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [hue, theme, colors, num]);

  // Handle click/tap to change color (with touch support)
  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      // Prevent color change if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button, a, input, textarea")
      ) {
        return;
      }
      // Match p5.js: p.ceil(p.random(-1, 356))
      const newHue = Math.ceil(Math.random() * 357 - 1);
      setHue(newHue);
      console.log(`the hue of the trail is ${newHue}/360`);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("touchend", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchend", handleClick);
    };
  }, []);

  useFrame((state) => {
    // Throttle updates on mobile for better performance
    const now = state.clock.elapsedTime * 1000;
    if (isMobile && now - lastUpdateTime.current < 16.67) {
      // ~60fps cap on mobile
      return;
    }
    lastUpdateTime.current = now;

    // Convert client coordinates to world space
    const clientX = mousePosition.current.x;
    const clientY = mousePosition.current.y;

    // Convert to normalized device coordinates (-1 to 1)
    const x = (clientX / size.width) * 2 - 1;
    const y = -(clientY / size.height) * 2 + 1;

    // Convert to world coordinates
    targetPos.current.x = (x * viewport.width) / 2;
    targetPos.current.y = (y * viewport.height) / 2;

    // Direct mouse following (no smoothing like p5.js version)
    mousePos.current.x = targetPos.current.x;
    mousePos.current.y = targetPos.current.y;

    // Update trail points with snake-like following (match p5.js ease = 0.7)
    let leader = { x: mousePos.current.x, y: mousePos.current.y };
    const trailEase = isMobile ? 0.8 : 0.5; // Slightly faster on mobile for responsiveness

    for (let i = 0; i < num; i++) {
      const point = points.current[i];

      // Match p5.js SnakeTrail logic
      const dx = leader.x - point.x;
      const dy = leader.y - point.y;
      point.x += dx * trailEase;
      point.y += dy * trailEase;

      // Update instance positions
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;

      leader = { x: point.x, y: point.y };
    }

    // Update geometry
    if (meshRef.current?.geometry.attributes.position) {
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Shader material that mimics p5.js ellipse rendering
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        attribute float opacity;
        attribute vec3 color;
        attribute float size;
        varying float vOpacity;
        varying vec3 vColor;
        
        void main() {
          vOpacity = opacity;
          vColor = color;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Sharp circle edge like p5.js ellipse
          if (dist > 0.5) {
            discard;
          }
          
          // Solid fill like p5.js, no glow effects
          gl_FragColor = vec4(vColor, vOpacity);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: false,
    });
  }, []);

  return (
    <points ref={meshRef} material={shaderMaterial}>
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
