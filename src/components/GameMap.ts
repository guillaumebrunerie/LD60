import { type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { Tile } from "./Tile";
import {
	createMap,
	findBestPath,
	hexDistance,
	rotate,
	type Map,
	type Pos,
} from "../game/map";
import { Player } from "./Player";
import { Target } from "./Target";

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
	map: Map;
	tiles: Tile[] = [];
	player: Player;
	targets: Container<Target>;

	constructor(options: GameMapOptions) {
		super(options);

		const tiles = this.addChild(new Tiles({ x: 800, y: 500 }));
		this.map = createMap();

		for (const { pos, elevation } of this.map) {
			this.tiles.push(
				tiles.addChild(new Tile({ gameMap: this, pos, elevation })),
			);
		}

		this.targets = tiles.addChild(new Container<Target>());

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

	removeTarget(pos: Pos) {
		const target = this.targets.children.find(
			(target) =>
				target.pos.col === pos.col && target.pos.row === pos.row,
		);
		if (target) {
			this.targets.removeChild(target);
		}
	}

	addTarget(pos: Pos) {
		const path = findBestPath(
			this.map,
			this.player.lastStep() || this.player.pos,
			pos,
		);
		if (!path) {
			return;
		}
		for (const step of path) {
			this.player.nextSteps.push(step);
			this.targets.addChild(new Target({ gameMap: this, pos: step }));
		}
	}
}
