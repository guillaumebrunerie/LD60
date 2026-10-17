import {
	Assets,
	Color,
	Graphics,
	Sprite,
	Ticker,
	type ContainerOptions,
} from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos } from "../game/map";
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
		{ col: 2, row: 1 },
	];
	nextSteps: Pos[] = [];
	timer = 0;

	constructor(options: SnakeOptions) {
		super({
			...options,
		});
		this.gameMap = options.gameMap;

		this.parts = this.addChild(new Container<SnakePart>());
		this.positions.forEach((pos, i) => {
			let type: SnakePartType;
			if (i == 0) {
				type = "head";
			} else if (i == this.positions.length - 1) {
				type = "tail";
			} else {
				const xy = calculatePos(pos, RADIUS);
				const prevXY = calculatePos(this.positions[i - 1], RADIUS);
				const nextXY = calculatePos(this.positions[i + 1], RADIUS);
				const angle =
					Math.atan2(nextXY.y - xy.y, nextXY.x - xy.x) -
					Math.atan2(prevXY.y - xy.y, prevXY.x - xy.x);
				const steps = Math.round(
					mod((angle * 180) / Math.PI, 360) / 60,
				);
				switch (steps) {
					default:
						type = "tail";
						debugger;
						break;
					case 1:
					case 5:
						type = "body-sharp";
						break;
					case 2:
					case 4:
						type = "body-soft";
						break;
					case 3:
						type = "body-straight";
				}
			}
			this.parts.addChild(
				new SnakePart({
					pos,
					type,
				}),
			);
		});
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

	moveTo(newPos: Pos) {
		const head = this.parts.children[0];
		const tail = this.parts.children.at(-1)!;
		this.parts.addChildAt(
			new SnakePart({
				pos: newPos,
				type: "head",
			}),
			0,
		);
		head.makeBody();
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
	constructor(options: SnakePartOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			scale: RADIUS / BASE_RADIUS,
		});
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: getSnakeTexture(options.type),
			}),
		);
	}

	makeBody() {
		this.removeChildren();

		const partG = new Graphics();
		partG.circle(0, 0, 20);
		partG.fill(
			new Color({
				r: 0,
				g: 0,
				b: 255,
			}),
		);
		this.addChild(partG);
	}
}
