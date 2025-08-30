import CanvasStore from "@/utils/CanvasStore";
import * as fabric from "fabric";
import { toJS } from "mobx";
import React, { RefObject, useEffect, useRef } from "react";

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

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        selection: true,
        selectionColor: "rgba(0, 120, 215, 0.1)",
        selectionLineWidth: 1,
        selectionBorderColor: "#60a5fa",
        freeDrawingCursor: "crosshair",
      });

      canvas.preserveObjectStacking = true;

      canvas.on("text:changed", (e) => {
        setTimeout(() => {
          CanvasStore.setUpdateObject({
            id: (e.target as any).id,
            updates: { text: e.target.text },
          });
        }, 300);
      });

      canvas.on("selection:created", (selectedEl) => {
        CanvasStore.setHoveredLayer(null as any);
        const selectedLayers = selectedEl.selected.forEach((el: any) => {
          CanvasStore.setSelectedLayer({
            id: el.id,
            type: el.itemType,
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
        const selectedLayers = e.selected.forEach((el: any) => {
          CanvasStore.setSelectedLayer({
            id: el.id,
            type: el.itemType,
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
        if (e.target && CanvasStore.selectedLayers.length === 0) {
          console.log("mouse:over", e.target);
          CanvasStore.setHoveredLayer(e.target);
        }
      });

      canvas.on("mouse:out", (e) => {
        CanvasStore.setHoveredLayer(null as any);
      });

      // canvas.setZoom(0.09);

      DEV_MODE && (window.canvas = canvas);

      if (typeof ref === "function") {
        ref(canvas);
      } else if (typeof ref === "object" && ref) {
        ref.current = canvas;
      }

      // it is crucial `onLoad` is a dependency of this effect
      // to ensure the canvas is disposed and re-created if it changes
      onLoad?.(canvas);

      return () => {
        DEV_MODE && delete window.canvas;

        if (typeof ref === "function") {
          ref(null);
        } else if (typeof ref === "object" && ref) {
          ref.current = null;
        }

        // `dispose` is async
        // however it runs a sync DOM cleanup
        // its async part ensures rendering has completed
        // and should not affect react
        canvas.dispose();
      };
    }, [canvasRef, onLoad]);

    return <canvas ref={canvasRef} {...props} />;
  }
);
