import { useMyPresence, useOthers } from "@/liveblocks.config";
import { Avatar } from "./Avatar";
import styles from "./index.module.css";

const  ActiveUsers=()=> {
    const users = useOthers();
    const [myPresence] = useMyPresence();
    const hasMoreUsers = users.length > 3;

     return  <div className="flex items-center justify-center">
      <div className="flex items-center pl-3">

      {myPresence?.userName && (
          
          <Avatar
            name={myPresence.userName === "You" ? myPresence.userName : `${myPresence.userName} (You)`}
            color={myPresence.userColor}
            otherStyles="border-[3px] border-primary-green"
          />
      
      )}

{users.slice(0, 3).map(({ connectionId, presence }) => {
      return (
        <Avatar key={connectionId} 
         name={presence?.userName || "Guest"} color={presence?.userColor} otherStyles="-ml-3"/>
      );
    })}

        {hasMoreUsers && <div className={styles.more}>
          +{users.length - 3}</div>}

      
      </div>
    </div>
  }
  export default ActiveUsers;
