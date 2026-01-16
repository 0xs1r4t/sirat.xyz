"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Image, { ImageProps } from "next/image";

interface DitherImageProps extends Omit<ImageProps, "onLoad"> {
  ditherPattern?: "2x2" | "4x4" | "8x8";
  ditherIntensity?: number;
  className?: string;
  onLoad?: () => void;
  useThemeColors?: boolean;
  // Support for different media types
  mediaType?: "image" | "video";
}

const DitherImage = ({
  ditherPattern = "4x4",
  ditherIntensity = 1.0,
  className,
  onLoad,
  useThemeColors = false,
  mediaType = "image",
  ...imageProps
}: DitherImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [theme, setTheme] = useState<string>("strawberry-matcha");
  const [isMounted, setIsMounted] = useState(false);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if the source is a video format
  const isVideoFormat = useCallback(
    (src: string) => {
      const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".gif"];
      return (
        videoExtensions.some((ext) => src.toLowerCase().includes(ext)) ||
        mediaType === "video"
      );
    },
    [mediaType]
  );

  // Theme detection (similar to MouseTrail)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !useThemeColors) return;

    const htmlElement = document.documentElement;
    const classList = Array.from(htmlElement.classList);
    const themeClass = classList.find((cls) =>
      ["strawberry-matcha", "blueberry-lemon", "neopolitan-ice-cream"].includes(
        cls
      )
    );
    const initialTheme = themeClass || "strawberry-matcha";
    setTheme(initialTheme);

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
        }
      });
    });

    observer.observe(htmlElement, { attributes: true });
    return () => observer.disconnect();
  }, [isMounted, useThemeColors]);

  const handleMediaLoad = useCallback(() => {
    if (mediaRef.current) {
      const rect = mediaRef.current.getBoundingClientRect();
      setImageDimensions({
        width: rect.width,
        height: rect.height,
      });
      setIsLoaded(true);
      onLoad?.();
    }
  }, [onLoad]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mediaRef.current) {
        const rect = mediaRef.current.getBoundingClientRect();
        setImageDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if we should render a video element instead of Image
  const shouldUseVideo = isVideoFormat(imageProps.src as string);

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      {shouldUseVideo ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={imageProps.src as string}
          width={imageProps.width}
          height={imageProps.height}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleMediaLoad}
          style={{ display: "block", ...imageProps.style }}
        />
      ) : (
        <Image
          {...imageProps}
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          onLoad={handleMediaLoad}
          style={{ display: "block", ...imageProps.style }}
        />
      )}

      {isLoaded && imageDimensions.width > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: imageDimensions.width,
            height: imageDimensions.height,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <Canvas
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1 }}
            style={{
              width: "100%",
              height: "100%",
            }}
            gl={{
              antialias: false,
              alpha: true,
              preserveDrawingBuffer: false,
              powerPreference: "low-power"
            }}
            onCreated={(state) => {
              // Handle WebGL context loss
              const canvas = state.gl.domElement;
              canvas.addEventListener('webglcontextlost', (e) => {
                console.log('WebGL context lost, preventing default');
                e.preventDefault();
              });
              canvas.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored');
              });
            }}
          >
            <DitherEffect
              mediaElement={mediaRef.current}
              pattern={ditherPattern}
              intensity={ditherIntensity}
              dimensions={imageDimensions}
              theme={theme}
              useThemeColors={useThemeColors}
              isVideo={shouldUseVideo}
            />
          </Canvas>
        </div>
      )}
    </div>
  );
};

interface DitherEffectProps {
  mediaElement: HTMLImageElement | HTMLVideoElement | null;
  pattern: "2x2" | "4x4" | "8x8";
  intensity: number;
  dimensions: { width: number; height: number };
  theme: string;
  useThemeColors: boolean;
  isVideo: boolean;
}

