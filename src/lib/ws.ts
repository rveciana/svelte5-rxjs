import { filter, scan, startWith, tap } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export const subject$: WebSocketSubject<Message> = webSocket('wss://ws.bitmex.com/realtime');
export const subscribeToCurrency = (symbol: string) =>
	subject$.next({ op: 'subscribe', args: [`orderBookL2_25:${symbol}`] });

export type Side = 'Buy' | 'Sell';
interface Operation {
	op: 'subscribe' | 'unsubscribe';
	args: string[];
}
interface SuccessMessage {
	success: boolean;
	subscribe: string;
	request: {
		op: 'subscribe' | 'unsubscribe';
		args: string[];
	};
}

interface BaseData {
	symbol: string;
	id: number;
	side: Side;
}

interface SizedData extends BaseData {
	size: number;
}

interface PricedData extends SizedData {
	price: number;
}
interface TimestampedData extends PricedData {
	timestamp: string;
}

interface OrderBookMessageBase {
	table: 'orderBookL2_25';
}
interface PartialDataOrderBookMessage extends OrderBookMessageBase {
	action: 'partial';
	data: TimestampedData[];
}

interface UpdateDataOrderBookMessage extends OrderBookMessageBase {
	action: 'update';
	data: SizedData[];
}

interface DeleteDataOrderBookMessage extends OrderBookMessageBase {
	action: 'delete';
	data: BaseData[];
}

interface InsertDataOrderBookMessage extends OrderBookMessageBase {
	action: 'insert';
	data: PricedData[];
}

export type OrderBookMessage =
	| PartialDataOrderBookMessage
	| UpdateDataOrderBookMessage
	| DeleteDataOrderBookMessage
	| InsertDataOrderBookMessage;

export type Message = SuccessMessage | OrderBookMessage | Operation;

export const isOrderBookMessage = (msg: Message): msg is OrderBookMessage => {
	return (msg as OrderBookMessage).data !== undefined;
};
