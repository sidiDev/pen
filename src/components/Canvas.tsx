import * as fabric from "fabric";
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
  defaultCursor: string;
}

export const Canvas = React.forwardRef<fabric.Canvas, CanvasProps>(
  ({ onLoad, canvasRef, defaultCursor, ...props }, ref) => {
    useEffect(() => {
      if (!canvasRef.current) {
        return;
      }

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 1000,
        height: 1000,
        selection: true,
        selectionColor: "rgba(0, 120, 215, 0.2)",
        selectionLineWidth: 1,
        selectionBorderColor: "#60a5fa",
      });

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
