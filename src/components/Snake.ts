import {
	Assets,
	Color,
	Graphics,
	Sprite,
	Ticker,
	type ContainerOptions,
} from "pixi.js";
import { Container } from "../PausableContainer";
import {
	applyDirection,
	calculatePos,
	findBestPath,
	hexDistance,
	type Direction,
	type Pos,
} from "../game/map";
import type { GameMap } from "./GameMap";
import { BASE_RADIUS, HEIGHT, RADIUS, WIDTH } from "../configuration";
import { mod } from "../utils/maths";
import type { Apple } from "./Apple";
import { randomItem } from "../utils/random";

type SnakeOptions = ContainerOptions & {
	gameMap: GameMap;
};

export class Snake extends Container {
	gameMap: GameMap;
	parts: Container<SnakePart>;
	positions: Pos[] = [
		{ col: WIDTH - 2, row: Math.round(HEIGHT / 2) },
		{ col: WIDTH - 1, row: Math.round(HEIGHT / 2) },
		{ col: WIDTH, row: Math.round(HEIGHT / 2) },
		{ col: WIDTH + 1, row: Math.round(HEIGHT / 2) },
		{ col: WIDTH + 2, row: Math.round(HEIGHT / 2) },
		{ col: WIDTH + 3, row: Math.round(HEIGHT / 2) },
		{ col: WIDTH + 4, row: Math.round(HEIGHT / 2) },
	];
	nextSteps: Pos[] = [];
	timer = 0;
	direction: Direction = "left-up";

	constructor(options: SnakeOptions) {
		super({
			...options,
			eventMode: "none",
		});
		this.gameMap = options.gameMap;

		this.parts = this.addChild(new Container<SnakePart>());
		this.positions.forEach((pos, i) => {
			this.parts.addChild(
				new SnakePart(
					this.createPart(
						pos,
						this.positions[i - 1],
						this.positions[i + 1],
					),
				),
			);
		});

		window.addEventListener("keydown", (event) => {
			switch (`${event.code}/${this.direction}`) {
				case "ArrowLeft/left-up":
				case "ArrowLeft/left-down":
					this.direction = "left";
					break;
				case "ArrowLeft/right-up":
					this.direction = "left-up";
					break;
				case "ArrowLeft/right-down":
					this.direction = "left-down";
					break;
				case "ArrowRight/right-up":
				case "ArrowRight/right-down":
					this.direction = "right";
					break;
				case "ArrowRight/left-up":
					this.direction = "right-up";
					break;
				case "ArrowRight/left-down":
					this.direction = "right-down";
					break;
				case "ArrowUp/left":
				case "ArrowUp/left-down":
					this.direction = "left-up";
					break;
				case "ArrowUp/right":
				case "ArrowUp/right-down":
					this.direction = "right-up";
					break;
				case "ArrowDown/left":
				case "ArrowDown/left-up":
					this.direction = "left-down";
					break;
				case "ArrowDown/right":
				case "ArrowDown/right-up":
					this.direction = "right-down";
					break;
			}
		});
	}

	pushAway() {
		const isFreeAt = ({ col, row }: Pos) => {
			const elevation = this.gameMap.map.array[col]?.[row];
			if (elevation === undefined || elevation < 0 || elevation > 1) {
				return false;
			} else {
				return true;
			}
		};

		// console.log(
		// 	"BEFORE",
		// 	this.parts.children.map((c) => c.pos),
		// );
		let dead = false;
		// const calculatedPos = [];
		for (let i = 0; i < this.parts.children.length; i++) {
			const part = this.parts.children[i];
			// console.log("i", i, part.pos);
			if (dead) {
				// console.log("DEAD", part.pos);
				this.parts.removeChild(part);
				part.destroy();
				i--;
				continue;
			}
			if (
				(i == 0 ||
					hexDistance(this.parts.children[i - 1].pos, part.pos) ==
						1) &&
				isFreeAt(part.pos)
			) {
				// console.log("It’s ok at", part.pos);
				// calculatedPos.push(part.pos);
				continue;
			}

			const candidates = (
				["left", "left-up", "left-down"] as const
			).flatMap((direction) => {
				const newPos = applyDirection(part.pos, direction);
				if (
					(i == 0 ||
						hexDistance(this.parts.children[i - 1].pos, newPos) ==
							1) &&
					isFreeAt(newPos)
				) {
					return [newPos];
				} else {
					return [];
				}
			});
			// console.log(
			// 	"abc",
			// 	candidates.map((newPos) =>
			// 		hexDistance(this.parts.children[i - 1].pos, newPos),
			// 	),
			// );
			if (candidates.length > 0) {
				part.pos = randomItem(candidates);
				// calculatedPos.push(part.pos);
			} else {
				dead = true;
				// console.log("DEAD!", part.pos);
				part.destroy();
				this.parts.removeChild(part);
				i--;
				// this.parts.children.splice(i, this.parts.children.length - i);
				// dead = true;
				// return;
			}
		}

		// console.log(
		// 	this.parts.children.map(
		// 		(_, i) =>
		// 			i > 0 &&
		// 			hexDistance(
		// 				this.parts.children[i - 1].pos,
		// 				this.parts.children[i].pos,
		// 			),
		// 	),
		// );

		this.parts.children.forEach((part, i) => {
			part.changeType(
				this.createPart(
					part.pos,
					this.parts.children[i - 1]?.pos,
					this.parts.children[i + 1]?.pos,
				),
			);
		});

		// console.log(
		// 	this.parts.children.map(
		// 		(_, i) =>
		// 			i > 0 &&
		// 			hexDistance(
		// 				this.parts.children[i - 1].pos,
		// 				this.parts.children[i].pos,
		// 			),
		// 	),
		// );

		// console.log(
		// 	"free",
		// 	this.parts.children.map((part) => isFreeAt(part.pos)),
		// );

		// console.log("calculated", calculatedPos);

		// console.log(
		// 	"AFTER",
		// 	this.parts.children.map((c) => c.pos),
		// );
		// debugger;
	}

