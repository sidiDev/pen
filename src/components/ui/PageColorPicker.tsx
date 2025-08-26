import { JSX, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { ColorPicker } from "@/components/ui/color-picker";
import { X } from "lucide-react";
import { hsvaToRgba, hexToHsva } from "@uiw/color-convert";
import { observer } from "mobx-react-lite";
import canvasStore from "@/utils/CanvasStore";

const PageColorPicker = observer(() => {
  const [newColor, setNewColor] = useState(
    canvasStore.currentPage.backgroundColor.hex
  );

  const [color, setColor] = useState(
    canvasStore.currentPage.backgroundColor.hex
  );
  const [alpha, setAlpha] = useState(
    canvasStore.currentPage.backgroundColor.alpha
  );

  useEffect(() => {
    if (color) {
      const hsva = hexToHsva(color);

      const rgba = hsvaToRgba(hsva);
      const bgColor = `rgba(${Math.round(rgba.r)}, ${Math.round(
        rgba.g
      )}, ${Math.round(rgba.b)}, ${alpha})`;
      document.body.style.backgroundColor = bgColor;
      canvasStore.setCurrentPageBgColor(color, bgColor, alpha);
      setNewColor(color);
    }
  }, [color, alpha]);

  return (
    <button className="w-full text-left">
      <div className="flex items-center gap-2 px-2 h-7 bg-neutral-700 border border-neutral-600 rounded-lg hover:border-neutral-500 transition-all duration-200 group">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative size-4 rounded overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-checkerboard" />
              <div
                className="absolute inset-0 transition-opacity duration-200"
                style={{
                  backgroundColor: color,
                  opacity: alpha,
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={40}
            side="left"
            className="w-70 p-4 bg-neutral-800 border-neutral-700 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs text-neutral-200">Custom</h3>
                <PopoverClose className="text-neutral-500">
                  <X size={16} />
                </PopoverClose>
              </div>

              <ColorPicker
                value={color}
                onChange={setColor}
                onAlphaChange={setAlpha}
                showAlpha={true}
              />
            </div>
          </PopoverContent>
        </Popover>
        <input
          type="text"
          value={newColor.toUpperCase().replace("#", "")}
          onChange={(e) => {
            const newValue = e.target.value
              .replace(/[^0-9A-Fa-f]/g, "")
              .substring(0, 6);
            if (newValue.length === 6) {
              setNewColor(`#${newValue}`);
            } else {
              setNewColor(`#${newValue}`);
            }
          }}
          onBlur={(e) => {
            const value = e.target.value;
            const newValue = value.replace(/[^0-9A-Fa-f]/g, "").substring(0, 6);

            if (newValue.length === 6) {
              setColor(`#${newValue}`);
              setNewColor(`#${newValue}`);
            } else {
              setColor(canvasStore.currentPage.backgroundColor.hex);
              setNewColor(canvasStore.currentPage.backgroundColor.hex);
            }
          }}
          className="text-xs border-r h-full border-neutral-700 flex-1 bg-transparent outline-none text-neutral-200 focus:ring-0 px-1"
          placeholder="000000"
        />

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-sm text-neutral-400">
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(alpha * 100)}
              onChange={(e) => {
                const newValue = Math.max(
                  0,
                  Math.min(100, parseInt(e.target.value) || 0)
                );
                setAlpha(newValue / 100);
              }}
              className="text-center bg-transparent border-none outline-none text-neutral-200 focus:ring-0 px-1"
            />
            <span className="text-xs">%</span>
          </div>
        </div>
      </div>
    </button>
  );
});

export default PageColorPicker;
