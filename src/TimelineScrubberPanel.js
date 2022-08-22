import { useEffect, useState } from 'react'
import { Drawer, Slider } from '@mui/material'
import { StyledContainer, StyledCloseIcon } from './TimelineScrubberPanel.styles'

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
    const onEnterTimelineScrubberMode = args => {
      setTimelineScrubberValue(args.timelineScrubberValue)
      setCycleDurationMs(args.cycleDurationMs)
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

  useEffect(() => {
    const onSyncTimelineScrubber = args => {
      setTimelineScrubberValue(args.timelineScrubberValue)
      setCycleDurationMs(args.cycleDurationMs)
    }

    threeAppActions.addSyncTimelineScrubberListener(onSyncTimelineScrubber)
    return () => threeAppActions.removeSyncTimelineScrubberListener(onSyncTimelineScrubber)
  }, [threeAppActions])

  useEffect(() => {
    if (!isTimelineScrubberOpen) {
      threeAppActions.setTimelineScrubberMode(false)
    }
  }, [threeAppActions, isTimelineScrubberOpen])

  const formatSliderValue = value => {
    const asSecondsValue = (value / 1000).toFixed(1)
    const asPerCentValue = (value / cycleDurationMs * 100).toFixed(1)
    return `${asSecondsValue}s (${asPerCentValue}%)`
  }

  return (
    <Drawer anchor="bottom" hideBackdrop open={isTimelineScrubberOpen} onClose={closeTimelineScrubber}>
      <StyledContainer>
        <StyledCloseIcon onClick={closeTimelineScrubber} />
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
      </StyledContainer>
    </Drawer>
  );
}

export default TimelineScrubberPanel;
