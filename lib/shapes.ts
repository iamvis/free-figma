import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import {
  CustomFabricObject,
  ElementDirection,
  ImageUpload,
  ModifyShape,
  TemplateOption,
} from "@/types/type";

const baseShapeOptions = {
  fill: "#1F2836",
  stroke: "#C4D3ED",
  strokeWidth: 2,
  rx: 18,
  ry: 18,
  shadow: "0 12px 28px rgba(15,19,25,0.22)",
} as const;

export const FABRIC_CUSTOM_PROPS = [
  "objectId",
  "shapeKind",
  "connectorStartId",
  "connectorEndId",
  "connectorStartSide",
  "connectorEndSide",
  "connectorPoints",
  "isConnector",
  "selectable",
  "evented",
  "lockMovementX",
  "lockMovementY",
  "lockScalingX",
  "lockScalingY",
  "lockRotation",
] as const;

const connectorStroke = "#9BE7FF";
const connectorHandleRadius = 8;

const createShadow = (blur = 22, color = "rgba(15,19,25,0.22)") =>
  new fabric.Shadow({
    color,
    blur,
    offsetX: 0,
    offsetY: 10,
  });

export const createRectangle = (pointer: PointerEvent) =>
  new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 160,
    height: 110,
    ...baseShapeOptions,
    shadow: createShadow(),
    objectId: uuidv4(),
  } as unknown as CustomFabricObject<fabric.Rect>);

export const createTriangle = (pointer: PointerEvent) =>
  new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 130,
    height: 120,
    fill: "#1F2836",
    stroke: "#C4D3ED",
    strokeWidth: 2,
    shadow: createShadow(),
    objectId: uuidv4(),
  } as CustomFabricObject<fabric.Triangle>);

export const createCircle = (pointer: PointerEvent) =>
  new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 64,
    fill: "#1F2836",
    stroke: "#C4D3ED",
    strokeWidth: 2,
    shadow: createShadow(),
    objectId: uuidv4(),
  } as unknown as CustomFabricObject<fabric.Circle>);

export const createLine = (pointer: PointerEvent) =>
  new fabric.Line([pointer.x, pointer.y, pointer.x + 140, pointer.y + 80], {
    stroke: "#DCE7FF",
    strokeWidth: 3.5,
    strokeLineCap: "round",
    strokeLineJoin: "round",
    shadow: createShadow(10, "rgba(111,238,255,0.16)"),
    objectId: uuidv4(),
  } as CustomFabricObject<fabric.Line>);

export const createConnector = (pointer: PointerEvent) =>
  new fabric.Line([pointer.x, pointer.y, pointer.x + 160, pointer.y], {
    stroke: connectorStroke,
    strokeWidth: 3,
    strokeLineCap: "round",
    strokeLineJoin: "round",
    shadow: createShadow(14, "rgba(111,238,255,0.18)"),
    objectId: uuidv4(),
    shapeKind: "connector",
    isConnector: true,
    hasBorders: false,
  } as CustomFabricObject<fabric.Line>);

export const createText = (pointer: PointerEvent, text: string) =>
  new fabric.IText(text, {
    left: pointer.x,
    top: pointer.y,
    fill: "#E8F0FF",
    fontFamily: "Space Grotesk",
    fontSize: 40,
    fontWeight: "500",
    lineHeight: 1.1,
    charSpacing: 0,
    shadow: createShadow(16, "rgba(15,19,25,0.16)"),
    objectId: uuidv4(),
  } as fabric.ITextOptions);

export const createStickyNote = (pointer: PointerEvent) =>
  new fabric.Textbox("New note", {
    left: pointer.x,
    top: pointer.y,
    width: 220,
    fontFamily: "Caveat",
    fontSize: 28,
    fontWeight: "700",
    fill: "#4A3B00",
    backgroundColor: "#FFE082",
    stroke: "#F7C948",
    strokeWidth: 1,
    splitByGrapheme: false,
    padding: 18,
    rx: 20,
    ry: 20,
    shadow: createShadow(26, "rgba(15,19,25,0.18)"),
    objectId: uuidv4(),
  } as any);

