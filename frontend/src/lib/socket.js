import io from 'socket.io-client';

// One shared connection for the whole app.
// Deployed (npm run build): the server also serves this page, so connect to the same address.
// Developing (npm run dev): the page comes from Vite on :5173 and the server is on :3001.
export const socket = import.meta.env.PROD ? io() : io('http://localhost:3001');
