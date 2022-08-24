import { useEffect, useState } from 'react'
import { Drawer, IconButton, Slider } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import { StyledContainer } from './TimelineScrubbingPanel.styles'

const TimelineScrubbingPanel = ({ threeAppActions }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState()
  const [max, setMax] = useState()
  const [isPlaying, setIsPlaying] = useState(false)

  const open = () => {
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  const onChange = event => {
    const value = event.target.value
    setValue(value)
    threeAppActions.setTimelineScrubbingValue(value)
  }

  useEffect(() => {
    const onEnterTimelineScrubbingMode = args => {
      setValue(args.timelineScrubbingValue)
      setMax(args.cycleDurationMs)
      setIsPlaying(args.playing)
      open()
    }

    threeAppActions.addEnterTimelineScrubbingModeListener(onEnterTimelineScrubbingMode)
    return () => threeAppActions.removeEnterTimelineScrubbingModeListener(onEnterTimelineScrubbingMode)
  }, [threeAppActions])

  useEffect(() => {
    const onLeaveTimelineScrubbingMode = () => {
      close()
    }

    threeAppActions.addLeaveTimelineScrubbingModeListener(onLeaveTimelineScrubbingMode)
    return () => threeAppActions.removeLeaveTimelineScrubbingModeListener(onLeaveTimelineScrubbingMode)
  }, [threeAppActions])

  useEffect(() => {
    const onSyncTimelineScrubbing = args => {
      setValue(args.timelineScrubbingValue)
      setMax(args.cycleDurationMs)
    }

    threeAppActions.addSyncTimelineScrubbingListener(onSyncTimelineScrubbing)
    return () => threeAppActions.removeSyncTimelineScrubbingListener(onSyncTimelineScrubbing)
  }, [threeAppActions])

  useEffect(() => {
    if (!isOpen) {
      threeAppActions.setTimelineScrubbingMode(false)
    }
  }, [threeAppActions, isOpen])

  const onClickPlayPause = () => {
    setIsPlaying(currentValue => !currentValue)
  }

  useEffect(() => {
    threeAppActions.setPlaying(isPlaying)
  }, [threeAppActions, isPlaying])

  return (
    <Drawer anchor="bottom" hideBackdrop open={isOpen} onClose={close}>
      <StyledContainer>
        <IconButton onClick={onClickPlayPause}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Slider
          sx={{ mx: 0.5 }}
          size="small"
          min={0}
          max={max}
          step={100}
          valueLabelDisplay="off"
          value={value}
          onChange={onChange}
        />
        <IconButton onClick={close}>
          <CloseIcon />
        </IconButton>
      </StyledContainer>
    </Drawer>
  );
}

export default TimelineScrubbingPanel;