export const createSpecificShape = (shapeType: string, pointer: PointerEvent) => {
  switch (shapeType) {
    case "rectangle":
      return createRectangle(pointer);
    case "triangle":
      return createTriangle(pointer);
    case "circle":
      return createCircle(pointer);
    case "line":
      return createLine(pointer);
    case "connector":
      return createConnector(pointer);
    case "text":
      return createText(pointer, "Tap to type");
    case "sticky-note":
      return createStickyNote(pointer);
    default:
      return null;
  }
};

const createTemplateTitle = (text: string, left: number, top: number, size = 34) =>
  new fabric.IText(text, {
    left,
    top,
    fill: "#F4F7FB",
    fontFamily: "Space Grotesk",
    fontSize: size,
    fontWeight: "700",
    objectId: uuidv4(),
  } as fabric.ITextOptions);

const createCaption = (text: string, left: number, top: number) =>
  new fabric.Textbox(text, {
    left,
    top,
    width: 240,
    fill: "#A9BDD8",
    fontFamily: "Work Sans",
    fontSize: 16,
    lineHeight: 1.35,
    objectId: uuidv4(),
  } as any);

const createCard = (left: number, top: number, width: number, height: number, fill: string, stroke: string) =>
  new fabric.Rect({
    left,
    top,
    width,
    height,
    rx: 24,
    ry: 24,
    fill,
    stroke,
    strokeWidth: 1.5,
    shadow: createShadow(24, "rgba(15,19,25,0.16)"),
    objectId: uuidv4(),
  } as any);

const createTemplateSticky = (text: string, left: number, top: number, backgroundColor: string, width = 190) =>
  new fabric.Textbox(text, {
    left,
    top,
    width,
    fontFamily: "Caveat",
    fontSize: 28,
    fontWeight: "700",
    fill: "#27313F",
    backgroundColor,
    padding: 18,
    rx: 20,
    ry: 20,
    shadow: createShadow(18, "rgba(15,19,25,0.14)"),
    objectId: uuidv4(),
  } as any);

const createArrowHead = (left: number, top: number) =>
  new fabric.Triangle({
    left,
    top,
    width: 26,
    height: 22,
    angle: 180,
    fill: connectorStroke,
    objectId: uuidv4(),
  } as any);

