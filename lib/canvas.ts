import { fabric } from "fabric";
import { v4 as uuid4 } from "uuid";

import {
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasObjectModified,
  CanvasObjectScaling,
  CanvasPathCreated,
  CanvasSelectionCreated,
  CustomFabricObject,
  RenderCanvas,
} from "@/types/type";
import { defaultNavElement } from "@/constants";
import {
  FABRIC_CUSTOM_PROPS,
  addConnectorDecorations,
  createSpecificShape,
  getConnectorArrowHead,
  getSidePoint,
  normalizeSerializedFabricObject,
  styleFreeformPath,
} from "./shapes";

const VIEWPORT_STORAGE_KEY = "figpro:viewport";
const SNAP_THRESHOLD = 8;

type GuideLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const getGuideStore = (canvas: fabric.Canvas): GuideLine[] => {
  const canvasWithGuides = canvas as fabric.Canvas & { __snapGuides?: GuideLine[] };
  if (!canvasWithGuides.__snapGuides) canvasWithGuides.__snapGuides = [];
  return canvasWithGuides.__snapGuides;
};

const setGuideStore = (canvas: fabric.Canvas, guides: GuideLine[]) => {
  const canvasWithGuides = canvas as fabric.Canvas & { __snapGuides?: GuideLine[] };
  canvasWithGuides.__snapGuides = guides;
};

const getCanvasPoint = (canvas: fabric.Canvas, point: fabric.Point) => {
  const viewport = canvas.viewportTransform;
  if (!viewport) return point;
  return fabric.util.transformPoint(point, viewport);
};

const attachConnectorRendering = (object: fabric.Object) => {
  const customObject = object as CustomFabricObject<fabric.Object>;
  if (!customObject.isConnector) return;
  addConnectorDecorations(object);
};

const getPreviewStore = (canvas: fabric.Canvas) => {
  const canvasWithPreview = canvas as fabric.Canvas & { __connectorPreviewId?: string | null };
  return canvasWithPreview;
};

export const setConnectorPreviewTarget = (canvas: fabric.Canvas | null, objectId: string | null) => {
  if (!canvas) return;
  getPreviewStore(canvas).__connectorPreviewId = objectId;
  canvas.requestRenderAll();
};

export const saveCanvasViewport = (canvas: fabric.Canvas | null) => {
  if (!canvas || typeof window === "undefined") return;
  const viewportTransform = canvas.viewportTransform;
  if (!viewportTransform) return;

  window.localStorage.setItem(
    VIEWPORT_STORAGE_KEY,
    JSON.stringify({
      zoom: canvas.getZoom(),
      viewportTransform,
    })
  );
};

const restoreCanvasViewport = (canvas: fabric.Canvas) => {
  if (typeof window === "undefined") return;

  const rawViewport = window.localStorage.getItem(VIEWPORT_STORAGE_KEY);
  if (!rawViewport) return;

  try {
    const parsedViewport = JSON.parse(rawViewport);
    if (Array.isArray(parsedViewport?.viewportTransform) && parsedViewport.viewportTransform.length === 6) {
      canvas.setViewportTransform(parsedViewport.viewportTransform);
      if (typeof parsedViewport.zoom === "number") canvas.setZoom(parsedViewport.zoom);
    }
  } catch {
    window.localStorage.removeItem(VIEWPORT_STORAGE_KEY);
  }
};

export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  const canvasElement = document.getElementById("canvas");
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
    preserveObjectStacking: true,
    selectionFullyContained: false,
    selectionColor: "rgba(111,238,255,0.08)",
    selectionBorderColor: "#6FEEFF",
    selectionDashArray: [8, 6],
    fireRightClick: true,
    stopContextMenu: true,
  });

  fabric.Object.prototype.set({
    transparentCorners: false,
    cornerStyle: "circle",
    cornerColor: "#56FFA6",
    cornerStrokeColor: "#0f1319",
    borderColor: "#56FFA6",
    borderDashArray: [6, 6],
    borderScaleFactor: 1.6,
    cornerSize: 14,
    padding: 8,
  });

  fabric.ActiveSelection.prototype.set({
    borderColor: "#6FEEFF",
    cornerColor: "#56FFA6",
    borderDashArray: [8, 6],
  });

  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.width = 3.5;
  canvas.freeDrawingBrush.color = "#DCE7FF";
  canvas.freeDrawingBrush.decimate = 2;
  canvas.freeDrawingCursor = "crosshair";

  fabricRef.current = canvas;
  restoreCanvasViewport(canvas);
  return canvas;
};

