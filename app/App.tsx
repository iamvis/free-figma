"use client";

import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import ZoomControls from "@/components/ZoomControls";
import BoardStyleSwitcher, { BoardStyle } from "@/components/BoardStyleSwitcher";
import BoardMinimap from "@/components/BoardMinimap";
import SelectionHud from "@/components/SelectionHud";
import { CommentsOverlay } from "@/components/comments/CommentsOverlay";
import { defaultNavElement } from "@/constants";
import {
  centerCanvasOnPoint,
  centerCanvasOnSelection,
  clearSnapGuides,
  clearTopContext,
  fitCanvasToContent,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handleCanvaseMouseMove,
  handlePathCreated,
  handleResize,
  initializeFabric,
  panCanvas,
  renderCanvas,
  renderConnectorDecorations,
  renderConnectorTargetPreview,
  renderSnapGuides,
  saveCanvasViewport,
  serializeCanvasObject,
  setConnectorPreviewTarget,
} from "@/lib/canvas";
import {
  bringElement,
  connectObjects,
  createTemplateObjects,
  distributeSelectedElements,
  duplicateSelectedElement,
  getAutoConnectorPreview,
  getConnectorTarget,
  handleImageUpload,
  toggleLockSelectedElement,
  updateConnectorsForObject,
} from "@/lib/shapes";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import { ActiveElement, Attributes, CustomFabricObject, TemplateOption } from "@/types/type";

const handToolElement: ActiveElement = {
  name: "Hand",
  value: "hand",
  icon: "",
};

const connectorToolElement: ActiveElement = {
  name: "Connector",
  value: "connector",
  icon: "",
};

