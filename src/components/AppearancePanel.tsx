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
    cornerRadius: number | "Mixed";
  }>({
    opacity: panelSettings.opacity,
    cornerRadius: "Mixed",
  });

  function handleBlur(value: string, property: "opacity" | "cornerRadius") {
    const isNumber = value.match(/^\d+$/) !== null;

    if (value === "" || (!isNumber && isMultiSelect)) {
      setAppearanceSettings({
        ...appearanceSettings,
        [property]: "Mixed",
      });
      if (property === "opacity") {
        setPanelSettings({
          ...panelSettings,
          opacity: "Mixed" as any,
        });
      }
      return;
    }

    if (!isMultiSelect && isNumber) {
      let numericValue = Number(value);
      if (property === "opacity") {
        if (Number.isNaN(numericValue)) numericValue = 0;
        numericValue = Math.max(0, Math.min(100, numericValue));
      }

      setAppearanceSettings({
        ...appearanceSettings,
        [property]: numericValue,
      });

      if (property === "opacity") {
        const normalized = (numericValue as number) / 100;
        setPanelSettings({
          ...panelSettings,
          opacity: normalized as number,
        });
      }

      if (isMultiSelect) {
        selectedLayers.forEach((layerId) => {
          const updates: Record<string, any> =
            property === "opacity"
              ? { opacity: (numericValue as number) / 100 }
              : { rx: numericValue, ry: numericValue };
          canvasStore.setUpdateObject({ id: layerId, updates });
        });
      } else {
        const targetId = selectedLayers[0];
        const layer = canvas
          ?.getObjects()
          .find((obj) => (obj as any).id === targetId) as any;

        if (layer) {
          if (property === "opacity") {
            layer.set({ opacity: (numericValue as number) / 100 });
          } else {
            // fabric objects commonly use rx/ry for corner radii
            layer.set({ rx: numericValue, ry: numericValue });
          }
          layer.setCoords?.();
          canvas?.renderAll();
        }

        const updates: Record<string, any> =
          property === "opacity"
            ? { opacity: (numericValue as number) / 100 }
            : { rx: numericValue, ry: numericValue };
        canvasStore.setUpdateObject({ id: targetId, updates });
      }
    }
  }

  useEffect(() => {
    // Sync opacity directly from panelSettings
    // Corner radius is read from the fabric object when possible
    let cornerRadius: number | "Mixed" = "Mixed";
    if (!isMultiSelect && selectedLayers.length === 1) {
      const targetId = selectedLayers[0];
      const layer = canvas
        ?.getObjects()
        .find((obj) => (obj as any).id === targetId) as any;
      if (layer) {
        const rx = (layer as any).rx ?? (layer as any).cornerRadius;
        if (typeof rx === "number") cornerRadius = Math.round(rx);
      }
    }

    const opacityDisplay =
      typeof (panelSettings as any).opacity === "number"
        ? Math.round(((panelSettings as any).opacity as number) * 100)
        : ("Mixed" as any);

    setAppearanceSettings({
      opacity: opacityDisplay as any,
      cornerRadius,
    });
  }, [panelSettings.opacity, isMultiSelect, selectedLayers.join(","), canvas]);

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
              type="text"
              value={appearanceSettings.opacity}
              onChange={(e) => {
                setAppearanceSettings({
                  ...appearanceSettings,
                  opacity: (e.target.value === ""
                    ? ("" as any)
                    : (Number(e.target.value) as any)) as any,
                });
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
              type="text"
              value={appearanceSettings.cornerRadius}
              onChange={(e) => {
                setAppearanceSettings({
                  ...appearanceSettings,
                  cornerRadius: (e.target.value === ""
                    ? ("" as any)
                    : (Number(e.target.value) as any)) as any,
                });
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
