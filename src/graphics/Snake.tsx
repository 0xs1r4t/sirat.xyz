"use client";

import { Vector } from "p5";
import { P5CanvasInstance, Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

/***
 * A slight modification of my original sketch, "Pastel Dreams"
 * You can play around with the parameters of the sketch here:
 * https://editor.p5js.org/0xS1R4T/sketches/VnkFAP_oN
 ***/

export const Snake = () => {
  const sketch: Sketch = (p: P5CanvasInstance) => {
    let x: number,
      y: number,
      points: Vector[],
      target: Vector,
      leader: Vector,
      i: number;
    // windowSize: number;

    let value: number = 300;
    let back: number = 120;
    let num: number = p.windowWidth < 768 ? 40 : 80; // fewer segments on mobile
    let radius: number = p.windowWidth < 768 ? 75 : 150; // smaller radius on mobile
    let degrees: number[] = [];

    class Circle {
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

      public createSnake(i: number, leader: Vector) {
        this.distance.x = leader.x - this.points[i].x;
        this.distance.y = leader.y - this.points[i].y;
        this.velocity = this.distance.mult(this.ease);
        this.points[i].add(this.velocity);

        /**************************************
         * original values:
         *
        hue = value
        saturation = (num - i + 5) / 3 or 28
        brightness = 90
        alpha = (num - i) * 1.25
         *
        **************************************/
        p.fill(value, (num - i + 5) / 3, 90, (num - i) * 1.25);
        p.ellipse(this.points[i].x, this.points[i].y, radius, radius);
        this.velocity.lerp(this.distance, this.ease);
      }
    }

    p.setup = () => {
      p.disableFriendlyErrors = true;

      let myCanvas = p.createCanvas(p.windowWidth, p.windowHeight, "p2d");

      const canvasElement = document.querySelector("canvas");
      canvasElement?.addEventListener(
        "touchstart",
        (e) => e.preventDefault(),
        false
      );

      addDegrees(); // add degrees 0 - 360 in degrees

      p.colorMode(p.HSB, 360, 100, 100, 100); // with alpha (transparency)
      p.noCursor();
      p.frameRate(30);

      points = new Array<Vector>(num);

      for (i = 0; i < num; i++) {
        points[i] = p.createVector(p.width / 2, p.height / 2);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.mousePressed = () => {
      chooseRandColor();
    };

    p.touchStarted = () => {
      chooseRandColor();
    };

    const addDegrees = () => {
      for (i = 0; i <= 360; i += 30) {
        degrees.push(i);
        // increment every 30 degrees to switch between 12 colours
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
      p.noStroke();

      // touch for mobile, mouse for pc
      // p.touches.length > 0 ? p.cursor("none") : p.cursor("default");
      // x = p.touches.length > 0 ? p.touches[0].x : p.mouseX;
      // y = p.touches.length > 0 ? p.touches[0].y : p.mouseY;
      x = p.mouseX;
      y = p.mouseY;

      // set target to mouse position
      target = p.createVector(x, y);
      leader = p.createVector(target.x, target.y);

      let point = new Circle(points, num, x, y);

      for (i = 0; i < num; i++) {
        point.createSnake(i, leader);
        leader = points[i];
      }
    };
  };

  return <NextReactP5Wrapper sketch={sketch} />;
};
