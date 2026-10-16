import io from 'socket.io-client';

// One shared connection for the whole app (same as before the split)
export const socket = io('http://localhost:3001');
