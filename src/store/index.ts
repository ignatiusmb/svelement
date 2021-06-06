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

export function storage(
	key: string,
	value: any,
	type: 'local' | 'session' = 'local'
): Writable<any> {
	const getStorage =
		type === 'local'
			? () => typeof localStorage !== 'undefined' && localStorage
			: () => typeof sessionStorage !== 'undefined' && sessionStorage;

	const storage = getStorage();
	const initial = writable(value);

	if (storage && storage[key]) {
		initial.set(JSON.parse(storage[key]));
	}

	return {
		subscribe: initial.subscribe,
		set(value) {
			initial.set(value);
			if (storage) {
				const encoded = JSON.stringify(value);
				storage.setItem(key, encoded);
			}
		},
		update(updater) {
			const value = updater(get(initial));
			initial.set(value);
			if (storage) {
				const encoded = JSON.stringify(value);
				storage.setItem(key, encoded);
			}
		},
	};
}
