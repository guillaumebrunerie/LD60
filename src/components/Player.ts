import { Color, Graphics, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { RADIUS } from "../configuration";

type PlayerOptions = ContainerOptions & { gameMap: GameMap; pos: Pos };

export class Player extends Container {
	pos: Pos;
	gameMap: GameMap;

	constructor(options: PlayerOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
		});
		this.gameMap = options.gameMap;
		this.pos = options.pos;
		const playerG = new Graphics();
		playerG.circle(0, 0, 20);
		playerG.fill(
			new Color({
				r: 255,
				g: 0,
				b: 0,
			}),
		);
		this.addChild(playerG);
	}

	move(pos: Pos) {
		const xy = calculatePos(pos, RADIUS);
		this.animate(this, { ...xy }, { duration: 1 });
		this.pos = pos;
	}
}
