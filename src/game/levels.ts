export type Level = {
	size: number;
	factor: number;
	seed?: string;
};

export const level1: Level = {
	size: 10, // small: 10, medium: 15, large: 20
	factor: 1,
	seed: undefined,
};
