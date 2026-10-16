import { Point } from "pixi.js";

export const randomAroundPoint = (p: Point, r: number): Point => {
	const d = Math.sqrt(Math.random()) * r;
	const angle = Math.random() * Math.PI * 2;
	return new Point(p.x + d * Math.cos(angle), p.y + d * Math.sin(angle));
};

/** Get the distance between a and b points */
export function getDistanceSq(pointA: Point, pointB: Point) {
	const dx = pointB.x - pointA.x;
	const dy = pointB.y - pointA.y;
	return dx * dx + dy * dy;
}

/** Get the distance between a and b points */
export function getDistance(pointA: Point, pointB: Point) {
	return Math.sqrt(getDistanceSq(pointA, pointB));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number) {
	return (1 - t) * a + t * b;
}

/** Clamp a number to minimum and maximum values */
export function clamp(v: number, min = 0, max = 1) {
	if (min > max) [min, max] = [max, min];
	return (
		v < min ? min
		: v > max ? max
		: v
	);
}

export const distanceToNearestIncrement = (
	rotation: number,
	increment: number,
	min: number,
	max: number,
	speed: number,
) => {
	const threshold = 2.5;

	let base = Math.round(rotation / increment);
	if (speed > threshold) {
		base = Math.ceil(rotation / increment);
	} else if (speed < -threshold) {
		base = Math.floor(rotation / increment);
	}
	const nearestIncrement = Math.min(max, Math.max(min, base * increment));
	return nearestIncrement - rotation;
};

export const mod = (a: number, b: number) => {
	return ((a % b) + b) % b;
};

// Returns the intersection point of two line segments AB and CD, or null if none.
export const segmentIntersection = (
	a1: Point,
	a2: Point,
	b1: Point,
	b2: Point,
	epsilon = 0.000001,
): Point | null => {
	const dax = a2.x - a1.x;
	const day = a2.y - a1.y;
	const dbx = b2.x - b1.x;
	const dby = b2.y - b1.y;

	const denom = dax * dby - day * dbx;
	if (denom === 0) {
		// Parallel (or collinear)
		return null;
	}

	const s = ((b1.x - a1.x) * dby - (b1.y - a1.y) * dbx) / denom;
	const t = ((b1.x - a1.x) * day - (b1.y - a1.y) * dax) / denom;

	if (s > epsilon && s < 1 - epsilon && t > epsilon && t < 1 - epsilon) {
		// Segments intersect
		return new Point(a1.x + s * dax, a1.y + s * day);
	}

	return null; // no intersection within segment bounds
};

// Returns the point nearest to `to` that intersects the disk. It should not be
// within epsilon of from or we get weird infinite loops.
export const segmentIntersectsDisk = (
	from: Point,
	to: Point,
	center: Point,
	radius: number,
): Point | undefined => {
	const segment = to.subtract(from);
	const segLenSq = segment.magnitudeSquared();

	if (segLenSq == 0) {
		return;
	}

	const vector = center.subtract(from);
	const t = vector.dot(segment) / segLenSq;
	const projection = from.add(segment.multiplyScalar(t));
	const distanceToLineSq = projection.subtract(center).magnitudeSquared();

	if (distanceToLineSq >= radius * radius) {
		return;
	}
	const delta = Math.sqrt((radius * radius - distanceToLineSq) / segLenSq);
	const uMin = t - delta;
	const uMax = t + delta;
	if (uMax < 0.001 || uMin >= 1) {
		return;
	}
	const u = Math.min(1, uMax);
	return from.add<Point>(segment.multiplyScalar(u));
};
