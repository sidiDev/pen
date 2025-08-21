import { JSX } from "react";
import LayersPanel from "./LayersPanel";

function Container({ children }: { children: JSX.Element }): JSX.Element {
  return (
    <>
      <LayersPanel />
      {children}
    </>
  );
}

export default Container;
