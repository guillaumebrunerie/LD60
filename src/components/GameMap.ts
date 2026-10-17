import { type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { Tile } from "./Tile";
import { createMap, hexDistance, rotate, type Pos } from "../game/map";
import { Player } from "./Player";

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
	player: Player;

	constructor(options: GameMapOptions) {
		super(options);

		const tiles = this.addChild(new Tiles({ x: 800, y: 500 }));
		const map = createMap();
		this.tiles = [];

		for (const { col, row } of map) {
			this.tiles.push(
				tiles.addChild(new Tile({ gameMap: this, pos: { col, row } })),
			);
		}

		this.player = tiles.addChild(
			new Player({ gameMap: this, pos: { col: 0, row: 0 } }),
		);
	}

	rotate(pivot: Pos, radius: number) {
		for (const tile of this.tiles) {
			if (hexDistance(tile.pos, pivot) <= radius) {
				tile.move(rotate(tile.pos, pivot, 60));
			}
		}
	}
}
