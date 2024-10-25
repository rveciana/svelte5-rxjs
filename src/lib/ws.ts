import { webSocket } from 'rxjs/webSocket';

export const subject$ = webSocket('wss://ws.bitmex.com/realtime');
export const subscribeToCurrency=(symbol:string)=>subject$.next({"op": "subscribe", "args": [`orderBookL2_25:${symbol}`]});

