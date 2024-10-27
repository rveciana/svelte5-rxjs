import { describe, it, expect, vi, afterAll, beforeEach, afterEach } from 'vitest';
import { isOrderBookMessage, type Message, type OrderBookMessage } from './ws';
import { Subject } from 'rxjs';
import { spyOnObservable } from './spyOnObservable';
import { processMessage } from './dataObservables';

describe('Test filter with typeguard', () => {
	it('true if message has data', () => {
		const msg: Message = {
			table: 'orderBookL2_25',
			action: 'update',
			data: [{ symbol: 'XBTUSD', id: 17999995000, side: 'Buy', size: 5 }]
		};

		expect(isOrderBookMessage(msg)).toBe(true);
	});
	it("false if message doesn't have data", () => {
		const msg: Message = {
			success: true,
			subscribe: 'orderBookL2_25:XBTUSD',
			request: { op: 'subscribe', args: ['orderBookL2_25:XBTUSD'] }
		};

		expect(isOrderBookMessage(msg)).toBe(false);
	});
});

const partialData: OrderBookMessage = {
	table: 'orderBookL2_25',

	action: 'partial',
	data: [
		{
			symbol: 'XBTUSD',
			id: 17999992000,
			side: 'Sell',
			size: 100,
			price: 80,
			timestamp: '2022-02-09T11:23:06.802Z'
		},
		{
			symbol: 'XBTUSD',
			id: 17999993000,
			side: 'Sell',
			size: 20,
			price: 70,
			timestamp: '2022-02-09T11:23:06.802Z'
		},
		{
			symbol: 'XBTUSD',
			id: 17999994000,
			side: 'Sell',
			size: 10,
			price: 60,
			timestamp: '2022-02-09T11:23:06.802Z'
		},
		{
			symbol: 'XBTUSD',
			id: 17999995000,
			side: 'Buy',
			size: 10,
			price: 50,
			timestamp: '2022-02-09T11:23:06.802Z'
		},
		{
			symbol: 'XBTUSD',
			id: 17999996000,
			side: 'Buy',
			size: 20,
			price: 40,
			timestamp: '2022-02-09T11:23:06.802Z'
		},
		{
			symbol: 'XBTUSD',
			id: 17999997000,
			side: 'Buy',
			size: 100,
			price: 30,
			timestamp: '2022-02-09T11:23:06.802Z'
		}
	]
};
describe('The reducer function adds, removes or  changes, the object', () => {
	it('Partial function', () => {
		const orderBook = processMessage({}, partialData);

		expect(orderBook[17999997000].price).toEqual(30);
		expect(Object.keys(orderBook).length).toEqual(6);
	});
	it('Partial function overwrites', () => {
		const orderBook = processMessage(
			{},
			{
				...partialData,
				data: [
					{
						symbol: 'XBTUSD',
						id: 17999997000,
						side: 'Buy',
						size: 100,
						price: 20,
						timestamp: '2022-02-09T11:23:06.802Z'
					}
				]
			}
		);

		expect(orderBook[17999997000].price).toEqual(20);
		expect(Object.keys(orderBook).length).toEqual(1);
	});
	it('Insert function', () => {
		const initialOrderBook = processMessage({}, partialData);
		expect(Object.keys(initialOrderBook).length).toEqual(6);
		const insertData: OrderBookMessage = {
			table: 'orderBookL2_25',
			action: 'insert',
			data: [{ symbol: 'XBTUSD', id: 123, side: 'Buy', size: 10, price: 45 }]
		};

		const orderBook = processMessage(initialOrderBook, insertData);
		expect(Object.keys(orderBook).length).toEqual(7);
		expect(orderBook[123].price).toEqual(45);

		const orderBook2 = processMessage(initialOrderBook, insertData);
		expect(Object.keys(orderBook2).length).toEqual(7);
		expect(orderBook2[123].price).toEqual(45);
	});
	it('Delete function', () => {
		const orderBook = processMessage({}, partialData);
		const orderBook2 = processMessage(orderBook, {
			table: 'orderBookL2_25',
			action: 'delete',
			data: [{ symbol: 'XBTUSD', id: 17999995000, side: 'Buy' }]
		});

		expect(Object.keys(orderBook2).length).toEqual(5);

		const orderBook3 = processMessage(orderBook2, {
			table: 'orderBookL2_25',
			action: 'delete',
			data: [{ symbol: 'XBTUSD', id: 17999996000, side: 'Buy' }]
		});
		expect(Object.keys(orderBook3).length).toEqual(4);
	});

	it('Update function', () => {
		const orderBook = processMessage({}, partialData);
		const orderBook2 = processMessage(orderBook, {
			table: 'orderBookL2_25',
			action: 'update',
			data: [{ symbol: 'XBTUSD', id: 17999997000, side: 'Buy', size: 5 }]
		});

		expect(orderBook2[17999997000].size).toEqual(5);
		expect(Object.keys(orderBook2).length).toEqual(6);
	});
});
