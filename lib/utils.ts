import jsPDF from "jspdf";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { ArrowRight, Circle, Image as ImageIcon, PencilLine, Slash, Square, StickyNote, Triangle } from "lucide-react";

const adjectives = [
  "Happy",
  "Creative",
  "Energetic",
  "Lively",
  "Dynamic",
  "Radiant",
  "Joyful",
  "Vibrant",
  "Cheerful",
  "Sunny",
  "Sparkling",
  "Bright",
  "Shining",
];

const animals = [
  "Dolphin",
  "Tiger",
  "Elephant",
  "Penguin",
  "Kangaroo",
  "Panther",
  "Lion",
  "Cheetah",
  "Giraffe",
  "Hippopotamus",
  "Monkey",
  "Panda",
  "Crocodile",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomName(): string {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return `${randomAdjective} ${randomAnimal}`;
}

export const getShapeInfo = (
  shape:
    | string
    | {
        type?: string;
        shapeKind?: string;
        isConnector?: boolean;
      }
) => {
  const shapeType = typeof shape === "string" ? shape : shape.type || "";
  const shapeKind = typeof shape === "string" ? "" : shape.shapeKind || "";
  const isConnector = typeof shape === "string" ? false : Boolean(shape.isConnector);

  if (isConnector || shapeKind === "connector") {
    return {
      icon: ArrowRight,
      name: "Connector",
    };
  }

  if (shapeKind === "freeform") {
    return {
      icon: PencilLine,
      name: "Free Drawing",
    };
  }

  switch (shapeType) {
    case "rect":
      return {
        icon: Square,
        name: "Rectangle",
      };

    case "circle":
      return {
        icon: Circle,
        name: "Circle",
      };

    case "triangle":
      return {
        icon: Triangle,
        name: "Triangle",
      };

    case "line":
      return {
        icon: Slash,
        name: "Line",
      };

    case "connector":
      return {
        icon: ArrowRight,
        name: "Connector",
      };

    case "i-text":
      return {
        icon: "/assets/text.svg",
        name: "Text",
      };

    case "image":
      return {
        icon: ImageIcon,
        name: "Image",
      };

    case "textbox":
      return {
        icon: StickyNote,
        name: "Sticky Note",
      };

    case "freeform":
    case "path":
      return {
        icon: PencilLine,
        name: "Free Drawing",
      };

    default:
      return {
        icon: Square,
        name: shapeType,
      };
  }
};

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

const getCanvasExportData = (fabricCanvas: fabric.Canvas | null) => {
  if (!fabricCanvas) return null;

  return {
    width: fabricCanvas.getWidth(),
    height: fabricCanvas.getHeight(),
    dataUrl: fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
      enableRetinaScaling: true,
    }),
  };
};

export const copyTextToClipboard = async (value: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};

export const exportToPdf = (fabricCanvas: fabric.Canvas | null) => {
  const canvasData = getCanvasExportData(fabricCanvas);

  if (!canvasData) return;

  // use jspdf
  const doc = new jsPDF({
    orientation: canvasData.width >= canvasData.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvasData.width, canvasData.height],
  });

  // add the image to the pdf
  doc.addImage(canvasData.dataUrl, "PNG", 0, 0, canvasData.width, canvasData.height);

  // download the pdf
  doc.save("canvas.pdf");
};

export const exportToPng = (fabricCanvas: fabric.Canvas | null) => {
  const canvasData = getCanvasExportData(fabricCanvas);
  if (!canvasData) return;

  downloadDataUrl(canvasData.dataUrl, "board.png");
};
