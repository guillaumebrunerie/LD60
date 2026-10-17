import { Assets, Sprite, Ticker, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, findBestPath, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { BASE_RADIUS, RADIUS } from "../configuration";

type EnemyOptions = ContainerOptions & { gameMap: GameMap; pos: Pos };

export class Enemy extends Container {
	pos: Pos;
	gameMap: GameMap;

	constructor(options: EnemyOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			scale: RADIUS / BASE_RADIUS,
			eventMode: "none",
		});
		this.gameMap = options.gameMap;
		this.pos = options.pos;
		this.addChild(
			new Sprite({
				texture: Assets.get(`Apple.png`),
				anchor: 0.5,
			}),
		);
	}

	timer = 0;
	nextSteps: Pos[] = [];
	update(ticker: Ticker) {
		if (this.timer <= 0) {
			if (this.nextSteps.length > 0) {
				this.move(this.nextSteps.shift()!);
				this.nextSteps = [];
			}
			this.pickTarget();
		}

		if (this.timer <= 0) {
			this.timer = 1000;
		}
		this.timer -= ticker.deltaMS;
	}

	pickTarget() {
		const pathAndDistance = findBestPath(
			this.gameMap.map,
			[], //this.gameMap.snake.parts.children.map((part) => part.pos),
			this.pos,
			[this.gameMap.player.pos],
		);
		if (!pathAndDistance) {
			return;
		}
		const { path } = pathAndDistance;
		for (const pos of path) {
			this.nextSteps.push(pos);
		}
	}

	move(pos: Pos) {
		const xy = calculatePos(pos, RADIUS);
		this.animate(this, { ...xy }, { duration: 0.2 });
		this.pos = pos;
	}
}
