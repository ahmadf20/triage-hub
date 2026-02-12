import { io } from "socket.io-client";

// Use environment variable or default to localhost:3000
const URL = process.env.NEXT_PUBLIC_API_URL;

export const socket = io(URL, {
  autoConnect: true,
});
