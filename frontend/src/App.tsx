import { useState, useEffect, useCallback } from 'react';
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import axios from 'axios';
import toast from 'react-hot-toast';
import Orderbook from './components/OrderBook';
import io from 'socket.io-client';


const BACKEND = "http://localhost:3000";
const socket = io(BACKEND);

type INRBalance = {
  balance: number;
  locked: number;
};

type StockBalance = {
  [symbol: string]: {
    yes: { quantity: number; locked: number };
    no: { quantity: number; locked: number };
  };
};

type Orderbook = {
  [symbol: string]: {
    yes: {
      [price: string]: {
        total: number;
        orders: { [userId: string]: number };
      }
    };
    no: {
      [price: string]: {
        total: number;
        orders: { [userId: string]: number };
      }
    };
  };
};

type BIDS = {
  [stockSymbol: string]: {
    [stocktype: string]: {
      [price: string]: {
        [userId: string]: {
          quantity: number;
        };
      };
    };
  };
};

export default function App() {
  const [inrBalances, setInrBalances] = useState<{ [userId: string]: INRBalance }>({});
  const [stockBalances, setStockBalances] = useState<{ [userId: string]: StockBalance }>({});
  const [orderbook, setOrderbook] = useState<Orderbook>({});
  const [bids, setBids] = useState<{ [userId: string]: BIDS }>({});
  const [userId, setUserId] = useState('');
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stockType, setStockType] = useState<"yes" | "no">("yes");



  socket.on('orderbook_update', (updatedOrderbook) => {
    setOrderbook(updatedOrderbook);
  });

  socket.on('balances_update', (updatedBalances) => {
    setInrBalances(updatedBalances.inr);
    setStockBalances(updatedBalances.stock);
  });

  socket.on('bids_update', (updatedBids) => {
    setBids(updatedBids);
  });




  const fetchBalances = useCallback(async () => {
    try {
      const inrResponse = await axios.get(`${BACKEND}/api/v1/balances/inr`);
      setInrBalances(inrResponse.data.INR_BALANCES);

      const stockResponse = await axios.get(`${BACKEND}/api/v1/balances/stock`);
      setStockBalances(stockResponse.data.STOCK_BALANCES);
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast.error('Failed to fetch balances');
    }
  }, []);

  const fetchOrderbook = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND}/api/v1/balances/orderbook`);
      setOrderbook(response.data.ORDERBOOK);
    } catch (error) {
      console.error('Error fetching orderbook:', error);
      toast.error('Failed to fetch orderbook');
    }
  }, []);

  const fetchBids = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND}/api/v1/balances/bid`);
      setBids(response.data.BIDS);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('Failed to fetch bids');
    }
  }, []);

  useEffect(() => {
    fetchBalances();
    fetchOrderbook();
    fetchBids();

    socket.on('orderbook_update', (updatedOrderbook) => {
      setOrderbook(updatedOrderbook);
    });

    socket.on('balances_update', (updatedBalances) => {
      setInrBalances(updatedBalances.inr);
      setStockBalances(updatedBalances.stock);
    });

    socket.on('bids_update', (updatedBids) => {
      setBids(updatedBids);
    });

    return () => {
      socket.off('orderbook_update');
      socket.off('balances_update');
      socket.off('bids_update');
    };
  }, [fetchBalances, fetchOrderbook, fetchBids]);

  const handleBuy = async () => {
    try {
      await axios.post(`${BACKEND}/api/v1/order/buy`, {
        userId,
        stockSymbol,
        quantity: Number(quantity),
        price: Number(price),
        stocktype: stockType
      });
      toast.success("Order placed successfully");
      fetchBalances();
      fetchOrderbook();
      fetchBids();
    } catch (error) {
      console.error('Error placing buy order:', error);
      toast.error('Failed to place buy order');
    }
  };

  const handleSell = async () => {
    try {
      await axios.post(`${BACKEND}/api/v1/order/sell`, {
        userId,
        stockSymbol,
        quantity: Number(quantity),
        price: Number(price),
        stocktype: stockType
      });
      toast.success("Order placed successfully");
      fetchBalances();
      fetchOrderbook();
      fetchBids();
    } catch (error) {
      console.error('Error in handleSell:', error);
      toast.error('Failed to place sell order');
    }
  };

  const handleCreateSymbol = async () => {
    try {
      await axios.post(`${BACKEND}/api/v1/symbol/create/${stockSymbol}`);
      toast.success("Symbol created successfully");
      fetchOrderbook();
      fetchBids();
    } catch (error) {
      console.error('Error creating symbol:', error);
      toast.error('Failed to create symbol');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Probo</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>INR Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(inrBalances, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(stockBalances, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Orderbook</CardTitle>
        </CardHeader>
        <CardContent>
          <Orderbook orderbook={orderbook} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(bids, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <Input placeholder="Stock Symbol" value={stockSymbol} onChange={(e) => setStockSymbol(e.target.value)} />
            <Input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Select value={stockType} onValueChange={(value: "yes" | "no") => setStockType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stock type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <div className="sm:col-span-2 flex justify-between gap-4">
              <Button onClick={handleBuy} className="flex-1">Buy</Button>
              <Button onClick={handleSell} className="flex-1">Sell</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create Stock Symbol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Stock Symbol" value={stockSymbol} onChange={(e) => setStockSymbol(e.target.value)} className="flex-1" />
            <Button onClick={handleCreateSymbol}>Create Symbol</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}