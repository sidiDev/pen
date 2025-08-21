import { makeAutoObservable } from "mobx";
// import { observer } from "mobx-react-lite";

class CanvasStore {
  objects = [];
  selectedToolbarActionState: "cursor" | "text" | "frame" | "rectangle" =
    "cursor";

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedToolbarAction(action: "cursor" | "text" | "frame" | "rectangle") {
    this.selectedToolbarActionState = action;
  }

  get selectedToolbarAction() {
    return this.selectedToolbarActionState;
  }
}

export default new CanvasStore();
