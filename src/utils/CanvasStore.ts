import { makeAutoObservable } from "mobx";
import * as fabric from "fabric";
// import { observer } from "mobx-react-lite";

export interface IPage {
  id: string;
  backgroundColor: {
    hex: string;
    rgba: string;
    alpha: number;
  };
  name: string;
  objects: Record<string, any>[];
}
class CanvasStore {
  pages: IPage[] = [
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
  selectedLayers = [] as { type: string; id: string }[];
  hoveredLayer = null as fabric.FabricObject | null;
  selectedToolbarActionState:
    | "cursor"
    | "text"
    | "frame"
    | "rectangle"
    | "image" = "cursor";
  zoom = 1;
  isPanning = false;
  selectedImage = {
    name: "" as string | null,
    url: null as string | null,
  };
  private updateObjectTimeout: ReturnType<typeof setTimeout> | null = null;
  private updateListeners = new Set<(pages: IPage[]) => void>();

  constructor() {
    makeAutoObservable(this);
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
  }

  setIsPanning(isPanning: boolean) {
    this.isPanning = isPanning;
  }

  addObject(object: any) {
    this.currentPage.objects.unshift(object);
  }

  setSelectedToolbarAction(
    action: "cursor" | "text" | "frame" | "rectangle" | "image"
  ) {
    this.selectedToolbarActionState = action;
  }

  setSelectedImage(image: { name: string; url: string | null }) {
    this.selectedImage = image;
  }

  setEmptySelectedLayers() {
    this.selectedLayers = [];
  }

  clearAllSelections() {
    this.selectedLayers = [];
  }

  setSelectedLayer(layer: { type: string; id: string }) {
    const isLayerExist = this.selectedLayers.some(
      (item) => item.id === layer.id
    );

    console.log(isLayerExist);

    if (!isLayerExist) {
      this.selectedLayers.push(layer);
    }
  }

  setSelectedLayers(layers: { type: string; id: string }[]) {
    this.selectedLayers = layers;
  }

  toggleSelectedLayer(layer: { type: string; id: string }) {
    const existingIndex = this.selectedLayers.findIndex(
      (item) => item.id === layer.id
    );

    if (existingIndex >= 0) {
      // Remove if already selected
      this.selectedLayers.splice(existingIndex, 1);
    } else {
      // Add if not selected
      this.selectedLayers.push(layer);
    }
  }

  setUnselectLayer(ids: string[]) {
    this.selectedLayers = this.selectedLayers.filter(
      (item) => !ids.includes(item.id)
    );
  }

  setUpdateObject({ id, updates }: { id: string; updates: Object }) {
    this.currentPage.objects = this.currentPage.objects.map((item) => {
      if (item.id == id) {
        return { ...item, ...updates };
      }

      if (item.children && item.children.length > 0) {
        this.setUpdateObject({ id, updates });
      }
      return item;
    });
    this.scheduleDebouncedUpdate();
  }

  private scheduleDebouncedUpdate() {
    if (this.updateObjectTimeout) {
      clearTimeout(this.updateObjectTimeout);
    }
    this.updateObjectTimeout = setTimeout(() => {
      console.log("Updating Object");
      for (const listener of this.updateListeners) {
        try {
          listener(this.allPages);
        } catch (error) {
          console.error("Debounced update listener error", error);
        }
      }
      this.updateObjectTimeout = null;
    }, 1000);
  }

  onDebouncedUpdate(listener: (pages: IPage[]) => void) {
    this.updateListeners.add(listener);
    return () => this.updateListeners.delete(listener);
  }

  setHoveredLayer(layer: fabric.FabricObject) {
    this.hoveredLayer = layer;
  }

  setUpdatePages(pages: any[]) {
    this.pages = pages;
  }

  getLayerById(id: string) {
    return this.selectedLayers.filter((item) => item.id == id);
  }

  get selectedToolbarAction() {
    return this.selectedToolbarActionState;
  }

  get selectedLayersCount() {
    return this.selectedLayers.length;
  }

  get hasSelectedLayers() {
    return this.selectedLayers.length > 0;
  }

  isLayerSelected(layerId: string): boolean {
    return this.selectedLayers.some((layer) => layer.id === layerId);
  }

  get currentLayers() {
    return this.currentPage.objects.map((item) => ({
      id: item?.id,
      name: item?.name || item?.text,
      type: item?.type,
      children: [],
    }));
  }

  get allPages() {
    return this.pages;
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
