import { Button } from "./ui/button";
import { ArrowRightFromLine } from "lucide-react";
import { IconAutoHeight } from "./icons";
import { PanelSettings } from "./InspectorPanel";
import { useEffect, useState } from "react";
import * as fabric from "fabric";
import canvasStore from "@/utils/CanvasStore";

interface LayoutPanelProps {
  className?: string;
  isMultiSelect?: boolean;
  panelSettings: PanelSettings;
  setPanelSettings: (settings: PanelSettings) => void;
  canvas: fabric.Canvas | null;
  selectedLayers: string[];
  isImage?: boolean;
}

export function LayoutPanel({
  className,
  isMultiSelect,
  panelSettings,
  setPanelSettings,
  canvas,
  selectedLayers,
  isImage,
}: LayoutPanelProps) {
  const [layoutSettings, setLayoutSettings] = useState<{
    x: number | "Mixed";
    y: number | "Mixed";
    width: number | "Mixed";
    height: number | "Mixed";
  }>({
    x: panelSettings.x,
    y: panelSettings.y,
    width: panelSettings.width,
    height: panelSettings.height,
  });

  console.log(isImage);

  function handleBlur(value: string, property: string) {
    const isNumber = value.match(/^\d+$/) !== null;

    if (value === "" || (value.match(/^\d+$/) === null && isMultiSelect)) {
      setLayoutSettings({
        ...layoutSettings,
        [property]: "Mixed",
      });
      setPanelSettings({
        ...panelSettings,
        [property]: "Mixed",
      });
    } else if (!isMultiSelect && value.match(/^\d+$/) !== null) {
      console.log("Blur", value);
      const newValue = isNumber ? Number(value) : value;
      setLayoutSettings({
        ...layoutSettings,
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

  useEffect(() => {
    setLayoutSettings(panelSettings);
  }, [
    panelSettings.x,
    panelSettings.y,
    panelSettings.width,
    panelSettings.height,
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-neutral-200">Layout</h2>
      </div>

      {/* Position */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-neutral-400">Position</label>
          <div className="mt-0.5 relative">
            <input
              type="text"
              value={layoutSettings.x}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
              onChange={(e) => {
                setLayoutSettings({
                  ...layoutSettings,
                  x: Number(e.target.value) as number | "Mixed",
                });
              }}
              onBlur={(e) => {
                handleBlur(e.target.value, "left");
              }}
            />
            <div className="w-3 h-3 text-xs text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              X
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mt-0.5 relative">
            <input
              type="text"
              value={layoutSettings.y}
              onChange={(e) => {
                setLayoutSettings({
                  ...layoutSettings,
                  y: Number(e.target.value) as number | "Mixed",
                });
              }}
              onBlur={(e) => {
                handleBlur(e.target.value, "top");
              }}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
            />
            <div className="w-3 h-3 text-xs text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              Y
            </div>{" "}
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-neutral-400">Dimensions</label>
          <div className="mt-0.5 relative">
            <input
              type="text"
              value={layoutSettings.width}
              onChange={(e) => {
                setLayoutSettings({
                  ...layoutSettings,
                  width: Number(e.target.value) as number | "Mixed",
                });
              }}
              onBlur={(e) => {
                handleBlur(e.target.value, "width");
              }}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
            />
            <div className="w-3 h-3 text-xs text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              W
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mt-0.5 relative">
            <input
              type="text"
              value={layoutSettings.height}
              onChange={(e) => {
                setLayoutSettings({
                  ...layoutSettings,
                  height: Number(e.target.value) as number | "Mixed",
                });
              }}
              onBlur={(e) => {
                handleBlur(e.target.value, "height");
              }}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
            />
            <div className="w-3 h-3 text-xs text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              H
            </div>{" "}
          </div>
        </div>
      </div>

      {!isImage && (
        <>
          {/* Resizing */}
          <div className="">
            <label className="text-xs text-neutral-400">Resizing</label>
            <div className="mt-0.5 flex gap-2">
              <div className="flex-1 flex items-center bg-neutral-700/50 h-7 p-1 rounded-md">
                <Button
                  size="icon"
                  className="size-6 flex-1 bg-zinc-800 border-none shadow-none hover:bg-neutral-800 text-neutral-200 hover:text-neutral-100"
                >
                  <ArrowRightFromLine className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
                >
                  <IconAutoHeight className="w-4 h-4" />
                </Button>
                {/* <Button
              variant="outline"
              size="icon"
              className="size-6 flex-1 bg-transparent border-none shadow-none hover:bg-transparent text-neutral-200 hover:text-neutral-100"
            >
              <AlignRight className="w-4 h-4" />
            </Button> */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