export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
}: CanvasMouseDown) => {
  const pointer = canvas.getPointer(options.e);
  const target = canvas.findTarget(options.e, false);
  canvas.isDrawingMode = false;

  if (!selectedShapeRef.current || selectedShapeRef.current === "select" || selectedShapeRef.current === "hand") {
    isDrawing.current = false;
    return;
  }

  if (selectedShapeRef.current === "freeform") {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    return;
  }

  if (target && (target.type === selectedShapeRef.current || target.type === "activeSelection")) {
    isDrawing.current = false;
    canvas.setActiveObject(target);
    target.setCoords();
    return;
  }

  isDrawing.current = true;
  shapeRef.current = createSpecificShape(selectedShapeRef.current, pointer as any);
  if (shapeRef.current) {
    attachConnectorRendering(shapeRef.current);
    canvas.add(shapeRef.current);
  }
};

export const handleCanvaseMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMouseMove) => {
  if (!isDrawing.current) return;
  if (selectedShapeRef.current === "freeform") return;

  canvas.isDrawingMode = false;
  const pointer = canvas.getPointer(options.e);

  switch (selectedShapeRef?.current) {
    case "rectangle":
    case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case "circle":
      shapeRef.current?.set({
        radius: Math.max(Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2, 16),
      });
      break;
    case "line":
    case "connector":
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;
    case "image":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    default:
      break;
  }

  canvas.renderAll();
  if ((shapeRef.current as CustomFabricObject<fabric.Object>)?.objectId) syncShapeInStorage(shapeRef.current);
};

export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: CanvasMouseUp) => {
  isDrawing.current = false;
  if (selectedShapeRef.current === "freeform") return;

  syncShapeInStorage(shapeRef.current);
  shapeRef.current = null;
  activeObjectRef.current = null;
  selectedShapeRef.current = null;

  if (!canvas.isDrawingMode) {
    setTimeout(() => {
      setActiveElement(defaultNavElement);
    }, 520);
  }
};

export const handleCanvasObjectModified = ({ options, syncShapeInStorage }: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;
  if (target.type === "activeSelection") return;
  syncShapeInStorage(target);
};

export const handlePathCreated = ({ options, syncShapeInStorage }: CanvasPathCreated) => {
  const path = options.path as CustomFabricObject<fabric.Path>;
  if (!path) return;

  path.set({ objectId: uuid4() });
  styleFreeformPath(path);
  syncShapeInStorage(path);
};

