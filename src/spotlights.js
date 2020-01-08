import * as THREE from "three"
import * as C from "./constants"

const COLOUR = 0xffffff
const HIGH_INTENSITY = 100
const LOW_INTENSITY = 50
const DISTANCE = C.MEMBRANE_LENGTH * 2
const ANGLE = 14 * Math.PI / 180

const highIntensitySpotLights = []
const helpers = []

export const addSpotLights = (scene, positionY, targetY, intensityType) => {

  const addTo = side => {

    const x = side === C.LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X
    const intensity = intensityType === C.HIGH_INTENSITY_SPOTLIGHT ? HIGH_INTENSITY : LOW_INTENSITY

    const spotLightTarget = new THREE.Object3D()
    spotLightTarget.position.set(x, targetY, 0)
    scene.add(spotLightTarget)

    const spotLight = new THREE.SpotLight(COLOUR, intensity, DISTANCE, ANGLE)
    spotLight.position.set(x, positionY, C.MEMBRANE_LENGTH)
    spotLight.target = spotLightTarget
    scene.add(spotLight)

    if (intensityType === C.HIGH_INTENSITY_SPOTLIGHT) {
      highIntensitySpotLights.push(spotLight)
    }
  }

  addTo(C.LEFT)
  addTo(C.RIGHT)
}

export const toggleSpotLightHelpers = scene => {
  if (helpers.length) {
    helpers.forEach(helper => scene.remove(helper))
    helpers.splice(0, helpers.length)
  }
  else {
    highIntensitySpotLights.forEach(spotLight => helpers.push(new THREE.SpotLightHelper(spotLight)))
    helpers.forEach(helper => scene.add(helper))
  }
}
