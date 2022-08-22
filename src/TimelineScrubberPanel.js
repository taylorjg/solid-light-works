import { useEffect, useState } from 'react'
import { Drawer, Slider } from '@mui/material'

const TimelineScrubberPanel = ({ threeAppActions }) => {
  const [isTimelineScrubberOpen, setIsTimelineScrubberOpen] = useState(false)
  const [timelineScrubberValue, setTimelineScrubberValue] = useState()
  const [cycleDurationMs, setCycleDurationMs] = useState()

  const openTimelineScrubber = () => {
    setIsTimelineScrubberOpen(true)
  }

  const closeTimelineScrubber = () => {
    setIsTimelineScrubberOpen(false)
  }

  const onTimelineScrubberChange = event => {
    const value = event.target.value
    setTimelineScrubberValue(value)
    threeAppActions.setTimelineScrubberValue(value)
  }

  useEffect(() => {
    const onEnterTimelineScrubberMode = (args) => {
      const { timelineScrubberValue, cycleDurationMs } = args
      setTimelineScrubberValue(timelineScrubberValue)
      setCycleDurationMs(cycleDurationMs)
      openTimelineScrubber()
    }

    threeAppActions.addEnterTimelineScrubberModeListener(onEnterTimelineScrubberMode)
    return () => threeAppActions.removeEnterTimelineScrubberModeListener(onEnterTimelineScrubberMode)
  }, [threeAppActions])

  useEffect(() => {
    const onLeaveTimelineScrubberMode = () => {
      closeTimelineScrubber()
    }

    threeAppActions.addLeaveTimelineScrubberModeListener(onLeaveTimelineScrubberMode)
    return () => threeAppActions.removeLeaveTimelineScrubberModeListener(onLeaveTimelineScrubberMode)
  }, [threeAppActions])

  const formatSliderValue = value => {
    const asSecondsValue = (value / 1000).toFixed(1)
    const asPerCentValue = (value / cycleDurationMs * 100).toFixed(1)
    return `${asSecondsValue}s (${asPerCentValue}%)`
  }

  return (
    <Drawer anchor="bottom" hideBackdrop open={isTimelineScrubberOpen} onClose={closeTimelineScrubber}>
      <div style={{ display: "flex" }}>
        {/* TODO: add a close button */}
        <Slider
          style={{ margin: "2rem 2rem 0 2rem" }}
          size="small"
          min={0}
          max={cycleDurationMs}
          step={100}
          valueLabelDisplay="auto"
          valueLabelFormat={formatSliderValue}
          value={timelineScrubberValue}
          onChange={onTimelineScrubberChange}
        />
      </div>
    </Drawer>
  );
}

export default TimelineScrubberPanel;
