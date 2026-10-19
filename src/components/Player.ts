import { Ticker, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { RADIUS, SPEED } from "../configuration";
import { length } from "../utils/maths";

type PlayerOptions = ContainerOptions & { gameMap: GameMap; pos: Pos };

export class Player extends Container {
	pos: Pos;
	gameMap: GameMap;
	nextSteps: Pos[] = [];

	constructor(options: PlayerOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			alpha: 0.5,
		});
		this.gameMap = options.gameMap;
		this.pos = options.pos;
		// const playerG = new Graphics();
		// playerG.circle(0, 0, 10);
		// playerG.fill(
		// 	new Color({
		// 		r: 255,
		// 		g: 255,
		// 		b: 0,
		// 	}),
		// );
		// this.addChild(playerG);
	}

	update(ticker: Ticker) {
		const nextStep = this.nextSteps[0];
		if (!nextStep) {
			return;
		}
		const nextStepXY = calculatePos(nextStep, RADIUS);
		const vector = {
			x: nextStepXY.x - this.x,
			y: nextStepXY.y - this.y,
		};
		const delta = ticker.deltaMS;
		const distance = (delta * SPEED) / 1000;
		if (length(vector) < distance) {
			this.nextSteps.shift();
			this.x = nextStepXY.x;
			this.y = nextStepXY.y;
			this.pos = nextStep;
		} else {
			const angle = Math.atan2(vector.y, vector.x);
			this.x += Math.cos(angle) * distance;
			this.y += Math.sin(angle) * distance;
		}
	}

	lastStep() {
		return this.nextSteps[this.nextSteps.length - 1];
	}
}
