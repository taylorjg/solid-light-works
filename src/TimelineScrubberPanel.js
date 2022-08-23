import { useEffect, useState } from 'react'
import { Drawer, IconButton, Slider } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import { StyledContainer } from './TimelineScrubberPanel.styles'

const TimelineScrubberPanel = ({ threeAppActions }) => {
  const [isTimelineScrubberOpen, setIsTimelineScrubberOpen] = useState(false)
  const [timelineScrubberValue, setTimelineScrubberValue] = useState()
  const [cycleDurationMs, setCycleDurationMs] = useState()
  const [isPlaying, setIsPlaying] = useState(false)

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
      setIsPlaying(args.playing)
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

  const onClickPlayPause = () => {
    setIsPlaying(currentValue => !currentValue)
  }

  useEffect(() => {
    threeAppActions.setPlaying(isPlaying)
  }, [threeAppActions, isPlaying])

  return (
    <Drawer anchor="bottom" hideBackdrop open={isTimelineScrubberOpen} onClose={closeTimelineScrubber}>
      <StyledContainer>
        <IconButton onClick={onClickPlayPause}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Slider
          sx={{ mx: 0.5 }}
          size="small"
          min={0}
          max={cycleDurationMs}
          step={100}
          valueLabelDisplay="off"
          value={timelineScrubberValue}
          onChange={onTimelineScrubberChange}
        />
        <IconButton onClick={closeTimelineScrubber}>
          <CloseIcon />
        </IconButton>
      </StyledContainer>
    </Drawer>
  );
}

export default TimelineScrubberPanel;
