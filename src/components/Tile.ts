import { Color, Graphics, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos, type XYPoint } from "../game/map";
import type { GameMap } from "./GameMap";
import { randomRange } from "../utils/random";

type TileOptions = ContainerOptions & { gameMap: GameMap; pos: Pos };

const RADIUS = 30;

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
		const tileG = new Graphics();
		tileG.regularPoly(0, 0, RADIUS, 6);
		tileG.fill(
			new Color({
				r: Math.random() * 255,
				g: Math.random() * 255,
				b: Math.random() * 255,
			}),
		);
		this.addChild(tileG);
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
