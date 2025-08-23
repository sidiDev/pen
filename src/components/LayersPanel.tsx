import { JSX, useState } from "react";
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
} from "lucide-react";
import Tooltip from "@/components/ui/tooltip-custom";
import canvasStore from "@/utils/CanvasStore";
import { observer } from "mobx-react-lite";
import * as fabric from "fabric";

// Define layer types
interface Layer {
  id: string;
  name: string;
  type: "frame" | "text" | "image" | "group";
  children?: Layer[];
  content?: string;
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
const sampleLayers: Layer[] = [
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
function LayerItem({ layer, depth = 0 }: { layer: Layer; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = layer.children && layer.children.length > 0;

  const getIcon = (type: Layer["type"]) => {
    switch (type) {
      case "frame":
        return <Hash className="size-3.5 text-zinc-400" />;
      case "text":
        return <Type className="size-3.5 text-zinc-400" />;
      case "image":
        return <Image className="size-3.5 text-zinc-400" />;
      case "group":
        return <Frame className="size-3.5 text-zinc-400" />;
      default:
        return <Frame className="size-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="w-full">
      <div
        className="flex justify-start items-center gap-2 py-1.5 hover:bg-zinc-800 group rounded-md"
        // style={{ paddingLeft: `${16 + depth * 16}px` }}
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
              <ChevronDown className="size-3 text-zinc-400" />
            ) : (
              <ChevronRight className="size-3 text-zinc-400" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w--5" />}
        {getIcon(layer.type)}
        <span className="text-zinc-300 text-xs truncate">{layer.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="pt-2 space-y-2">
          {layer.children!.map((child) => (
            <LayerItem key={child.id} layer={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

const LayersPanel = observer(({ canvas }: { canvas: fabric.Canvas | null }) => {
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);

  return (
    <div className="fixed z-10 h-full w-70 bg-zinc-900 border-r border-zinc-800">
      <div className="flex h-full">
        <div className="flex-1">
          {/* Pages Section */}
          <div className="flex-1 py-3.5">
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
                    <ChevronDown className="size-3 text-zinc-400" />
                  ) : (
                    <ChevronRight className="size-3 text-zinc-400" />
                  )}
                </div>
                <h1 className="text-zinc-300 text-xs">Pages</h1>
              </button>
            </div>
            {isPagesExpanded && (
              <div className="px-2 pt-2">
                <Button className="text-xs font-normal hover:bg-zinc-800 w-full block text-left pl-8">
                  Page 1
                </Button>
              </div>
            )}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-4 border-t border-zinc-800">
            <h1 className="text-zinc-300 px-0 text-xs">Layers</h1>
          </div>

          {/* Layers Tree */}
          <div className="flex-1 overflow-y-auto px-2 space-y-2">
            {sampleLayers.map((layer) => (
              <LayerItem key={layer.id} layer={layer} />
            ))}
          </div>
        </div>

        {/* Actions Panel */}
        <div className="flex flex-col justify-center items-center h-full border-l border-zinc-800 p-1 space-y-1">
          {toolbarActions.map((action) => (
            <Tooltip key={action.id} content={action.id} side="right">
              <Button
                onClick={() => {
                  canvasStore.setSelectedToolbarAction(action.id);
                }}
                className={`hover:bg-zinc-800 size-9 text-zinc-300 ${
                  canvasStore.selectedToolbarAction === action.id
                    ? "bg-zinc-800"
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
  );
});

export default LayersPanel;
