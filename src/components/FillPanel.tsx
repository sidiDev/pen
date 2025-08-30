import ColorPickerHandler from "./ui/ColorPickerHandler";
import { useEffect, useState } from "react";
import { PanelSettings } from "./InspectorPanel";
interface LayoutPanelProps {
  className?: string;
  fill: string;
  opacity: number;
}

export function FillPanel({ className, fill, opacity }: LayoutPanelProps) {
  const [color, setColor] = useState("");
  const [alpha, setAlpha] = useState(null);
  const handlePageBgColorChange = (
    color: string,
    rgba: string,
    alpha: number
  ) => {};

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-neutral-200">Fill</h2>
      </div>

      {/* Position */}
      <div className="flex gap-2">
        <ColorPickerHandler
          color={color || (fill as string)}
          alpha={alpha || opacity}
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
