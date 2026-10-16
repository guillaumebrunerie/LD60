declare global {
	interface Window {
		android?: unknown;
	}
}

export const isAndroid = () => window.android !== undefined;
