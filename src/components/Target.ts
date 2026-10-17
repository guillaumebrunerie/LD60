import { Assets, Sprite, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { BASE_RADIUS, RADIUS } from "../configuration";

type TargetOptions = ContainerOptions & {
	gameMap: GameMap;
	pos: Pos;
};

export class Target extends Container {
	pos: Pos;
	gameMap: GameMap;

	constructor(options: TargetOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			scale: RADIUS / BASE_RADIUS,
			interactive: true,
		});
		this.gameMap = options.gameMap;
		this.pos = options.pos;

		this.addChild(
			new Sprite({
				texture: Assets.get(`MapTile_Select.png`),
				anchor: 0.5,
				blendMode: "add",
				alpha: 0,
			}),
		);
	}
}
