
import React from 'react'
import Cursor from './Cursor';
import { COLORS } from '@/constants';
import { useOthers } from '@/liveblocks.config';

const LiveCursors = () => {
  const others= useOthers();
return  others.map(({connectionId, presence})=>{
    if(presence==null || !presence?.cursor) return null;

    return (
        <Cursor
        key={connectionId}
        color={presence.userColor || COLORS[Number(connectionId) % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message || ''}
        name={presence.userName || `Guest ${connectionId}`}
        />
    )
  })
    
}

export default LiveCursors
