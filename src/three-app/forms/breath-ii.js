import * as THREE from "three";
import {
  parametricEllipseX,
  parametricEllipseY,
  parametricEllipseXDerivative,
  parametricEllipseYDerivative,
} from "@app/three-app/syntax/parametric-ellipse";
import {
  parametricTravellingWaveX,
  parametricTravellingWaveY,
  parametricTravellingWaveXDerivative,
  parametricTravellingWaveYDerivative,
} from "@app/three-app/syntax/parametric-travelling-wave";
import { CycleTiming } from "@app/three-app/cycle-timing";
import { Line } from "@app/three-app/line";
import { newtonRaphsonMethod } from "../newton-raphson-method";
import * as C from "@app/three-app/constants";
import * as U from "@app/three-app/utils";

const MAX_TICKS = 4000;
const ELLIPSE_POINT_COUNT = 100;
const TRAVELLING_WAVE_POINT_COUNT = 100;

export class BreathIIForm {
  constructor(width, height) {
    this.cycleTiming = new CycleTiming(MAX_TICKS);
    this.width = width;
    this.height = height;
    this.rx = (width / 2) * 0.98;
    this.ry = (height / 2) * 0.98;
    this.ellipseRx = this.rx;
    this.ellipseRy = this.ry;
    this.travellingWaveRy = this.ry / 2;
  }

  getEllipsePoints(parametricEllipseXFn, parametricEllipseYFn, θ1, θ2) {
    const Δθ = (θ2 - θ1) / ELLIPSE_POINT_COUNT;
    return U.range(ELLIPSE_POINT_COUNT + 1).map((n) => {
      const t = θ1 + n * Δθ;
      const x = parametricEllipseXFn(t);
      const y = parametricEllipseYFn(t);
      return new THREE.Vector2(x, y);
    });
  }

  getTravellingWavePoints(
    parametricTravellingWaveXFn,
    parametricTravellingWaveYFn,
    t1,
    t2
  ) {
    const Δt = (t2 - t1) / TRAVELLING_WAVE_POINT_COUNT;
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map((n) => {
      const t = t1 + n * Δt;
      const x = parametricTravellingWaveXFn(t);
      const y = parametricTravellingWaveYFn(t);
      return new THREE.Vector2(x, y);
    });
  }

