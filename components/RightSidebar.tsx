import React, { useRef } from 'react'
import Dimensions from './settings/Dimensions'
import Text from './settings/Text'
import Color from './settings/Color'
import Export from './settings/Export'
import QuickActions from './settings/QuickActions'
import { RightSidebarProps } from '@/types/type'
import { modifyShape } from '@/lib/shapes'
import { useRedo } from '@/liveblocks.config'

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
  selectedCount,
  isLocked,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onClearSelection,
  onDistributeHorizontally,
  onDistributeVertically,
}:RightSidebarProps) => {
  const colorInputRef= useRef(null);
  const strokInputRef= useRef(null)
   const handleInputChange = (property: string, value: string) =>{
  
    if(!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({
      ...prev,[property]:value
    }))
    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value, 
      activeObjectRef,
      syncShapeInStorage
    })
   }

  return (
    <section className="panel-shell soft-glow flex h-full min-w-[260px] flex-col overflow-y-auto text-primary-grey-300 max-sm:hidden select-none">
    <div className="panel-section space-y-2">
      <h3 className="type-kicker">Design</h3>
      <span className="type-body block">
        Fine-tune size, typography, color, and export options for the selected element.
      </span>
    </div>
    <Dimensions
    width={elementAttributes.width}
    height={elementAttributes.height}
    handleInputChange={handleInputChange}
    isEditingRef={isEditingRef}
    />
    <Text
     fontFamily={elementAttributes.fontFamily}
     fontSize={elementAttributes.fontSize}
     fontWeight={elementAttributes.fontWeight}
     handleInputChange={handleInputChange}
    />
    <QuickActions
      selectedCount={selectedCount}
      isLocked={isLocked}
      onDuplicate={onDuplicate}
      onBringToFront={onBringToFront}
      onSendToBack={onSendToBack}
      onToggleLock={onToggleLock}
      onClearSelection={onClearSelection}
      onDistributeHorizontally={onDistributeHorizontally}
      onDistributeVertically={onDistributeVertically}
    />
    <Color
    inputRef={colorInputRef}
    attribute={elementAttributes.fill}
    attributeType='fill'
    placeholder="color"
    handleInputChange={handleInputChange}
    />
    <Color
    inputRef={strokInputRef}
    attribute={elementAttributes.stroke}
    attributeType='stroke'
    placeholder="stroke"
    handleInputChange={handleInputChange}
    />
    <Export fabricCanvas={fabricRef.current} />
    </section>
  )
}

export default RightSidebar