export const handleCanvasObjectMoving = ({ options }: { options: fabric.IEvent }) => {
  const target = options.target as fabric.Object;
  if (!target) return;
  const canvas = target.canvas as fabric.Canvas;
  if (!canvas) return;

  const customTarget = target as CustomFabricObject<fabric.Object>;
  if (customTarget.isConnector) return;

  const activeObjects = canvas.getObjects().filter((obj) => !(obj as CustomFabricObject<fabric.Object>).isConnector);
  const zoom = canvas.getZoom() || 1;
  const threshold = SNAP_THRESHOLD / zoom;
  const guides: GuideLine[] = [];
  const activeBounds = target.getBoundingRect(true, true);
  const targetLeft = activeBounds.left;
  const targetRight = activeBounds.left + activeBounds.width;
  const targetTop = activeBounds.top;
  const targetBottom = activeBounds.top + activeBounds.height;
  const targetCenterX = activeBounds.left + activeBounds.width / 2;
  const targetCenterY = activeBounds.top + activeBounds.height / 2;
  let snappedLeft = target.left ?? 0;
  let snappedTop = target.top ?? 0;

  const canvasCenterX = (canvas.getWidth() / 2 - (canvas.viewportTransform?.[4] || 0)) / zoom;
  const canvasCenterY = (canvas.getHeight() / 2 - (canvas.viewportTransform?.[5] || 0)) / zoom;

  const snapToX = (candidate: number, source: "left" | "center" | "right") => {
    const distance =
      source === "left" ? Math.abs(targetLeft - candidate) : source === "center" ? Math.abs(targetCenterX - candidate) : Math.abs(targetRight - candidate);
    if (distance > threshold) return;
    if (source === "left") snappedLeft = candidate;
    else if (source === "center") snappedLeft += candidate - targetCenterX;
    else snappedLeft += candidate - targetRight;
  };

  const snapToY = (candidate: number, source: "top" | "middle" | "bottom") => {
    const distance =
      source === "top" ? Math.abs(targetTop - candidate) : source === "middle" ? Math.abs(targetCenterY - candidate) : Math.abs(targetBottom - candidate);
    if (distance > threshold) return;
    if (source === "top") snappedTop = candidate;
    else if (source === "middle") snappedTop += candidate - targetCenterY;
    else snappedTop += candidate - targetBottom;
  };

  snapToX(canvasCenterX, "center");
  if (Math.abs(targetCenterX - canvasCenterX) <= threshold) guides.push({ x1: canvasCenterX, y1: -10000, x2: canvasCenterX, y2: 10000 });
  snapToY(canvasCenterY, "middle");
  if (Math.abs(targetCenterY - canvasCenterY) <= threshold) guides.push({ x1: -10000, y1: canvasCenterY, x2: 10000, y2: canvasCenterY });

  activeObjects.forEach((obj) => {
    if (obj === target) return;
    const bounds = obj.getBoundingRect(true, true);
    const boundsLeft = bounds.left;
    const boundsRight = bounds.left + bounds.width;
    const boundsTop = bounds.top;
    const boundsBottom = bounds.top + bounds.height;
    const boundsCenterX = bounds.left + bounds.width / 2;
    const boundsCenterY = bounds.top + bounds.height / 2;

    [boundsLeft, boundsCenterX, boundsRight].forEach((candidate, index) => {
      const kind = index === 0 ? "left" : index === 1 ? "center" : "right";
      const before = snappedLeft;
      snapToX(candidate, kind);
      if (before !== snappedLeft) guides.push({ x1: candidate, y1: Math.min(boundsTop, targetTop) - 40, x2: candidate, y2: Math.max(boundsBottom, targetBottom) + 40 });
    });

    [boundsTop, boundsCenterY, boundsBottom].forEach((candidate, index) => {
      const kind = index === 0 ? "top" : index === 1 ? "middle" : "bottom";
      const before = snappedTop;
      snapToY(candidate, kind);
      if (before !== snappedTop) guides.push({ x1: Math.min(boundsLeft, targetLeft) - 40, y1: candidate, x2: Math.max(boundsRight, targetRight) + 40, y2: candidate });
    });
  });

  target.set({ left: snappedLeft, top: snappedTop });
  target.setCoords();
  setGuideStore(canvas, guides);
};

export const handleCanvasSelectionCreated = ({ options, isEditingRef, setElementAttributes }: CanvasSelectionCreated) => {
  if (isEditingRef.current) return;
  if (!options?.selected) return;

  const selectedElement = options.selected[0] as fabric.Object;
  if (selectedElement && options.selected.length === 1) {
    const scaledWidth = selectedElement?.scaleX ? selectedElement.width! * selectedElement.scaleX : selectedElement?.width;
    const scaledHeight = selectedElement?.scaleY ? selectedElement.height! * selectedElement.scaleY : selectedElement?.height;

    setElementAttributes({
      width: scaledWidth?.toFixed(0).toString() || "",
      height: scaledHeight?.toFixed(0).toString() || "",
      fill: selectedElement?.fill?.toString() || "",
      stroke: (selectedElement?.stroke as string) || "",
      // @ts-ignore
      fontSize: selectedElement?.fontSize || "",
      // @ts-ignore
      fontFamily: selectedElement?.fontFamily || "",
      // @ts-ignore
      fontWeight: selectedElement?.fontWeight || "",
    });
  }
};

