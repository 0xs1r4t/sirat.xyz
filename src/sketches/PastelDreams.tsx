"use client";

import p5, { Vector } from "p5";
import { P5CanvasInstance, type Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export const PastelDreams = () => {
  const sketch: Sketch = (p5: P5CanvasInstance) => {
    // p5.disableFriendlyErrors = true;

    let cnv: any;
    let windowWidth: number, windowHeight: number;

    let x: number, y: number;
    let size: { length: number; width: number };
    size = { length: 100, width: 100 };
    let width: number, height: number;
    let i: number;
    let value = 300,
      back = 120,
      ease = 0.5,
      num = 100;
    let deg: Array<number> = []; // degrees
    //   let easing = true, frames = 700, count = 0;

    let points: p5.Vector[] = [],
      distance: p5.Vector,
      velocity: p5.Vector;

    p5.setup = () => {
      width = p5.windowWidth;
      height = p5.windowHeight;
      cnv = p5.createCanvas(width, height /*, p5.WEBGL */);

      addDegrees(); // add degrees 0 - 360 in deg
      cnv.mouseClicked(chooseRandColor);
      p5.colorMode(p5.HSB, 360, 100, 100);

      for (i = 0; i < num; i++) {
        points[i] = new Vector(size.length / 2, size.width / 2);
      }
    };

    p5.windowResized = () => {
      windowWidth = p5.windowWidth;
      windowHeight = p5.windowHeight;
      p5.resizeCanvas(windowWidth, windowHeight);
    };

    const addDegrees = () => {
      for (i = 0; i <= 360; i += 30) {
        deg.push(i);
      }
      console.log(deg);
    };

    const chooseRandColor = () => {
      value = p5.random(deg);

      if (value >= 0 && value <= 180) {
        back = value + 180;
      } else if (value > 180 && value <= 360) {
        back = value - 180;
      }

      console.log(`value = ${value}, background = ${back}`);
    };

    p5.draw = () => {
      p5.background(back, 25, 100);
      p5.noStroke();
      x = p5.mouseX;
      y = p5.mouseY;

      console.log("window.innerHeight in p5.draw", window.innerHeight);

      let target = new Vector(x, y);
      let leader = new Vector(target.x, target.y);

      for (let i = 0; i < num; i++) {
        p5.fill(value, ((i + 5) * 2) / 3, 85);
        let point = points[i];
        distance = Vector.sub(leader, point);
        velocity = distance.mult(ease);
        point.add(velocity);
        p5.ellipse(point.x, point.y, size.length, size.width);
        leader = point;
      }
    };
  };

  return <NextReactP5Wrapper sketch={sketch} />;
};