export const createTemplateObjects = (template: TemplateOption["value"]) => {
  switch (template) {
    case "brainstorm":
      return [
        createCard(60, 50, 690, 430, "rgba(22,28,37,0.88)", "#2C3543"),
        createTemplateTitle("Sprint Brainstorm", 94, 86),
        createCaption("Frame the room, capture energy quickly, then cluster by actionability.", 96, 130),
        createTemplateSticky("Pain points", 96, 210, "#FFE082"),
        createTemplateSticky("Quick wins", 312, 178, "#80DEEA"),
        createTemplateSticky("Big bets", 530, 224, "#C5E1A5"),
        createTemplateSticky("Open questions", 206, 356, "#F8BBD0"),
        createTemplateSticky("Risks", 454, 352, "#FFCCBC"),
      ];
    case "flowchart":
      return [
        createTemplateTitle("Decision Flow", 120, 60),
        createCaption("A cleaner default flow with clear hierarchy and tuned connectors.", 122, 104),
        createCard(150, 170, 220, 86, "#202731", "#56FFA6"),
        createText({ x: 205, y: 196 } as PointerEvent, "Start"),
        createCard(150, 338, 220, 86, "#202731", "#6FEEFF"),
        createText({ x: 198, y: 364 } as PointerEvent, "Review"),
        new fabric.Line([260, 256, 260, 338], {
          stroke: connectorStroke,
          strokeWidth: 3,
          objectId: uuidv4(),
        } as any),
        createArrowHead(247, 414),
        createCard(455, 248, 230, 96, "#2B2334", "#FFB3D6"),
        createText({ x: 506, y: 280 } as PointerEvent, "Approve"),
        new fabric.Line([370, 298, 455, 298], {
          stroke: connectorStroke,
          strokeWidth: 3,
          objectId: uuidv4(),
        } as any),
      ];
    case "wireframe":
      return [
        createTemplateTitle("Landing Wireframe", 70, 55),
        createCard(70, 120, 780, 480, "#202731", "#2B303B"),
        new fabric.Rect({
          left: 100,
          top: 152,
          width: 320,
          height: 300,
          rx: 24,
          ry: 24,
          fill: "#2B303B",
          shadow: createShadow(18, "rgba(15,19,25,0.16)"),
          objectId: uuidv4(),
        } as any),
        new fabric.Rect({
          left: 460,
          top: 166,
          width: 280,
          height: 20,
          rx: 10,
          ry: 10,
          fill: "#E2EDF9",
          opacity: 0.88,
          objectId: uuidv4(),
        } as any),
        new fabric.Rect({
          left: 460,
          top: 212,
          width: 232,
          height: 18,
          rx: 9,
          ry: 9,
          fill: "#D4E1F0",
          opacity: 0.54,
          objectId: uuidv4(),
        } as any),
        new fabric.Rect({
          left: 460,
          top: 246,
          width: 260,
          height: 18,
          rx: 9,
          ry: 9,
          fill: "#D4E1F0",
          opacity: 0.46,
          objectId: uuidv4(),
        } as any),
        new fabric.Rect({
          left: 460,
          top: 312,
          width: 172,
          height: 56,
          rx: 18,
          ry: 18,
          fill: "#56FFA6",
          shadow: createShadow(18, "rgba(86,255,166,0.18)"),
          objectId: uuidv4(),
        } as any),
      ];
    case "journey":
      return [
        createTemplateTitle("Customer Journey", 90, 50),
        createCaption("Capture what people see, feel, and need across the experience.", 92, 98),
        createCard(90, 166, 760, 420, "#1A212C", "#334052"),
        createTemplateSticky("Discover", 126, 224, "#B3E5FC"),
        createTemplateSticky("Evaluate", 306, 224, "#C5E1A5"),
        createTemplateSticky("Adopt", 486, 224, "#FFE082"),
        createTemplateSticky("Advocate", 666, 224, "#F8BBD0"),
        createTemplateSticky("What delights?", 188, 412, "#FFFFFF", 240),
        createTemplateSticky("What blocks progress?", 448, 412, "#FFCCBC", 260),
      ];
    case "retro":
      return [
        createTemplateTitle("Team Retro", 82, 58),
        createCaption("A structured board that feels designed instead of dropped-in.", 84, 104),
        createCard(70, 158, 820, 430, "#171E28", "#2F3A4A"),
        createCard(100, 200, 220, 330, "#24303F", "#63D0FF"),
        createCard(370, 200, 220, 330, "#263325", "#7AE582"),
        createCard(640, 200, 220, 330, "#34282A", "#FF9DB7"),
        createTemplateTitle("Keep", 162, 228, 26),
        createTemplateTitle("Try", 440, 228, 26),
        createTemplateTitle("Change", 694, 228, 26),
        createTemplateSticky("Ship faster handoffs", 128, 286, "#B3E5FC", 164),
        createTemplateSticky("Tighter kickoff ritual", 398, 286, "#C5E1A5", 164),
        createTemplateSticky("Reduce review churn", 668, 286, "#F8BBD0", 164),
      ];
    default:
      return [];
  }
};

export const handleImageUpload = ({ file, canvas, shapeRef, syncShapeInStorage }: ImageUpload) => {
  const reader = new FileReader();

  reader.onload = () => {
    fabric.Image.fromURL(reader.result as string, (img) => {
      img.scaleToWidth(240);
      img.scaleToHeight(240);
      img.set({
        shadow: createShadow(18, "rgba(15,19,25,0.18)"),
      });
      canvas.current.add(img);
      (img as CustomFabricObject<fabric.Image>).objectId = uuidv4();
      shapeRef.current = img;
      syncShapeInStorage(img);
      canvas.current.requestRenderAll();
    });
  };

  reader.readAsDataURL(file);
};

export const styleFreeformPath = (path: CustomFabricObject<fabric.Path>) => {
  path.set({
    shapeKind: "freeform",
    stroke: "#DCE7FF",
    strokeWidth: 3.25,
    strokeLineCap: "round",
    strokeLineJoin: "round",
    fill: "",
    shadow: createShadow(8, "rgba(111,238,255,0.14)"),
  });
};

export const createShape = (canvas: fabric.Canvas, pointer: PointerEvent, shapeType: string) => {
  if (shapeType === "freeform") {
    canvas.isDrawingMode = true;
    return null;
  }

  return createSpecificShape(shapeType, pointer);
};