export const handleCanvasObjectScaling = ({ options, setElementAttributes }: CanvasObjectScaling) => {
  const selectedElement = options.target;
  const scaledWidth = selectedElement?.scaleX ? selectedElement.width! * selectedElement.scaleX : selectedElement?.width;
  const scaledHeight = selectedElement?.scaleY ? selectedElement.height! * selectedElement.scaleY : selectedElement?.height;

  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
  }));
};

export const renderCanvas = ({ fabricRef, canvasObjects, activeObjectRef }: RenderCanvas) => {
  const viewportTransform = fabricRef.current?.viewportTransform ? [...fabricRef.current.viewportTransform] : null;
  fabricRef.current?.clear();

  Array.from(canvasObjects, ([objectId, objectData]) => {
    const normalizedObjectData = normalizeSerializedFabricObject(objectData as Record<string, any>);

    fabric.util.enlivenObjects(
      [normalizedObjectData],
      (enlivenedObjects: fabric.Object[]) => {
        enlivenedObjects.forEach((enlivenedObj) => {
          attachConnectorRendering(enlivenedObj);
          if ((activeObjectRef.current as CustomFabricObject<fabric.Object>)?.objectId === objectId) {
            fabricRef.current?.setActiveObject(enlivenedObj);
          }
          fabricRef.current?.add(enlivenedObj);
        });
      },
      "fabric"
    );
  });

  if (viewportTransform && fabricRef.current) fabricRef.current.setViewportTransform(viewportTransform);
  fabricRef.current?.renderAll();
};

export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const canvasElement = document.getElementById("canvas");
  if (!canvasElement || !canvas) return;
  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
  saveCanvasViewport(canvas);
};

export const handleCanvasZoom = ({
  options,
  canvas,
}: {
  options: fabric.IEvent & { e: WheelEvent };
  canvas: fabric.Canvas;
}) => {
  const delta = options.e?.deltaY;
  let zoom = canvas.getZoom();
  if (!options.e.ctrlKey && !options.e.metaKey) return;
  zoom = Math.min(Math.max(0.2, zoom * Math.pow(0.999, delta)), 4);
  canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);
  saveCanvasViewport(canvas);
  options.e.preventDefault();
  options.e.stopPropagation();
};

export const clearSnapGuides = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  setGuideStore(canvas, []);
  canvas.requestRenderAll();
};

export const renderSnapGuides = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const guides = getGuideStore(canvas);
  if (!guides.length) return;
  const ctx = canvas.getSelectionContext();
  if (!ctx) return;

  ctx.save();
  ctx.strokeStyle = "rgba(111, 238, 255, 0.9)";
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);
  guides.forEach((guide) => {
    const start = getCanvasPoint(canvas, new fabric.Point(guide.x1, guide.y1));
    const end = getCanvasPoint(canvas, new fabric.Point(guide.x2, guide.y2));
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });
  ctx.restore();
};

