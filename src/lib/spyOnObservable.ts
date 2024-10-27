import { Observable, Subscription } from 'rxjs';
import { vi, type Mock } from 'vitest';

export function spyOnObservable(observable$: Observable<unknown>) {
	const next: Mock<any> = vi.fn();
	const error: Mock<any> = vi.fn();
	const complete: Mock<any> = vi.fn();
	const emissionCount = () => next.mock.calls.length;
	const latestEmission = () => {
		try {
			return next.mock.calls.at(-1)![0];
		} catch (e) {
			throw new Error('expected next to have been called');
		}
	};
	let subscription: Subscription;
	subscription = observable$.subscribe({
		next,
		error,
		complete: () => {
			subscription?.unsubscribe();
			complete();
		}
	});
	return { next, error, complete, subscription, latestEmission, emissionCount };
}
