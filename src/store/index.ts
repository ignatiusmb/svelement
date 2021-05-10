import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';

const cache = new Map();

export function fetcher(url: RequestInfo) {
	const store = writable(new Promise(() => {}));
	if (cache.has(url)) store.set(Promise.resolve(cache.get(url)));
	const load = async () => {
		const data = await fetch(url).then((r) => r.json());
		cache.set(url, data), store.set(Promise.resolve(data));
	};
	return load(), store;
}

export function storage<T>(
	key: string,
	value: T,
	type: 'local' | 'session' = 'local'
): Writable<T> {
	const getStorage =
		type === 'local'
			? () => typeof localStorage !== 'undefined' && localStorage
			: () => typeof sessionStorage !== 'undefined' && sessionStorage;

	const ss = getStorage();
	const initial = writable(value);
	const updateStorage = (key: string, value: T) => {
		const ss = getStorage();
		if (ss) ss.setItem(key, JSON.stringify(value));
	};

	if (ss && ss[key]) initial.set(JSON.parse(ss[key]));

	return {
		subscribe: initial.subscribe,
		set(value) {
			initial.set(value);
			updateStorage(key, value);
		},
		update(updater) {
			const value = updater(get(initial));
			initial.set(value);
			updateStorage(key, value);
		},
	};
}
