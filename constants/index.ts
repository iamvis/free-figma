import {
  ArrowRight,
  Circle,
  Hand,
  LayoutTemplate,
  Image as ImageIcon,
  PencilLine,
  Slash,
  Sparkles,
  Square,
  StickyNote,
  Triangle,
  Workflow,
} from "lucide-react";

import { TemplateOption } from "./../types/type";

export const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export const shapeElements = [
  { icon: Square, name: "Rectangle", value: "rectangle" },
  { icon: Circle, name: "Circle", value: "circle" },
  { icon: Triangle, name: "Triangle", value: "triangle" },
  { icon: Slash, name: "Line", value: "line" },
  { icon: ArrowRight, name: "Connector", value: "connector" },
  { icon: ImageIcon, name: "Image", value: "image" },
  { icon: PencilLine, name: "Free Drawing", value: "freeform" },
  { icon: StickyNote, name: "Sticky Note", value: "sticky-note" },
];

export const navElements = [
  { icon: "/assets/select.svg", name: "Select", value: "select" },
  { icon: Hand, name: "Hand", value: "hand" },
  { icon: Square, name: "Rectangle", value: shapeElements },
  { icon: "/assets/text.svg", value: "text", name: "Text" },
  { icon: "/assets/delete.svg", value: "delete", name: "Delete" },
  { icon: "/assets/reset.svg", value: "reset", name: "Reset" },
];

export const defaultNavElement = {
  icon: "/assets/select.svg",
  name: "Select",
  value: "select",
};

export const directionOptions = [
  { label: "Bring to Front", value: "front", icon: "/assets/front.svg" },
  { label: "Send to Back", value: "back", icon: "/assets/back.svg" },
];

export const fontFamilyOptions = [
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "Work Sans", label: "Work Sans" },
  { value: "Caveat", label: "Caveat" },
];

export const fontSizeOptions = [
  { value: "10", label: "10" },
  { value: "12", label: "12" },
  { value: "14", label: "14" },
  { value: "16", label: "16" },
  { value: "18", label: "18" },
  { value: "20", label: "20" },
  { value: "22", label: "22" },
  { value: "24", label: "24" },
  { value: "26", label: "26" },
  { value: "28", label: "28" },
  { value: "30", label: "30" },
  { value: "32", label: "32" },
  { value: "34", label: "34" },
  { value: "36", label: "36" },
];

export const fontWeightOptions = [
  { value: "400", label: "Normal" },
  { value: "500", label: "Semibold" },
  { value: "600", label: "Bold" },
];

export const alignmentOptions = [
  { value: "left", label: "Align Left", icon: "/assets/align-left.svg" },
  { value: "horizontalCenter", label: "Align Horizontal Center", icon: "/assets/align-horizontal-center.svg" },
  { value: "right", label: "Align Right", icon: "/assets/align-right.svg" },
  { value: "top", label: "Align Top", icon: "/assets/align-top.svg" },
  { value: "verticalCenter", label: "Align Vertical Center", icon: "/assets/align-vertical-center.svg" },
  { value: "bottom", label: "Align Bottom", icon: "/assets/align-bottom.svg" },
];

export const shortcuts = [
  { key: "1", name: "Undo", shortcut: "Ctrl/Cmd + Z" },
  { key: "2", name: "Redo", shortcut: "Ctrl/Cmd + Y" },
  { key: "3", name: "Select tool", shortcut: "V" },
  { key: "4", name: "Hand tool", shortcut: "H / Space" },
  { key: "5", name: "Rectangle", shortcut: "R" },
  { key: "6", name: "Text", shortcut: "T" },
  { key: "7", name: "Sticky note", shortcut: "N" },
  { key: "8", name: "Connector", shortcut: "C" },
];

export const templateOptions: TemplateOption[] = [
  {
    name: "Brainstorm",
    description: "Drops a headline and a cluster of sticky notes for idea mapping.",
    value: "brainstorm",
    icon: StickyNote,
  },
  {
    name: "Flowchart",
    description: "Adds a simple decision flow with labeled steps and arrows.",
    value: "flowchart",
    icon: Workflow,
  },
  {
    name: "Wireframe",
    description: "Creates a landing-page layout scaffold for quick UI sketching.",
    value: "wireframe",
    icon: LayoutTemplate,
  },
  {
    name: "Journey",
    description: "Drops a polished customer journey lane with checkpoints and notes.",
    value: "journey",
    icon: Workflow,
  },
  {
    name: "Retro",
    description: "Creates a designed retrospective board with themed columns and prompts.",
    value: "retro",
    icon: Sparkles,
  },
];
