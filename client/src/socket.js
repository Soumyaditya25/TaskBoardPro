import { io } from "socket.io-client";
const SERVER = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const socket = io(SERVER, { autoConnect: true });
