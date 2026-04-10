"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

import { AppIcon } from "@/types/type";

type IconRendererProps = {
  icon: AppIcon | undefined;
  alt: string;
  size?: number;
  className?: string;
};

const IconRenderer = ({ icon, alt, size = 20, className = "" }: IconRendererProps) => {
  if (!icon) return null;

  if (typeof icon === "string") {
    return (
      <Image
        src={icon}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={className}
      />
    );
  }

  const IconComponent = icon as LucideIcon;

  return (
    <IconComponent
      size={size}
      strokeWidth={1.9}
      className={`shrink-0 text-current ${className}`.trim()}
      aria-hidden="true"
    />
  );
};

export default IconRenderer;
