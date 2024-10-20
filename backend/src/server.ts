import express from 'express';
import userRoutes from './Routes/user.route';
import publicRoutes from './Routes/public.route'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import { BIDSType, INR_BALANCESType, ORDERBOOKType } from './types';


const app = express();

const server = http.createServer(app);
const io = new Server(server)

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.use(express.json());
app.use(cors());

app.use('/api/v1/user', userRoutes);

app.use('/api/v1/', publicRoutes);

const port = 3000;
app.listen(port, () => {
    console.log(`server running on ${port}`)
});

function emitOrderbookUpdate(orderbook: ORDERBOOKType): void {
    io.emit('orderbook_update', orderbook);
}

function emitBalancesUpdate(balances: INR_BALANCESType): void {
    io.emit('balances_update', balances);
}

function emitBidsUpdate(bids: BIDSType): void {
    io.emit('bids_update', bids);
}

module.exports = { server, emitOrderbookUpdate, emitBalancesUpdate, emitBidsUpdate };
export default app;