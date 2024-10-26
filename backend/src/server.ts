import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import userRoutes from './Routes/user.route.js';  
import publicRoutes from './Routes/public.route.js'; 
import cors from 'cors';
import { BIDSType, INR_BALANCESType, ORDERBOOKType } from './types.js'; 

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/', publicRoutes);

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

export function emitOrderbookUpdate(orderbook: ORDERBOOKType): void {
    io.emit('orderbook_update', orderbook);
}

export function emitBalancesUpdate(balances: INR_BALANCESType): void {
    io.emit('balances_update', balances);
}

export function emitBidsUpdate(bids: BIDSType): void {
    io.emit('bids_update', bids);
}

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { app, io, server };