import { Divider, FormControl, FormControlLabel, FormLabel, Slider, Switch, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import styled from '@emotion/styled'
import { Mode } from './three-app'

const ModeSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.value)
  }

  return (
    <div>
      <FormControl sx={{ mt: "1rem" }}>
        <FormLabel id="mode-label">Mode</FormLabel>
        <ToggleButtonGroup
          aria-labelledby="mode-label"
          exclusive
          value={value}
          onChange={handleChange}
          size="small"
          sx={{ mt: ".5rem" }}
        >
          <ToggleButton value={Mode.Mode2D}>2D</ToggleButton>
          <ToggleButton value={Mode.Mode3D}>3D</ToggleButton>
        </ToggleButtonGroup>
      </FormControl>
    </div>
  )
}

const AnimationSpeedSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.value)
  }

  return (
    <div>
      <FormControl sx={{ width: "100%" }}>
        <FormLabel id="animation-speed-label">Animation Speed</FormLabel>
        <Slider
          aria-labelledby="animation-speed-label"
          size="small"
          min={100}
          max={5000}
          step={25}
          valueLabelDisplay="auto"
          value={value}
          onChange={handleChange}
        />
      </FormControl>
    </div>
  )
}

const BehindOnlySetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.checked)
  }

  return (
    <div>
      <FormControl>
        <FormLabel id="behind-only-label">Behind Only</FormLabel>
        <FormControlLabel
          sx={{ mt: ".25rem" }}
          control={
            <Switch
              aria-labelledby="behind-only-label"
              size="small"
              checked={value}
              onClick={handleChange}
            />
          }
          label={value ? "On" : "Off"}
        />
      </FormControl>
    </div>
  )
}

const AutoRotateSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.checked)
  }

  return (
    <div>
      <FormControl>
        <FormLabel id="auto-rotate-label">Auto Rotate</FormLabel>
        <FormControlLabel
          sx={{ mt: ".25rem" }}
          control={
            <Switch
              aria-labelledby="auto-rotate-label"
              size="small"
              checked={value}
              onClick={handleChange}
            />
          }
          label={value ? "On" : "Off"}
        />
      </FormControl>
    </div>
  )
}

const AutoRotateSpeedSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.value)
  }

  return (
    <div>
      <FormControl sx={{ width: "100%" }}>
        <FormLabel id="auto-rotate-speed-label">Auto Rotate Speed</FormLabel>
        <Slider
          aria-labelledby="auto-rotate-speed-label"
          size="small"
          min={0.0}
          max={10.0}
          step={0.1}
          valueLabelDisplay="auto"
          value={value}
          onChange={handleChange}
        />
      </FormControl>
    </div>
  )
}

const AxesEnabledSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.checked)
  }

  return (
    <div>
      <FormControl>
        <FormLabel id="axes-enabled-label">Show Axes</FormLabel>
        <FormControlLabel
          sx={{ mt: ".25rem" }}
          control={
            <Switch
              aria-labelledby="axes-enabled-label"
              size="small"
              checked={value}
              onClick={handleChange}
            />
          }
          label={value ? "On" : "Off"}
        />
      </FormControl>
    </div>
  )
}

const StyledOuter = styled.div`
  margin: 0;
  padding: 0;
  min-width: 15rem;
  width: 100%;
  height: 100%;
`

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: .5rem .5rem .5rem 1rem;
  svg {
    cursor: pointer;
  }
`

const StyledInner = styled.div`
  margin: 1rem;
  display: flex;
  flex-direction: column;
  > * {
    margin-bottom: 2rem;
  }
`

const SettingsContent = ({ settings, setSettings, onClose }) => {

  const createProps = fieldName => {
    return {
      value: settings[fieldName],
      setValue: value => setSettings(settings => ({
        ...settings,
        [fieldName]: value
      }))
    }
  }

  return (
    <StyledOuter>
      <StyledHeader>
        <Typography variant="subtitle1" gutterBottom>Settings</Typography>
        <CloseIcon onClick={onClose} />
      </StyledHeader>
      <Divider />
      <StyledInner>
        <ModeSetting {...createProps("mode")} />
        <BehindOnlySetting {...createProps("behindOnly")} />
        {/* <AnimationSpeedSetting {...createProps("animationSpeed")} /> */}
        <AutoRotateSetting {...createProps("autoRotate")} />
        <AutoRotateSpeedSetting {...createProps("autoRotateSpeed")} />
        <AxesEnabledSetting {...createProps("axesEnabled")} />
      </StyledInner>
    </StyledOuter>
  )
}

export default SettingsContent
