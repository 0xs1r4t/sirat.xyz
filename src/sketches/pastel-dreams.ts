"use client";

import { Vector } from "p5";

export const pastelDreams: P5jsSketch = (p5, parentRef) => {
  let x: number, y: number;
  let size: { length: number; width: number };
  let width: number, height: number;
  let i: number;
  let value = 300,
    back = 120,
    ease = 0.5,
    num = 100;
  let deg: Array<number> = []; // degrees
  //   let easing = true, frames = 700, count = 0;

  let parentStyle: CSSStyleDeclaration;
  //   let windowHeight: number = 250;
  //   let windowWidth: number = 250;
  let canvasHeight: number;
  let canvasWidth: number;
  let cnv: any;
  let points: Vector[] = [];
  let distance: Vector, velocity: Vector;

  p5.setup = () => {
    parentStyle = window.getComputedStyle(parentRef);
    canvasWidth = parseInt(parentStyle.width) * 0.97;
    canvasHeight = parseInt(parentStyle.height) + 250;

    cnv = p5.createCanvas(canvasWidth, canvasHeight).parent(parentRef);

    addDegrees(); // add degrees 0 - 360 in deg
    cnv.mouseClicked(chooseRandColor);
    p5.colorMode(p5.HSB, 360, 100, 100);

    for (i = 0; i < num; i++) {
      points[i] = new Vector(width / 2, height / 2);
    }
  };

  //   let windowResized = () => {
  //     p5.resizeCanvas(windowWidth, windowHeight);
  //   };

  let addDegrees = () => {
    for (i = 0; i <= 360; i += 30) {
      deg.push(i);
    }
    // console.log(deg);
  };

  let chooseRandColor = () => {
    value = p5.random(deg);

    if (value >= 0 && value <= 180) {
      back = value + 180;
    } else if (value > 180 && value <= 360) {
      back = value - 180;
    }

    // console.log(`value = ${value}, background = ${back}`);
  };

  p5.draw = () => {
    p5.background(back, 25, 100);
    // p5.background(parentStyle.backgroundColor);
    p5.noStroke();
    x = p5.mouseX;
    y = p5.mouseY;

    let target = new Vector(x, y);
    let leader = new Vector(target.x, target.y);

    size = { length: 100, width: 100 };

    for (let i = 0; i > num; i++) {
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