export const modifyShape = ({
  canvas,
  property,
  value,
  activeObjectRef,
  syncShapeInStorage,
}: ModifyShape) => {
  const selectedElement = canvas.getActiveObject();
  if (!selectedElement || selectedElement?.type === "activeSelection") return;

  if (property === "width") {
    selectedElement.set("scaleX", 1);
    selectedElement.set("width", value);
  } else if (property === "height") {
    selectedElement.set("scaleY", 1);
    selectedElement.set("height", value);
  } else {
    if (selectedElement[property as keyof object] === value) return;
    selectedElement.set(property as keyof object, value);
  }

  activeObjectRef.current = selectedElement;
  syncShapeInStorage(selectedElement);
};

export const bringElement = ({ canvas, direction, syncShapeInStorage }: ElementDirection) => {
  if (!canvas) return;
  const selectedElement = canvas.getActiveObject();
  if (!selectedElement || selectedElement?.type === "activeSelection") return;

  if (direction === "front") {
    canvas.bringToFront(selectedElement);
  } else if (direction === "back") {
    canvas.sendToBack(selectedElement);
  }

  syncShapeInStorage(selectedElement);
};

export const duplicateSelectedElement = ({
  canvas,
  syncShapeInStorage,
}: {
  canvas: fabric.Canvas | null;
  syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
  if (!canvas) return;

  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type === "activeSelection") return;

  activeObject.clone((cloned: fabric.Object) => {
    cloned.set({
      left: (activeObject.left || 0) + 24,
      top: (activeObject.top || 0) + 24,
      objectId: uuidv4(),
    } as any);

    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    syncShapeInStorage(cloned);
    canvas.requestRenderAll();
  });
};

export const toggleLockSelectedElement = ({
  canvas,
  syncShapeInStorage,
}: {
  canvas: fabric.Canvas | null;
  syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
  if (!canvas) return false;

  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type === "activeSelection") return false;

  const nextLockedState = !activeObject.selectable;
  activeObject.set({
    selectable: !nextLockedState,
    evented: !nextLockedState,
    lockMovementX: nextLockedState,
    lockMovementY: nextLockedState,
    lockScalingX: nextLockedState,
    lockScalingY: nextLockedState,
    lockRotation: nextLockedState,
  });

  syncShapeInStorage(activeObject);
  canvas.requestRenderAll();
  return nextLockedState;
};

export const getObjectBounds = (object: fabric.Object) => object.getBoundingRect(true, true);

export const getObjectCenter = (object: fabric.Object) => {
  const bounds = getObjectBounds(object);
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  };
};

export const getSidePoint = (object: fabric.Object, side: "left" | "right" | "top" | "bottom") => {
  const bounds = getObjectBounds(object);
  switch (side) {
    case "left":
      return { x: bounds.left, y: bounds.top + bounds.height / 2 };
    case "right":
      return { x: bounds.left + bounds.width, y: bounds.top + bounds.height / 2 };
    case "top":
      return { x: bounds.left + bounds.width / 2, y: bounds.top };
    case "bottom":
      return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height };
  }
};

export const getNearestSide = (source: fabric.Object, target: fabric.Object) => {
  const sourceCenter = getObjectCenter(source);
  const targetCenter = getObjectCenter(target);
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      startSide: dx > 0 ? "right" : "left",
      endSide: dx > 0 ? "left" : "right",
    } as const;
  }

  return {
    startSide: dy > 0 ? "bottom" : "top",
    endSide: dy > 0 ? "top" : "bottom",
  } as const;
};

const dedupeConnectorPoints = (points: Array<{ x: number; y: number }>) =>
  points.filter((point, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    return Math.abs(prev.x - point.x) > 1 || Math.abs(prev.y - point.y) > 1;
  });

const simplifyConnectorPoints = (points: Array<{ x: number; y: number }>) =>
  dedupeConnectorPoints(points).filter((point, index, arr) => {
    if (index === 0 || index === arr.length - 1) return true;
    const prev = arr[index - 1];
    const next = arr[index + 1];
    const sameX = Math.abs(prev.x - point.x) < 1 && Math.abs(point.x - next.x) < 1;
    const sameY = Math.abs(prev.y - point.y) < 1 && Math.abs(point.y - next.y) < 1;
    return !(sameX || sameY);
  });

