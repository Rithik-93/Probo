// import app from "../server";
// import http from 'http';
// import { Server } from 'socket.io';
// import { BIDSType, INR_BALANCESType, ORDERBOOKType } from '../types';

// const server = http.createServer(app);
// const io = new Server(server)

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });


// const port = 3000;
// server.listen(port, () => {
//     console.log(`server running on ${port}`)
// });

// function emitOrderbookUpdate(orderbook: ORDERBOOKType): void {
//     io.emit('orderbook_update', orderbook);
// }

// function emitBalancesUpdate(balances: INR_BALANCESType): void {
//     io.emit('balances_update', balances);
// }

// function emitBidsUpdate(bids: BIDSType): void {
//     io.emit('bids_update', bids);
// }

// module.exports = { server, emitOrderbookUpdate, emitBalancesUpdate, emitBidsUpdate };