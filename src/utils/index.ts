export function cssVars(props: Record<string, string>): string {
	const vars = Object.entries(props).filter(([key]) => /^--/.test(key));
	return vars.reduce((css, [key, val]) => `${css}${key}:${val};`, '');
}
