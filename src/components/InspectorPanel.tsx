import { JSX } from "react";
import PageColorPicker from "./ui/PageColorPicker";

function InspectorPanel(): JSX.Element {
  return (
    <div className="fixed right-0 top-0 z-10 h-full w-68 bg-zinc-900 border-l border-zinc-800">
      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <h1 className="text-sm font-medium text-zinc-200">Page</h1>
          <div className="space-y-2">
            <PageColorPicker />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectorPanel;
