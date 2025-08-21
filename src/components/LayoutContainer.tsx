import { JSX } from "react";
import LayersPanel from "@/components/LayersPanel";
import InspectorPanel from "@/components/InspectorPanel";

function LayoutContainer({ children }: { children: JSX.Element }): JSX.Element {
  return (
    <>
      <LayersPanel />
      {children}
      <InspectorPanel />
    </>
  );
}

export default LayoutContainer;
