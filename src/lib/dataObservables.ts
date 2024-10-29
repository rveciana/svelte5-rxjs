import { filter, scan, startWith } from 'rxjs';
import { subject$, type Message, type OrderBookMessage, type Side } from './ws';

export interface OrderBookValue {
	side: Side;
	size: number;
	price: number;
	prevSize?: number;
}
export interface OrderBook {
	[id: number]: OrderBookValue;
}

export const isOrderBookMessage = (msg: Message): msg is OrderBookMessage => {
	return (msg as OrderBookMessage).data !== undefined;
};

export const processMessage = (acc: OrderBook, cur: OrderBookMessage): OrderBook => {
	switch (cur.action) {
		case 'partial':
			return cur.data.reduce(
				(out, ord) => ({ ...out, [ord.id]: { side: ord.side, size: ord.size, price: ord.price } }),
				{}
			);
		case 'insert': {
			let out = acc;
			for (let ord of cur.data) {
				out = { ...out, [ord.id]: { side: ord.side, size: ord.size, price: ord.price } };
			}
			return out;
		}
		case 'update': {
			let out = acc;
			for (let ord of cur.data) {
				out = {
					...out,
					[ord.id]: { ...acc[ord.id], side: ord.side, size: ord.size, prevSize: acc[ord.id].size }
				};
			}
			return out;
		}
		case 'delete': {
			let out = acc;
			for (let ord of cur.data) {
				const { [ord.id]: _, ...rest } = out;
				out = rest;
			}
			return out;
		}
	}
};

export const data$ = subject$.pipe(
	filter(isOrderBookMessage),
	scan(processMessage, {}),
	startWith({} as OrderBook)
);
