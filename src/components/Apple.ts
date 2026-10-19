import { AnimatedSprite, Assets, Sprite, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { calculatePos, type Pos } from "../game/map";
import type { GameMap } from "./GameMap";
import { BASE_RADIUS, RADIUS } from "../configuration";
import { randomCyclic } from "../utils/random";

type AppleOptions = ContainerOptions & { gameMap: GameMap; pos: Pos };

export class Apple extends Container {
	pos: Pos;
	gameMap: GameMap;

	constructor(options: AppleOptions) {
		super({
			...options,
			...calculatePos(options.pos, RADIUS),
			scale: RADIUS / BASE_RADIUS,
			eventMode: "none",
		});
		this.gameMap = options.gameMap;
		this.pos = options.pos;

		this.addChild(
			new AnimatedSprite({
				textures: randomCyclic([
					...Assets.get("DiamondIdle").animations["DiamondIdle"],
				]),
				animationSpeed: 15 / 60,
				anchor: 0.5,
				autoPlay: true,
				eventMode: "none",
			}),
		);

		// this.addChild(
		// 	new Sprite({
		// 		texture: Assets.get(`Apple.png`),
		// 		anchor: 0.5,
		// 	}),
		// );
	}

	move(pos: Pos) {
		const xy = calculatePos(pos, RADIUS);
		this.animate(this, { ...xy }, { duration: 0.5 });
		this.pos = pos;
	}
}
