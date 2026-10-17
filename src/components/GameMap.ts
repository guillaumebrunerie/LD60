import { type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { Tile } from "./Tile";
import { createMap, hexDistance, rotate, type Pos } from "../game/map";

type TilesOptions = ContainerOptions & {
	// setPlayerTarget: (i: number, j: number) => void;
};

class Tiles extends Container {
	constructor(options: TilesOptions) {
		super({ ...options, interactive: true });

		// this.on("pointertap", (event) => {
		// 	const { x, y } = event.getLocalPosition(this.parent!);
		// 	const i = Math.round(y / (TILE_SIZE / 2) + 1) / 2;
		// 	const j = Math.round(x / (TILE_SIZE / 2) + 1) / 2;
		// 	options.setPlayerTarget(i, j);
		// });
	}
}

type GameMapOptions = ContainerOptions & {};

export class GameMap extends Container {
	tiles: Tile[];
	constructor(options: GameMapOptions) {
		super(options);

		const tiles = this.addChild(
			new Tiles({ x: 600, y: 500 /*, angle: 15*/ }),
		);
		const map = createMap();
		this.tiles = [];

		for (const { col, row } of map) {
			this.tiles.push(
				tiles.addChild(new Tile({ gameMap: this, pos: { col, row } })),
			);
		}

		this.interactive = true;
		this.onpointerdown = () => this.rotate(0, 0, 6);
	}

	rotate(pivot: Pos, radius: number) {
		for (const tile of this.tiles) {
			if (hexDistance(tile.pos, pivot) <= radius) {
				tile.move(rotate(tile.pos, pivot, 60));
				// tile.move(tile.col + 20, tile.row);
			}
		}
	}
}
