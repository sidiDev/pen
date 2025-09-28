import CanvasStore from "@/utils/CanvasStore";
import * as fabric from "fabric";
import React, { RefObject, useEffect } from "react";

const DEV_MODE = process.env.NODE_ENV === "development";

declare global {
  var canvas: fabric.Canvas | undefined;
}

export interface CanvasProps
  extends Omit<React.HTMLAttributes<HTMLCanvasElement>, "onLoad"> {
  /**
   * Callback function called when the canvas is loaded and ready to use
   * @param canvas The fabric.Canvas instance
   */
  onLoad?(canvas: fabric.Canvas): void;
  /**
   * Reference to the HTML canvas element
   */
  canvasRef: RefObject<HTMLCanvasElement>;
}

export const Canvas = React.forwardRef<fabric.Canvas, CanvasProps>(
  ({ onLoad, canvasRef, ...props }, ref) => {
    useEffect(() => {
      if (!canvasRef.current) {
        return;
      }

      const canvas = initCanvas(canvasRef.current);

      canvas.preserveObjectStacking = true;

      canvas.on("text:changed", (e) => {
        console.log("text:changed", e);

        CanvasStore.setUpdateObject({
          id: (e.target as any).id,
          updates: { text: e.target.text },
        });
      });

      canvas.on("selection:created", (selectedEl) => {
        CanvasStore.setHoveredLayer(null as any);
        selectedEl.selected.forEach((el: any) => {
          CanvasStore.setSelectedLayer({
            id: el.id,
            type: el.itemType || el.type,
          });
        });

        // console.log(selectedLayers);

        // selectedEl.e?.target?.addEventListener("mousemove", (e) => {
        //   console.log("selection offsetX", selectedEl?.e?.offsetX);
        //   console.log("selection", selectedEl?.e);
        //   console.log("mousemove offsetX", e.offsetX);
        // });
      });

      canvas.on("selection:updated", (e) => {
        console.log("selection:updated", e);
        const unselectedIds = e.deselected.map((item: any) => item.id);
        CanvasStore.setUnselectLayer(unselectedIds);
        CanvasStore.setHoveredLayer(null as any);
        e.selected.forEach((el: any) => {
          CanvasStore.setSelectedLayer({
            id: el.id,
            type: el.itemType || el.type,
          });
        });
      });

      canvas.on("selection:cleared", (e) => {
        setTimeout(() => {
          console.log("selection:cleared", e);
          const unselectedIds = e.deselected.map((item: any) => item.id);
          CanvasStore.setUnselectLayer(unselectedIds);
        }, 100);
      });

      canvas.on("mouse:over", (e) => {
        const target = e.target as any;
        if (!target) return;
        // ignore our synthetic hover overlay
        if (target.id === "hover-element") return;
        // Allow hovering other objects even when something is selected,
        // but don't consider already-selected items as hover targets
        if (!CanvasStore.isLayerSelected?.(target.id)) {
          CanvasStore.setHoveredLayer(target);
        } else {
          CanvasStore.setHoveredLayer(null as any);
        }
      });

      canvas.on("mouse:out", (e) => {
        const target = e.target as fabric.FabricObject | undefined;
        // Clear hover when leaving the currently hovered object
        if (!target || CanvasStore.hoveredLayer === target) {
          CanvasStore.setHoveredLayer(null as any);
        }
      });

      // canvas.setZoom(0.09);

      // it is crucial `onLoad` is a dependency of this effect
      // to ensure the canvas is disposed and re-created if it changes
      onLoad?.(canvas);

      return () => {
        canvas?.dispose();
      };
    }, []);

    function initCanvas(element: HTMLCanvasElement) {
      const canvas = new fabric.Canvas(element, {
        width: window.innerWidth,
        height: window.innerHeight,
        selection: true,
        stopContextMenu: true,
        selectionColor: "rgba(0, 120, 215, 0.1)",
        selectionLineWidth: 1,
        selectionFullyContained: false,
        selectionBorderColor: "#60a5fa",
        freeDrawingCursor: "crosshair",
        preserveObjectStacking: true,
      });

      fabric.ActiveSelection.prototype.setControlsVisibility({
        ml: false, // middle-left
        mt: false, // middle-top
        mr: false, // middle-right
        mb: false, // middle-bottom
        mtr: false, // rotation control (optional)
      });
      fabric.ActiveSelection.ownDefaults.transparentCorners = false;
      fabric.ActiveSelection.ownDefaults.borderScaleFactor = 1.5;
      fabric.ActiveSelection.ownDefaults.cornerColor = "#FFF";
      fabric.ActiveSelection.ownDefaults.cornerStrokeColor = "#3b82f6";
      fabric.ActiveSelection.ownDefaults.borderColor = "#60a5fa";
      fabric.ActiveSelection.ownDefaults.cornerSize = 8;

      return canvas;
    }

    return <canvas id="canvas" ref={canvasRef} {...props} />;
  }
);
