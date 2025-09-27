import { useEffect, useState } from "react";
import * as fabric from "fabric";
import canvasStore from "@/utils/CanvasStore";
import { PanelSettings } from "./InspectorPanel";
import { Droplet, Square } from "lucide-react";

interface AppearancePanelProps {
  className?: string;
  panelSettings: PanelSettings;
  setPanelSettings: (settings: PanelSettings) => void;
  isMultiSelect: boolean;
  selectedLayers: string[];
  canvas: fabric.Canvas | null;
}

export function AppearancePanel({
  className,
  panelSettings,
  setPanelSettings,
  isMultiSelect,
  selectedLayers,
  canvas,
}: AppearancePanelProps) {
  const [appearanceSettings, setAppearanceSettings] = useState<{
    opacity: number | "Mixed";
    cornerRadius: {
      r: number;
      l: number;
      t: number;
      b: number;
    };
  }>({
    opacity: panelSettings.opacity,
    cornerRadius: panelSettings.borderRadius,
  });

  function handleBlur(value: string, property: "opacity" | "cornerRadius") {
    const trimmed = value.trim();
    const isNumber = trimmed !== "" && !Number.isNaN(Number(trimmed));

    if (trimmed === "" || (!isNumber && isMultiSelect)) {
      if (property === "opacity") {
        setAppearanceSettings({
          ...appearanceSettings,
          opacity: "Mixed",
        });
        setPanelSettings({
          ...panelSettings,
          opacity: "Mixed" as any,
        });
      }
      return;
    }

    if (!isNumber) return;

    let numericValue = Number(trimmed);
    if (property === "opacity") {
      if (Number.isNaN(numericValue)) numericValue = 0;
      numericValue = Math.max(0, Math.min(100, numericValue));
    }

    if (property === "opacity") {
      setAppearanceSettings({
        ...appearanceSettings,
        opacity: numericValue,
      });
      setPanelSettings({
        ...panelSettings,
        opacity: numericValue as number,
      });
    } else {
      const radius = Math.max(0, numericValue);
      setAppearanceSettings({
        ...appearanceSettings,
        cornerRadius: { r: radius, l: radius, t: radius, b: radius },
      });
      setPanelSettings({
        ...panelSettings,
        borderRadius: { r: radius, l: radius, t: radius, b: radius },
      });
    }

    const applyToLayer = (layerId: string) => {
      const layer = canvas
        ?.getObjects()
        .find((obj) => (obj as any).id === layerId) as any;

      if (!layer) {
        console.error("Layer not found:", layerId);
        return;
      }

      if (property === "opacity") {
        layer.set({ opacity: (numericValue as number) / 100 });
      } else {
        const radius = Math.max(0, numericValue);
        // For images, ensure clipPath exists and update it
        if (layer.type === "image" || layer.itemType === "image") {
          const clipPath = new fabric.Rect({
            width: layer.width / layer.scaleX,
            height: layer.height / layer.scaleY,
            rx: radius,
            ry: radius,
            originX: "center",
            originY: "center",
          });
          layer.set({ clipPath });
          // Mark the object as dirty to force re-render
          layer.dirty = true;
        }
      }
      layer.setCoords?.();
      canvas?.requestRenderAll();
    };

    const persistUpdates = (layerId: string) => {
      if (property === "opacity") {
        canvasStore.setUpdateObject({
          id: layerId,
          updates: { opacity: (numericValue as number) / 100 },
        });
      } else {
        const radius = Math.max(0, numericValue);
        canvasStore.setUpdateObject({
          id: layerId,
          updates: {
            borderRadius: { r: radius, l: radius, t: radius, b: radius },
          },
        });
      }
    };

    if (isMultiSelect) {
      selectedLayers.forEach((layerId) => {
        applyToLayer(layerId);
        persistUpdates(layerId);
      });
    } else if (selectedLayers[0]) {
      const layerId = selectedLayers[0];
      applyToLayer(layerId);
      persistUpdates(layerId);
    }
  }

  useEffect(() => {
    setAppearanceSettings({
      opacity: panelSettings.opacity,
      cornerRadius: panelSettings.borderRadius,
    });
  }, [panelSettings.opacity, panelSettings.borderRadius]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-neutral-200">Appearance</h2>
      </div>

      <div className="flex gap-2 items-end">
        {/* Opacity */}
        <div className="flex-1">
          <label className="text-xs text-neutral-400">Opacity</label>
          <div className="mt-0.5 relative">
            <input
              type="number"
              value={appearanceSettings.opacity}
              onChange={(e) => {
                const v = e.target.value;
                setAppearanceSettings({
                  ...appearanceSettings,
                  opacity: (v === "" ? ("" as any) : (Number(v) as any)) as any,
                });
                // Apply changes in real-time for better UX
                const n = Number(v);
                if (!Number.isNaN(n) && n >= 0 && n <= 100) {
                  handleBlur(v, "opacity");
                }
              }}
              onBlur={(e) => handleBlur(e.target.value, "opacity")}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
            />
            <Droplet className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Corner radius */}
        <div className="flex-1">
          <label className="text-xs text-neutral-400">Corner radius</label>
          <div className="mt-0.5 relative">
            <input
              type="number"
              value={appearanceSettings.cornerRadius.r}
              onChange={(e) => {
                const v = e.target.value;
                const n = v === "" ? 0 : Number(v);
                const radius = Math.max(0, Number.isNaN(n) ? 0 : n);
                setAppearanceSettings({
                  ...appearanceSettings,
                  cornerRadius: { r: radius, l: radius, t: radius, b: radius },
                });
                // Apply changes in real-time for better UX
                if (!Number.isNaN(n) && n >= 0) {
                  handleBlur(e.target.value, "cornerRadius");
                }
              }}
              onBlur={(e) => handleBlur(e.target.value, "cornerRadius")}
              className="w-full h-7 px-3 py-2 pl-8 bg-neutral-700/50 border border-neutral-700 rounded-md text-neutral-200 text-xs focus:outline-none hover:border-neutral-500 focus:border-neutral-500 transition-all duration-200"
            />
            <Square className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
