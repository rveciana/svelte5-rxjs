import { Subject } from 'rxjs';
import { vi, describe, afterAll, it, expect } from 'vitest';
import { spyOnObservable } from './spyOnObservable';
import { createData$, processMessage, type Message, type OrderBookMessage } from './ws';
import { WebSocketSubject } from 'rxjs/webSocket';
import type { OrderBook } from './dataObservables';

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

const mockSubject$ = new Subject<Message>();

vi.doMock('./ws', () => {
	return {
		subject$: mockSubject$
	};
});

const { data$ } = await import('./dataObservables');

describe('data$', () => {
	const { latestEmission, error, subscription } = spyOnObservable(data$);

	afterAll(() => {
		subscription.unsubscribe();
	});
	it('should initially emit empty object', () => {
		expect(latestEmission()).toEqual({});
	});
	it('should not error', () => {
		expect(error).not.toBeCalled();
	});
	it('should ignore the success messages', () => {
		mockSubject$.next({
			success: true,
			subscribe: 'orderBookL2_25:XBTUSD',
			request: { op: 'subscribe', args: ['orderBookL2_25:XBTUSD'] }
		});
		expect(latestEmission()).toEqual({});
	});
	it("should add data when it's sent", () => {
		mockSubject$.next(partialData);
		expect(Object.keys(latestEmission() as OrderBook)).toHaveLength(6);
	});
});
