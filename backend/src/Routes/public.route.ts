import express, { Request, Response } from 'express';
// import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from '../server';

import { BIDSType, INR_BALANCESType, ORDERBOOKType, STOCK_BALANCESType } from '../types';

const router = express.Router();

export let INR_BALANCES: INR_BALANCESType = {
    "user1": {
        balance: 1000000,
        locked: 0
    },
    "user2": {
        balance: 20000000,
        locked: 20
    }
};

export let ORDERBOOK: ORDERBOOKType | null = {
    "BTC_USDT": {
        "yes": {
            "9.5": {
                "total": 12,
                orders: {
                    "user1": 2,
                    "user2": 10,
                }
            },
            "8.5": {
                "total": 12,
                orders: {
                    "user1": 6,
                    "user2": 6,
                }
            },
            "7.5": {
                "total": 15,
                orders: {
                    "user1": 1,
                    "user2": 14,
                }
            },
            "6.5": {
                "total": 8,
                orders: {
                    "user2": 4,
                    "user1": 4,
                }
            }
        },
        "no": {
            "1.0": {
                "total": 10,
                orders: {
                    "user2": 5,
                    "user1": 5
                }
            },
            "2.0": {
                "total": 20,
                orders: {
                    "user1": 10,
                    "user2": 10,
                }
            },
            "3.0": {
                "total": 5,
                orders: {
                    "user1": 3,
                    "user2": 2
                }
            },
            "4.0": {
                "total": 6,
                orders: {
                    "user1": 4,
                    "user2": 2,
                }
            }
        }
    }
};

export let BIDS: BIDSType = {};

export let STOCK_BALANCES: STOCK_BALANCESType = {
    "user1": {
        "BTC_USDT": {
            "yes": {
                "quantity": 13,
                "locked": 0
            },
            "no": {
                "quantity": 22,
                "locked": 0
            }
        }
    },
    "user2": {
        "BTC_USDT": {
            "no": {
                "quantity": 19,
                "locked": 4
            },
            "yes": {
                "quantity": 13,
                "locked": 0
            }
        }
    }
}

router.get('/balances/orderbook', (req: Request, res: Response) => {
    res.json({
        ORDERBOOK
    })
    return
});

router.get('/balances/inr', (req: Request, res: Response) => {
    res.json({
        INR_BALANCES
    })
    return
});

router.get('/balances/stock', (req: Request, res: Response) => {
    res.json({
        STOCK_BALANCES
    })
    return
});

router.get('/balances/bid', (req: Request, res: Response) => {
    res.json({
        BIDS
    })
    return
});

router.delete('/reset', (req: Request, res: Response) => {
    ORDERBOOK = {};
    STOCK_BALANCES = {};
    INR_BALANCES = {};
    res.json({
        msg: "Reset successful"
    })
});

interface OrderBuyRequestBody {
    userId: string;
    stockSymbol: string;
    quantity: number;
    price: number;
    stocktype: "yes" | "no";
}

