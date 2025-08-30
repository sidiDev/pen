import React, { useEffect, useState } from "react";
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
    letterSpacing: number;
    textAlign: string;
  }>({
    fontFamily: panelSettings.fontFamily,
    fontWeight: panelSettings.fontWeight,
    fontSize: panelSettings.fontSize,
    lineHeight: panelSettings.lineHeight,
    letterSpacing: panelSettings.letterSpacing,
    textAlign: panelSettings.textAlign,
  });

  useEffect(() => {
    setTypographySettings(panelSettings);
    console.log(panelSettings);
  }, [panelSettings]);

  function handleBlur(value: string, property: string) {
    const isNumber = value.match(/^\d+$/) !== null;

    if (value === "" || (value.match(/^\d+$/) === null && isMultiSelect)) {
      setTypographySettings({
        ...typographySettings,
        [property]: "Mixed",
      });
      setPanelSettings({
        ...panelSettings,
        [property]: "Mixed",
      });
    } else if (!isMultiSelect && value.match(/^\d+$/) !== null) {
      console.log("Blur", value);
      const newValue = isNumber ? Number(value) : value;
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
        console.log(selectedLayers[0]);

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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-neutral-200">Typography</h2>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Select defaultValue="inter">
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="Font family" />
          </SelectTrigger>
          <SelectContent sideOffset={5}>
            <SelectItem value="inter">Inter</SelectItem>
            <SelectItem value="arial">Arial</SelectItem>
            <SelectItem value="helvetica">Helvetica</SelectItem>
            <SelectItem value="georgia">Georgia</SelectItem>
            <SelectItem value="times">Times New Roman</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font Weight and Size */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Select defaultValue="regular">
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Weight" className="w-full" />
            </SelectTrigger>
            <SelectContent sideOffset={5}>
              <SelectItem value="light">Light</SelectItem>
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
              value={typographySettings.letterSpacing}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
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
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-zinc-800 border-none shadow-none hover:bg-neutral-800 text-neutral-200 hover:text-neutral-100"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Vertical Alignment */}
          <div className="flex-1 flex gap-1 items-center bg-neutral-700/50 h-7 p-1 rounded-md">
            <Button
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <ArrowUpToLine className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <FoldVertical className="w-4 h-4" />
            </Button>
            <Button
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