export const buildConnectorPoints = ({
  startPoint,
  endPoint,
  startSide,
  endSide,
}: {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  startSide: "left" | "right" | "top" | "bottom";
  endSide: "left" | "right" | "top" | "bottom";
}) => {
  const gap = 44;
  const startHorizontal = startSide === "left" || startSide === "right";
  const startOut = {
    x: startPoint.x + (startSide === "right" ? gap : startSide === "left" ? -gap : 0),
    y: startPoint.y + (startSide === "bottom" ? gap : startSide === "top" ? -gap : 0),
  };
  const endOut = {
    x: endPoint.x + (endSide === "right" ? gap : endSide === "left" ? -gap : 0),
    y: endPoint.y + (endSide === "bottom" ? gap : endSide === "top" ? -gap : 0),
  };

  let points: Array<{ x: number; y: number }>;

  if (startHorizontal) {
    const midX = Math.round((startOut.x + endOut.x) / 2);
    points = [
      startPoint,
      startOut,
      { x: midX, y: startOut.y },
      { x: midX, y: endOut.y },
      endOut,
      endPoint,
    ];
  } else {
    const midY = Math.round((startOut.y + endOut.y) / 2);
    points = [
      startPoint,
      startOut,
      { x: startOut.x, y: midY },
      { x: endOut.x, y: midY },
      endOut,
      endPoint,
    ];
  }

  return simplifyConnectorPoints(points);
};

const connectorPointsToPath = (points: Array<{ x: number; y: number }>) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

export const getAutoConnectorPreview = ({
  startObject,
  endObject,
}: {
  startObject: fabric.Object;
  endObject: fabric.Object;
}) => {
  const { startSide, endSide } = getNearestSide(startObject, endObject);
  const startPoint = getSidePoint(startObject, startSide);
  const endPoint = getSidePoint(endObject, endSide);
  return {
    startSide,
    endSide,
    startPoint,
    endPoint,
    points: buildConnectorPoints({ startPoint, endPoint, startSide, endSide }),
  };
};