export default function Page() {
  const undo = useUndo();
  const redo = useRedo();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const connectorStartObjectRef = useRef<fabric.Object | null>(null);
  const imageinputRef = useRef<HTMLInputElement>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const canvasObjects = useStorage((root) => root.canvasObjects);
  const isEditingRef = useRef(false);
  const isSpacePressedRef = useRef(false);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [boardStyle, setBoardStyle] = useState<BoardStyle>("dots");
  const [selectedCount, setSelectedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanningUi, setIsPanningUi] = useState(false);
  const [canvasTick, setCanvasTick] = useState(0);
  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#1F2836",
    stroke: "#C4D3ED",
  });
  const [activeElement, setActiveElement] = useState<ActiveElement>(defaultNavElement);

  const bumpCanvasTick = () => setCanvasTick((value) => value + 1);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object as CustomFabricObject<fabric.Object>;
    if (!objectId) return;
    const shapeData = serializeCanvasObject(object);
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const objects = storage.get("canvasObjects");
    if (!objects || objects.size === 0) return true;
    for (const [key] of objects.entries()) objects.delete(key);
    return objects.size === 0;
  }, []);

  const updateZoomLevel = useCallback(() => {
    const zoom = fabricRef.current?.getZoom() || 1;
    setZoomLevel(Math.round(zoom * 100));
    bumpCanvasTick();
  }, []);

  const updateSelectionMeta = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    setSelectedCount(activeObjects.length);
    setIsLocked(activeObjects.length === 1 ? activeObjects[0]?.selectable === false : false);
    bumpCanvasTick();
  }, []);

  const stopDrawingMode = useCallback(() => {
    isDrawing.current = false;
    if (fabricRef.current) {
      fabricRef.current.isDrawingMode = false;
      fabricRef.current.selection = true;
      fabricRef.current.defaultCursor = "default";
    }
  }, []);

  const handleActiveElement = useCallback((elem: ActiveElement) => {
    setActiveElement(elem);
    selectedShapeRef.current = elem?.value as string;

    switch (elem?.value) {
      case "reset":
        deleteAllShapes();
        fabricRef.current?.clear();
        stopDrawingMode();
        setActiveElement(defaultNavElement);
        selectedShapeRef.current = "select";
        clearSnapGuides(fabricRef.current);
        break;
      case "delete":
        handleDelete(fabricRef.current as fabric.Canvas, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        selectedShapeRef.current = "select";
        bumpCanvasTick();
        break;
      case "image":
        imageinputRef.current?.click();
        stopDrawingMode();
        break;
      case "select":
      case "hand":
        stopDrawingMode();
        setConnectorPreviewTarget(fabricRef.current, null);
        break;
      default:
        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = elem?.value === "freeform";
          fabricRef.current.selection = false;
        }
        if (elem?.value !== "connector") {
          setConnectorPreviewTarget(fabricRef.current, null);
        }
        break;
    }
  }, [deleteAllShapes, deleteShapeFromStorage, stopDrawingMode]);

  const applyTemplate = (template: TemplateOption["value"]) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = createTemplateObjects(template);
    objects.forEach((object) => {
      canvas.add(object);
      syncShapeInStorage(object);
    });
    fitCanvasToContent(canvas);
    updateZoomLevel();
  };

  const setCanvasZoom = useCallback((nextZoom: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const boundedZoom = Math.min(Math.max(nextZoom, 0.2), 4);
    canvas.zoomToPoint(new fabric.Point((canvas.getWidth() || 0) / 2, (canvas.getHeight() || 0) / 2), boundedZoom);
    saveCanvasViewport(canvas);
    canvas.requestRenderAll();
    setZoomLevel(Math.round(boundedZoom * 100));
    bumpCanvasTick();
  }, []);

  const resetCanvasZoom = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);
    saveCanvasViewport(canvas);
    canvas.requestRenderAll();
    setZoomLevel(100);
    bumpCanvasTick();
  }, []);

  const duplicateSelection = () => {
    duplicateSelectedElement({ canvas: fabricRef.current, syncShapeInStorage });
    updateSelectionMeta();
  };

  const clearSelection = () => {
    fabricRef.current?.discardActiveObject();
    fabricRef.current?.requestRenderAll();
    updateSelectionMeta();
  };

  const bringSelectionToFront = () => {
    bringElement({ canvas: fabricRef.current as fabric.Canvas, direction: "front", syncShapeInStorage });
    bumpCanvasTick();
  };

  const sendSelectionToBack = () => {
    bringElement({ canvas: fabricRef.current as fabric.Canvas, direction: "back", syncShapeInStorage });
    bumpCanvasTick();
  };

  const toggleSelectionLock = () => {
    const nextLocked = toggleLockSelectedElement({ canvas: fabricRef.current, syncShapeInStorage });
    setIsLocked(nextLocked);
    bumpCanvasTick();
  };

  const distributeHorizontally = () => {
    distributeSelectedElements({ canvas: fabricRef.current, direction: "horizontal", syncShapeInStorage });
    fabricRef.current?.getActiveObjects().forEach((obj) => updateConnectorsForObject({ canvas: fabricRef.current, object: obj, syncShapeInStorage }));
    bumpCanvasTick();
  };

  const distributeVertically = () => {
    distributeSelectedElements({ canvas: fabricRef.current, direction: "vertical", syncShapeInStorage });
    fabricRef.current?.getActiveObjects().forEach((obj) => updateConnectorsForObject({ canvas: fabricRef.current, object: obj, syncShapeInStorage }));
    bumpCanvasTick();
  };

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    selectedShapeRef.current = "select";
    updateZoomLevel();
    updateSelectionMeta();

    const onMouseDown = (options: fabric.IEvent<MouseEvent>) => {
      const mouseEvent = options.e;
      const shouldPan = mouseEvent.button === 1 || isSpacePressedRef.current || selectedShapeRef.current === "hand";

      if (shouldPan) {
        isPanningRef.current = true;
        setIsPanningUi(true);
        lastPointerRef.current = { x: mouseEvent.clientX, y: mouseEvent.clientY };
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
        return;
      }

      const target = canvas.findTarget(options.e, false);
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });

      if (selectedShapeRef.current === "connector") {
        connectorStartObjectRef.current =
          target && !(target as CustomFabricObject<fabric.Object>).isConnector ? target : null;
      }
    };

    const onMouseMove = (options: fabric.IEvent<MouseEvent>) => {
      const mouseEvent = options.e;

      if (isPanningRef.current) {
        panCanvas({
          canvas,
          deltaX: mouseEvent.clientX - lastPointerRef.current.x,
          deltaY: mouseEvent.clientY - lastPointerRef.current.y,
        });
        lastPointerRef.current = { x: mouseEvent.clientX, y: mouseEvent.clientY };
        bumpCanvasTick();
        return;
      }

      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });

      if (selectedShapeRef.current === "connector" && connectorStartObjectRef.current) {
        const pointer = canvas.getPointer(options.e);
        const previewTarget = getConnectorTarget({
          canvas,
          excludeObjectId: (connectorStartObjectRef.current as CustomFabricObject<fabric.Object>).objectId,
          pointer,
        });

        setConnectorPreviewTarget(
          canvas,
          (previewTarget as CustomFabricObject<fabric.Object> | null)?.objectId || null
        );

        if (previewTarget && shapeRef.current) {
          const preview = getAutoConnectorPreview({
            startObject: connectorStartObjectRef.current,
            endObject: previewTarget,
          });
          (shapeRef.current as fabric.Line).set({
            x2: preview.endPoint.x,
            y2: preview.endPoint.y,
          });
        }
      }
      bumpCanvasTick();
    };

    const onMouseUp = (options: fabric.IEvent<MouseEvent>) => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setIsPanningUi(false);
        canvas.selection = selectedShapeRef.current === "select";
        canvas.defaultCursor = selectedShapeRef.current === "hand" || isSpacePressedRef.current ? "grab" : "default";
        saveCanvasViewport(canvas);
        bumpCanvasTick();
        return;
      }

      if (selectedShapeRef.current === "connector" && shapeRef.current) {
        const draftConnector = shapeRef.current as CustomFabricObject<fabric.Line>;
        const pointer = canvas.getPointer(options.e);
        const endTarget = getConnectorTarget({
          canvas,
          excludeObjectId: (connectorStartObjectRef.current as CustomFabricObject<fabric.Object> | null)?.objectId,
          pointer,
        });

        if (connectorStartObjectRef.current && endTarget) {
          canvas.remove(draftConnector);
          if (draftConnector.objectId) deleteShapeFromStorage(draftConnector.objectId);
          connectObjects({
            canvas,
            startObject: connectorStartObjectRef.current,
            endObject: endTarget,
            syncShapeInStorage,
          });
        } else {
          syncShapeInStorage(draftConnector);
        }
      }

      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
      connectorStartObjectRef.current = null;
      setConnectorPreviewTarget(canvas, null);
      clearSnapGuides(canvas);
      bumpCanvasTick();
    };

    const onObjectModified = (options: fabric.IEvent) => {
      handleCanvasObjectModified({ options, syncShapeInStorage });
      updateConnectorsForObject({ canvas, object: options.target || null, syncShapeInStorage });
      updateSelectionMeta();
    };

    const onObjectMoving = (options: fabric.IEvent) => {
      handleCanvasObjectMoving({ options });
      updateConnectorsForObject({ canvas, object: options.target || null, syncShapeInStorage });
      bumpCanvasTick();
    };

    const onSelectionCreated = (options: fabric.IEvent) => {
      handleCanvasSelectionCreated({ options, isEditingRef, setElementAttributes });
      updateSelectionMeta();
    };

    const onSelectionUpdated = (options: fabric.IEvent) => {
      handleCanvasSelectionCreated({ options, isEditingRef, setElementAttributes });
      updateSelectionMeta();
    };

    const onSelectionCleared = () => {
      setSelectedCount(0);
      setIsLocked(false);
      bumpCanvasTick();
    };

    const onObjectScaling = (options: fabric.IEvent) => {
      handleCanvasObjectScaling({ options, setElementAttributes });
      updateConnectorsForObject({ canvas, object: options.target || null, syncShapeInStorage });
      bumpCanvasTick();
    };

    const onPathCreated = (options: fabric.IEvent) => {
      handlePathCreated({ options, syncShapeInStorage });
      bumpCanvasTick();
    };

    const onMouseWheel = (options: fabric.IEvent<WheelEvent>) => {
      handleCanvasZoom({ options, canvas });
      setTimeout(updateZoomLevel, 0);
    };

    const onResize = () => {
      handleResize({ canvas: fabricRef.current });
      bumpCanvasTick();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tagName = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const isTypingTarget = tagName === "input" || tagName === "textarea" || (e.target as HTMLElement | null)?.isContentEditable;

      if (e.code === "Space" && !isTypingTarget) {
        e.preventDefault();
        setIsSpacePressed(true);
        isSpacePressedRef.current = true;
        if (!isPanningRef.current) canvas.defaultCursor = "grab";
      }

      if (!isTypingTarget && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "v") return handleActiveElement(defaultNavElement);
        if (key === "h") return handleActiveElement(handToolElement);
        if (key === "r") return handleActiveElement({ name: "Rectangle", value: "rectangle", icon: "" });
        if (key === "t") return handleActiveElement({ name: "Text", value: "text", icon: "" });
        if (key === "n") return handleActiveElement({ name: "Sticky Note", value: "sticky-note", icon: "" });
        if (key === "c") return handleActiveElement(connectorToolElement);
        if (e.key === "+") return setCanvasZoom((canvas.getZoom() || 1) + 0.1);
        if (e.key === "-") return setCanvasZoom((canvas.getZoom() || 1) - 0.1);
        if (e.key === "0") return resetCanvasZoom();
      }

      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        isSpacePressedRef.current = false;
        canvas.defaultCursor = selectedShapeRef.current === "hand" ? "grab" : "default";
      }
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
    canvas.on("object:modified", onObjectModified);
    canvas.on("object:moving", onObjectMoving);
    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:updated", onSelectionUpdated);
    canvas.on("selection:cleared", onSelectionCleared);
    canvas.on("object:scaling", onObjectScaling);
    canvas.on("path:created", onPathCreated);
    canvas.on("mouse:wheel", onMouseWheel);
    canvas.on("before:render", () => clearTopContext(canvas));
    canvas.on("after:render", () => {
      renderSnapGuides(canvas);
      renderConnectorDecorations(canvas);
      renderConnectorTargetPreview(canvas, connectorStartObjectRef.current);
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.dispose();
    };
  }, [canvasRef, deleteAllShapes, deleteShapeFromStorage, handleActiveElement, redo, resetCanvasZoom, setCanvasZoom, syncShapeInStorage, undo, updateSelectionMeta, updateZoomLevel]);

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
    updateSelectionMeta();
  }, [canvasObjects, updateSelectionMeta]);

  return (
    <main className="relative h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageinputRef}
        handleImageUpload={(e: any) => {
          e.stopPropagation();
          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            shapeRef,
            syncShapeInStorage,
          });
          bumpCanvasTick();
        }}
      />
      <section className="flex h-[calc(100vh-4rem)] flex-row gap-4 px-4 py-4">
        <LeftSidebar allShapes={Array.from(canvasObjects)} onTemplateSelect={applyTemplate} />
        <Live
          canvasRef={canvasRef}
          undo={undo}
          redo={redo}
          boardStyle={boardStyle}
          activeTool={isSpacePressed ? "hand" : activeElement?.value || "select"}
          isPanning={isPanningUi}
        >
          <SelectionHud key={`selection-${canvasTick}`} canvas={fabricRef.current} />
          <CommentsOverlay />
          <BoardStyleSwitcher boardStyle={boardStyle} onChange={setBoardStyle} />
          <BoardMinimap
            key={`minimap-${canvasTick}`}
            canvas={fabricRef.current}
            canvasObjects={Array.from(canvasObjects)}
            onJump={(point) => {
              centerCanvasOnPoint({ canvas: fabricRef.current, point });
              updateZoomLevel();
            }}
          />
          <ZoomControls
            zoomPercent={zoomLevel}
            onZoomIn={() => setCanvasZoom((fabricRef.current?.getZoom() || 1) + 0.1)}
            onZoomOut={() => setCanvasZoom((fabricRef.current?.getZoom() || 1) - 0.1)}
            onReset={resetCanvasZoom}
            onFit={() => {
              fitCanvasToContent(fabricRef.current);
              updateZoomLevel();
            }}
            onCenter={() => {
              centerCanvasOnSelection(fabricRef.current);
              updateZoomLevel();
            }}
          />
        </Live>
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
          selectedCount={selectedCount}
          isLocked={isLocked}
          onDuplicate={duplicateSelection}
          onBringToFront={bringSelectionToFront}
          onSendToBack={sendSelectionToBack}
          onToggleLock={toggleSelectionLock}
          onClearSelection={clearSelection}
          onDistributeHorizontally={distributeHorizontally}
          onDistributeVertically={distributeVertically}
        />
      </section>
    </main>
  );
}
