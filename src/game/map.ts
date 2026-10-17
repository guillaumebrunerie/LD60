import { ELEVATION_SCALE, RADIUS } from "../configuration";
import { mod } from "../utils/maths";
import { PerlinNoise } from "../utils/perlinNoise";
import { randomInt } from "../utils/random";

export type Pos = { col: number; row: number };
export type XYPoint = { x: number; y: number };

export type Map = {
	array: number[][];
	tiles: { pos: Pos; elevation: number }[];
	apples: Pos[];
};

export const createMap = (): Map => {
	const noise = new PerlinNoise({ width: 5, height: 5 });
	const tiles: Map["tiles"] = [];
	const array: number[][] = [];
	for (let col = -30; col <= 30; col++) {
		array[col] = [];
		for (let row = -30; row <= 30; row++) {
			const pos = { col, row };
			const xy = calculatePos(pos, RADIUS);
			const data = noise.sample({
				x: xy.x / RADIUS / ELEVATION_SCALE,
				y: xy.y / RADIUS / ELEVATION_SCALE,
			});

			let elevation;
			if (data < -0.3) {
				// Water
				elevation = -1;
			} else if (data < -0.15) {
				elevation = 0;
			} else if (data < 0.1) {
				// Mountains
				elevation = 1;
			} else if (data < 0.2) {
				elevation = 2;
			} else if (data < 0.35) {
				elevation = 3;
			} else {
				elevation = 4;
			}

			tiles.push({ pos, elevation });
			array[col][row] = elevation;
		}
	}

	const map = { array, tiles, apples: [] };

	for (let k = 0; k < 10; k++) {
		addApple(map);
	}

	return map;
};

export const addApple = (map: Map) => {
	for (let tries = 0; tries < 100; tries++) {
		const pos = {
			col: randomInt(-20, 20),
			row: randomInt(-20, 20),
		};
		const elevation = map.array[pos.col][pos.row];
		if (elevation < 0 || elevation > 1) {
			continue;
		}
		map.apples.push(pos);
		return pos;
	}
};

export const calculatePos = ({ col, row }: Pos, radius = 1): XYPoint => {
	const x =
		col * radius * Math.sqrt(3) + (mod(row, 2) * radius * Math.sqrt(3)) / 2;
	const y = row * radius * 1.5;
	return { x, y };
};

export const reversePos = ({ x, y }: XYPoint, radius = 1): Pos => {
	const row_ = y / radius / 1.5;
	const row = Math.round(row_);
	const col = Math.round(
		(x - (mod(row, 2) * radius * Math.sqrt(3)) / 2) / radius / Math.sqrt(3),
	);
	return { col, row };
};

export const hexDistanceData = (from: Pos, to: Pos) => {
	const dy = Math.abs(from.row - to.row);
	const dx2 =
		Math.abs(
			(from.col - to.col) * 2 + (mod(from.row, 2) - mod(to.row, 2)),
		) - dy;

	return { dy, dx: Math.max(dx2 / 2, 0) };
};

export const hexDistance = (from: Pos, to: Pos) => {
	const { dx, dy } = hexDistanceData(from, to);
	return dx + dy;
};

export const rotate = (pos: Pos, pivot: Pos, angle = 60): Pos => {
	const posXY = calculatePos(pos, 1);
	const pivotXY = calculatePos(pivot, 1);
	const delta = { x: posXY.x - pivotXY.x, y: posXY.y - pivotXY.y };
	const cos = Math.cos((angle * Math.PI) / 180);
	const sin = Math.sin((angle * Math.PI) / 180);
	const newDelta = {
		x: delta.x * cos - delta.y * sin,
		y: delta.x * sin + delta.y * cos,
	};
	const newPosXY = { x: pivotXY.x + newDelta.x, y: pivotXY.y + newDelta.y };
	return reversePos(newPosXY);
};

const neighbors = (pos: Pos) => {
	const e = mod(pos.row, 2);
	return [
		{ col: pos.col - 1, row: pos.row },
		{ col: pos.col + e - 1, row: pos.row - 1 },
		{ col: pos.col + e, row: pos.row - 1 },
		{ col: pos.col + 1, row: pos.row },
		{ col: pos.col + e, row: pos.row + 1 },
		{ col: pos.col + e - 1, row: pos.row + 1 },
	];
};

export const findBestPath = (
	map: Map,
	blocked: Pos[],
	from: Pos,
	tos: Pos[],
) => {
	const distances: { distance: number; path: Pos[] }[][] = [];
	const setDistance = (pos: Pos, distance: number, path: Pos[]) => {
		const column = (distances[pos.col] ||= []);
		column[pos.row] = { distance, path };
	};
	const getDistance = (pos: Pos) => {
		const column = distances[pos.col];
		if (!column) {
			return Infinity;
		}
		const cell = column[pos.row];
		if (cell === undefined) {
			return Infinity;
		}
		return cell.distance;
	};
	const getPath = (pos: Pos) => {
		const column = distances[pos.col];
		if (!column) {
			return [];
		}
		const cell = column[pos.row];
		if (cell === undefined) {
			return [];
		}
		return cell.path;
	};
	setDistance(from, 0, []);

	const toVisitNext = [from];
	const visited: Pos[] = [];

	while (toVisitNext.length > 0) {
		const pos = toVisitNext.shift()!;
		visited.push(pos);
		const path = getPath(pos);
		const distance = getDistance(pos);
		if (tos.some((to) => pos.col == to.col && pos.row == to.row)) {
			return { path, distance };
		}
		for (const otherPos of neighbors(pos)) {
			if (
				blocked.some(
					(p) => p.col == otherPos.col && p.row == otherPos.row,
				)
			) {
				continue;
			}
			const elevation = map.tiles.find(
				({ pos: p }) => p.col == otherPos.col && p.row == otherPos.row,
			)?.elevation;
			if (elevation == undefined || elevation < 0 || elevation > 1) {
				continue;
			}

			const oldDistance = getDistance(otherPos);
			const newDistance = distance + 1;
			if (newDistance < oldDistance) {
				setDistance(otherPos, newDistance, [...path, otherPos]);
			}
			if (
				![...visited, ...toVisitNext].some(
					(p) => p.col == otherPos.col && p.row == otherPos.row,
				)
			) {
				toVisitNext.push(otherPos);
			}
		}
	}
};