export const connectObjects = ({
  canvas,
  startObject,
  endObject,
  syncShapeInStorage,
}: {
  canvas: fabric.Canvas | null;
  startObject: fabric.Object | null;
  endObject: fabric.Object | null;
  syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
  if (!canvas || !startObject || !endObject || startObject === endObject) return null;

  const { startSide, endSide, points } = getAutoConnectorPreview({ startObject, endObject });
  const connector = new fabric.Path(connectorPointsToPath(points), {
    stroke: connectorStroke,
    strokeWidth: 3,
    strokeLineCap: "round",
    strokeLineJoin: "round",
    fill: "",
    shadow: createShadow(12, "rgba(111,238,255,0.16)"),
    objectId: uuidv4(),
    shapeKind: "connector",
    connectorStartId: (startObject as CustomFabricObject<fabric.Object>).objectId,
    connectorEndId: (endObject as CustomFabricObject<fabric.Object>).objectId,
    connectorStartSide: startSide,
    connectorEndSide: endSide,
    connectorPoints: points,
    isConnector: true,
    objectCaching: false,
  } as unknown as CustomFabricObject<fabric.Path>);

  addConnectorDecorations(connector as unknown as fabric.Object);
  canvas.add(connector);
  syncShapeInStorage(connector);
  canvas.requestRenderAll();
  return connector;
};

export const normalizeSerializedFabricObject = (objectData: Record<string, any>) => {
  if (!objectData || typeof objectData !== "object") return objectData;

  if (objectData.type === "freeform") {
    return {
      ...objectData,
      type: "path",
      shapeKind: "freeform",
    };
  }

  if (objectData.isConnector && !objectData.shapeKind) {
    return {
      ...objectData,
      shapeKind: "connector",
    };
  }

  return objectData;
};

export const addConnectorDecorations = (object: fabric.Object) => {
  object.controls = {
    ...fabric.Object.prototype.controls,
    mtr: new fabric.Control({ visible: false }),
  };
};

export const updateConnectorPosition = ({
  canvas,
  connector,
}: {
  canvas: fabric.Canvas;
  connector: CustomFabricObject<any>;
}) => {
  const startObject = canvas
    .getObjects()
    .find((item) => (item as CustomFabricObject<fabric.Object>).objectId === connector.connectorStartId);
  const endObject = canvas
    .getObjects()
    .find((item) => (item as CustomFabricObject<fabric.Object>).objectId === connector.connectorEndId);

  if (!startObject || !endObject) return;

  const { startSide, endSide, points } = getAutoConnectorPreview({ startObject, endObject });
  const connectorPath = connector as fabric.Path & CustomFabricObject<fabric.Path>;
  const parsedPath = new fabric.Path(connectorPointsToPath(points)).path;

  connectorPath.set({
    connectorStartSide: startSide,
    connectorEndSide: endSide,
    connectorPoints: points,
  });
  connectorPath.path = parsedPath as fabric.Point[];
  connectorPath.setCoords();
};

export const updateConnectorsForObject = ({
  canvas,
  object,
  syncShapeInStorage,
}: {
  canvas: fabric.Canvas | null;
  object: fabric.Object | null;
  syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
  if (!canvas || !object) return;
  const objectId = (object as CustomFabricObject<fabric.Object>).objectId;
  if (!objectId) return;

  canvas.getObjects().forEach((item) => {
    const connector = item as CustomFabricObject<any>;
    if (!connector.isConnector) return;
    if (connector.connectorStartId !== objectId && connector.connectorEndId !== objectId) return;
    updateConnectorPosition({ canvas, connector });
    syncShapeInStorage(connector);
  });
  canvas.requestRenderAll();
};

export const getConnectorTarget = ({
  canvas,
  excludeObjectId,
  pointer,
}: {
  canvas: fabric.Canvas;
  excludeObjectId?: string;
  pointer: { x: number; y: number };
}) => {
  return canvas
    .getObjects()
    .filter((obj) => {
      const custom = obj as CustomFabricObject<fabric.Object>;
      return !custom.isConnector && custom.objectId !== excludeObjectId;
    })
    .find((obj) => obj.containsPoint(new fabric.Point(pointer.x, pointer.y), null, true)) || null;
};

export const distributeSelectedElements = ({
  canvas,
  direction,
  syncShapeInStorage,
}: {
  canvas: fabric.Canvas | null;
  direction: "horizontal" | "vertical";
  syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
  if (!canvas) return;
  const objects = canvas
    .getActiveObjects()
    .filter((obj) => !(obj as CustomFabricObject<fabric.Object>).isConnector);
  if (objects.length < 3) return;

  const sorted = [...objects].sort((a, b) =>
    direction === "horizontal" ? (a.left || 0) - (b.left || 0) : (a.top || 0) - (b.top || 0)
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const start = direction === "horizontal" ? first.left || 0 : first.top || 0;
  const end = direction === "horizontal" ? last.left || 0 : last.top || 0;
  const gap = (end - start) / (sorted.length - 1);

  sorted.forEach((obj, index) => {
    if (direction === "horizontal") {
      obj.set({ left: start + gap * index });
    } else {
      obj.set({ top: start + gap * index });
    }
    obj.setCoords();
    syncShapeInStorage(obj);
  });

  canvas.requestRenderAll();
};

export const getConnectorArrowHead = (line: fabric.Line) => {
  const customLine = line as unknown as CustomFabricObject<any>;
  const points = customLine.connectorPoints;
  const fallbackPoints = [
    { x: line.x1 || 0, y: line.y1 || 0 },
    { x: line.x2 || 0, y: line.y2 || 0 },
  ];
  const route = points && points.length >= 2 ? points : fallbackPoints;
  const penultimate = route[route.length - 2];
  const last = route[route.length - 1];
  const x1 = penultimate.x;
  const y1 = penultimate.y;
  const x2 = last.x;
  const y2 = last.y;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  return {
    tipX: x2,
    tipY: y2,
    leftX: x2 - connectorHandleRadius * 1.8 * Math.cos(angle - Math.PI / 6),
    leftY: y2 - connectorHandleRadius * 1.8 * Math.sin(angle - Math.PI / 6),
    rightX: x2 - connectorHandleRadius * 1.8 * Math.cos(angle + Math.PI / 6),
    rightY: y2 - connectorHandleRadius * 1.8 * Math.sin(angle + Math.PI / 6),
  };
};
