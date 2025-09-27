import ColorPickerHandler from "./ui/ColorPickerHandler";
import { useState } from "react";
import * as fabric from "fabric";
import { CanvasStoreType } from "@/utils/CanvasStore";

interface LayoutPanelProps {
  className?: string;
  fill: string;
  opacity: number;
  canvas: fabric.Canvas | null;
  canvasStore: CanvasStoreType;
}

export function FillPanel({
  className,
  fill,
  opacity,
  canvas,
  canvasStore,
}: LayoutPanelProps) {
  const handlePageBgColorChange = (
    color: string,
    _rgba: string,
    alpha: number
  ) => {
    canvas?.getActiveObjects().forEach((obj) => {
      obj.set("fill", color);
      obj.set("opacity", alpha);
      canvasStore.setUpdateObject({
        id: (obj as any).id,
        updates: {
          fill: color,
          opacity: alpha,
        },
      });
    });
    canvas?.renderAll();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-neutral-200">Fill</h2>
      </div>

      {/* Position */}
      <div className="flex gap-2">
        <ColorPickerHandler
          color={fill as string}
          alpha={opacity / 100}
          onColorChange={handlePageBgColorChange}
          label="Background"
          placeholder="000000"
          className="w-full"
          showAlpha={true}
          showLabel={true}
          showHexInput={true}
          showPercentage={true}
          popoverSide="left"
          popoverAlign="end"
          popoverSideOffset={40}
        />
      </div>
    </div>
  );
}
