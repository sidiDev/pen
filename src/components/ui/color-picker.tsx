import * as React from "react";
import {
  HsvaColor,
  hsvaToHex,
  hexToHsva,
  hsvaToRgba,
  hsvaToHsla,
} from "@uiw/color-convert";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColorSaturationProps {
  hsva: HsvaColor;
  onChange: (hsva: HsvaColor) => void;
}

const ColorSaturation = React.forwardRef<HTMLDivElement, ColorSaturationProps>(
  ({ hsva, onChange }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMouseMove = React.useCallback(
      (e: MouseEvent | React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width)
        );
        const y = Math.max(
          0,
          Math.min(1, (e.clientY - rect.top) / rect.height)
        );

        onChange({
          h: hsva.h,
          s: x * 100,
          v: (1 - y) * 100,
          a: hsva.a,
        });
      },
      [hsva.h, hsva.a, onChange]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      handleMouseMove(e);
    };

    React.useEffect(() => {
      if (!isDragging) return;

      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = () => setIsDragging(false);

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }, [isDragging, handleMouseMove]);

    const thumbLeft = (hsva.s / 100) * 100;
    const thumbTop = ((100 - hsva.v) / 100) * 100;

    return (
      <div
        ref={containerRef}
        className="relative h-48 w-full rounded-lg overflow-hidden cursor-crosshair"
        style={{
          backgroundColor: `hsl(${hsva.h}, 100%, 50%)`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div
          className="absolute w-4 h-4 -tranneutral-x-1/2 -tranneutral-y-1/2 pointer-events-none"
          style={{
            left: `${thumbLeft}%`,
            top: `${thumbTop}%`,
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-white shadow-lg bg-transparent" />
        </div>
      </div>
    );
  }
);
ColorSaturation.displayName = "ColorSaturation";

interface ColorSliderProps {
  type: "hue" | "alpha";
  value: number;
  onChange: (value: number) => void;
  hsva?: HsvaColor;
}

const ColorSlider = React.forwardRef<HTMLDivElement, ColorSliderProps>(
  ({ type, value, onChange, hsva }) => {
    const sliderRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMouseMove = React.useCallback(
      (e: MouseEvent | React.MouseEvent) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width)
        );

        if (type === "hue") {
          onChange(x * 360);
        } else {
          onChange(x);
        }
      },
      [type, onChange]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      handleMouseMove(e);
    };

    React.useEffect(() => {
      if (!isDragging) return;

      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = () => setIsDragging(false);

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }, [isDragging, handleMouseMove]);

    const thumbPosition = type === "hue" ? (value / 360) * 100 : value * 100;

    let backgroundStyle: React.CSSProperties = {};
    if (type === "hue") {
      backgroundStyle.background =
        "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)";
    } else if (hsva) {
      const opaqueColor = hsvaToHex({ ...hsva, a: 1 });
      backgroundStyle.background = `linear-gradient(to right, transparent, ${opaqueColor})`;
    }

    return (
      <div
        ref={sliderRef}
        className="relative h-8 w-full rounded-md overflow-hidden cursor-pointer"
        style={backgroundStyle}
        onMouseDown={handleMouseDown}
      >
        {type === "alpha" && (
          <div className="absolute inset-0 bg-checkerboard" />
        )}
        <div
          className="absolute top-1/2 -tranneutral-y-1/2 -tranneutral-x-1/2 pointer-events-none"
          style={{ left: `${thumbPosition}%` }}
        >
          <div className="w-4 h-8 rounded-sm border-2 border-white shadow-lg bg-transparent" />
        </div>
      </div>
    );
  }
);
ColorSlider.displayName = "ColorSlider";

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onAlphaChange?: (alpha: number) => void;
  format?: "hex" | "rgb" | "hsl";
  showAlpha?: boolean;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    { value, onChange, onAlphaChange, format = "hex", showAlpha = true },
    ref
  ) => {
    const [hsva, setHsva] = React.useState<HsvaColor>(() => {
      try {
        return hexToHsva(value);
      } catch {
        return { h: 0, s: 0, v: 100, a: 1 };
      }
    });
    const [currentFormat, setCurrentFormat] = React.useState(format);

    React.useEffect(() => {
      try {
        const newHsva = hexToHsva(value);
        setHsva(newHsva);
      } catch {
        // Invalid color value
      }
    }, [value]);

    const handleHsvaChange = (newHsva: HsvaColor) => {
      setHsva(newHsva);
      const hex = hsvaToHex(newHsva);
      onChange(hex);
      if (onAlphaChange) {
        onAlphaChange(newHsva.a);
      }
    };

    const getFormattedValue = () => {
      switch (currentFormat) {
        case "rgb": {
          const rgba = hsvaToRgba(hsva);
          return showAlpha
            ? `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(
                rgba.b
              )}, ${rgba.a.toFixed(2)})`
            : `rgb(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(
                rgba.b
              )})`;
        }
        case "hsl": {
          const hsla = hsvaToHsla(hsva);
          return showAlpha
            ? `hsla(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(
                hsla.l
              )}%, ${hsla.a.toFixed(2)})`
            : `hsl(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(
                hsla.l
              )}%)`;
        }
        default:
          return hsvaToHex(hsva);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      try {
        const newHsva = hexToHsva(newValue);
        setHsva(newHsva);
        onChange(newValue);
        if (onAlphaChange) {
          onAlphaChange(newHsva.a);
        }
      } catch {
        // Invalid input, don't update
      }
    };

    return (
      <div ref={ref} className="w-full space-y-3">
        <ColorSaturation hsva={hsva} onChange={handleHsvaChange} />

        <ColorSlider
          type="hue"
          value={hsva.h}
          onChange={(h) => handleHsvaChange({ ...hsva, h })}
        />

        {showAlpha && (
          <ColorSlider
            type="alpha"
            value={hsva.a}
            onChange={(a) => handleHsvaChange({ ...hsva, a })}
            hsva={hsva}
          />
        )}

        <div className="flex gap-2">
          <Select
            defaultValue="hex"
            onValueChange={(value: string) =>
              setCurrentFormat(value as typeof currentFormat)
            }
          >
            <SelectTrigger
              size="sm"
              className="w-[80px] py-0 text-xs bg-neutral-700 border border-neutral-600 rounded-md text-neutral-200 focus:outline-none"
            >
              <SelectValue
                placeholder="Hex"
                className="text-xs text-neutral-200 placeholder:text-neutral-200"
              />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border border-neutral-700">
              <SelectItem value="hex" className="text-neutral-200">
                Hex
              </SelectItem>
              <SelectItem value="rgb" className="text-neutral-200">
                RGB
              </SelectItem>
              <SelectItem value="hsl" className="text-neutral-200">
                HSL
              </SelectItem>
            </SelectContent>
          </Select>

          <input
            type="text"
            value={getFormattedValue()}
            onChange={handleInputChange}
            className="flex-1 px-2 py-1.5 text-xs bg-neutral-700 border border-neutral-600 rounded-md text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>
    );
  }
);
ColorPicker.displayName = "ColorPicker";

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showEyeIcon?: boolean;
  className?: string;
}

export const ColorField = React.forwardRef<HTMLDivElement, ColorFieldProps>(
  ({ value, label, showEyeIcon = true, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [alpha, setAlpha] = React.useState(1);

    React.useEffect(() => {
      try {
        const hsva = hexToHsva(value);
        setAlpha(hsva.a);
      } catch {
        setAlpha(1);
      }
    }, [value]);

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        {label && <span className="text-xs text-neutral-400">{label}</span>}

        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md hover:border-neutral-600 transition-colors cursor-pointer">
          <div className="relative w-4 h-4 rounded overflow-hidden">
            <div className="absolute inset-0 bg-checkerboard" />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: value }}
            />
          </div>

          <span className="text-xs text-neutral-200 font-mono">
            {value.toUpperCase().replace("#", "")}
          </span>

          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <span className="font-mono">{Math.round(alpha * 100)}</span>
            <span>%</span>
          </div>

          {showEyeIcon && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(!isVisible);
              }}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {isVisible ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);
ColorField.displayName = "ColorField";
