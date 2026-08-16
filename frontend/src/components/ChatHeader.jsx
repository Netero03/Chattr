import { useAuthStore } from "../store/auth/useAuthStore";
import { useChatStore } from "../store/chat/useChatStore";
import {Pin, PinOff} from "lucide-react";

const ChatHeader = () => {
  const {
    selectedUser,
    pinnedChatUsers,
    pinUser,
    unpinUser,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isPinned = pinnedChatUsers.some(
  (user) => user._id === selectedUser?._id
);

const handleTogglePin = () => {
    if (isPinned) {
      unpinUser(selectedUser._id);
    } else {
      pinUser(selectedUser._id);
    }
  };

  return (
    <div className="py-2.5 px-4 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
          {/* Pin user button */}
          {/* Pin / Unpin */}
        <button
          onClick={handleTogglePin}
          className="btn btn-ghost btn-sm"
          title={isPinned ? "Unpin user" : "Pin user"}
        >
          {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
        </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
