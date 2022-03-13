import { Divider, FormControl, FormControlLabel, FormLabel, Slider, Switch, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { StyledSettingsPanel, StyledSettingsPanelHeader, StyledSettingsPanelBody } from './SettingsPanel.styles'
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

// const AnimationSpeedSetting = ({ value, setValue }) => {

//   const handleChange = event => {
//     setValue(event.target.value)
//   }

//   return (
//     <div>
//       <FormControl sx={{ width: "100%" }}>
//         <FormLabel id="animation-speed-label">Animation Speed</FormLabel>
//         <Slider
//           aria-labelledby="animation-speed-label"
//           size="small"
//           min={100}
//           max={5000}
//           step={25}
//           valueLabelDisplay="auto"
//           value={value}
//           onChange={handleChange}
//         />
//       </FormControl>
//     </div>
//   )
// }

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

const VertexNormalsEnabledSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.checked)
  }

  return (
    <div>
      <FormControl>
        <FormLabel id="vertex-normals-enabled-label">Show Vertex Normals</FormLabel>
        <FormControlLabel
          sx={{ mt: ".25rem" }}
          control={
            <Switch
              aria-labelledby="vertex-normals-enabled-label"
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

const SettingsPanel = ({ settings, setSettings, onClose }) => {

  const createPropsForSetting = fieldName => {
    return {
      value: settings[fieldName],
      setValue: value => setSettings(settings => ({
        ...settings,
        [fieldName]: value
      }))
    }
  }

  return (
    <StyledSettingsPanel>
      <StyledSettingsPanelHeader>
        <Typography variant="subtitle1" gutterBottom>Settings</Typography>
        <CloseIcon onClick={onClose} />
      </StyledSettingsPanelHeader>
      <Divider />
      <StyledSettingsPanelBody>
        <ModeSetting {...createPropsForSetting("mode")} />
        <BehindOnlySetting {...createPropsForSetting("behindOnly")} />
        {/* <AnimationSpeedSetting {...createProps("animationSpeed")} /> */}
        <AutoRotateSetting {...createPropsForSetting("autoRotate")} />
        <AutoRotateSpeedSetting {...createPropsForSetting("autoRotateSpeed")} />
        <AxesEnabledSetting {...createPropsForSetting("axesEnabled")} />
        <VertexNormalsEnabledSetting {...createPropsForSetting("vertexNormalsEnabled")} />
      </StyledSettingsPanelBody>
    </StyledSettingsPanel>
  )
}

export default SettingsPanel
