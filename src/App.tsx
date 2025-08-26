import LayoutContainer from "@/components/LayoutContainer";
import { observer } from "mobx-react-lite";
import canvasStore from "@/utils/CanvasStore";
import { Canvas } from "@/components/Canvas";
import * as fabric from "fabric";
import { useRef, useCallback, useEffect, useState, RefObject } from "react";
import { v4 as uuidv4 } from "uuid";
import { toJS } from "mobx";

const App = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  // console.log(toJS(canvasStore.currentPage));

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
    const pointer = canvas?.getScenePoint(e.e);
    const id = uuidv4();

    const textObject = {
      type: "text",
      resizeMode: "fit",
      x: pointer?.x,
      y: pointer?.y,
      text: "",
      fill: "#000",
      fontSize: 16,
      opacity: 1,
      textAlign: "left",
      widthMode: "fit",
      id,
    };

    canvasStore.addObject({
      ...textObject,
    });

    const text = new fabric.IText(textObject.text, {
      fill: textObject.fill,
      fontSize: textObject.fontSize,
      left: textObject.x,
      top: textObject.y,
      textAlign: textObject.textAlign,
      cornerColor: "#FFF",
      cornerStrokeColor: "#3b82f6",
      cornerSize: 8,
      transparentCorners: false,
      borderColor: "#3b82f6",
      borderScaleFactor: 1.5,
      borderOpacityWhenMoving: 0,
      opacity: textObject.opacity,
      padding: 1,
      id,
      itemType: "text",
    });

    canvas?.setActiveObject(text);
    text.enterEditing();

    // Hide middle control points, keep only corners
    text.setControlsVisibility({
      mt: false, // Hide middle-top
      mb: false, // Hide middle-bottom
      ml: false, // Hide middle-left
      mr: false, // Hide middle-right
      mtr: false, // Hide middle-top-rotation (if exists)
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
      </>
    </LayoutContainer>
  );
});

export default App;
