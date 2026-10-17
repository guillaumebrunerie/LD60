import { Assets, Sprite, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { randomInt, randomRange } from "../utils/random";
import { RADIUS } from "../configuration";

type TileOptions = ContainerOptions & { gameMap: GameMap; pos: Pos };

export class Tile extends Container {
	pos: Pos;
	gameMap: GameMap;

	constructor(options: TileOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			interactive: true,
		});
		this.gameMap = options.gameMap;
		this.pos = options.pos;
		// const tileG = new Graphics();
		// // tileG.circle(0, 0, (RADIUS * Math.sqrt(3)) / 2);
		// tileG.regularPoly(0, 0, RADIUS, 6);
		// tileG.fill(
		// 	new Color({
		// 		r: Math.random() * 255,
		// 		g: Math.random() * 255,
		// 		b: Math.random() * 255,
		// 	}),
		// );
		// this.addChild(tileG);

		const id = randomInt(1, 3);

		this.addChild(
			new Sprite({
				texture: Assets.get(`MapTile_0${id}.png`),
				anchor: 0.5,
			}),
		);

		this.onpointerdown = () => {
			this.gameMap.rotate(this.pos, randomRange(1, 5));
		};
	}

	move(pos: Pos) {
		const xy = calculatePos(pos, RADIUS);
		this.animate(this, { ...xy }, { duration: 1 });
		this.pos = pos;
	}
}
