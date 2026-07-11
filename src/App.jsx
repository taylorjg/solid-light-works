import { useEffect, useState } from "react";
import { useQueryParams } from "@app/hooks/useQueryParams";
import SettingsButton from "@app/components/SettingsButton";
import OverlayButtons from "@app/components/OverlayButtons";
import TimelineScrubbingPanel from "@app/components/TimelineScrubbingPanel";
import { Name } from "@app/components/Name";
import { Version } from "@app/components/Version";

const App = ({ threeAppActions }) => {
  const queryParams = useQueryParams();

  useEffect(() => {
    if (queryParams.has("mode")) {
      threeAppActions.setMode(queryParams.getString("mode"));
    }
    if (queryParams.has("behindOnly")) {
      threeAppActions.setBehindOnly(queryParams.getBool("behindOnly"));
    }
    if (queryParams.has("autoRotate")) {
      threeAppActions.setAutoRotate(queryParams.getBool("autoRotate"));
    }
    if (queryParams.has("autoRotateSpeed")) {
      threeAppActions.setAutoRotateSpeed(
        queryParams.getNumber("autoRotateSpeed")
      );
    }
    if (queryParams.has("axesEnabled")) {
      threeAppActions.setAxesEnabled(queryParams.getBool("axesEnabled"));
    }
    if (queryParams.has("intersectionPointsEnabled")) {
      threeAppActions.setIntersectionPointsEnabled(
        queryParams.getBool("intersectionPointsEnabled")
      );
    }
    if (queryParams.has("vertexNormalsEnabled")) {
      threeAppActions.setVertexNormalsEnabled(
        queryParams.getBool("vertexNormalsEnabled")
      );
    }
    if (queryParams.has("formBoundariesEnabled")) {
      threeAppActions.setFormBoundariesEnabled(
        queryParams.getBool("formBoundariesEnabled")
      );
    }
  }, [threeAppActions, queryParams]);

  const [settings, setSettings] = useState(threeAppActions.getSettings);

  useEffect(() => {
    threeAppActions.addSettingsChangedListener(setSettings);
    return () => threeAppActions.removeSettingsChangedListener(setSettings);
  }, [threeAppActions]);

  return (
    <>
      <SettingsButton threeAppActions={threeAppActions} />
      <OverlayButtons threeAppActions={threeAppActions} />
      <TimelineScrubbingPanel threeAppActions={threeAppActions} />
      {settings.showName && (
        <Name currentInstallation={settings.currentInstallation} />
      )}
      <Version />
    </>
  );
};

export default App;
