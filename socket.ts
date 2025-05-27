import { io } from 'socket.io-client';
import { appDomain } from "./src/constants";

// export const appDomain: string = import.meta.env.VITE_APP_URL;

// Create a connection using the environment variable for the URL
const connection: string = appDomain;
const socket = io(connection, { transports: ['websocket'] });

// Optionally, you can add listeners for events here (e.g., socket.on('message', callback))
export default socket;