const DitherEffect = ({
  mediaElement,
  pattern,
  intensity,
  dimensions,
  theme,
  useThemeColors,
  isVideo,
}: DitherEffectProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Debug logging
  console.log('DitherEffect render:', {
    mediaElement: !!mediaElement,
    texture: !!texture,
    dimensions,
    pattern,
    intensity
  });

  // Theme color mappings
  const getThemeColors = useCallback((themeName: string) => {
    switch (themeName) {
      case "blueberry-lemon":
        return {
          tint: new THREE.Vector3(0.87, 0.95, 0.84),
          contrast: 1.2,
        };
      case "neopolitan-ice-cream":
        return {
          tint: new THREE.Vector3(1.0, 0.96, 0.88),
          contrast: 1.1,
        };
      case "strawberry-matcha":
      default:
        return {
          tint: new THREE.Vector3(0.9, 1.0, 0.93),
          contrast: 1.0,
        };
    }
  }, []);

  // Create texture from media element
  useEffect(() => {
    if (!mediaElement) {
      console.log('No mediaElement for texture creation');
      return;
    }

    console.log('Creating texture from mediaElement:', mediaElement.tagName, isVideo);

    let newTexture: THREE.Texture;

    if (isVideo) {
      // For video elements, create a video texture
      newTexture = new THREE.VideoTexture(mediaElement as HTMLVideoElement);
      console.log('Created VideoTexture');
    } else {
      // For images, create texture via canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const img = mediaElement as HTMLImageElement;
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      console.log('Image dimensions for texture:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        width: img.width,
        height: img.height,
        canvasSize: { width: canvas.width, height: canvas.height }
      });

      ctx.drawImage(img, 0, 0);

      newTexture = new THREE.CanvasTexture(canvas);
      console.log('Created CanvasTexture');
    }

    newTexture.minFilter = THREE.LinearFilter;
    newTexture.magFilter = THREE.LinearFilter;
    newTexture.wrapS = THREE.ClampToEdgeWrapping;
    newTexture.wrapT = THREE.ClampToEdgeWrapping;

    setTexture(newTexture);
    console.log('Texture set:', newTexture);

    return () => {
      newTexture.dispose();
    };
  }, [mediaElement, isVideo]);

  // Update texture for videos
  useFrame(() => {
    if (texture && isVideo && mediaElement) {
      (texture as THREE.VideoTexture).needsUpdate = true;
    }
  });

  // Dithering shader material
  const shaderMaterial = React.useMemo(() => {
    if (!texture) return null;

    const ditherFunction = getDitherFunction(pattern);
    const themeColors = getThemeColors(theme);

    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uIntensity: { value: intensity },
        uResolution: {
          value: new THREE.Vector2(dimensions.width, dimensions.height),
        },
        uThemeTint: { value: themeColors.tint },
        uContrast: { value: themeColors.contrast },
        uUseThemeColors: { value: useThemeColors ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uIntensity;
        uniform vec2 uResolution;
        uniform vec3 uThemeTint;
        uniform float uContrast;
        uniform float uUseThemeColors;
        varying vec2 vUv;

        // Luminance calculation
        float luma(vec3 color) {
          return dot(color, vec3(0.299, 0.587, 0.114));
        }

        ${ditherFunction}

        void main() {
          vec4 originalColor = texture2D(uTexture, vUv);
          
          // Convert screen coordinates to dither coordinates
          vec2 ditherCoord = gl_FragCoord.xy;
          
          // Apply theme colors if enabled
          vec4 processedColor = originalColor;
          if (uUseThemeColors > 0.5) {
            processedColor.rgb = (processedColor.rgb - 0.5) * uContrast + 0.5;
            processedColor.rgb *= uThemeTint;
          }
          
          vec4 ditheredColor = ${getDitherCall(
            pattern
          )}(ditherCoord, processedColor);
          
          // Apply the dithering effect
          gl_FragColor = mix(originalColor, ditheredColor, uIntensity);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: false,
    });
  }, [
    texture,
    pattern,
    intensity,
    dimensions,
    theme,
    useThemeColors,
    getThemeColors,
  ]);

  // Create plane geometry that matches the canvas size
  const geometry = React.useMemo(() => {
    // For orthographic camera, create plane that fills the viewport
    const plane = new THREE.PlaneGeometry(2, 2);
    console.log('Created plane geometry:', plane);
    return plane;
  }, []);

  if (!shaderMaterial || !texture) {
    console.log('DitherEffect not rendering:', { 
      hasShaderMaterial: !!shaderMaterial, 
      hasTexture: !!texture 
    });
    return null;
  }

  console.log('DitherEffect rendering mesh with:', {
    geometry: geometry.type,
    material: shaderMaterial.type,
    uniforms: Object.keys(shaderMaterial.uniforms)
  });

  return <mesh ref={meshRef} geometry={geometry} material={shaderMaterial} />;
};

