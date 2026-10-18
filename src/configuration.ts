import type { CRTFilterOptions } from "pixi-filters";

export const BASE_RADIUS = 50;
export const RADIUS = 30;

export const WIDTH = Math.ceil(900 / RADIUS / Math.sqrt(3));
export const HEIGHT = Math.ceil(1600 / RADIUS / 1.5);

export const ELEVATION_SCALE = 9;

export const SNAKE_SPEED = 3;
export const ENV_SPEED = 1;
export const ENV_RATE = 60;

export const SPEED = 300;
export const CRT_CONFIGURATION: CRTFilterOptions & { speed: number } = {
	curvature: 2,
	lineWidth: 1,
	lineContrast: 0.5,
	noise: 0.2,
	speed: 3,
	vignetting: 0,
};
