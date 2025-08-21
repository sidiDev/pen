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

function PageColorPicker() {
  const [color, setColor] = useState("#F5F5F5");
  const [alpha, setAlpha] = useState(1);

  useEffect(() => {
    const hsva = hexToHsva(color);
    const rgba = hsvaToRgba(hsva);
    document.body.style.backgroundColor = `rgba(${Math.round(
      rgba.r
    )}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${alpha})`;
  }, [color, alpha]);

  return (
    <button className="w-full text-left">
      <div className="flex items-center gap-2 px-2 h-7 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-all duration-200 group">
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
            className="w-70 p-4 bg-zinc-900 border-zinc-700 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs text-zinc-200">Custom</h3>
                <PopoverClose className="text-zinc-500">
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
          value={color.toUpperCase().replace("#", "")}
          onChange={(e) => {
            const newValue = e.target.value
              .replace(/[^0-9A-Fa-f]/g, "")
              .substring(0, 6);
            if (newValue.length === 6) {
              setColor(`#${newValue}`);
            } else {
              setColor(`#${newValue}`);
            }
          }}
          onBlur={(e) => {
            const value = e.target.value;
            if (value.length === 6) {
              setColor(`#${value}`);
            } else if (value.length === 0) {
              setColor("#000000");
            }
          }}
          className="text-xs border-r h-full border-zinc-700 flex-1 bg-transparent outline-none text-zinc-200 focus:ring-0 px-1"
          placeholder="000000"
        />

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-sm text-zinc-400">
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
              className="text-center bg-transparent border-none outline-none text-zinc-200 focus:ring-0 px-1"
            />
            <span className="text-xs">%</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default PageColorPicker;
