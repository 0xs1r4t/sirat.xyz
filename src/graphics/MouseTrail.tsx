"use client";

import { Fragment } from "react";

// import React, { useEffect, useState } from "react";
// import { cn } from "@/lib/utils";
// import { P5CanvasInstance, Sketch } from "@p5-wrapper/react";
// import { NextReactP5Wrapper } from "@p5-wrapper/next";
// import { Vector } from "p5";
// import { usePathname } from "next/navigation";

// /***
//  * The original sketch is stored in the "Snake.tsx" file.
//  * It can be viewed separately on https://sirat.xyz/graphics
//  * This is a slight modification of the original sketch.
//  * It works as a trail that follows the mouse.
//  * You can click to change the color of the trail.
//  * You can play around with the parameters of the sketch here:
//  * https://editor.p5js.org/0xS1R4T/sketches/VnkFAP_oN
//  ***/

// interface MouseTrailProps {
//   children: React.ReactNode;
//   className?: string;
// }

// const MouseTrail = ({ children, className }: MouseTrailProps) => {
//   const pathname = usePathname();
//   const [theme, setTheme] = useState("strawberry-matcha");

//   useEffect(() => {
//     // Get initial theme
//     const htmlElement = document.documentElement;
//     setTheme(htmlElement.getAttribute("data-theme") || "strawberry-matcha");

//     // Watch for theme changes
//     const observer = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//         if (mutation.attributeName === "data-theme") {
//           setTheme(
//             htmlElement.getAttribute("data-theme") || "strawberry-matcha"
//           );
//         }
//       });
//     });

//     observer.observe(htmlElement, { attributes: true });
//     return () => observer.disconnect();
//   }, []);

//   // Don't render the trail if we're on the graphics page
//   if (pathname === "/graphics") {
//     return <div className={className}>{children}</div>;
//   }

//   const sketch: Sketch = (p: P5CanvasInstance) => {
//     let points: Vector[] = [];
//     const num = 25;
//     const radius = 50;
//     let value = 300; // initial hue

//     const getThemeValues = () => {
//       switch (theme) {
//         case "blueberry-lemon":
//           return { saturation: 75, brightness: 75 };
//         case "neopolitan-ice-cream":
//           return { saturation: 30, brightness: 100 };
//         case "strawberry-matcha":
//         default:
//           return { saturation: 20, brightness: 100 };
//       }
//     };

//     const getViewportHeight = () => {
//       // Use svh if available, fallback to vh
//       return (
//         (window.innerHeight *
//           (window.visualViewport?.height || window.innerHeight)) /
//         window.innerHeight
//       );
//     };

//     class SnakeTrail {
//       distance: Vector;
//       velocity: Vector;
//       ease: number;

//       constructor(public points: Vector[], public num: number) {
//         this.points.length = num;
//         this.distance = p.createVector(0, 0);
//         this.velocity = p.createVector(0, 0);
//         this.ease = 0.7;
//       }

//       createTrail(i: number, leader: Vector) {
//         this.distance.x = leader.x - this.points[i].x;
//         this.distance.y = leader.y - this.points[i].y;
//         this.velocity = this.distance.mult(this.ease);
//         this.points[i].add(this.velocity);

//         const { saturation, brightness } = getThemeValues();
//         p.fill(value, saturation, brightness, (num - i) * 1.25);
//         p.ellipse(this.points[i].x, this.points[i].y, radius, radius);
//         this.velocity.lerp(this.distance, this.ease);
//       }
//     }

//     p.setup = () => {
//       p.disableFriendlyErrors = true;
//       const myCanvas = p.createCanvas(p.windowWidth, p.windowHeight);
//       myCanvas.style("position", "fixed");
//       myCanvas.style("top", "0");
//       myCanvas.style("left", "0");
//       myCanvas.style("z-index", "-1");
//       myCanvas.style("pointer-events", "none");
//       myCanvas.style("height", "100svh");
//       myCanvas.style("max-height", "100svh");

//       // Only apply touch prevention to the canvas element
//       myCanvas.elt.style.touchAction = "none";
//       myCanvas.elt.style.userSelect = "none";
//       myCanvas.elt.style.webkitUserSelect = "none";
//       myCanvas.elt.style.webkitTouchCallout = "none";

//       p.colorMode(p.HSB, 360, 100, 100, 100);
//       p.frameRate(30);

//       // Initialize points at center
//       for (let i = 0; i < num; i++) {
//         points[i] = p.createVector(p.width / 2, p.height / 2);
//       }
//     };

//     p.windowResized = () => {
//       p.resizeCanvas(p.windowWidth, getViewportHeight());
//     };

//     p.mousePressed = () => {
//       value = p.ceil(p.random(-1, 356)); // Random color on click
//       console.log(`the hue of the trail is ${value}/360`);
//     };

//     p.draw = () => {
//       p.clear(); // Clear canvas each frame
//       p.noStroke();

//       const target = p.createVector(p.mouseX, p.mouseY);
//       let leader = p.createVector(target.x, target.y);

//       const trail = new SnakeTrail(points, num);

//       for (let i = 0; i < num; i++) {
//         trail.createTrail(i, leader);
//         leader = points[i];
//       }
//     };
//   };

//   return (
//     <div className={cn("relative w-full h-svh", className)}>
//       <NextReactP5Wrapper sketch={sketch} />
//       <div className="relative">{children}</div>
//     </div>
//   );
// };

const MouseTrail = () => {
  return <Fragment></Fragment>;
};

export default MouseTrail;