// @ts-ignore
router.post('/order/buy', async (req: Request<{}, {}, OrderBuyRequestBody>, res: Response) => {
    const { userId, stockSymbol, quantity, price, stocktype } = req.body;

    
    const totalCost = quantity * price;


    if (ORDERBOOK === null) {
        ORDERBOOK = {};
    }
    console.log(ORDERBOOK[stockSymbol])
    // if (ORDERBOOK[stockSymbol]) {
    //     res.json({
    //         msg : `${stockSymbol} not available in the orderbook`
    //     })
    //     return
    // }

    if (!INR_BALANCES[userId]) {
        return res.status(400).json({ msg: "User not found" });
    }
    if (stocktype !== "no" && stocktype !== "yes") {
        return res.status(400).json({ msg: "Please enter a valid stock type" });
    }
    
    const userBalance = INR_BALANCES[userId].balance;
    if (totalCost > userBalance) {
        return res.status(400).json({ msg: "Not enough INR" });
    }
    if (!ORDERBOOK[stockSymbol]) {
        ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    }

    let remainingQuantity = quantity;
    const oppositeStocktype = stocktype === "yes" ? "no" : "yes";

    const updateStockBalance = (type: "yes" | "no", amount: number) => {
        if (!STOCK_BALANCES[userId]) {
            STOCK_BALANCES[userId] = {};
        }
        if (!STOCK_BALANCES[userId][stockSymbol]) {
            STOCK_BALANCES[userId][stockSymbol] = { yes: { quantity: 0, locked: 0 }, no: { quantity: 0, locked: 0 } };
        }
        STOCK_BALANCES[userId][stockSymbol][type].quantity += amount;
    };

    if (BIDS[stockSymbol] && BIDS[stockSymbol][oppositeStocktype] && BIDS[stockSymbol][oppositeStocktype][price]) {
        const oppositeBids = BIDS[stockSymbol][oppositeStocktype][price];
        const oppositeUserId = Object.keys(oppositeBids)[0];
        const oppositeQuantity = oppositeBids[oppositeUserId].quantity;

        const nullifyQuantity = Math.min(remainingQuantity, oppositeQuantity);
        remainingQuantity -= nullifyQuantity;
        BIDS[stockSymbol][oppositeStocktype][price][oppositeUserId].quantity -= nullifyQuantity;

        if (BIDS[stockSymbol][oppositeStocktype][price][oppositeUserId].quantity <= 0) {
            delete BIDS[stockSymbol][oppositeStocktype][price][oppositeUserId];
        }

        if (Object.keys(BIDS[stockSymbol][oppositeStocktype][price]).length === 0) {
            delete BIDS[stockSymbol][oppositeStocktype][price];
        }

        if (Object.keys(BIDS[stockSymbol][oppositeStocktype]).length === 0) {
            delete BIDS[stockSymbol][oppositeStocktype];
        }

        if (Object.keys(BIDS[stockSymbol]).length === 0) {
            delete BIDS[stockSymbol];
        }
    }

    if (remainingQuantity > 0) {
        if (!BIDS[stockSymbol]) {
            BIDS[stockSymbol] = {};
        }
        if (!BIDS[stockSymbol][stocktype]) {
            BIDS[stockSymbol][stocktype] = {};
        }
        if (!BIDS[stockSymbol][stocktype][price]) {
            BIDS[stockSymbol][stocktype][price] = {};
        }
        if (!BIDS[stockSymbol][stocktype][price][userId]) {
            BIDS[stockSymbol][stocktype][price][userId] = { quantity: 0 };
        }
        BIDS[stockSymbol][stocktype][price][userId].quantity += remainingQuantity;

        return res.json({
            msg: "Order partially/fully added to BIDS",
            remainingQuantity,
            bids: BIDS[stockSymbol][stocktype][price][userId]
        });
    }
    if (remainingQuantity === 0) {
        updateStockBalance(stocktype, quantity); 
    }

    const executedCost = (quantity - remainingQuantity) * price;
    INR_BALANCES[userId].balance -= totalCost;
    INR_BALANCES[userId].locked += executedCost;

    return res.json({
        msg: "Order processed successfully",
        executedQuantity: quantity - remainingQuantity,
        remainingQuantity,
        stock: STOCK_BALANCES[userId][stockSymbol]
    });
});




