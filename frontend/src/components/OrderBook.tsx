import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

type OrderEntry = {
  total: number;
  orders: { [userId: string]: number };
};

type Orderbook = {
  [symbol: string]: {
    yes: { [price: string]: OrderEntry };
    no: { [price: string]: OrderEntry };
  };
};

export default function Component({ orderbook }: { orderbook: Orderbook }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Orderbook Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(orderbook).map(([symbol, data]) => (
            <div key={symbol} className="border-b pb-8 last:border-b-0">
              <h3 className="text-xl font-semibold mb-4">{symbol}</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">YES</h4>
                  <div className="space-y-2">
                    {Object.entries(data.yes)
                      .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                      .map(([price, entry]) => (
                        <div key={price} className="flex justify-between">
                          <span className="font-medium">{price}</span>
                          <span>{entry.total}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">NO</h4>
                  <div className="space-y-2">
                    {Object.entries(data.no)
                      .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                      .map(([price, entry]) => (
                        <div key={price} className="flex justify-between">
                          <span className="font-medium">{price}</span>
                          <span>{entry.total}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}