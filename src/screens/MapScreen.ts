import { GameMap } from "../components/GameMap";
import { Container } from "../PausableContainer";
import { Ticker, type ContainerOptions } from "pixi.js";

export class MapScreen extends Container {
	ticker: Ticker;

	constructor(options?: ContainerOptions) {
		super(options);

		this.addChild(
			new GameMap({
				x: 900 / 2,
				y: 1600 / 2,
			}),
		);

		this.ticker = new Ticker();
		this.ticker.add(() => this.update(this.ticker));
		this.ticker.start();
	}

	pause() {
		this.ticker.stop();
	}

	resume() {
		this.ticker.start();
	}
}
