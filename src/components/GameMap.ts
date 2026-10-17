import { Ticker, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { Tile } from "./Tile";
import {
	addApple,
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
import { CRT_CONFIGURATION, HEIGHT, WIDTH } from "../configuration";
import { RotateButton } from "./RotateButton";
import { Enemy } from "./Enemy";

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
	enemies: Container<Enemy>;
	snake: Snake;
	rotateLeft: RotateButton;
	rotateRight: RotateButton;

	constructor(options: GameMapOptions) {
		super(options);

		this.filters = [new CRTFilter(CRT_CONFIGURATION)];

		const tiles = this.addChild(new Tiles({ x: 0, y: 0 }));
		this.map = createMap();

		for (const { pos, elevation } of this.map.tiles) {
			this.tiles.push(
				tiles.addChild(new Tile({ gameMap: this, pos, elevation })),
			);
		}

		this.targets = tiles.addChild(new Container<Target>());

		this.player = tiles.addChild(
			new Player({
				gameMap: this,
				pos: {
					col: Math.round(WIDTH / 2),
					row: Math.round(HEIGHT / 2),
				},
			}),
		);

		this.enemies = tiles.addChild(new Container<Enemy>());
		for (const pos of this.map.apples) {
			this.enemies.addChild(
				new Enemy({
					gameMap: this,
					pos,
				}),
			);
		}

		this.apples = tiles.addChild(new Container<Apple>());
		// for (const pos of this.map.apples) {
		// 	this.apples.addChild(
		// 		new Apple({
		// 			gameMap: this,
		// 			pos,
		// 		}),
		// 	);
		// }
		// this.snake = tiles.addChild(new Snake({ gameMap: this }));
		// this.snake.pickTarget(this.apples);
		this.rotateLeft = this.addChild(
			new RotateButton({
				x: 750,
				y: 1450,
				gameMap: this,
				steps: 1,
			}),
		);
		this.rotateRight = this.addChild(
			new RotateButton({
				x: 150,
				y: 1450,
				gameMap: this,
				scale: { x: -1, y: 1 },
				steps: -1,
			}),
		);

		window.addEventListener("keydown", (event) => {
			if (event.code == "Space") {
				this.rotate(this.player.pos, 3, event.shiftKey ? -1 : 1);
			}
		});
	}

	update(ticker: Ticker) {
		super.update(ticker);
		this.filters[0].time +=
			(ticker.deltaMS / 1000) * CRT_CONFIGURATION.speed;
	}

	moveInProgress = false;
	rotate(pivot: Pos, radius: number, steps: number) {
		if (this.moveInProgress) {
			return;
		}
		this.moveInProgress = true;
		const replacements: [
			{ pos: Pos; elevation: number },
			{ pos: Pos; elevation: number },
		][] = [];
		for (const tile of this.tiles) {
			if (hexDistance(tile.pos, pivot) <= radius) {
				const oldPos = { ...tile.pos };
				const newPos = rotate(tile.pos, pivot, 60 * steps);
				tile.move({ ...newPos }, 60 * steps);
				const oldT = this.map.tiles.find(
					(t) => t.pos.col == oldPos.col && t.pos.row == oldPos.row,
				)!;
				replacements.push([oldT, { ...oldT, pos: { ...newPos } }]);
			}
		}
		// for (const apple of this.apples.children) {
		// 	if (hexDistance(apple.pos, pivot) <= radius) {
		// 		const newPos = rotate(apple.pos, pivot, 60 * steps);
		// 		apple.move(newPos);
		// 	}
		// }
		this.map.tiles = this.map.tiles.map(
			(t) => replacements.find(([a]) => a == t)?.[1] || t,
		);
		for (const [, newT] of replacements) {
			this.map.array[newT.pos.col][newT.pos.row] = newT.elevation;
		}
		// this.snake.nextSteps = [];
		// this.snake.pickTarget(this.apples);
		setTimeout(() => {
			this.moveInProgress = false;
		}, 500);
	}

	maybeEatApple(pos: Pos) {
		const apple = this.apples.children.find(
			(apple) => apple.pos.col == pos.col && apple.pos.row == pos.row,
		);
		if (apple) {
			apple.destroy();
			apple.removeFromParent();
			this.snake.pickTarget(this.apples);

			const newApple = addApple(this.map);
			if (newApple) {
				this.apples.addChild(
					new Apple({
						gameMap: this,
						pos: newApple,
					}),
				);
			}
			return true;
		}
		return false;
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

	clearTargets() {
		this.player.nextSteps = [];
		this.targets.removeChildren();
	}

	addTarget(pos: Pos) {
		const pathAndDistance = findBestPath(
			this.map,
			[], //this.snake.parts.children.map((part) => part.pos),
			this.player.lastStep() || this.player.pos,
			[pos],
		);
		if (!pathAndDistance) {
			return;
		}
		const { path } = pathAndDistance;
		for (const step of path) {
			this.player.nextSteps.push(step);
			this.targets.addChild(new Target({ gameMap: this, pos: step }));
			// this.snake.nextSteps.push(step);
		}
	}
}
