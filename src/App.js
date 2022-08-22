import { useEffect } from 'react'
import { useQueryParams } from './useQueryParams'
import SettingsButton from './SettingsButton'
import OverlayButtons from './OverlayButtons'
import TimelineScrubberPanel from './TimelineScrubberPanel'
import Version from './Version'

const App = ({ threeAppActions }) => {

  const queryParams = useQueryParams()

  useEffect(() => {
    if (queryParams.has('mode')) {
      threeAppActions.setMode(queryParams.getString('mode'))
    }
    if (queryParams.has('behindOnly')) {
      threeAppActions.setBehindOnly(queryParams.getBool('behindOnly'))
    }
    if (queryParams.has('autoRotate')) {
      threeAppActions.setAutoRotate(queryParams.getBool('autoRotate'))
    }
    if (queryParams.has('autoRotateSpeed')) {
      threeAppActions.setAutoRotateSpeed(queryParams.getNumber('autoRotateSpeed'))
    }
    if (queryParams.has('axesEnabled')) {
      threeAppActions.setAxesEnabled(queryParams.getBool('axesEnabled'))
    }
    if (queryParams.has('intersectionPointsEnabled')) {
      threeAppActions.setIntersectionPointsEnabled(queryParams.getBool('intersectionPointsEnabled'))
    }
    if (queryParams.has('vertexNormalsEnabled')) {
      threeAppActions.setVertexNormalsEnabled(queryParams.getBool('vertexNormalsEnabled'))
    }
    if (queryParams.has('formBoundariesEnabled')) {
      threeAppActions.setFormBoundariesEnabled(queryParams.getBool('formBoundariesEnabled'))
    }
  }, [threeAppActions, queryParams])

  return (
    <>
      <SettingsButton threeAppActions={threeAppActions} />
      <OverlayButtons threeAppActions={threeAppActions} />
      <TimelineScrubberPanel threeAppActions={threeAppActions} />
      <Version />
    </>
  )
}

export default App
