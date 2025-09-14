import LayoutContainer from "@/components/LayoutContainer";
import { observer } from "mobx-react-lite";
import canvasStore, { IPage } from "@/utils/CanvasStore";

import { Canvas } from "@/components/Canvas";
import * as fabric from "fabric";
import { useRef, useCallback, useEffect, useState, RefObject } from "react";
import { v4 as uuidv4 } from "uuid";

const File = observer(({ pages }: { pages: IPage[] }) => {
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

      function applyDefaultObjectStyles(obj: any) {
        // Ensure itemType exists for downstream logic
        if (!obj.itemType) {
          obj.itemType = obj.type;
        }
        // Apply default control styling and hide middle controls
        obj.set({
          cornerColor: "#FFF",
          cornerStrokeColor: "#3b82f6",
          cornerSize: 8,
          transparentCorners: false,
          borderColor: "#3b82f6",
          borderScaleFactor: 1.5,
          borderOpacityWhenMoving: 0,
        });
        obj.setControlsVisibility?.({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          mtr: false,
        });
        if (obj.type === "i-text") {
          obj.set("editingBorderColor", "#3b82f6");
        }
      }

      pages.forEach((page) => {
        canvas.setZoom(page.zoom.value);
        canvas.relativePan(
          new fabric.Point(page.zoom.delta.x, page.zoom.delta.y)
        );
        canvas
          .loadFromJSON({ version: "5.2.4", objects: page.objects })
          .then((canvas) => {
            canvas
              .getObjects()
              .forEach((o: any) => applyDefaultObjectStyles(o));
            canvas.requestRenderAll();
            canvas.set({ preserveObjectStacking: true });
          });
      });
    },
    [canvasRef]
  );

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Wheel pan/zoom and space-drag pan
  useEffect(() => {
    if (!canvas) return;

    const minZoom = 0.05;
    const maxZoom = 8;
    const WHEEL_ZOOM_EXP_BASE = 1.005;
    const KB_ZOOM_STEP = 1.2;

    function setZoomClamped(
      nextZoom: number,
      pointer: { x: number; y: number }
    ) {
      const z = Math.min(maxZoom, Math.max(minZoom, nextZoom));
      canvasStore.setZoom({
        pointer: { x: pointer.x, y: pointer.y },
        delta: {
          x: canvasStore.currentPage.zoom.delta.x,
          y: canvasStore.currentPage.zoom.delta.y,
        },
        value: z,
      });
      return z;
    }

    const handleWheel = (opt: any) => {
      const e = opt.e as WheelEvent;
      const isZoomGesture = e.ctrlKey || e.metaKey;

      if (isZoomGesture) {
        const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
        const pointer = new fabric.Point(
          e.clientX - canvasRect.left,
          e.clientY - canvasRect.top
        );
        const currentZoom = canvas.getZoom();
        const zoomFactor = Math.pow(WHEEL_ZOOM_EXP_BASE, -e.deltaY);
        const nextZoom = setZoomClamped(currentZoom * zoomFactor, pointer);
        console.log("pointer", pointer);
        console.log("nextZoom", nextZoom);

        canvas.zoomToPoint(pointer, nextZoom);
        canvas.requestRenderAll();
      } else {
        const vpt = canvas.viewportTransform!;
        console.log("vpt", vpt);

        const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
        const pointer2 = {
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
        };

        const delta = new fabric.Point(-e.deltaX, -e.deltaY);
        canvasStore.setZoom({
          pointer: { x: pointer2.x, y: pointer2.y },
          delta: { x: vpt[4], y: vpt[5] },
          value: canvasStore.currentPage.zoom.value,
        });
        console.log({ x: delta.x, y: delta.y });
        canvas.relativePan(delta);
        canvas.requestRenderAll();
      }

      e.preventDefault();
      e.stopPropagation();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts while typing in inputs or contenteditable elements
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isInputLike =
        !!target &&
        (tagName === "input" ||
          tagName === "textarea" ||
          (target as HTMLElement).isContentEditable);
      if (isInputLike) return;
      // If editing text, allow normal typing including Space
      const activeObject: any = canvas.getActiveObject?.();
      const isEditingText =
        activeObject &&
        activeObject.type === "i-text" &&
        activeObject.isEditing;

      if (e.code === "Space" && !isEditingText) {
        canvasStore.setIsPanning(true);
        canvas.setCursor("grab");
        canvas.requestRenderAll();
        e.preventDefault();
      }

      if (e.metaKey || e.ctrlKey) {
        if (e.key === "+" || e.key === "=") {
          const center = new fabric.Point(canvas.width / 2, canvas.height / 2);
          const nextZoom = setZoomClamped(
            canvas.getZoom() * KB_ZOOM_STEP,
            center
          );
          canvas.zoomToPoint(center, nextZoom);
          canvas.requestRenderAll();
          e.preventDefault();
        }
        if (e.key === "-") {
          const center = new fabric.Point(canvas.width / 2, canvas.height / 2);
          const nextZoom = setZoomClamped(
            canvas.getZoom() / KB_ZOOM_STEP,
            center
          );
          canvas.zoomToPoint(center, nextZoom);
          canvas.requestRenderAll();
          e.preventDefault();
        }
        if (e.key === "0") {
          const nextZoom = setZoomClamped(1, { x: 0, y: 0 });
          canvas.setZoom(nextZoom);
          canvas.absolutePan(new fabric.Point(0, 0));
          canvas.requestRenderAll();
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Ignore when focus is in inputs/contenteditable
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isInputLike =
        !!target &&
        (tagName === "input" ||
          tagName === "textarea" ||
          (target as HTMLElement).isContentEditable);
      if (isInputLike) return;
      if (e.code === "Space") {
        canvasStore.setIsPanning(false);
        if (!isDraggingRef.current) {
          canvas.setCursor(currentCursor());
          canvas.requestRenderAll();
        }
      }
    };

    const handleMouseDown = (opt: any) => {
      if (canvasStore.isPanning) {
        isDraggingRef.current = true;
        const e = opt.e as MouseEvent;
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        canvas.setCursor("grabbing");
        canvas.defaultCursor = "grabbing";
        canvas.requestRenderAll();
        // Disable selection while panning
        canvas.selection = false;
      }
    };

    const handleMouseMove = (opt: any) => {
      if (isDraggingRef.current && lastPosRef.current) {
        const e = opt.e as MouseEvent;
        const delta = new fabric.Point(
          e.clientX - lastPosRef.current.x,
          e.clientY - lastPosRef.current.y
        );
        canvas.relativePan(delta);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        canvas.requestRenderAll();
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        lastPosRef.current = null;
        canvas.selection = true;
        canvas.setCursor(canvasStore.isPanning ? "grab" : currentCursor());
        canvas.defaultCursor = currentCursor();
        canvas.requestRenderAll();
      }
    };

    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown as any);
      window.removeEventListener("keyup", handleKeyUp as any);
    };
  }, [canvas]);

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
    if (canvasStore.isPanning) return;
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
      type: "i-text",
      resizeMode: "fit",
      left: pointer?.x,
      top: pointer?.y,
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
      left: textObject.left,
      top: textObject.top,
      textAlign: textObject.textAlign,
      ...cornerStyle,
      transparentCorners: false,
      borderColor: "#3b82f6",
      borderScaleFactor: 1.5,
      borderOpacityWhenMoving: 0,
      opacity: textObject.opacity,
      id,
      itemType: "i-text",
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
      type: "rect",
      name: "Rectangle",
      resizeMode: "fit",
      left: pointer?.x,
      top: pointer?.y,
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
      left: rectangleObject.left,
      top: rectangleObject.top,
      width: rectangleObject.width,
      height: rectangleObject.height,
      ...cornerStyle,
      transparentCorners: false,
      borderScaleFactor: 1.5,
      borderOpacityWhenMoving: 0,
      opacity: rectangleObject.opacity,
      id,
      itemType: "rect",
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
    fabric.FabricImage.fromURL(imageUrl as string).then((img) => {
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
        src: imageUrl,
        name: imageName,
        left: (pointer?.x as number) - img.width / 2,
        top: (pointer?.y as number) - img.height / 2,
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
        strokeWidth: 2 / (canvas?.getZoom() ?? 1),
        strokeUniform: true,
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

  // Keep hover border width constant on screen when zoom changes
  useEffect(() => {
    if (!canvas) return;
    const hoverElement = canvas
      .getObjects()
      .find((obj) => (obj as any).id === "hover-element") as
      | fabric.Rect
      | undefined;
    if (hoverElement) {
      hoverElement.set("strokeWidth", 2 / canvas.getZoom());
      hoverElement.set("strokeUniform", true);
      canvas.requestRenderAll();
    }
  }, [canvasStore.currentPage.zoom.value, canvas]);

  // To test something
  function handleClick() {
    const value = 0.2666819576535833;
    const minZoom = 0.05;
    const maxZoom = 8;
    const z = Math.min(maxZoom, Math.max(minZoom, value));
    canvas?.setZoom(z);
    // const pointer = new fabric.Point(614, 194);
    // canvas?.zoomToPoint(pointer, value);
    canvas?.requestRenderAll();
  }

  return (
    <LayoutContainer canvas={canvas}>
      <>
        <div className="flex justify-center">
          {/* <button onClick={handleClick}>Click me</button> */}
        </div>
        <Canvas
          onLoad={onLoad}
          canvasRef={canvasRef as RefObject<HTMLCanvasElement>}
        />
      </>
    </LayoutContainer>
  );
});

export default File;
