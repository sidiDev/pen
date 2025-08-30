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

interface ColorPickerHandlerProps {
  // Color value and alpha
  color: string;
  alpha: number;

  // Callbacks for when color or alpha changes
  onColorChange: (color: string, rgba: string, alpha: number) => void;

  // UI customization
  label?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  popoverClassName?: string;

  // Features
  showAlpha?: boolean;
  showLabel?: boolean;
  showHexInput?: boolean;
  showPercentage?: boolean;

  // Popover positioning
  popoverSide?: "top" | "right" | "bottom" | "left";
  popoverAlign?: "start" | "center" | "end";
  popoverSideOffset?: number;
  popoverStyle?: React.CSSProperties;
  alignOffset?: number;
}

const ColorPickerHandler = observer(
  ({
    color: initialColor,
    alpha: initialAlpha,
    onColorChange,
    label = "Custom",
    placeholder = "000000",
    className = "",
    buttonClassName = "",
    popoverClassName = "",
    showAlpha = true,
    showLabel = true,
    showHexInput = true,
    showPercentage = true,
    popoverSide = "left",
    popoverAlign = "start",
    popoverSideOffset = 40,
    popoverStyle = {},
    alignOffset = 0,
  }: ColorPickerHandlerProps) => {
    const [newColor, setNewColor] = useState(initialColor);
    const [color, setColor] = useState(initialColor);
    const [alpha, setAlpha] = useState(initialAlpha);

    useEffect(() => {
      if (color) {
        const hsva = hexToHsva(color);
        const rgba = hsvaToRgba(hsva);
        const bgColor = `rgba(${Math.round(rgba.r)}, ${Math.round(
          rgba.g
        )}, ${Math.round(rgba.b)}, ${alpha})`;

        onColorChange(color, bgColor, alpha);
        setNewColor(color);
      }
    }, [color, alpha, onColorChange]);

    useEffect(() => {
      if (initialColor) {
        setColor(initialColor);
        setAlpha(initialAlpha);
      }
    }, [initialColor, initialAlpha]);

    const handleColorChange = (newColor: string) => {
      setColor(newColor);
    };

    const handleAlphaChange = (newAlpha: number) => {
      setAlpha(newAlpha);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
        .replace(/[^0-9A-Fa-f]/g, "")
        .substring(0, 6);
      setNewColor(`#${newValue}`);
    };

    const handleHexInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const newValue = value.replace(/[^0-9A-Fa-f]/g, "").substring(0, 6);

      if (newValue.length === 6) {
        setColor(`#${newValue}`);
        setNewColor(`#${newValue}`);
      } else {
        setColor(initialColor);
        setNewColor(initialColor);
      }
    };

    const handleAlphaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Math.max(
        0,
        Math.min(100, parseInt(e.target.value) || 0)
      );
      setAlpha(newValue / 100);
    };

    return (
      <div className={className}>
        <div
          className={`flex items-center gap-2 px-2 h-7 bg-neutral-700/50 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-all duration-200 group ${buttonClassName}`}
        >
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative size-4 rounded overflow-hidden flex-shrink-0 cursor-pointer">
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
              align={popoverAlign}
              sideOffset={popoverSideOffset}
              alignOffset={0}
              side={popoverSide}
              style={popoverStyle}
              className={`w-70 p-4 bg-neutral-800 border-neutral-700 shadow-2xl ${popoverClassName}`}
            >
              <div className="space-y-4">
                {showLabel && (
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs text-neutral-200">{label}</h3>
                    <PopoverClose className="text-neutral-500">
                      <X size={16} />
                    </PopoverClose>
                  </div>
                )}

                <ColorPicker
                  value={color}
                  onChange={handleColorChange}
                  onAlphaChange={handleAlphaChange}
                  showAlpha={showAlpha}
                />
              </div>
            </PopoverContent>
          </Popover>

          {showHexInput && (
            <input
              type="text"
              value={newColor.toUpperCase().replace("#", "")}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              className="text-xs border-r h-full border-neutral-700 flex-1 bg-transparent outline-none text-neutral-200 focus:ring-0 px-1"
              placeholder={placeholder}
            />
          )}

          {showAlpha && showPercentage && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 text-sm text-neutral-400">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(alpha * 100)}
                  onChange={handleAlphaInputChange}
                  className="text-center bg-transparent border-none outline-none text-neutral-200 focus:ring-0"
                />
                <span className="text-xs">%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ColorPickerHandler;
