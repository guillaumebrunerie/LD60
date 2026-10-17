import { mod } from "../utils/maths";

export type Pos = { col: number; row: number };
export type XYPoint = { x: number; y: number };

export const createMap = () => {
	const map: Pos[] = [];
	for (let col = -10; col <= 10; col++) {
		for (let row = -10; row <= 10; row++) {
			map.push({ col, row });
		}
	}
	return map;
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
	if (Math.abs(row - row_) > 0.001) {
		debugger;
	}
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
