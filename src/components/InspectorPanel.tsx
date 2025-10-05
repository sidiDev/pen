import { JSX, useEffect, useState } from "react";
import ColorPickerHandler from "./ui/ColorPickerHandler";
import { TypographyPanel } from "@/components/TypographyPanel";
import { LayoutPanel } from "./LayoutPanel";
import { AppearancePanel } from "./AppearancePanel";
import { FillPanel } from "./FillPanel";
import { observer } from "mobx-react-lite";
import canvasStore from "@/utils/CanvasStore";
import * as fabric from "fabric";
import ImageFill from "./ImageFill";

export interface PanelSettings {
  alignment: string;
  lineHeight: number;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  textAlign: string;
  originY: string;
  fill: string | fabric.TFiller | null;
  opacity: number;
  left: number | "Mixed";
  top: number | "Mixed";
  width: number | "Mixed";
  height: number | "Mixed";
  charSpacing: number;
  borderRadius: {
    r: number;
    l: number;
    t: number;
    b: number;
  };
}

const InspectorPanel = observer(
  ({ canvas }: { canvas: fabric.Canvas | null }): JSX.Element => {
    const initialPanelSettings: PanelSettings = {
      alignment: "start",
      lineHeight: 0,
      fontSize: 0,
      fontWeight: 0,
      fontFamily: "",
      textAlign: "",
      originY: "",
      fill: "",
      opacity: 0,
      left: "Mixed",
      top: "Mixed",
      width: "Mixed",
      height: "Mixed",
      charSpacing: 0,
      borderRadius: {
        r: 0,
        l: 0,
        t: 0,
        b: 0,
      },
    };
    const [panelSettings, setPanelSettings] =
      useState<PanelSettings>(initialPanelSettings);

    const handlePageBgColorChange = (
      color: string,
      rgba: string,
      alpha: number
    ) => {
      document.body.style.backgroundColor = rgba;
      canvasStore.setCurrentPageBgColor(color, rgba, alpha);
    };

    const selectedLayerKey = canvasStore.selectedLayers
      .map((layer) => layer.id)
      .join("|");

    useEffect(() => {
      setPanelSettings(initialPanelSettings);
      if (canvasStore.selectedLayersCount == 1) {
        const selectedLayer = canvasStore.selectedLayers[0];
        const layer = canvas
          ?.getObjects()
          .find((obj) => (obj as any).id === selectedLayer.id);
        if (layer) {
          console.log(layer.fill);

          setPanelSettings((data) => ({
            ...data,
            left: Math.round(layer.left),
            top: Math.round(layer.top),
            width: Math.round((layer as any).getScaledWidth?.() ?? layer.width),
            height: Math.round(
              (layer as any).getScaledHeight?.() ?? layer.height
            ),
            borderRadius: {
              r: (layer as any)?.borderRadius?.r,
              l: (layer as any)?.borderRadius?.l,
              t: (layer as any)?.borderRadius?.t,
              b: (layer as any)?.borderRadius?.b,
            },
            fill: layer.fill,
            opacity: layer.opacity * 100,
            fontSize: (layer as any).fontSize,
            fontWeight: (layer as any).fontWeight,
            fontFamily: (layer as any).fontFamily,
            textAlign: (layer as any).textAlign,
            lineHeight: (layer as any).lineHeight,
            charSpacing: (layer as any).charSpacing,
          }));
        }
      }
    }, [canvasStore.selectedLayersCount, selectedLayerKey]);

    // Update position and size live while moving selected object
    useEffect(() => {
      if (!canvas) return;

      const handleObjectMoving = (e: any) => {
        if (canvasStore.selectedLayersCount !== 1) return;
        const target = e?.target as any;
        if (!target) return;
        const selectedId = canvasStore.selectedLayers[0]?.id;
        if (selectedId && target.id === selectedId) {
          setPanelSettings((data) => ({
            ...data,
            left: Math.round(target.left),
            top: Math.round(target.top),
            width: Math.round(target?.getScaledWidth?.() ?? target.width),
            height: Math.round(target?.getScaledHeight?.() ?? target.height),
          }));
        }
      };

      canvas.on("object:moving", handleObjectMoving);
      return () => {
        canvas.off("object:moving", handleObjectMoving);
      };
    }, [canvas, canvasStore.selectedLayersCount, selectedLayerKey]);

    // Update position and size live while creating/resizing via pointer drag
    useEffect(() => {
      if (!canvas) return;

      const updateFromTarget = (target: any) => {
        if (canvasStore.selectedLayersCount !== 1) return;
        if (!target) return;
        const selectedId = canvasStore.selectedLayers[0]?.id;
        if (selectedId && target.id === selectedId) {
          setPanelSettings((data) => ({
            ...data,
            left: Math.round(target.left),
            top: Math.round(target.top),
            width: Math.round(target?.getScaledWidth?.() ?? target.width),
            height: Math.round(target?.getScaledHeight?.() ?? target.height),
          }));
        }
      };

      const handleMouseMove = () => {
        // During creation we manually set width/height; reflect that here
        const active = canvas.getActiveObject() as any;
        updateFromTarget(active);
      };

      const handleObjectScaling = (e: any) => {
        updateFromTarget(e?.target as any);
      };

      canvas.on("mouse:move", handleMouseMove);
      canvas.on("object:scaling", handleObjectScaling);
      return () => {
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("object:scaling", handleObjectScaling);
      };
    }, [canvas, canvasStore.selectedLayersCount, selectedLayerKey]);

    // useEffect(() => {
    //   if (canvasStore.hasSelectedLayers) {
    //     const ids = new Set(
    //       canvasStore.selectedLayers.map((layer) => layer.id)
    //     );
    //     canvas?.getObjects().forEach((obj: any) => {
    //       if (ids.has(obj.id)) {
    //         console.log("obj", obj);
    //       }
    //     });
    //   }
    // }, [panelSettings, canvasStore.selectedLayers]);

    const isImage = canvasStore.selectedLayers[0]?.type === "image";

    return (
      <div className="fixed right-0 top-0 z-10 h-full w-68 bg-neutral-800 border-l border-neutral-700">
        <div className="p-4 space-y-6">
          {!canvasStore.hasSelectedLayers ? (
            <div className="space-y-4">
              <h1 className="text-xs font-medium text-neutral-200">Page</h1>
              <div className="space-y-2">
                <ColorPickerHandler
                  color={canvasStore.currentPage.backgroundColor.hex}
                  alpha={canvasStore.currentPage.backgroundColor.alpha}
                  onColorChange={handlePageBgColorChange}
                  label="Fill"
                  placeholder="000000"
                  className="w-full"
                  showAlpha={true}
                  showLabel={true}
                  showHexInput={true}
                  showPercentage={true}
                  popoverSide="left"
                  popoverAlign="start"
                  popoverClassName=" transform-y-20"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-neutral-700 [&>div]:pb-3">
              <LayoutPanel
                isMultiSelect={canvasStore.selectedLayersCount > 1}
                panelSettings={panelSettings}
                setPanelSettings={setPanelSettings}
                canvas={canvas}
                selectedLayers={canvasStore.selectedLayers.map(
                  (layer) => layer.id
                )}
                isImage={isImage}
              />
              {
                <AppearancePanel
                  panelSettings={panelSettings}
                  setPanelSettings={setPanelSettings}
                  selectedLayers={canvasStore.selectedLayers.map(
                    (layer) => layer.id
                  )}
                  isMultiSelect={canvasStore.selectedLayersCount > 1}
                  canvas={canvas}
                />
              }
              {!isImage && (
                <TypographyPanel
                  panelSettings={panelSettings}
                  setPanelSettings={setPanelSettings}
                  selectedLayers={canvasStore.selectedLayers.map(
                    (layer) => layer.id
                  )}
                  isMultiSelect={canvasStore.selectedLayersCount > 1}
                  canvas={canvas}
                />
              )}
              {!isImage && (
                <FillPanel
                  fill={panelSettings.fill as string}
                  opacity={panelSettings.opacity as number}
                  canvas={canvas}
                  canvasStore={canvasStore}
                />
              )}
              {isImage && (
                <ImageFill
                  imageUrl={
                    ((
                      canvas
                        ?.getObjects()
                        .find(
                          (obj: any) =>
                            obj.id === canvasStore.selectedLayers[0].id
                        ) as any
                    ).imageUrl as string) ||
                    ((
                      canvas
                        ?.getObjects()
                        .find(
                          (obj: any) =>
                            obj.id === canvasStore.selectedLayers[0].id
                        ) as any
                    ).src as string)
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default InspectorPanel;
