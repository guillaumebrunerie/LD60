import { GameMap } from "../components/GameMap";
import { Container } from "../PausableContainer";
import type { ContainerOptions } from "pixi.js";

export class MapScreen extends Container {
	constructor(options?: ContainerOptions) {
		super(options);

		this.addChild(new GameMap({}));
	}
}
