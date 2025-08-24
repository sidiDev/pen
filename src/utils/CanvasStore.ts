import { makeAutoObservable } from "mobx";
// import { observer } from "mobx-react-lite";

class CanvasStore {
  pages = [
    {
      id: "1",
      backgroundColor: {
        hex: "#fafafa",
        rgba: "RGBA(250, 250, 250, 1)",
        alpha: 1,
      },
      name: "Page 1",
      objects: [] as any[],
    },
  ];
  currentPageNumber = 0;
  selectedToolbarActionState: "cursor" | "text" | "frame" | "rectangle" =
    "cursor";

  constructor() {
    makeAutoObservable(this);
  }

  addObject(object: any) {
    this.currentPage.objects.push(object);
  }

  setSelectedToolbarAction(action: "cursor" | "text" | "frame" | "rectangle") {
    this.selectedToolbarActionState = action;
  }

  setUpdateObject({
    id,
    prop,
    value,
  }: {
    id: string;
    prop: string;
    value: any;
  }) {
    this.currentPage.objects.find((object) => object.id === id)[prop] = value;
  }

  get selectedToolbarAction() {
    return this.selectedToolbarActionState;
  }

  get currentLayers() {
    return this.currentPage.objects.map((item) => ({
      id: item?.id,
      name: item?.name || item?.text,
      type: item?.type,
      children: [],
    }));
  }

  get currentPage() {
    return this.pages[this.currentPageNumber];
  }

  setCurrentPageBgColor(color: string, rgba: string, alpha: number) {
    this.pages[this.currentPageNumber].backgroundColor.hex = color;
    this.pages[this.currentPageNumber].backgroundColor.rgba = rgba;
    this.pages[this.currentPageNumber].backgroundColor.alpha = alpha;
  }
}

export default new CanvasStore();
