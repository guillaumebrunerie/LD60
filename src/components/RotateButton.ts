import { Assets, Sprite, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import type { Pos } from "../game/map";
import type { GameMap } from "./GameMap";

type RotateButtonOptions = ContainerOptions & {
	gameMap: GameMap;
	pos: Pos;
	steps: number;
};

export class RotateButton extends Container {
	gameMap: GameMap;
	nextSteps: Pos[] = [];
	sprite: Sprite;
	pressed = false;

	constructor(options: RotateButtonOptions) {
		super({
			...options,
			interactive: true,
		});
		this.gameMap = options.gameMap;

		this.sprite = this.addChild(
			new Sprite({
				texture: Assets.get("ButtonRotateOff.png"),
				anchor: 0.5,
			}),
		);

		this.on("pointerdown", () => {
			this.sprite.texture = Assets.get("ButtonRotateOn.png");
		});

		this.on("pointerup", () => {
			this.sprite.texture = Assets.get("ButtonRotateOff.png");
		});
		this.on("pointerupoutside", () => {
			this.sprite.texture = Assets.get("ButtonRotateOff.png");
		});

		this.on("tap", () => {
			this.gameMap.rotate(this.gameMap.player.pos, 3, options.steps);
		});
	}
}
