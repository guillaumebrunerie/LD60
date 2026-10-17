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
		for (const pos of this.positions) {
			this.parts.addChild(
				new SnakePart({
					pos,
					type: pos == this.positions[0] ? "head" : "not_head",
				}),
			);
		}
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

type SnakePartOptions = ContainerOptions & {
	pos: Pos;
	type: "head" | "not_head";
};

class SnakePart extends Container {
	constructor(options: SnakePartOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			scale: RADIUS / BASE_RADIUS,
		});
		const partG = new Graphics();
		partG.circle(0, 0, 20);
		partG.fill(
			new Color({
				r: options.type == "head" ? 255 : 0,
				g: 0,
				b: options.type == "head" ? 0 : 255,
			}),
		);
		this.addChild(partG);
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
