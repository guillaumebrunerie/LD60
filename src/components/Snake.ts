import {
	Assets,
	Color,
	Graphics,
	Sprite,
	Ticker,
	type ContainerOptions,
} from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, findBestPath, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { BASE_RADIUS, RADIUS } from "../configuration";
import { mod } from "../utils/maths";

type SnakeOptions = ContainerOptions & {
	gameMap: GameMap;
};

export class Snake extends Container {
	gameMap: GameMap;
	parts: Container<SnakePart>;
	positions: Pos[] = [
		{ col: 0, row: 0 },
		{ col: 1, row: 0 },
		{ col: 2, row: 0 },
		{ col: 3, row: 0 },
		{ col: 4, row: 0 },
		{ col: 5, row: 0 },
	];
	nextSteps: Pos[] = [];
	timer = 0;

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
		if (this.timer <= 0 && this.nextSteps.length > 0) {
			this.moveTo(this.nextSteps.shift()!);
		}

		if (this.timer <= 0) {
			this.timer = 200;
		}
		this.timer -= ticker.deltaMS;
	}

	pickTarget(apples: Pos[]) {
		// const bestPathAndDistance;
		// for (const apple of apples) {
		// 	const pathAndDistance = findBestPath(
		// 		this.gameMap.map,
		// 		this.parts.children[0].pos,
		// 		apple,
		// 	);
		// }
	}

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
		beforeTail.changeType(
			this.createPart(beforeTail.pos, beforeTail2.pos, undefined),
		);
		tail.destroy();
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
	pos: Pos;
	constructor(options: SnakePartOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			scale: RADIUS / BASE_RADIUS,
			eventMode: "none",
		});
		this.pos = options.pos;
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: getSnakeTexture(options.type),
			}),
		);
	}

	changeType(options: SnakePartOptions) {
		this.removeChildren();
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: getSnakeTexture(options.type),
			}),
		);
		this.rotation = options.rotation || 0;
	}
}
