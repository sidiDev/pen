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
      case "image":
        return "crosshair";
    }
  }

  canvas?.on("mouse:move", (e) => {
    const cursor = currentCursor();
    canvas.setCursor(cursor);

    if (
      canvasStore.selectedToolbarAction === "image" &&
      canvasStore.selectedImage
    ) {
      if (!document.getElementById("uploaded-image")) {
        const imgEl = document.createElement("img");
        imgEl.src = canvasStore.selectedImage.url as string;
        imgEl.id = "uploaded-image";
        imgEl.width = 70;
        imgEl.height = 70;
        imgEl.style.borderRadius = "6px";
        imgEl.style.position = "absolute";
        imgEl.style.left = (e.e as any).pageX - 35 + "px";
        imgEl.style.top = (e.e as any).pageY - 35 + "px";
        imgEl.style.pointerEvents = "none";
        imgEl.style.zIndex = "-1000";
        document.body.appendChild(imgEl);
      } else {
        const imgEl = document.getElementById("uploaded-image");
        if (imgEl) {
          imgEl.style.left = `${(e.e as any).pageX - 35}px`;
          imgEl.style.top = `${(e.e as any).pageY - 35}px`;
        }
      }
    }
  });

  canvas?.on("mouse:out", () => {
    const imgEl = document.getElementById("uploaded-image");
    if (imgEl) {
      imgEl.remove();
    }
  });

  canvas?.on("mouse:down", (e) => {
    switch (canvasStore.selectedToolbarAction) {
      case "text":
        return addText(e);
      case "frame":
        return addText(e);
      case "rectangle":
        return addRectangle(e);
      case "image":
        return addImage(e);
    }
  });

  const cornerStyle = {
    cornerColor: "#FFF",
    cornerStrokeColor: "#3b82f6",
    cornerSize: 8,
    transparentCorners: false,
  };

  function addText(e: any) {
    const pointer = canvas?.getScenePoint(e.e);
    const id = uuidv4();

    const textObject = {
      type: "text",
      resizeMode: "fit",
      x: pointer?.x,
      y: pointer?.y,
      width: "auto",
      height: "auto",
      text: "",
      fill: "#000",
      fontSize: 12,
      opacity: 1,
      textAlign: "left",
      widthMode: "fit",
      borderColor: "#3b82f6",
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
      ...cornerStyle,
      transparentCorners: false,
      borderColor: "#3b82f6",
      borderScaleFactor: 1.5,
      borderOpacityWhenMoving: 0,
      opacity: textObject.opacity,
      id,
      itemType: "text",
    });

    text.set("editingBorderColor", "#3b82f6");
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

  function addRectangle(e: any) {
    const pointer = canvas?.getScenePoint(e.e);
    const id = uuidv4();

    const rectangleObject = {
      type: "rectangle",
      name: "Rectangle",
      resizeMode: "fit",
      x: pointer?.x,
      y: pointer?.y,
      width: 100,
      height: 100,
      fill: "#D9D9D9",
      opacity: 1,
      widthMode: "fit",
      id,
    };

    canvasStore.addObject({
      ...rectangleObject,
    });

    const rectangle = new fabric.Rect({
      fill: rectangleObject.fill,
      left: rectangleObject.x,
      top: rectangleObject.y,
      width: rectangleObject.width,
      height: rectangleObject.height,
      ...cornerStyle,
      transparentCorners: false,
      borderScaleFactor: 1.5,
      borderOpacityWhenMoving: 0,
      opacity: rectangleObject.opacity,
      id,
      itemType: "rectangle",
    });

    rectangle.set("editingBorderColor", "#3b82f6");
    canvas?.setActiveObject(rectangle);

    // Hide middle control points, keep only corners
    rectangle.setControlsVisibility({
      mt: false, // Hide middle-top
      mb: false, // Hide middle-bottom
      ml: false, // Hide middle-left
      mr: false, // Hide middle-right
      mtr: false, // Hide middle-top-rotation (if exists)
    });
    canvas?.add(rectangle);
    canvasStore.setSelectedToolbarAction("cursor");
  }

  function addImage(e: any) {
    const imageName = canvasStore.selectedImage.name;
    const imageUrl = canvasStore.selectedImage.url;
    const pointer = canvas?.getScenePoint(e.e);
    const id = uuidv4();
    const img = fabric.FabricImage.fromURL(imageUrl as string).then((img) => {
      const clipPath = new fabric.Rect({
        width: img.width,
        height: img.height,
        rx: 0, // Border radius X
        ry: 0, // Border radius Y
        originX: "center",
        originY: "center",
      });
      img.set({
        left: (pointer?.x as number) - img.width / 2,
        top: (pointer?.y as number) - img.height / 2,
        scaleX: 1,
        scaleY: 1,
        ...cornerStyle,
        cornerColor: "#FFF",
        cornerStrokeColor: "#3b82f6",
        cornerSize: 8,
        itemType: "image",
        clipPath,
        imageUrl,
        id,
      });
      img.setControlsVisibility({
        mt: false, // Hide middle-top
        mb: false, // Hide middle-bottom
        ml: false, // Hide middle-left
        mr: false, // Hide middle-right
        mtr: false, // Hide middle-top-rotation (if exists)
      });
      canvas?.add(img);
      canvas?.renderAll();
      canvasStore.addObject({
        type: "image",
        url: imageUrl,
        name: imageName,
        x: (pointer?.x as number) - img.width / 2,
        y: (pointer?.y as number) - img.height / 2,
        width: img.getScaledWidth(),
        height: img.getScaledHeight(),
        id,
      });
    });
    const htmlImg = document.getElementById("uploaded-image");
    if (htmlImg) {
      htmlImg.remove();
    }
    canvasStore.setSelectedToolbarAction("cursor");
    canvasStore.setSelectedImage({
      name: "",
      url: null,
    });
  }

  useEffect(() => {
    if (canvasStore.hoveredLayer) {
      removeHoverElement();

      // Create a Fabric.js rectangle for hover effect
      const hoverRect = new fabric.Rect({
        left: canvasStore.hoveredLayer.left,
        top: canvasStore.hoveredLayer.top,
        width: canvasStore.hoveredLayer.getScaledWidth(),
        height: canvasStore.hoveredLayer.getScaledHeight(),
        fill: "transparent",
        stroke: "#60a5fa",
        strokeWidth: 2,
        selectable: false,
        evented: false,
        hoverCursor: "default",
        id: "hover-element",
      });

      canvas?.add(hoverRect);
      canvas?.renderAll();
    } else {
      removeHoverElement();
    }

    function removeHoverElement() {
      if (canvas) {
        const hoverElement = canvas
          .getObjects()
          .find((obj) => (obj as any).id === "hover-element");
        if (hoverElement) {
          canvas.remove(hoverElement);
          canvas.renderAll();
        }
      }
    }
  }, [canvasStore.hoveredLayer, canvas]);

  return (
    <LayoutContainer canvas={canvas}>
      <>
        <Canvas
          onLoad={onLoad}
          canvasRef={canvasRef as RefObject<HTMLCanvasElement>}
        />
      </>
    </LayoutContainer>
  );
});

export default App;
