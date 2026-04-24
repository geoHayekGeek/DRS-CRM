"use client";

import { useEffect } from "react";

type DeployMarkerLogProps = {
  marker: string;
};

export default function DeployMarkerLog({ marker }: DeployMarkerLogProps) {
  useEffect(() => {
    // Browser-side marker to verify the currently deployed homepage build.
    console.info(`[DEPLOY_MARKER][homepage][client] ${marker}`);
  }, [marker]);

  return null;
}

