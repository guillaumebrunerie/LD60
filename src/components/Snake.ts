import { Assets, Sprite, Ticker, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import {
	applyDirection,
	calculatePos,
	findBestPath,
	hexDistance,
	oppositeDirection,
	type Direction,
	type Pos,
} from "../game/map";
import type { GameMap } from "./GameMap";
import { BASE_RADIUS, RADIUS, SNAKE_SPEED } from "../configuration";
import { mod } from "../utils/maths";
import type { Apple } from "./Apple";
import { randomItem } from "../utils/random";
import type { Level } from "../game/levels";

type SnakeOptions = ContainerOptions & {
	gameMap: GameMap;
	level: Level;
};

export class Snake extends Container {
	gameMap: GameMap;
	parts: Container<SnakePart>;
	positions: Pos[] = [];
	nextSteps: Pos[] = [];
	timer = 0;
	direction: Direction = "right";
	queuedDirections: Direction[] = [];
	isRunning = false;

	constructor(options: SnakeOptions) {
		super({
			...options,
			eventMode: "none",
		});
		this.gameMap = options.gameMap;
		const row = options.level.size;
		this.positions = [
			{ col: 3, row },
			{ col: 2, row },
			{ col: 1, row },
		];

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
			if (event.code.startsWith("Arrow")) {
				this.isRunning = true;
			}
			switch (`${event.code}/${this.finalDirection()}`) {
				// Going right
				case "ArrowUp/right":
					if (event.shiftKey) {
						this.changeDirection("left-up");
					} else {
						this.changeDirection("right-up");
					}
					break;
				case "ArrowDown/right":
					if (event.shiftKey) {
						this.changeDirection("left-down");
					} else {
						this.changeDirection("right-down");
					}
					break;

				// Going left
				case "ArrowUp/left":
					if (event.shiftKey) {
						this.changeDirection("left-down");
					} else {
						this.changeDirection("left-up");
					}
					break;
				case "ArrowDown/left":
					if (event.shiftKey) {
						this.changeDirection("left-up");
					} else {
						this.changeDirection("left-down");
					}
					break;

				// Going right-up
				case "ArrowLeft/right-up":
					if (event.shiftKey) {
						this.changeDirection("left");
					} else {
						this.changeDirection("left-up");
					}
					break;
				case "ArrowRight/right-up":
					this.changeDirection("right");
					break;
				case "ArrowUp/right-up":
					this.changeDirection("left-up");
					break;
				case "ArrowDown/right-up":
					if (event.shiftKey) {
						this.changeDirection("right-down");
					} else {
						this.changeDirection("right");
					}
					break;

				// Going right-down
				case "ArrowLeft/right-down":
					if (event.shiftKey) {
						this.changeDirection("left");
					} else {
						this.changeDirection("left-down");
					}
					break;
				case "ArrowRight/right-down":
					this.changeDirection("right");
					break;
				case "ArrowDown/right-down":
					this.changeDirection("left-down");
					break;
				case "ArrowUp/right-down":
					if (event.shiftKey) {
						this.changeDirection("right-up");
					} else {
						this.changeDirection("right");
					}
					break;

				// Going left-up
				case "ArrowRight/left-up":
					if (event.shiftKey) {
						this.changeDirection("right");
					} else {
						this.changeDirection("right-up");
					}
					break;
				case "ArrowLeft/left-up":
					this.changeDirection("left");
					break;
				case "ArrowUp/left-up":
					this.changeDirection("right-up");
					break;
				case "ArrowDown/left-up":
					if (event.shiftKey) {
						this.changeDirection("left-down");
					} else {
						this.changeDirection("left");
					}
					break;

				// Going left-down
				case "ArrowRight/left-down":
					if (event.shiftKey) {
						this.changeDirection("right");
					} else {
						this.changeDirection("right-down");
					}
					break;
				case "ArrowLeft/left-down":
					this.changeDirection("left");
					break;
				case "ArrowDown/left-down":
					this.changeDirection("right-down");
					break;
				case "ArrowUp/left-down":
					if (event.shiftKey) {
						this.changeDirection("left-up");
					} else {
						this.changeDirection("left");
					}
					break;
			}
		});
	}

	changeDirection(newDirection: Direction) {
		this.isRunning = true;
		if (
			newDirection != oppositeDirection(this.finalDirection()) &&
			newDirection != this.finalDirection()
		) {
			this.queuedDirections.push(newDirection);
		}
	}

	finalDirection() {
		if (this.queuedDirections.length > 0) {
			return this.queuedDirections[this.queuedDirections.length - 1];
		} else {
			return this.direction;
		}
	}

	pushAway() {
		const isFreeAt = ({ col, row }: Pos, i: number) => {
			const elevation = this.gameMap.map.array[col]?.[row];
			if (elevation === undefined || elevation < 0 || elevation > 1) {
				return false;
			}
			if (
				this.parts.children.some(
					(part, j) =>
						j < i && part.pos.col == col && part.pos.row == row,
				)
			) {
				return false;
			}
			return true;
		};

		// let dead = false;
		for (let i = 0; i < this.parts.children.length; i++) {
			const part = this.parts.children[i];
			// if (dead) {
			// 	part.destroy();
			// 	this.removeChild(part);
			// 	i--;
			// 	continue;
			// }

			const isPosAcceptable = (pos: Pos, from = part.pos) =>
				(i == 0 || hexDistance(from, pos) == 1) && isFreeAt(pos, i);

			if (
				isPosAcceptable(
					part.pos,
					this.parts.children[Math.max(0, i - 1)].pos,
				)
			) {
				continue;
			}

			const allCandidates = (
				[
					"left",
					"left-up",
					"left-down",
					"right-up",
					"right-down",
					"right",
				] as const
			).map((direction) =>
				applyDirection(
					this.parts.children[Math.max(0, i - 1)].pos,
					direction,
				),
			);
			const goodCandidates = allCandidates.filter((pos) =>
				isPosAcceptable(pos),
			);
			if (goodCandidates.length > 0) {
				part.pos = randomItem(goodCandidates);
			} else {
				part.pos = this.parts.children[Math.max(0, i - 1)].pos;
				// dead = true;
				// part.destroy();
				// this.removeChild(part);
				// i--;
			}
		}

		this.parts.children.forEach((part, i) => {
			part.setType(
				this.createPart(
					part.pos,
					this.parts.children[i - 1]?.pos,
					this.parts.children[i + 1]?.pos,
				),
			);
		});
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
		if (!this.isRunning) {
			return;
		}
		// if (this.timer <= 0 && this.nextSteps.length > 0) {
		// 	this.moveTo(this.nextSteps.shift()!);
		// 	this.nextSteps = [];
		// 	this.pickTarget(this.gameMap.apples);
		// }

		if (this.timer <= 0) {
			const nextDirection = this.queuedDirections.shift();
			if (nextDirection) {
				this.direction = nextDirection;
			}
			this.moveTo(applyDirection(this.headPos(), this.direction));
			// this.moveTo(this.nextSteps.shift()!);
			// this.nextSteps = [];
			// this.pickTarget(this.gameMap.apples);
		}

		if (this.timer <= 0) {
			this.timer = 1000 / SNAKE_SPEED;
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
	isWarned = false;
	moveTo(newPos: Pos) {
		const isFreeAt = ({ col, row }: Pos) => {
			const elevation = this.gameMap.map.array[col]?.[row];
			if (elevation === undefined || elevation < 0 || elevation > 1) {
				return false;
			}
			if (
				this.parts.children.some(
					(part) => part.pos.col == col && part.pos.row == row,
				)
			) {
				return false;
			}
			return true;
		};
		if (!isFreeAt(newPos)) {
			// if (this.isWarned) {
			this.gameMap.gameOver();
			// } else {
			// 	this.isWarned = true;
			// }
			return;
		}
		this.isWarned = false;

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
		head.setType(this.createPart(head.pos, newPos, afterHead?.pos));
		if (!this.isGrowing) {
			if (beforeTail2) {
				beforeTail.setType(
					this.createPart(beforeTail.pos, beforeTail2.pos, undefined),
				);
			}
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

	allPositions() {
		return this.parts.children.map((p) => p.pos);
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
			alpha: 0.5,
		});
		this.setType(options);
	}

	setType(options: SnakePartOptions) {
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
