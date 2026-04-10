"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { templateOptions } from "@/constants";
import { getShapeInfo } from "@/lib/utils";
import IconRenderer from "./IconRenderer";
import { TemplateOption } from "@/types/type";

type CanvasShapeEntry = [
  string,
  {
    objectId?: string;
    type?: string;
    shapeKind?: string;
    isConnector?: boolean;
  },
];

const LeftSidebar = ({
  allShapes,
  onTemplateSelect,
}: {
  allShapes: CanvasShapeEntry[];
  onTemplateSelect: (template: TemplateOption["value"]) => void;
}) => {
  const [query, setQuery] = useState("");

  const memoizedShapes = useMemo(
    () => {
      const filteredShapes = allShapes.filter((shape) => {
        const info = getShapeInfo(shape[1] || "");
        return info.name.toLowerCase().includes(query.toLowerCase());
      });

      return (
      <section className="panel-shell flex h-full min-w-[240px] flex-col overflow-y-auto text-primary-grey-300 max-sm:hidden">
        <div className="panel-section space-y-2">
          <h3 className="type-kicker">Layers</h3>
          <p className="type-body">Track every element on the board in one place.</p>
          <div className="flex items-center gap-2 rounded-2xl border border-primary-grey-100 bg-primary-grey-200/35 px-3 py-2">
            <Search className="h-4 w-4 text-primary-grey-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search layers"
              className="w-full bg-transparent text-sm text-[rgb(var(--app-text))] outline-none placeholder:text-primary-grey-300"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="text-primary-grey-300 hover:text-[rgb(var(--app-text))]">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-primary-grey-200/45 px-2.5 py-1 type-mono">
              {allShapes.length} total
            </span>
            <span className="rounded-full bg-primary-grey-200/45 px-2.5 py-1 type-mono">
              {filteredShapes.length} shown
            </span>
          </div>
        </div>
        <div className="panel-section space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="type-kicker">Templates</h3>
            <span className="type-mono">Quick start</span>
          </div>
          <div className="space-y-2">
            {templateOptions.map((template) => (
              <button
                key={template.value}
                type="button"
                className="interactive-card flex w-full items-start gap-3 rounded-2xl border border-primary-grey-100 bg-primary-grey-200/35 px-3 py-3 text-left transition-colors hover:bg-primary-grey-200"
                onClick={() => onTemplateSelect(template.value)}
              >
                <div className="mt-0.5 rounded-xl bg-primary-grey-100/70 p-2 text-[rgb(var(--app-text))]">
                  <IconRenderer icon={template.icon} alt={template.name} size={16} />
                </div>
                <div>
                  <p className="font-ui text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--app-text))]">{template.name}</p>
                  <p className="mt-1 text-[13px] leading-5 text-primary-grey-300">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          {filteredShapes.length ? filteredShapes.map((shape) => {
            const info = getShapeInfo(shape[1] || "");

            return (
              <div
                key={shape[1]?.objectId}
                className="interactive-card group mx-3 my-1 flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:cursor-pointer hover:bg-primary-green hover:text-primary-black"
              >
                <IconRenderer
                  icon={info?.icon}
                  alt='Layer'
                  size={16}
                  className='group-hover:invert'
                />
                <h3 className='font-ui text-[14px] font-semibold tracking-[-0.02em] capitalize'>{info.name}</h3>
              </div>
            );
          }) : (
            <div className="mx-3 my-4 rounded-2xl border border-dashed border-primary-grey-100 px-4 py-6 text-center text-sm text-primary-grey-300">
              No layers match your search.
            </div>
          )}
        </div>
      </section>
    )},
    [allShapes, onTemplateSelect, query]
  );

  return memoizedShapes;
};

export default LeftSidebar;
