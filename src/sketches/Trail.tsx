"use client";

import { Vector } from "p5";
import { P5CanvasInstance, Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export const Trail = () => {
  let x: number,
    y: number,
    points: Vector[],
    target: Vector,
    leader: Vector,
    i: number,
    windowSize: number;

  let value: number = 300,
    back: number = 120,
    num: number = 80,
    radius: number = 150;
  let degrees: number[] = [];

  const sketch: Sketch = (p: P5CanvasInstance) => {
    class Point {
      distance: Vector;
      velocity: Vector;
      ease: number;

      constructor(
        public points: Vector[],
        public num: number,
        public x: number,
        public y: number
      ) {
        this.points.length = num;
        this.distance = p.createVector(0, 0);
        this.velocity = p.createVector(0, 0);
        this.ease = 0.5;
      }

      public createTrail(i: number, leader: Vector) {
        this.distance.x = leader.x - this.points[i].x;
        this.distance.y = leader.y - this.points[i].y;
        this.velocity = this.distance.mult(this.ease);
        this.points[i].add(this.velocity);
        // hue = value
        // saturation = (num - i + 5) / 3 or 28
        // brightness = 90
        // alpha = (num - i) * 1.25
        p.fill(value, (num - i + 5) / 3, 90, (num - i) * 1.25);
        p.ellipse(this.points[i].x, this.points[i].y, radius, radius);
        this.velocity.lerp(this.distance, this.ease);
      }
    }

    p.setup = () => {
      p.disableFriendlyErrors = true;
      // windowSize = p.min(p.windowWidth, p.windowHeight);

      // let myCanvas = p.createCanvas(windowSize, windowSize, "p2d");
      let myCanvas = p.createCanvas(p.windowWidth, p.windowHeight, "p2d");
      addDegrees(); // add degrees 0 - 360 in degrees
      myCanvas.mouseClicked(chooseRandColor);
      p.colorMode(p.HSB, 360, 100, 100, 100); // with alpha (transparency)
      points = new Array<Vector>(num);

      for (i = 0; i < num; i++) {
        points[i] = p.createVector(p.width / 2, p.height / 2);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    const addDegrees = () => {
      for (i = 0; i <= 360; i += 30) {
        degrees.push(i);
      }
    };

    const chooseRandColor = () => {
      value = p.random(degrees);

      if (value >= 0 && value <= 180) {
        back = value + 180;
      } else if (value > 180 && value <= 360) {
        back = value - 180;
      }
    };

    p.draw = () => {
      p.background(back, 20, 100);
      // p.background(0, 0, 100);
      p.noStroke();
      x = p.mouseX;
      y = p.mouseY;

      target = p.createVector(x, y);
      leader = p.createVector(target.x, target.y);

      let point = new Point(points, num, x, y);

      for (i = 0; i < num; i++) {
        point.createTrail(i, leader);
        leader = points[i];
      }
    };
  };

  return <NextReactP5Wrapper sketch={sketch} />;
};