export const renderConnectorDecorations = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const ctx = canvas.getSelectionContext();
  if (!ctx) return;

  ctx.save();
  canvas.getObjects().forEach((item) => {
    const connector = item as CustomFabricObject<any>;
    if (!connector.isConnector) return;
    const arrow = getConnectorArrowHead(connector as unknown as fabric.Line);
    const tip = getCanvasPoint(canvas, new fabric.Point(arrow.tipX, arrow.tipY));
    const left = getCanvasPoint(canvas, new fabric.Point(arrow.leftX, arrow.leftY));
    const right = getCanvasPoint(canvas, new fabric.Point(arrow.rightX, arrow.rightY));
    ctx.fillStyle = "#9BE7FF";
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
};

export const renderConnectorTargetPreview = (canvas: fabric.Canvas | null, startObject: fabric.Object | null) => {
  if (!canvas) return;
  const previewId = getPreviewStore(canvas).__connectorPreviewId;
  if (!previewId) return;

  const target = canvas.getObjects().find((item) => (item as CustomFabricObject<fabric.Object>).objectId === previewId);
  if (!target) return;

  const ctx = canvas.getSelectionContext();
  if (!ctx) return;

  const rect = target.getBoundingRect(true, true);
  const topLeft = getCanvasPoint(canvas, new fabric.Point(rect.left, rect.top));
  const bottomRight = getCanvasPoint(canvas, new fabric.Point(rect.left + rect.width, rect.top + rect.height));

  ctx.save();
  ctx.strokeStyle = "rgba(86,255,166,0.95)";
  ctx.fillStyle = "rgba(86,255,166,0.08)";
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y, 18);
  ctx.fill();
  ctx.stroke();

  if (startObject) {
    const startCenter = startObject.getCenterPoint();
    ["left", "right", "top", "bottom"].forEach((side) => {
      const point = getSidePoint(target, side as "left" | "right" | "top" | "bottom");
      const screenPoint = getCanvasPoint(canvas, new fabric.Point(point.x, point.y));
      const centerDistance = Math.hypot(point.x - startCenter.x, point.y - startCenter.y);
      const radius = centerDistance < 220 ? 5 : 4;
      ctx.beginPath();
      ctx.arc(screenPoint.x, screenPoint.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(155,231,255,0.96)";
      ctx.fill();
    });
  }

  ctx.restore();
};

export const clearTopContext = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  canvas.clearContext(canvas.getSelectionContext());
};

export const panCanvas = ({ canvas, deltaX, deltaY }: { canvas: fabric.Canvas | null; deltaX: number; deltaY: number }) => {
  if (!canvas) return;
  const viewport = canvas.viewportTransform;
  if (!viewport) return;
  viewport[4] += deltaX;
  viewport[5] += deltaY;
  canvas.requestRenderAll();
  saveCanvasViewport(canvas);
};

export const fitCanvasToContent = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const objects = canvas.getObjects();
  if (!objects.length) {
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);
    saveCanvasViewport(canvas);
    canvas.requestRenderAll();
    return;
  }

  const bounds = objects.reduce(
    (acc, obj) => {
      const rect = obj.getBoundingRect(true, true);
      return {
        left: Math.min(acc.left, rect.left),
        top: Math.min(acc.top, rect.top),
        right: Math.max(acc.right, rect.left + rect.width),
        bottom: Math.max(acc.bottom, rect.top + rect.height),
      };
    },
    { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
  );

  const contentWidth = bounds.right - bounds.left || 1;
  const contentHeight = bounds.bottom - bounds.top || 1;
  const padding = 160;
  const zoom = Math.min(Math.max(Math.min((canvas.getWidth() - padding) / contentWidth, (canvas.getHeight() - padding) / contentHeight), 0.2), 2.5);
  const viewportX = canvas.getWidth() / 2 - (bounds.left + contentWidth / 2) * zoom;
  const viewportY = canvas.getHeight() / 2 - (bounds.top + contentHeight / 2) * zoom;

  canvas.setViewportTransform([zoom, 0, 0, zoom, viewportX, viewportY]);
  saveCanvasViewport(canvas);
  canvas.requestRenderAll();
};

export const centerCanvasOnSelection = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  const target = canvas.getActiveObject() || canvas.getObjects()[0];
  if (!target) return;

  const zoom = canvas.getZoom() || 1;
  const rect = target.getBoundingRect(true, true);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  canvas.setViewportTransform([zoom, 0, 0, zoom, canvas.getWidth() / 2 - centerX * zoom, canvas.getHeight() / 2 - centerY * zoom]);
  saveCanvasViewport(canvas);
  canvas.requestRenderAll();
};

export const centerCanvasOnPoint = ({
  canvas,
  point,
}: {
  canvas: fabric.Canvas | null;
  point: { x: number; y: number };
}) => {
  if (!canvas) return;
  const zoom = canvas.getZoom() || 1;
  canvas.setViewportTransform([zoom, 0, 0, zoom, canvas.getWidth() / 2 - point.x * zoom, canvas.getHeight() / 2 - point.y * zoom]);
  saveCanvasViewport(canvas);
  canvas.requestRenderAll();
};

export const serializeCanvasObject = (object: fabric.Object) =>
  object.toObject([...FABRIC_CUSTOM_PROPS]) as Record<string, unknown>;
