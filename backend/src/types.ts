export interface INR_BALANCESType {
    [key: string]:
    {
        balance: number,
        locked: number
    }
}


export interface BIDSType {
    [stockSymbol: string]: {
        [stocktype: string]: {
            [price: string]: {
                [userId: string]: {
                    quantity: number;
                };
            };
        };
    };
}


export interface ORDERBOOKType {
    [stockSymbol: string]: {
        yes: {
            [price: string]: {
                total: number;
                orders: {
                    [user: string]: number;
                };
            };
        };
        no: {
            [price: string]: {
                total: number;
                orders: {
                    [user: string]: number;
                };
            };
        };
    };
}

export interface STOCK_BALANCESType {
    [user: string]: {
        [stockSymbol: string]: {
            yes: {
                quantity: number;
                locked: number;
            };
            no: {
                quantity: number;
                locked: number;
            };
        };
    };
}
