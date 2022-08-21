import { useEffect, useState } from 'react'
import { Drawer, Slider } from '@mui/material'
import { useQueryParams } from './useQueryParams'
import SettingsButton from './SettingsButton'
import OverlayButtons from './OverlayButtons'
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

  const [isTimelineScrubberOpen, setIsTimelineScrubberOpen] = useState(false)
  const [timelineScrubberValue, setTimelineScrubberValue] = useState()

  const openTimelineScrubber = () => {
    setIsTimelineScrubberOpen(true)
  }

  const closeTimelineScrubber = () => {
    setIsTimelineScrubberOpen(false)
    threeAppActions.leaveTimelineScrubberMode()
  }

  const onTimelineScrubberChange = event => {
    const value = event.target.value
    setTimelineScrubberValue(value)
    threeAppActions.setTimelineScrubberValue(value)
  }

  useEffect(() => {
    const onEnterTimelineScrubberMode = (value) => {
      setTimelineScrubberValue(value)
      openTimelineScrubber()
    }

    threeAppActions.addEnterTimelineScrubberModeListener(onEnterTimelineScrubberMode)
    return () => threeAppActions.removeEnterTimelineScrubberModeListener(onEnterTimelineScrubberMode)
  }, [threeAppActions])

  const tempHardCodedMax = 10000 * 1000 / 60

  return (
    <>
      <SettingsButton threeAppActions={threeAppActions} />
      <OverlayButtons threeAppActions={threeAppActions} />
      <Drawer anchor="bottom" hideBackdrop open={isTimelineScrubberOpen} onClose={closeTimelineScrubber}>
        <div style={{ display: "flex" }}>
          {/* TODO: add a close button */}
          <Slider
            style={{ margin: "2rem 2rem 0 2rem" }}
            min={0}
            max={tempHardCodedMax}
            step={100}
            valueLabelDisplay="auto"
            valueLabelFormat={value => {
              return `${value.toLocaleString()}ms (${(value / tempHardCodedMax * 100).toFixed(2)}%)`
            }}
            value={timelineScrubberValue}
            onChange={onTimelineScrubberChange}
          />
        </div>
      </Drawer>
      <Version />
    </>
  )
}

export default App
