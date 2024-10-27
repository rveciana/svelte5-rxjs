export function objectValues<T extends { [K: string | number]: any }>(obj: T): Array<T[keyof T]> {
	return Object.values(obj);
}