// Helper functions to generate dither shaders
const getDitherFunction = (pattern: string): string => {
  switch (pattern) {
    case "2x2":
      return `
        float dither2x2(vec2 position, float brightness) {
          int x = int(mod(position.x, 2.0));
          int y = int(mod(position.y, 2.0));
          int index = x + y * 2;
          float limit = 0.0;

          if (index == 0) limit = 0.25;
          if (index == 1) limit = 0.75;
          if (index == 2) limit = 1.00;
          if (index == 3) limit = 0.50;

          return brightness < limit ? 0.0 : 1.0;
        }

        vec4 dither2x2(vec2 position, vec4 color) {
          return vec4(color.rgb * dither2x2(position, luma(color.rgb)), color.a);
        }
      `;
    case "4x4":
      return `
        float dither4x4(vec2 position, float brightness) {
          int x = int(mod(position.x, 4.0));
          int y = int(mod(position.y, 4.0));
          int index = x + y * 4;
          float limit = 0.0;

          if (index == 0) limit = 0.0625;
          if (index == 1) limit = 0.5625;
          if (index == 2) limit = 0.1875;
          if (index == 3) limit = 0.6875;
          if (index == 4) limit = 0.8125;
          if (index == 5) limit = 0.3125;
          if (index == 6) limit = 0.9375;
          if (index == 7) limit = 0.4375;
          if (index == 8) limit = 0.25;
          if (index == 9) limit = 0.75;
          if (index == 10) limit = 0.125;
          if (index == 11) limit = 0.625;
          if (index == 12) limit = 1.0;
          if (index == 13) limit = 0.5;
          if (index == 14) limit = 0.875;
          if (index == 15) limit = 0.375;

          return brightness < limit ? 0.0 : 1.0;
        }

        vec4 dither4x4(vec2 position, vec4 color) {
          return vec4(color.rgb * dither4x4(position, luma(color.rgb)), color.a);
        }
      `;
    case "8x8":
    default:
      return `
        float dither8x8(vec2 position, float brightness) {
          int x = int(mod(position.x, 8.0));
          int y = int(mod(position.y, 8.0));
          int index = x + y * 8;
          float limit = 0.0;

          if (index == 0) limit = 0.015625; if (index == 1) limit = 0.515625; 
          if (index == 2) limit = 0.140625; if (index == 3) limit = 0.640625;
          if (index == 4) limit = 0.046875; if (index == 5) limit = 0.546875;
          if (index == 6) limit = 0.171875; if (index == 7) limit = 0.671875;
          if (index == 8) limit = 0.765625; if (index == 9) limit = 0.265625;
          if (index == 10) limit = 0.890625; if (index == 11) limit = 0.390625;
          if (index == 12) limit = 0.796875; if (index == 13) limit = 0.296875;
          if (index == 14) limit = 0.921875; if (index == 15) limit = 0.421875;
          if (index == 16) limit = 0.203125; if (index == 17) limit = 0.703125;
          if (index == 18) limit = 0.078125; if (index == 19) limit = 0.578125;
          if (index == 20) limit = 0.234375; if (index == 21) limit = 0.734375;
          if (index == 22) limit = 0.109375; if (index == 23) limit = 0.609375;
          if (index == 24) limit = 0.953125; if (index == 25) limit = 0.453125;
          if (index == 26) limit = 0.828125; if (index == 27) limit = 0.328125;
          if (index == 28) limit = 0.984375; if (index == 29) limit = 0.484375;
          if (index == 30) limit = 0.859375; if (index == 31) limit = 0.359375;
          if (index == 32) limit = 0.0625; if (index == 33) limit = 0.5625;
          if (index == 34) limit = 0.1875; if (index == 35) limit = 0.6875;
          if (index == 36) limit = 0.03125; if (index == 37) limit = 0.53125;
          if (index == 38) limit = 0.15625; if (index == 39) limit = 0.65625;
          if (index == 40) limit = 0.8125; if (index == 41) limit = 0.3125;
          if (index == 42) limit = 0.9375; if (index == 43) limit = 0.4375;
          if (index == 44) limit = 0.78125; if (index == 45) limit = 0.28125;
          if (index == 46) limit = 0.90625; if (index == 47) limit = 0.40625;
          if (index == 48) limit = 0.25; if (index == 49) limit = 0.75;
          if (index == 50) limit = 0.125; if (index == 51) limit = 0.625;
          if (index == 52) limit = 0.21875; if (index == 53) limit = 0.71875;
          if (index == 54) limit = 0.09375; if (index == 55) limit = 0.59375;
          if (index == 56) limit = 1.0; if (index == 57) limit = 0.5;
          if (index == 58) limit = 0.875; if (index == 59) limit = 0.375;
          if (index == 60) limit = 0.96875; if (index == 61) limit = 0.46875;
          if (index == 62) limit = 0.84375; if (index == 63) limit = 0.34375;

          return brightness < limit ? 0.0 : 1.0;
        }

        vec4 dither8x8(vec2 position, vec4 color) {
          return vec4(color.rgb * dither8x8(position, luma(color.rgb)), color.a);
        }
      `;
  }
};

const getDitherCall = (pattern: string): string => {
  return `dither${pattern}`;
};

export default DitherImage;
