import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  FoldVertical,
  ArrowDownToLine,
} from "lucide-react";
import { IconLineHeight, IconletterSpacing } from "./icons";
import { PanelSettings } from "./InspectorPanel";
import * as fabric from "fabric";
import canvasStore from "@/utils/CanvasStore";
import fontWeight from "@/utils/fontWeight";

interface TypographyPanelProps {
  className?: string;
  panelSettings: PanelSettings;
  setPanelSettings: (settings: PanelSettings) => void;
  isMultiSelect: boolean;
  selectedLayers: string[];
  canvas: fabric.Canvas | null;
}

export function TypographyPanel({
  className,
  panelSettings,
  setPanelSettings,
  isMultiSelect,
  selectedLayers,
  canvas,
}: TypographyPanelProps) {
  const [typographySettings, setTypographySettings] = useState<{
    fontFamily: string;
    fontWeight: number;
    fontSize: number;
    lineHeight: number;
    charSpacing: number;
    textAlign: string;
  }>({
    fontFamily: panelSettings.fontFamily,
    fontWeight: panelSettings.fontWeight,
    fontSize: panelSettings.fontSize,
    lineHeight: panelSettings.lineHeight,
    charSpacing: panelSettings.charSpacing,
    textAlign: panelSettings.textAlign,
  });

  useEffect(() => {
    setTypographySettings(panelSettings);
  }, [panelSettings]);

  function handleBlur(value: string, property: string) {
    const trimmed = value.trim();
    const isNumber = trimmed !== "" && !Number.isNaN(Number(trimmed));

    console.log({ [property]: value });
    if (trimmed === "" || (!isNumber && isMultiSelect)) {
      setTypographySettings({
        ...typographySettings,
        [property]: "Mixed",
      });
      setPanelSettings({
        ...panelSettings,
        [property]: "Mixed",
      });
    } else if (!isMultiSelect && isNumber) {
      console.log("Blur", value);
      const newValue = Number(trimmed);
      setTypographySettings({
        ...typographySettings,
        [property]: newValue,
      });
      setPanelSettings({
        ...panelSettings,
        [property]: newValue,
      });

      if (isMultiSelect) {
        selectedLayers.forEach((layerId) => {
          canvasStore.setUpdateObject({
            id: layerId,
            updates: { [property]: newValue },
          });
        });
      } else {
        const layer = canvas
          ?.getObjects()
          .find((obj) => (obj as any).id === selectedLayers[0]);
        if (layer) {
          layer.set({ [property]: newValue });
          layer.setCoords();
          canvas?.renderAll();
          console.log(newValue);
        }

        canvasStore.setUpdateObject({
          id: selectedLayers[0],
          updates: { [property]: newValue },
        });
      }
    }
  }

  function handleAlignmentChange(value: string) {
    canvas?.getActiveObjects().forEach((obj) => {
      obj.set("textAlign", value);
      canvasStore.setUpdateObject({
        id: (obj as any).id,
        updates: { textAlign: value },
      });
    });
    canvas?.renderAll();
    setTypographySettings({
      ...typographySettings,
      textAlign: value,
    });
    setPanelSettings({
      ...panelSettings,
      textAlign: value,
    });
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-neutral-200">Typography</h2>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Select
          value={typographySettings.fontFamily}
          onValueChange={(val) => {
            canvas?.getActiveObjects().forEach((obj) => {
              obj.set("fontFamily", val);
              canvasStore.setUpdateObject({
                id: (obj as any).id,
                updates: {
                  fontFamily: val,
                },
              });
            });
            canvas?.renderAll();
            setTypographySettings({
              ...typographySettings,
              fontFamily: val,
            });
            setPanelSettings({
              ...panelSettings,
              fontFamily: val,
            });
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="Font family" />
          </SelectTrigger>
          <SelectContent sideOffset={5}>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value={`"Roboto Mono", monospace`}>
              Roboto Mono
            </SelectItem>
            <SelectItem value={`"Noto Sans", sans-serif`}>Noto Sans</SelectItem>
            <SelectItem value={`"Josefin Sans", sans-serif`}>
              Josefin Sans
            </SelectItem>
            <SelectItem value={`"Merriweather", serif`}>
              Merriweather
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font Weight and Size */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={
              fontWeight.numeric[
                typographySettings.fontWeight as keyof typeof fontWeight.numeric
              ]
            }
            onValueChange={(val) => {
              const currentFontWeight =
                fontWeight[val as keyof typeof fontWeight];
              const family = typographySettings.fontFamily || "Inter";
              const needsQuotes = family.includes(" ");
              const familyForCSS = needsQuotes ? `"${family}"` : family;

              const loadPromise = (document as any).fonts?.load
                ? (document as any).fonts
                    .load(`${currentFontWeight} 12px ${familyForCSS}`)
                    .catch(() => Promise.resolve())
                : Promise.resolve();

              Promise.resolve(loadPromise).finally(() => {
                canvas?.getActiveObjects().forEach((obj) => {
                  obj.set("fontWeight", currentFontWeight);
                  canvasStore.setUpdateObject({
                    id: (obj as any).id,
                    updates: {
                      fontWeight: currentFontWeight,
                    },
                  });
                });
                canvas?.renderAll();
              });
              setTypographySettings({
                ...typographySettings,
                fontWeight: currentFontWeight as number,
              });
              setPanelSettings({
                ...panelSettings,
                fontWeight: currentFontWeight as number,
              });
            }}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Weight" className="w-full" />
            </SelectTrigger>
            <SelectContent sideOffset={5}>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="semibold">Semibold</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <input
            type="number"
            value={typographySettings.fontSize}
            className="w-full h-7 px-3 py-2 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
            step="0.01"
            min="0"
            onChange={(e) => {
              setTypographySettings({
                ...typographySettings,
                fontSize: Number(e.target.value),
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleBlur(typographySettings.fontSize.toString(), "fontSize");
              }
            }}
            onBlur={(e) => {
              handleBlur(e.target.value, "fontSize");
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {/* Line Height */}
        <div className="flex-1">
          <label className="text-xs text-neutral-400">Line height</label>
          <div className="mt-0.5 relative">
            <input
              type="number"
              value={typographySettings.lineHeight}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
              onChange={(e) => {
                setTypographySettings({
                  ...typographySettings,
                  lineHeight: Number(e.target.value),
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBlur(
                    typographySettings.lineHeight.toString(),
                    "lineHeight"
                  );
                }
              }}
              onBlur={(e) => {
                handleBlur(e.target.value, "lineHeight");
              }}
            />
            <IconLineHeight className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="flex-1">
          <label className="text-xs text-neutral-400">Letter spacing</label>
          <div className="mt-0.5 relative">
            <input
              type="number"
              value={typographySettings.charSpacing}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
              onChange={(e) => {
                setTypographySettings({
                  ...typographySettings,
                  charSpacing: Number(e.target.value),
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBlur(
                    typographySettings.charSpacing.toString(),
                    "charSpacing"
                  );
                }
              }}
              onBlur={(e) => {
                handleBlur(e.target.value, "charSpacing");
              }}
            />
            <IconletterSpacing className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div className="">
        <label className="text-xs text-neutral-400">Alignment</label>
        <div className="mt-0.5 flex gap-2">
          {/* Horizontal Alignment */}
          <div className="flex-1 flex items-center bg-neutral-700/50 h-7 p-1 rounded-md">
            <Button
              data-selected={typographySettings.textAlign === "left"}
              onClick={() => {
                handleAlignmentChange("left");
              }}
              variant="outline"
              size="icon"
              className="size-6 flex-1 data-[selected=true]:bg-zinc-800 bg-transparent border-none shadow-none hover:bg-neutral-800 text-neutral-200 hover:text-neutral-100"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              data-selected={typographySettings.textAlign === "center"}
              onClick={() => {
                handleAlignmentChange("center");
              }}
              variant="outline"
              size="icon"
              className="size-6 flex-1 data-[selected=true]:bg-zinc-800 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              data-selected={typographySettings.textAlign === "right"}
              onClick={() => {
                handleAlignmentChange("right");
              }}
              variant="outline"
              size="icon"
              className="size-6 flex-1 data-[selected=true]:bg-zinc-800 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Vertical Alignment */}
          <div className="flex-1 flex gap-1 items-center bg-neutral-700/50 h-7 p-1 rounded-md">
            <Button
              disabled
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <ArrowUpToLine className="w-4 h-4" />
            </Button>
            <Button
              disabled
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <FoldVertical className="w-4 h-4" />
            </Button>
            <Button
              disabled
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <ArrowDownToLine className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
