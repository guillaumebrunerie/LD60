import { Assets, Sprite, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { BASE_RADIUS, RADIUS } from "../configuration";
import { randomItem } from "../utils/random";

type TileOptions = ContainerOptions & {
	gameMap: GameMap;
	pos: Pos;
	elevation: number;
};

export class Tile extends Container {
	pos: Pos;
	elevation: number;
	gameMap: GameMap;

	constructor(options: TileOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			scale: RADIUS / BASE_RADIUS,
			interactive: true,
		});
		this.gameMap = options.gameMap;
		this.pos = options.pos;
		this.elevation = options.elevation;
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

		// const alpha = (data + 1) / 2;
		// const id = 1;

		const alpha = 1;
		let ids;
		if (this.elevation < -0.3) {
			ids = ["Blocker_Water_01"];
		} else if (this.elevation < 0) {
			ids = ["Grass_01", "Grass_02", "Grass_03"];
		} else if (this.elevation < 0.1) {
			ids = ["Ground_01", "Ground_02", "Ground_03"];
		} else if (this.elevation < 0.2) {
			ids = ["Mountain_Low_01"];
		} else if (this.elevation < 0.3) {
			ids = ["Mountain_Medium_01"];
		} else {
			ids = ["Mountain_High_01"];
		}
		const id = randomItem(ids);

		// let id = 1;
		// if (this.elevation < -0.1) {
		// 	id = 2;
		// } else if (this.elevation > 0.1) {
		// 	id = 3;
		// }
		// const id = randomInt(1, 3);

		this.addChild(
			new Sprite({
				texture: Assets.get(`MapTile_${id}.png`),
				anchor: 0.5,
				alpha,
			}),
		);

		this.onpointerdown = () => {
			this.gameMap.addTarget(this.pos);
			// this.gameMap.rotate(this.pos, randomRange(1, 5));
		};
	}

	move(pos: Pos) {
		const xy = calculatePos(pos, RADIUS);
		this.animate(this, { ...xy }, { duration: 1 });
		this.pos = pos;
	}
}