router.post('/order/sell', async (req: Request, res: Response) => {
    const { userId, stockSymbol, quantity, price, stocktype } = req.body;
    const parsedPrice = price.toString();
    try {










        router.post('/order/buy', async (req: Request<{}, {}, OrderBuyRequestBody>, res: Response) => {
            const { userId, stockSymbol, quantity, price, stocktype } = req.body;
            const totalCost = quantity * price;
        
            if (!INR_BALANCES[userId]) {
                res.status(400).json({ msg: "User not found" });
                return;
            }
            if (stocktype !== "no" && stocktype !== "yes") {
                res.json({ msg: "Please enter a valid stock type" });
                return;
            }
            if (ORDERBOOK === null) {
                ORDERBOOK = {};
            }
            const userBalance = INR_BALANCES[userId].balance;
            if (totalCost > userBalance) {
                res.status(400).json({ msg: "Not enough INR" });
                return;
            }
            if (!ORDERBOOK[stockSymbol]) {
                res.json({
                    msg: `${stockSymbol} unavailable in the Orderbook`
                });
                return;
            }
        
            const oppositeStocktype = stocktype === "yes" ? "no" : "yes";
            let remainingQuantity = quantity;
        
            // Check if there's stock available for the opposite stocktype
            if (ORDERBOOK[stockSymbol][oppositeStocktype] && ORDERBOOK[stockSymbol][oppositeStocktype][price]) {
                const availableOppositeQuantity = ORDERBOOK[stockSymbol][oppositeStocktype][price].total;
                if (availableOppositeQuantity > 0) {
                    const quantityToExecute = Math.min(remainingQuantity, availableOppositeQuantity);
                    ORDERBOOK[stockSymbol][oppositeStocktype][price].total -= quantityToExecute;
                    remainingQuantity -= quantityToExecute;
        
                    // Update user's stock balance
                    if (!STOCK_BALANCES[userId]) {
                        STOCK_BALANCES[userId] = {};
                    }
                    if (!STOCK_BALANCES[userId][stockSymbol]) {
                        STOCK_BALANCES[userId][stockSymbol] = { yes: { quantity: 0, locked: 0 }, no: { quantity: 0, locked: 0 } };
                    }
                    STOCK_BALANCES[userId][stockSymbol][stocktype].quantity += quantityToExecute;
        
                    // Update user's INR balance
                    const executedCost = quantityToExecute * price;
                    INR_BALANCES[userId].balance -= executedCost;
                    INR_BALANCES[userId].locked += executedCost;
                }
            }
        
            // If there's remaining quantity, store it in BIDS
            if (remainingQuantity > 0) {
                if (!BIDS[stockSymbol]) {
                    BIDS[stockSymbol] = {};
                }
                if (!BIDS[stockSymbol][stocktype]) {
                    BIDS[stockSymbol][stocktype] = {};
                }
                if (!BIDS[stockSymbol][stocktype][price]) {
                    BIDS[stockSymbol][stocktype][price] = {};
                }
                if (!BIDS[stockSymbol][stocktype][price][userId]) {
                    BIDS[stockSymbol][stocktype][price][userId] = { quantity: 0 };
                }
                BIDS[stockSymbol][stocktype][price][userId].quantity += remainingQuantity;
        
                // Lock the remaining funds
                const remainingCost = remainingQuantity * price;
                INR_BALANCES[userId].balance -= remainingCost;
                INR_BALANCES[userId].locked += remainingCost;
            }
        
            res.json({ 
                msg: "Order processed successfully", 
                executedQuantity: quantity - remainingQuantity, 
                remainingQuantity,
                stock: STOCK_BALANCES[userId][stockSymbol]
            });
        });













        if (!INR_BALANCES[userId]) {
            res.status(400).json({ msg: "User not found" });
            return
        };
        if (!STOCK_BALANCES[userId][stockSymbol]) {
            res.json({
                msg: `Unable to find ${stockSymbol} stock in your account`
            })
            return
        };
        const totalCost = price * quantity;
        const userBalance = INR_BALANCES[userId].balance;
        if (ORDERBOOK === null) {
            ORDERBOOK = {}
        }
        if (totalCost > userBalance) {
            res.json({
                msg: "insufficient balance"
            })
            return
        };
        if (stocktype === "yes") {
            if (STOCK_BALANCES[userId][stockSymbol].yes.quantity < quantity) {
                res.json({
                    msg: `insufficient ${stockSymbol} stocks of YES in your account`
                })
                return
            }
            if (ORDERBOOK === null) {
                ORDERBOOK = {}
            }
            STOCK_BALANCES[userId][stockSymbol].yes.quantity -= quantity;
            ORDERBOOK[stockSymbol].yes[price].total += quantity;
        } else if (stocktype === "no") {
            if (STOCK_BALANCES[userId][stockSymbol].no.quantity < quantity) {
                res.json({
                    msg: `insufficient NO stocks of ${stockSymbol}`
                })
                return
            }
            if (ORDERBOOK === null) {
                ORDERBOOK = {}
            }
            STOCK_BALANCES[userId][stockSymbol].no.quantity -= quantity;
            ORDERBOOK[stockSymbol].no[parsedPrice].total += quantity;
            // console.log(parsedPrice)
            // console.log(ORDERBOOK[stockSymbol].no)
        };

        INR_BALANCES[userId].balance -= totalCost;
        INR_BALANCES[userId].locked += totalCost;
        res.json({
            msg: "Order placed ig"
        });
    } catch (e) {
        console.error(e);
    }
});

router.get('/orderbook/:stockSymbol', (req: Request, res: Response) => {
    const stockSymbol = req.params.stockSymbol;
    if (ORDERBOOK === null) {
        ORDERBOOK = {};
    }
    if (!ORDERBOOK[stockSymbol]) {
        res.json({
            msg: `No ${stockSymbol} stock available in the orderbook`
        });
        return
    };
    res.json({
        ORDERBOOK
    })
})

router.put('/trade/mint', (req: Request, res: Response) => {
    const { stockSymbol, userId, quantity } = req.body;

    if (!INR_BALANCES[userId]) {
        res.json({ message: "No user found" });
        return;
    }

    if (!STOCK_BALANCES[userId][stockSymbol]) {
        res.json({
            msg: `You don't have any ${stockSymbol} available`
        })
        return
    };

    STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
});

router.post('/symbol/create/:stockSymbol', (req: Request, res: Response) => {
    const stockSymbol = req.params.stockSymbol;

    if (ORDERBOOK === null) {
        ORDERBOOK = {};
    }
    if (ORDERBOOK[stockSymbol]) {
        res.json({ msg: "stockSymbol already exists" });
        return;
    }

    ORDERBOOK[stockSymbol] = {
        yes: {},
        no: {}
    };

    res.json({ msg: "stockSymbol created successfully" });
});

export default router;