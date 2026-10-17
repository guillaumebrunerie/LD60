import { Ticker, type ContainerOptions } from "pixi.js";
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
import { Snake } from "./Snake";
import { Apple } from "./Apple";
import { randomInt } from "../utils/random";
import { CRTFilter } from "pixi-filters";

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
	apples: Container<Apple>;
	snake: Snake;

	constructor(options: GameMapOptions) {
		super(options);

		this.filters = [
			new CRTFilter({
				curvature: 1,
				lineWidth: 2,
				lineContrast: 0.5,
				noise: 0.2,
			}),
		];

		const tiles = this.addChild(new Tiles({ x: 800, y: 500 }));
		this.map = createMap();

		for (const { pos, elevation } of this.map.tiles) {
			this.tiles.push(
				tiles.addChild(new Tile({ gameMap: this, pos, elevation })),
			);
		}

		this.targets = tiles.addChild(new Container<Target>());

		this.player = tiles.addChild(
			new Player({ gameMap: this, pos: { col: 0, row: 0 } }),
		);

		this.apples = tiles.addChild(new Container<Apple>());
		for (const pos of this.map.apples) {
			this.apples.addChild(
				new Apple({
					gameMap: this,
					pos,
				}),
			);
		}

		this.snake = tiles.addChild(new Snake({ gameMap: this }));

		this.snake.pickTarget(this.apples.children.map((apple) => apple.pos));

		window.addEventListener("keydown", (event) => {
			if (event.code == "Space") {
				this.rotate(this.player.pos, 3, event.shiftKey ? -1 : 1);
			}
		});
	}

	update(ticker: Ticker) {
		this.filters[0].time += (ticker.deltaMS / 1000) * 5;
	}

	rotate(pivot: Pos, radius: number, steps: number) {
		const replacements = [];
		for (const tile of this.tiles) {
			if (hexDistance(tile.pos, pivot) <= radius) {
				const oldPos = { ...tile.pos };
				const newPos = rotate(tile.pos, pivot, 60 * steps);
				tile.move({ ...newPos }, 60 * steps);
				const oldT = this.map.tiles.find(
					(t) => t.pos.col == oldPos.col && t.pos.row == oldPos.row,
				);
				replacements.push([oldT, { ...oldT, pos: { ...newPos } }]);
			}
		}
		this.map.tiles = this.map.tiles.map(
			(t) => replacements.find(([a]) => a == t)?.[1] || t,
		);
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
		const pathAndDistance = findBestPath(
			this.map,
			this.player.lastStep() || this.player.pos,
			pos,
		);
		if (!pathAndDistance) {
			return;
		}
		const { path } = pathAndDistance;
		for (const step of path) {
			this.player.nextSteps.push(step);
			this.targets.addChild(new Target({ gameMap: this, pos: step }));
			this.snake.nextSteps.push(step);
		}
	}
}
