import { JSX, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Frame,
  MousePointer2,
  Square,
  Type,
  MoreHorizontal,
  Image,
  Hash,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Tooltip from "@/components/ui/tooltip-custom";
import canvasStore from "@/utils/CanvasStore";
import { observer } from "mobx-react-lite";
import * as fabric from "fabric";
import { toJS } from "mobx";
import { useNavigate } from "react-router";

// Define layer types
interface Layer {
  id: string;
  name: string;
  type: "frame" | "text" | "image" | "group";
  children: any[];
}

const toolbarActions: {
  id: "cursor" | "text" | "frame" | "rectangle";
  icon: React.ReactNode;
}[] = [
  {
    id: "cursor",
    icon: <MousePointer2 className="flex-none size-5" />,
  },
  {
    id: "frame",
    icon: <Frame className="flex-none size-5" />,
  },
  {
    id: "rectangle",
    icon: <Square className="flex-none size-5" />,
  },
  {
    id: "text",
    icon: <Type className="flex-none size-5" />,
  },
];

// Sample data structure
const sampleLayers = [
  {
    id: "1",
    name: "01 1",
    type: "image",
    children: [],
  },
  {
    id: "2",
    name: "MacBook Air - 1",
    type: "frame",
    children: [
      {
        id: "2.1",
        name: "واجهة سهلة الاستخدام",
        type: "text",
        content: "واجهة سهلة الاستخدام",
      },
      {
        id: "2.2",
        name: "Frame 70233",
        type: "frame",
        children: [],
      },
      {
        id: "2.3",
        name: "android",
        type: "frame",
        children: [],
      },
    ],
  },
];

// Layer item component
const LayerItem = observer(
  ({
    layer,
    depth = 0,
    onSelect,
    idx,
  }: {
    layer: Layer;
    depth?: number;
    onSelect: (id: string) => void;
    idx: number;
  }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = layer.children && layer.children.length > 0;

    const getIcon = (type: Layer["type"]) => {
      switch (type) {
        case "frame":
          return <Hash className="size-3.5 text-neutral-400" />;
        case "text":
          return <Type className="size-3.5 text-neutral-400" />;
        case "image":
          return <Image className="size-3.5 text-neutral-400" />;
        case "group":
          return <Frame className="size-3.5 text-neutral-400" />;
        default:
          return <Frame className="size-3.5 text-neutral-400" />;
      }
    };

    return (
      <div className="w-full">
        <div
          id={`layer-element-${idx}`}
          data-selected={canvasStore.getLayerById(layer.id).length > 0}
          className="layer-element flex justify-start items-center gap-2 py-1.5 hover:bg-neutral-700/50 group rounded-md data-[selected=true]:bg-neutral-700"
          // style={{ paddingLeft: `${16 + depth * 16}px` }}
          onClick={() => onSelect(layer.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex-none ml-2"
            >
              {isExpanded ? (
                <ChevronDown className="size-3 text-neutral-400" />
              ) : (
                <ChevronRight className="size-3 text-neutral-400" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w--5" />}
          {getIcon(layer.type)}
          <span className="text-neutral-300 text-xs truncate">
            {layer.type == "text" ? layer.name || "Text" : layer.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="pt-2">
            {layer.children!.map((child, idx) => (
              <LayerItem
                onSelect={onSelect}
                key={child.id}
                layer={child}
                depth={depth + 1}
                idx={idx}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

const LayersPanel = observer(({ canvas }: { canvas: fabric.Canvas | null }) => {
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);
  const [keyDownName, setKeyDownName] = useState("");
  const navigate = useNavigate();

  function selectLayer(id: string) {
    const layer: any = canvas?.getObjects().find((el) => (el as any).id === id);
    if (!layer) return;

    if (keyDownName !== "Meta") {
      console.log("SINGLE SELECTION - Clearing all and selecting:", layer.id);
      // Single selection: clear all and select only this layer
      canvasStore.setSelectedLayers([{ id: layer.id, type: layer.itemType }]);
      canvas?.setActiveObject(layer);
    } else {
      console.log("MULTI SELECTION - Toggling:", layer.id);
      // Multi selection: toggle the layer selection
      canvasStore.toggleSelectedLayer({ id: layer.id, type: layer.itemType });

      // Update canvas active objects based on all selected layers
      const selectedObjects = canvasStore.selectedLayers
        .map((selected) =>
          canvas?.getObjects().find((obj: any) => obj.id === selected.id)
        )
        .filter((obj): obj is any => obj !== undefined);

      if (selectedObjects.length > 0) {
        if (selectedObjects.length === 1) {
          canvas?.setActiveObject(selectedObjects[0]);
        } else {
          console.log(selectedObjects);

          // Create a selection group for multiple objects
          if (canvas) {
            const selectionGroup = new fabric.ActiveSelection(selectedObjects, {
              canvas: canvas,
            });
            canvas.setActiveObject(selectionGroup);
          }
        }
      }
    }

    // Unselect all layers
    if (canvasStore.selectedLayers.length == 0) {
      canvas?.discardActiveObject();
      canvasStore.setEmptySelectedLayers();
    }
    canvas?.renderAll();

    console.log("Current selected layers:", canvasStore.selectedLayers);
  }

  console.log("selectedLayers", toJS(canvasStore.selectedLayers));
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      setKeyDownName(e.key);
    });
    window.addEventListener("keyup", () => {
      setKeyDownName("");
    });
  }, []);

  useEffect(() => {
    // Handle radius in layers elements
    const layerEls = document.querySelectorAll(".layer-element");
    if (canvasStore.selectedLayers.length > 0) {
      layerEls.forEach((el, idx) => {
        if (el && layerEls[idx + 1]) {
          el.classList.remove("rounded-b-none");
          layerEls[idx + 1].classList.remove("rounded-t-none");
        }
        if (
          el &&
          el.getAttribute("data-selected") == "true" &&
          layerEls[idx + 1] &&
          layerEls[idx + 1].getAttribute("data-selected") == "true"
        ) {
          el.classList.add("rounded-b-none");
          layerEls[idx + 1].classList.add("rounded-t-none");
        }
      });
    } else {
      layerEls.forEach((el, idx) => {
        if (el && layerEls[idx + 1]) {
          el.classList.remove("rounded-b-none");
          layerEls[idx + 1].classList.remove("rounded-t-none");
        }
      });
    }
  }, [toJS(canvasStore.selectedLayers)]);

  return (
    <div className="fixed z-10 h-full w-68 bg-neutral-800 border-r border-neutral-700">
      <div className="flex h-full">
        <div className="flex-1">
          {/* Pages Section */}
          <div className="flex-1 py-3">
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPagesExpanded(!isPagesExpanded);
                }}
                className="inline-flex gap-2 items-center px-5"
              >
                <div className="">
                  {isPagesExpanded ? (
                    <ChevronDown className="size-3 text-neutral-400" />
                  ) : (
                    <ChevronRight className="size-3 text-neutral-400" />
                  )}
                </div>
                <h1 className="text-neutral-300 text-xs">Pages</h1>
              </button>
            </div>
            {isPagesExpanded && (
              <div className="px-2 pt-2">
                <Button className="text-xs font-normal bg-neutral-700 hover:bg-neutral-700 w-full block text-left pl-8">
                  Page 1
                </Button>
              </div>
            )}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-4 border-t border-neutral-700">
            <h1 className="text-neutral-300 px-0 text-xs">Layers</h1>
          </div>

          {/* Layers Tree */}
          <div className="flex-1 overflow-y-auto px-2">
            {toJS(canvasStore.currentLayers).map((layer, idx) => (
              <LayerItem
                onSelect={selectLayer}
                key={layer.id}
                layer={layer}
                idx={idx}
              />
            ))}
          </div>
        </div>

        {/* Actions Panel */}
        <div className="flex flex-col items-center h-full border-l border-neutral-700 py-3">
          <Menubar className="bg-neutral-800 border-none">
            <MenubarMenu>
              <MenubarTrigger className="text-neutral-300 focus:text-neutral-300 bg-neutral-800 focus:bg-neutral-800 border-none ring-0 ring-offset-0 hover:bg-neutral-700 data-[state=open]:bg-neutral-700 data-[state=open]:text-neutral-300">
                <LayoutGrid className="size-5" />
              </MenubarTrigger>
              <MenubarContent
                sideOffset={4}
                className="bg-neutral-800 border-neutral-700 ml-1"
              >
                <MenubarItem onClick={() => navigate("/")}>
                  Back to files
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Place image</MenubarItem>
                <MenubarItem>Share</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="flex-1 justify-self-center flex flex-col justify-center items-center p-1 space-y-1">
            {toolbarActions.map((action) => (
              <Tooltip key={action.id} content={action.id} side="right">
                <Button
                  onClick={() => {
                    canvasStore.setSelectedToolbarAction(action.id);
                  }}
                  className={`bg-neutral-800 hover:bg-neutral-700 size-9 text-neutral-300 ${
                    canvasStore.selectedToolbarAction === action.id
                      ? "bg-neutral-700"
                      : ""
                  }`}
                >
                  {action.icon}
                </Button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default LayersPanel;