  getFootprintData(deltaMs, absoluteMs) {
    const { cycleRatio } = this.cycleTiming.update(deltaMs, absoluteMs);

    const ellipseRx = (this.width / 2) * 0.98;
    const ellipseRy = (this.height / 2) * 0.98;

    const waveWidth = this.width;

    const outerSkinXFn = parametricEllipseX(ellipseRx);
    const outerSkinYFn = parametricEllipseY(ellipseRy);
    const outerSkinXDerivativeFn = parametricEllipseXDerivative(ellipseRx);
    const outerSkinYDerivativeFn = parametricEllipseYDerivative(ellipseRy);

    const configureWaveA = () => {
      const A = this.travellingWaveRy * 0.5;
      const λ = this.width * 1.0;
      const k = C.TWO_PI / λ;
      const f = 1;
      const ω = C.TWO_PI * f;
      const ωt = ω * cycleRatio;
      const φ = THREE.MathUtils.degToRad(-70);
      const xoffset = -waveWidth / 2;
      const waveXFn = parametricTravellingWaveX(xoffset);
      const tmp = parametricTravellingWaveY(A, k, ωt, φ);
      const waveYFn = (t) => tmp(t) + this.height / 8;
      const waveXDerivativeFn = parametricTravellingWaveXDerivative(xoffset);
      const waveYDerivativeFn = parametricTravellingWaveYDerivative(
        A,
        k,
        ωt,
        φ
      );
      return {
        waveXFn,
        waveYFn,
        waveXDerivativeFn,
        waveYDerivativeFn,
      };
    };

    const configureWaveB = () => {
      const A = this.travellingWaveRy * 0.5;
      const λ = this.width * 1.0;
      const k = C.TWO_PI / λ;
      const f = 1;
      const ω = C.TWO_PI * f;
      const ωt = ω * cycleRatio;
      const φ = THREE.MathUtils.degToRad(55);
      const xoffset = -waveWidth / 2;
      const waveXFn = parametricTravellingWaveX(xoffset);
      const tmp = parametricTravellingWaveY(A, k, ωt, φ);
      const waveYFn = (t) => tmp(t) - this.height / 8;
      const waveXDerivativeFn = parametricTravellingWaveXDerivative(xoffset);
      const waveYDerivativeFn = parametricTravellingWaveYDerivative(
        A,
        k,
        ωt,
        φ
      );
      return {
        waveXFn,
        waveYFn,
        waveXDerivativeFn,
        waveYDerivativeFn,
      };
    };

    const {
      waveXFn: waveAXFn,
      waveYFn: waveAYFn,
      waveXDerivativeFn: waveAXDerivativeFn,
      waveYDerivativeFn: waveAYDerivativeFn,
    } = configureWaveA();

    const {
      waveXFn: waveBXFn,
      waveYFn: waveBYFn,
      waveXDerivativeFn: waveBXDerivativeFn,
      waveYDerivativeFn: waveBYDerivativeFn,
    } = configureWaveB();

    const intersectionEndXGuesses = {
      t1: THREE.MathUtils.degToRad(-180),
      t2: 0,
    };
    const intersectionEndYGuesses = { t1: 0, t2: waveWidth };

    const outerSkin = {
      x: outerSkinXFn,
      y: outerSkinYFn,
      dx: outerSkinXDerivativeFn,
      dy: outerSkinYDerivativeFn,
    };
    const waveA = {
      x: waveAXFn,
      y: waveAYFn,
      dx: waveAXDerivativeFn,
      dy: waveAYDerivativeFn,
    };
    const waveB = {
      x: waveBXFn,
      y: waveBYFn,
      dx: waveBXDerivativeFn,
      dy: waveBYDerivativeFn,
    };

    const intersectionEndXWaveA = newtonRaphsonMethod({
      curve1: outerSkin,
      curve2: waveA,
      t1Guess: intersectionEndXGuesses.t1,
      t2Guess: intersectionEndXGuesses.t2,
    });

    const intersectionEndXWaveB = newtonRaphsonMethod({
      curve1: outerSkin,
      curve2: waveB,
      t1Guess: intersectionEndXGuesses.t1,
      t2Guess: intersectionEndXGuesses.t2,
    });

    const intersectionEndYWaveA = newtonRaphsonMethod({
      curve1: outerSkin,
      curve2: waveA,
      t1Guess: intersectionEndYGuesses.t1,
      t2Guess: intersectionEndYGuesses.t2,
    });

    const intersectionEndYWaveB = newtonRaphsonMethod({
      curve1: outerSkin,
      curve2: waveB,
      t1Guess: intersectionEndYGuesses.t1,
      t2Guess: intersectionEndYGuesses.t2,
    });

    const intersectionPointEndXWaveA = new THREE.Vector2(
      outerSkinXFn(intersectionEndXWaveA.t1),
      outerSkinYFn(intersectionEndXWaveA.t1)
    );
    const intersectionPointEndXWaveB = new THREE.Vector2(
      outerSkinXFn(intersectionEndXWaveB.t1),
      outerSkinYFn(intersectionEndXWaveB.t1)
    );
    const intersectionPointEndYWaveA = new THREE.Vector2(
      outerSkinXFn(intersectionEndYWaveA.t1),
      outerSkinYFn(intersectionEndYWaveA.t1)
    );
    const intersectionPointEndYWaveB = new THREE.Vector2(
      outerSkinXFn(intersectionEndYWaveB.t1),
      outerSkinYFn(intersectionEndYWaveB.t1)
    );

    const upperOuterSkinPoints = this.getEllipsePoints(
      outerSkinXFn,
      outerSkinYFn,
      THREE.MathUtils.degToRad(-328),
      intersectionEndXWaveA.t1
    );

    const waveAPoints = this.getTravellingWavePoints(
      waveAXFn,
      waveAYFn,
      intersectionEndXWaveA.t2,
      intersectionEndYWaveA.t2
    );

    const connectingArcPoints = this.getEllipsePoints(
      outerSkinXFn,
      outerSkinYFn,
      intersectionEndYWaveA.t1,
      intersectionEndYWaveB.t1
    );

    const waveBPoints = this.getTravellingWavePoints(
      waveBXFn,
      waveBYFn,
      intersectionEndYWaveB.t2,
      intersectionEndXWaveB.t2
    );

    const lowerOuterSkinPoints = this.getEllipsePoints(
      outerSkinXFn,
      outerSkinYFn,
      intersectionEndXWaveB.t1,
      THREE.MathUtils.degToRad(-32)
    );

    const combinedPoints = U.combinePoints(
      upperOuterSkinPoints,
      waveAPoints,
      connectingArcPoints,
      waveBPoints,
      lowerOuterSkinPoints
    );

    const combinedLine = new Line(combinedPoints);
    const lines = [combinedLine];
    // const line1 = new Line(upperOuterSkinPoints)
    // const line2 = new Line(lowerOuterSkinPoints)
    // const lines = [line2]

    const intersectionPoints = [
      intersectionPointEndXWaveA,
      intersectionPointEndXWaveB,
      intersectionPointEndYWaveA,
      intersectionPointEndYWaveB,
    ];

    const footprintData = { lines, intersectionPoints };

    return footprintData;
  }
}
