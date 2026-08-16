import { createSocket } from "../../../lib/socket"

const createSocketSlice = (set, get) => ({
    onlineUsers: [],
    socket: null,

    connectSocket: () => {
        const { authUser } = get();

        // Prevents redundant socket connection
        if (!authUser || get().socket?.connected) return;

        const socket = createSocket(authUser);
        socket.connect();
        set({socket: socket});

        // Configure socket to refresh online users when needed
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
        };
    },
});

export default createSocketSlice;
