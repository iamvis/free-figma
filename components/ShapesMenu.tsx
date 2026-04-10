"use client";

import { ShapesMenuProps } from "@/types/type";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import IconRenderer from "./IconRenderer";

const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
}: ShapesMenuProps) => {
  const isDropdownElem = item.value.some((elem) => elem?.value === activeElement.value);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-md bg-transparent p-0 text-inherit hover:bg-transparent"
            onClick={() => handleActiveElement(item)}
          >
            <IconRenderer
              icon={isDropdownElem ? activeElement.icon : item.icon}
              alt={item.name}
              size={20}
              className={isDropdownElem ? "invert" : ""}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mt-5 flex flex-col gap-y-1 rounded-2xl border border-primary-grey-100 bg-primary-black/95 p-3 text-[rgb(var(--app-text))] shadow-2xl">
          {item.value.map((elem) => (
            <Button
              key={elem?.name}
              onClick={() => {
                handleActiveElement(elem);
              }}
              className={`flex h-fit justify-between gap-10 rounded-none px-5 py-3 focus:border-none ${
                activeElement.value === elem?.value ? "bg-primary-green" : "hover:bg-primary-grey-200"
              }`}
            >
              <div className="group flex items-center gap-2">
                <IconRenderer
                  icon={elem?.icon}
                  alt={elem?.name as string}
                  size={20}
                  className={activeElement.value === elem?.value ? "invert" : ""}
                />
                <p
                  className={`text-sm  ${
                    activeElement.value === elem?.value ? "text-slate-950" : "text-[rgb(var(--app-text))]"
                  }`}
                >
                  {elem?.name}
                </p>
              </div>
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        className="hidden"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </>
  );
};

export default ShapesMenu;
