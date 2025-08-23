import LayoutContainer from "@/components/LayoutContainer";
import { observer } from "mobx-react-lite";
import canvasStore from "@/utils/CanvasStore";
import { Canvas } from "@/components/Canvas";
import * as fabric from "fabric";
import { useRef, useCallback, useEffect, useState, RefObject } from "react";
import { v4 as uuidv4 } from "uuid";

const App = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  const onLoad = useCallback(
    (canvas: fabric.Canvas) => {
      setCanvas(canvas);
      // canvas.setDimensions({
      //   width: 10000,
      //   height: 10000,
      // });
    },
    [canvasRef]
  );

  function currentCursor() {
    switch (canvasStore.selectedToolbarAction) {
      case "text":
        return "text";
      case "cursor":
        return "default";
      case "frame":
        return "crosshair";
      case "rectangle":
        return "crosshair";
    }
  }

  canvas?.on("mouse:move", () => {
    canvas.setCursor(currentCursor());
  });

  canvas?.on("mouse:down", (e) => {
    switch (canvasStore.selectedToolbarAction) {
      case "text":
        return addText(e);
      case "frame":
        return addText(e);
      case "rectangle":
        return addText(e);
    }
  });

  function addText(e: any) {
    console.log(e);
    const pointer = canvas?.getScenePoint(e.e);

    const textObject = {
      type: "text",
      x: pointer?.x,
      y: pointer?.y,
      text: "Hello Sidi Jeddou",
    };

    canvasStore.addObject({
      id: uuidv4(),
      ...textObject,
    });

    const text = new fabric.Textbox(textObject.text, {
      fill: "#000",
      fontSize: 16,
      left: textObject.x,
      top: textObject.y,
      originX: "left",
      originY: "top",
    });
    canvas?.add(text);
    canvasStore.setSelectedToolbarAction("cursor");
  }

  return (
    <LayoutContainer canvas={canvas}>
      <>
        <Canvas
          onLoad={onLoad}
          canvasRef={canvasRef as RefObject<HTMLCanvasElement>}
          defaultCursor={currentCursor()}
        />
        {/* <canvas
          ref={canvasRef}
          style={{
            backgroundColor: canvasStore.currentPage.backgroundColor.rgba,
          }}
          width={window.innerWidth}
          height={window.innerHeight}
        /> */}
      </>
    </LayoutContainer>
  );
});

export default App;
