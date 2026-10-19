export type Level = {
	size: number;
	factor: number;
	seed?: string;
};

export const level1: Level = {
	size: 20, // small: 10, medium: 15, large: 20
	factor: 1.5,
	seed: undefined,
};
