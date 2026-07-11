import * as THREE from "three";
import { LineDescribingAConeForm } from "@app/three-app/forms/line-describing-a-cone";
import { Screen } from "@app/three-app/scenery";

const makeWork1 = () => {
  const ELLIPSE_CX = 0;
  const ELLIPSE_CY = 3;
  const PROJECTOR_HEIGHT = 1.5;
  const PROJECTOR_DISTANCE = 10;

  return {
    formConfigs: [
      {
        form: new LineDescribingAConeForm(6, 4),
        config2D: {
          transform: new THREE.Matrix4().makeTranslation(0, 0, 0),
        },
        config3D: {
          transform: new THREE.Matrix4().makeTranslation(
            ELLIPSE_CX,
            ELLIPSE_CY,
            0
          ),
          projectorPosition: new THREE.Vector3(
            0,
            -PROJECTOR_HEIGHT,
            PROJECTOR_DISTANCE
          ),
        },
      },
    ],
  };
};

export const config = {
  name: "Line Describing a Cone 2.0",
  works: [makeWork1()],
  config2D: {
    cameraPose: {
      position: new THREE.Vector3(0, 0, 8),
      target: new THREE.Vector3(),
    },
  },
  config3D: {
    cameraPoses: [
      {
        position: new THREE.Vector3(-10.06, 1.5, 9.81),
        target: new THREE.Vector3(-0.75, 2.0, 4.43),
      },
      {
        position: new THREE.Vector3(0.46, 1.21, 13.56),
        target: new THREE.Vector3(-0.54, 0.96, 4.38),
      },
      {
        position: new THREE.Vector3(0, 2, -6.75),
        target: new THREE.Vector3(0, 2.4, 0),
        isBehind: true,
      },
    ],
    scenery: [new Screen(14, 6)],
  },
};
