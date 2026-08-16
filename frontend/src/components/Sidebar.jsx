import { useEffect, useState } from "react";
import { useChatStore } from "../store/chat/useChatStore";
import { useAuthStore } from "../store/auth/useAuthStore";
import { Loader } from "lucide-react";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import SidebarUser from "./SidebarUser";

const Sidebar = () => {
  const {
    getSidebarUsers,
    pinnedChatUsers,
    otherChatUsers,
    selectedUser,
    setSelectedUser,
    isUsersLoading,

  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getSidebarUsers();
  }, [getSidebarUsers]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
    setSearchTerm("");
  };

  const filterOnline = (users) =>
    showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users;

  const filterBySearch = (users) => {
    if (!searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter((user) => user.fullName.toLowerCase().includes(lower));
  };

  const filteredPinnedUsers = filterBySearch(filterOnline(pinnedChatUsers));
  const filteredOtherUsers = filterBySearch(filterOnline(otherChatUsers));

  return (
    <aside
      className={`
        fixed top-16 left-0 h-full z-30
        bg-base-100 border-r border-base-300
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-72" : "w-16"}
      `}
    >
      {/* Header */}
      <div className="border-b border-base-300 px-2 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Users className="size-6 shrink-0" />
          {isSidebarOpen && <span className="font-medium">Contacts</span>}
        </div>

        <button onClick={handleSidebarToggle} className="btn btn-ghost btn-sm">
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="p-4 border-b border-base-300 flex flex-col gap-2">
          {/* Search input */}
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm w-full"
          />

          {/* Online only checkbox */}
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm whitespace-nowrap">Show online only</span>
          </label>

          <div className="text-xs text-zinc-500 mt-1">
            ({onlineUsers.length - 1} online)
          </div>
        </div>
      )}
      {/* User list */}
      <div className="overflow-scroll py-2">
        {/* Pinned users */}
        {filteredPinnedUsers.length > 0 && (
          <>
            {isSidebarOpen && (
              <div className="px-4 py-2 text-xs font-semibold text-zinc-400 uppercase">
                Pinned
              </div>
            )}

            {filteredPinnedUsers.map((user) => (
              <SidebarUser
                key={user._id}
                user={user}
                isSidebarOpen={isSidebarOpen}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                onlineUsers={onlineUsers}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            ))}
            {/* Sidebar Divider */}
            <div className="py-2">
              <div className="border-t border-base-300" />
            </div>
          </>
        )}

        {/* Other users */}
        {filteredOtherUsers.length > 0 && (
          <>
            {filteredOtherUsers.map((user) => (
              <SidebarUser
                key={user._id}
                user={user}
                isSidebarOpen={isSidebarOpen}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                onlineUsers={onlineUsers}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            ))}
          </>
        )}

        {/* No users found */}
        {filteredOtherUsers.length === 0 &&
          filteredPinnedUsers.length === 0 && (
            <p className="text-center pt-40">No Users Found</p>
          )}

        {(isUsersLoading) && (
          <div className="flex justify-center py-2">
            <Loader className="size-6 animate-spin opacity-50" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
