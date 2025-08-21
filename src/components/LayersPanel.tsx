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

// Define layer types
interface Layer {
  id: string;
  name: string;
  type: "frame" | "text" | "image" | "group";
  children?: Layer[];
  content?: string;
}

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
        return <Hash className="size-4 text-zinc-400" />;
      case "text":
        return <Type className="size-4 text-zinc-400" />;
      case "image":
        return <Image className="size-4 text-zinc-400" />;
      case "group":
        return <Frame className="size-4 text-zinc-400" />;
      default:
        return <Frame className="size-4 text-zinc-400" />;
    }
  };

  return (
    <div className="w-full">
      <div
        className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 cursor-pointer group"
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-none hover:bg-zinc-700 rounded p-0.5"
          >
            {isExpanded ? (
              <ChevronDown className="size-3 text-zinc-400" />
            ) : (
              <ChevronRight className="size-3 text-zinc-400" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        {getIcon(layer.type)}
        <span className="text-zinc-300 text-xs truncate">{layer.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {layer.children!.map((child) => (
            <LayerItem key={child.id} layer={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function LayersPanel(): JSX.Element {
  return (
    <div className="fixed z-10 h-full w-78 bg-zinc-900 border-r border-zinc-800">
      <div className="flex h-full">
        <div className="flex-1">
          {/* Pages Section */}
          <div className="flex-1 py-4">
            <h1 className="text-zinc-300 px-5 text-xs">Pages</h1>
            <div className="px-2 py-4 border-b border-zinc-800">
              <Button className="text-xs font-normal hover:bg-zinc-800 w-full block text-left">
                Page 1
              </Button>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h1 className="text-zinc-300 px-0 text-xs">Layers</h1>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-zinc-800 size-6 p-0 text-zinc-400"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>

          {/* Layers Tree */}
          <div className="flex-1 overflow-y-auto">
            {sampleLayers.map((layer) => (
              <LayerItem key={layer.id} layer={layer} />
            ))}
          </div>
        </div>

        {/* Actions Panel */}
        <div className="flex flex-col justify-center items-center h-full border-l border-zinc-800 p-1">
          <Tooltip content="Mouse" side="right">
            <Button className="hover:bg-zinc-800 size-9 text-zinc-300">
              <MousePointer2 className="flex-none size-5" />
            </Button>
          </Tooltip>
          <Tooltip content="Frame" side="right">
            <Button className="hover:bg-zinc-800 size-9 text-zinc-300">
              <Frame className="flex-none size-5" />
            </Button>
          </Tooltip>
          <Tooltip content="Rectangle" side="right">
            <Button className="hover:bg-zinc-800 size-9 text-zinc-300">
              <Square className="flex-none size-5" />
            </Button>
          </Tooltip>
          <Tooltip content="Text" side="right">
            <Button className="hover:bg-zinc-800 size-9 text-zinc-300">
              <Type className="flex-none size-5" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default LayersPanel;
