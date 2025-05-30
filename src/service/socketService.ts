import { io, Socket } from "socket.io-client";
import { getToken } from "./authApiService";
import { LOCAL_API_BASE_URL } from "./apiService";
// import { getToken } from "../";

let socket: Socket | null = null;

export const initializeSocket = async () => {
  const token = await getToken(); // Check if the token is available **Not Tested**

  socket = io(LOCAL_API_BASE_URL, {
    autoConnect: true,
    transports: ["websocket"],
    auth: { token },
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};

// Basic socket event listeners
export const setupSocketListeners = (navigation: any) => {
  socket?.on("connect", () => {
    console.log("Connected to socket server");
  });

  socket?.on("sosAlert", (alert: any) => {
    console.log("Received SOS Alert:", alert);
  });

  socket?.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });
};
