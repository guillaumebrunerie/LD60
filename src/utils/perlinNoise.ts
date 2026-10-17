import type { XYPoint } from "../game/map";
import { mod } from "./maths";
import { randomRange, randomSeeded } from "./random";

const dot = (a: XYPoint, b: XYPoint) => a.x * b.x + a.y * b.y;

const smoothstep = (x: number) => {
	if (x <= 0) {
		return 0;
	} else if (x >= 1) {
		return 1;
	} else {
		return 3 * x * x - 2 * x * x * x;
	}
};

const interpolate = (a: number, b: number, t: number) =>
	a + smoothstep(t) * (b - a);

export class PerlinNoise {
	width: number;
	height: number;
	vectors: XYPoint[][];

	constructor({ width, height }: { width: number; height: number }) {
		this.width = width;
		this.height = height;

		this.vectors = [];
		for (let x = 0; x < width; x++) {
			const col = [];
			for (let y = 0; y < height; y++) {
				const angle = randomRange(0, 2 * Math.PI);
				col.push({
					x: Math.cos(angle),
					y: Math.sin(angle),
				});
			}
			this.vectors.push(col);
		}
	}

	sample(xy: XYPoint) {
		const x = Math.floor(xy.x);
		const y = Math.floor(xy.y);
		const getData = (dx: number, dy: number) => {
			const point = {
				x: mod(x + dx, this.width),
				y: mod(y + dy, this.height),
			};
			const v = this.vectors[point.x][point.y];
			const d = { x: xy.x - (x + dx), y: xy.y - (y + dy) };
			return dot(d, v);
		};
		return interpolate(
			interpolate(getData(0, 0), getData(1, 0), xy.x - x),
			interpolate(getData(0, 1), getData(1, 1), xy.x - x),
			xy.y - y,
		);
	}
}
