import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Slider,
  Switch,
  Tab,
  Tabs,
  ToggleButtonGroup,
  ToggleButton,
  Typography
} from '@mui/material'
import { StyledSettingsPanel, StyledSettingsTabPanelBody } from './SettingsPanel.styles'
import { Mode } from './three-app'

const a11yProps = index => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  )
}

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
          min={0.0}
          max={5.0}
          step={0.05}
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

const IntersectionPointsEnabledSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.checked)
  }

  return (
    <div>
      <FormControl>
        <FormLabel id="intersection-points-enabled-label">Show Intersection Points</FormLabel>
        <FormControlLabel
          sx={{ mt: ".25rem" }}
          control={
            <Switch
              aria-labelledby="intersection-points-enabled-label"
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

const FormBoundariesEnabledSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.checked)
  }

  return (
    <div>
      <FormControl>
        <FormLabel id="form-boundaries-enabled-label">Show Form Boundaries</FormLabel>
        <FormControlLabel
          sx={{ mt: ".25rem" }}
          control={
            <Switch
              aria-labelledby="form-boundaries-enabled-label"
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

const StatsEnabledSetting = ({ value, setValue }) => {

  const handleChange = event => {
    setValue(event.target.checked)
  }

  return (
    <div>
      <FormControl>
        <FormLabel id="stats-enabled-label">Show FPS Stats</FormLabel>
        <FormControlLabel
          sx={{ mt: ".25rem" }}
          control={
            <Switch
              aria-labelledby="stats-enabled-label"
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

const SettingsPanel = ({ threeAppActions, closeSettingsPanel }) => {

  const [settings, setSettings] = useState(threeAppActions.getSettings)
  const [currentTabIndex, setCurrentTabIndex] = useState(0)

  useEffect(() => {
    threeAppActions.addSettingsChangedListener(setSettings)
    return () => threeAppActions.removeSettingsChangedListener(setSettings)
  }, [threeAppActions])

  const onChangeTab = (_event, newTabIndex) => {
    setCurrentTabIndex(newTabIndex)
  }

  const EnterTimelineScrubbingModeButton = () => {
    const onClick = () => {
      threeAppActions.setTimelineScrubbingMode(true)
      closeSettingsPanel()
    }

    return (
      <Button
        variant="outlined"
        onClick={onClick}>
        Enter Timeline Scrubbing Mode
      </Button>
    )
  }

  return (
    <StyledSettingsPanel>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTabIndex} onChange={onChangeTab} aria-label="settings-panel">
          <Tab label="Settings" {...a11yProps(0)} />
          <Tab label="Debug" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={currentTabIndex} index={0}>
        <StyledSettingsTabPanelBody>
          <ModeSetting value={settings.mode} setValue={threeAppActions.setMode} />
          <AnimationSpeedSetting value={settings.animationSpeed} setValue={threeAppActions.setAnimationSpeed} />
          <BehindOnlySetting value={settings.behindOnly} setValue={threeAppActions.setBehindOnly} />
          <AutoRotateSetting value={settings.autoRotate} setValue={threeAppActions.setAutoRotate} />
          <AutoRotateSpeedSetting value={settings.autoRotateSpeed} setValue={threeAppActions.setAutoRotateSpeed} />
        </StyledSettingsTabPanelBody>
      </TabPanel>

      <TabPanel value={currentTabIndex} index={1}>
        <StyledSettingsTabPanelBody>
          <AxesEnabledSetting value={settings.axesEnabled} setValue={threeAppActions.setAxesEnabled} />
          <IntersectionPointsEnabledSetting value={settings.intersectionPointsEnabled} setValue={threeAppActions.setIntersectionPointsEnabled} />
          <VertexNormalsEnabledSetting value={settings.vertexNormalsEnabled} setValue={threeAppActions.setVertexNormalsEnabled} />
          <FormBoundariesEnabledSetting value={settings.formBoundariesEnabled} setValue={threeAppActions.setFormBoundariesEnabled} />
          <StatsEnabledSetting value={settings.statsEnabled} setValue={threeAppActions.setStatsEnabled} />
          <EnterTimelineScrubbingModeButton />
        </StyledSettingsTabPanelBody>
      </TabPanel>
    </StyledSettingsPanel>
  )
}

export default SettingsPanel