	createPart(
		pos: Pos,
		prev: Pos | undefined,
		next: Pos | undefined,
	): SnakePartOptions {
		let type: SnakePartType;
		let rotation;
		const xy = calculatePos(pos, RADIUS);
		if (!prev) {
			type = "head";
			next ||= applyDirection(pos, oppositeDirection(this.direction));
			const nextXY = calculatePos(next!, RADIUS);
			rotation = Math.atan2(nextXY.y - xy.y, nextXY.x - xy.x);
		} else if (!next) {
			type = "tail";
			const prevXY = calculatePos(prev, RADIUS);
			rotation = Math.atan2(prevXY.y - xy.y, prevXY.x - xy.x) + Math.PI;
		} else {
			const prevXY = calculatePos(prev, RADIUS);
			const nextXY = calculatePos(next, RADIUS);
			const angle2 =
				Math.atan2(nextXY.y - xy.y, nextXY.x - xy.x) -
				Math.atan2(prevXY.y - xy.y, prevXY.x - xy.x);
			const steps = Math.round(mod((angle2 * 180) / Math.PI, 360) / 60);
			switch (steps) {
				default:
					type = "tail";
					// debugger;
					break;
				case 1:
					type = "body-sharp";
					rotation = Math.atan2(nextXY.y - xy.y, nextXY.x - xy.x);
					break;
				case 2:
					type = "body-soft";
					rotation = Math.atan2(nextXY.y - xy.y, nextXY.x - xy.x);
					break;
				case 3:
					type = "body-straight";
					rotation = Math.atan2(prevXY.y - xy.y, prevXY.x - xy.x);
					break;
				case 4:
					type = "body-soft";
					rotation = Math.atan2(prevXY.y - xy.y, prevXY.x - xy.x);
					break;
				case 5:
					type = "body-sharp";
					rotation = Math.atan2(prevXY.y - xy.y, prevXY.x - xy.x);
					break;
			}
		}
		return {
			pos,
			type,
			rotation,
		};
	}

	update(ticker: Ticker) {
		// if (this.timer <= 0 && this.nextSteps.length > 0) {
		// 	this.moveTo(this.nextSteps.shift()!);
		// 	this.nextSteps = [];
		// 	this.pickTarget(this.gameMap.apples);
		// }

		if (this.timer <= 0) {
			this.moveTo(applyDirection(this.headPos(), this.direction));
			// this.moveTo(this.nextSteps.shift()!);
			// this.nextSteps = [];
			// this.pickTarget(this.gameMap.apples);
		}

		if (this.timer <= 0) {
			this.timer = 200;
		}
		this.timer -= ticker.deltaMS;
	}

	pickTarget(apples: Container<Apple>) {
		const pathAndDistance = findBestPath(
			this.gameMap.map,
			this.gameMap.snake.parts.children.map((part) => part.pos),
			this.parts.children[0].pos,
			apples.children.map((apple) => apple.pos),
		);
		if (!pathAndDistance) {
			return;
		}
		const { path } = pathAndDistance;
		for (const pos of path) {
			this.nextSteps.push(pos);
		}
	}

	isGrowing = false;
	moveTo(newPos: Pos) {
		const head = this.parts.children[0];
		const afterHead = this.parts.children[1];
		const beforeTail2 = this.parts.children.at(-3)!;
		const beforeTail = this.parts.children.at(-2)!;
		const tail = this.parts.children.at(-1)!;

		// New head
		this.parts.addChildAt(
			new SnakePart(this.createPart(newPos, undefined, head.pos)),
			0,
		);
		head.changeType(this.createPart(head.pos, newPos, afterHead.pos));
		if (!this.isGrowing) {
			beforeTail.changeType(
				this.createPart(beforeTail.pos, beforeTail2.pos, undefined),
			);
			tail.destroy();
		}
		this.isGrowing = false;

		if (this.gameMap.maybeEatApple(newPos)) {
			this.isGrowing = true;
		}
	}

	headPos() {
		return this.parts.children[0].pos;
	}
}

type SnakePartType =
	"head" | "body-sharp" | "body-soft" | "body-straight" | "tail";
type SnakePartOptions = ContainerOptions & {
	pos: Pos;
	type: SnakePartType;
};

const getSnakeTexture = (type: SnakePartType) => {
	switch (type) {
		case "head":
			return Assets.get("SnakeHead.png");
		case "body-sharp":
			return Assets.get("SnakeBody_02.png");
		case "body-soft":
			return Assets.get("SnakeBody_03.png");
		case "body-straight":
			return Assets.get("SnakeBody_01.png");
		case "tail":
			return Assets.get("SnakeEnd.png");
	}
};

class SnakePart extends Container {
	pos: Pos = { col: -1, row: -1 };
	constructor(options: SnakePartOptions) {
		super({
			...options,
			scale: RADIUS / BASE_RADIUS,
			eventMode: "none",
		});
		this.changeType(options);
		// this.pos = options.pos;
		// this.addChild(
		// 	new Sprite({
		// 		anchor: 0.5,
		// 		texture: getSnakeTexture(options.type),
		// 		eventMode: "none",
		// 	}),
		// );
	}

	changeType(options: SnakePartOptions) {
		this.removeChildren();
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: getSnakeTexture(options.type),
				eventMode: "none",
			}),
		);
		this.rotation = options.rotation || 0;
		if (options.pos) {
			this.pos = options.pos;
			const { x, y } = calculatePos(options.pos, RADIUS);
			this.x = x;
			this.y = y;
		}
	}
}
