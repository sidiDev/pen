import { JSX } from "react";
import LayersPanel from "@/components/LayersPanel";
import InspectorPanel from "@/components/InspectorPanel";
import * as fabric from "fabric";

function LayoutContainer({
  children,
  canvas,
}: {
  children: JSX.Element;
  canvas: fabric.Canvas | null;
}): JSX.Element {
  return (
    <>
      <LayersPanel canvas={canvas} />
      {children}
      <InspectorPanel canvas={canvas} />
    </>
  );
}

export default LayoutContainer;
