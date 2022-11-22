import type { HTMLAction } from './types.js';
import { noop } from '../utils.js';

export const copy: HTMLAction<{ text?: string }> = (node, opts = {}) => {
	function write() {
		if (!opts.text) return;
		navigator.clipboard.writeText(opts.text);
	}

	node.addEventListener('click', write, true);
	return {
		update({ text: updated = '' }) {
			opts.text = updated;
		},
		destroy() {
			node.removeEventListener('click', write, true);
		},
	};
};

/** determine if there is click event outside */
export const outside: HTMLAction<(event: MouseEvent) => void> = (node, callback) => {
	function clicked(event: MouseEvent) {
		if (!node || !callback || event.defaultPrevented) return;
		if (!node.contains(event.target as Node)) callback(event);
	}

	document.addEventListener('click', clicked, true);
	return {
		destroy: () => document.removeEventListener('click', clicked, true),
	};
};

/** determine if click is maintained for `duration` */
export const hold: HTMLAction<{
	/** defaults to `2000` in ms */
	duration?: number;
	/** executed when `duration` has been reached */
	invoke?: () => void;
}> = (node, { duration = 2000, invoke = noop } = {}) => {
	let timer: NodeJS.Timeout;

	function press() {
		timer = setTimeout(invoke, duration);
	}
	function release() {
		if (timer) clearTimeout(timer);
	}

	node.addEventListener('mousedown', press);
	node.addEventListener('mouseup', release);
	return {
		update({ duration: updated = 2000 }) {
			duration = updated;
		},
		destroy() {
			node.removeEventListener('mousedown', press);
			node.removeEventListener('mouseup', release);
		},
	};
};
