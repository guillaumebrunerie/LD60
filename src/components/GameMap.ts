import { Ticker, type ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { Tile } from "./Tile";
import {
	addApple,
	createMap,
	hexDistance,
	rotate,
	type Map,
	type Pos,
	type XYPoint,
} from "../game/map";
import { Player } from "./Player";
import { Target } from "./Target";
import { Snake } from "./Snake";
import { Apple } from "./Apple";
import { RADIUS, SNAKE_SPEED } from "../configuration";
import { Enemy } from "./Enemy";
import { Note } from "./Note";
import { clamp, length, mod } from "../utils/maths";
import { level1 } from "../game/levels";
import { Score } from "./Score";
// import { Viewport } from "pixi-viewport";
// import { app } from "../getEngine";

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
	targets: Container<Target> = new Container<Target>();
	apples: Container<Apple> = new Container<Apple>();
	notes: Container<Note> = new Container<Note>();
	enemies: Container<Enemy> = new Container<Enemy>();
	snake: Snake;
	scoreDisplay: Score;
	// rotateLeft: RotateButton;
	// rotateRight: RotateButton;
	score = 0;

	constructor(options: GameMapOptions) {
		super(options);

		this.startGame();

		// this.filters = [new CRTFilter(CRT_CONFIGURATION)];

		window.addEventListener("keydown", (event) => {
			if (event.code == "Space") {
				// this.rotate(this.player.pos, 3, event.shiftKey ? -1 : 1);
			}
		});

		let downPosition: XYPoint | undefined = undefined;
		const threshold = 50;
		window.addEventListener("keydown", (event) => {
			if (event.code == "KeyR") {
				this.gameOver();
			}
		});
		window.addEventListener("pointerdown", (event) => {
			downPosition = { x: event.clientX, y: event.clientY };
		});
		window.addEventListener("pointerup", () => {
			downPosition = undefined;
		});
		window.addEventListener("pointermove", (event) => {
			if (
				downPosition &&
				length({
					x: downPosition.x - event.clientX,
					y: downPosition.y - event.clientY,
				}) >= threshold
			) {
				const angle = Math.atan2(
					event.clientY - downPosition.y,
					event.clientX - downPosition.x,
				);
				const steps = Math.round(
					mod((angle * 180) / Math.PI, 360) / 60,
				);
				downPosition = { x: event.clientX, y: event.clientY };
				switch (steps) {
					case 0:
					case 6:
						this.snake.changeDirection("right");
						break;
					case 1:
						this.snake.changeDirection("right-down");
						break;
					case 2:
						this.snake.changeDirection("left-down");
						break;
					case 3:
						this.snake.changeDirection("left");
						break;
					case 4:
						this.snake.changeDirection("left-up");
						break;
					case 5:
						this.snake.changeDirection("right-up");
						break;
				}
			}
		});
	}

	tt: Tiles;
	// viewport: Viewport;
	startGame() {
		this.score = 0;
		this.scoreDisplay?.setScore(this.score);

		// this.viewport = this.addChild(
		// 	new Viewport({
		// 		screenWidth: window.innerWidth,
		// 		screenHeight: window.innerHeight,
		// 		worldWidth: width,
		// 		worldHeight: height,
		// 		events: app().renderer.events,
		// 	}),
		// );

		const tiles = (this.tt = this.addChild(new Tiles({})));
		this.map = createMap(level1);

		this.tiles.forEach((tile) => tile.destroy());
		for (const { pos, elevation } of this.map.tiles) {
			this.tiles.push(
				tiles.addChild(new Tile({ gameMap: this, pos, elevation })),
			);
		}

		this.targets.destroy();
		this.targets = tiles.addChild(new Container<Target>());

		this.player?.destroy();
		// this.player = tiles.addChild(
		// 	new Player({
		// 		gameMap: this,
		// 		pos: {
		// 			col: Math.round(WIDTH / 2),
		// 			row: Math.round(HEIGHT / 2),
		// 		},
		// 	}),
		// );

		this.enemies.destroy();
		this.enemies = tiles.addChild(new Container<Enemy>());
		// for (const pos of this.map.apples) {
		// 	this.enemies.addChild(
		// 		new Enemy({
		// 			gameMap: this,
		// 			pos,
		// 		}),
		// 	);
		// }

		this.notes.destroy();
		this.notes = tiles.addChild(new Container<Note>());
		for (const pos of this.map.notes) {
			this.notes.addChild(
				new Note({
					gameMap: this,
					pos,
				}),
			);
		}

		this.apples.destroy();
		this.apples = tiles.addChild(new Container<Apple>());
		for (const pos of this.map.apples) {
			this.apples.addChild(
				new Apple({
					gameMap: this,
					pos,
				}),
			);
		}

		this.snake?.destroy();
		this.snake = tiles.addChild(
			new Snake({ gameMap: this, level: level1 }),
		);
		// this.snake.pickTarget(this.apples);
		// this.rotateLeft = this.addChild(
		// 	new RotateButton({
		// 		x: 750,
		// 		y: 1450,
		// 		gameMap: this,
		// 		steps: 1,
		// 	}),
		// );
		// this.rotateRight = this.addChild(
		// 	new RotateButton({
		// 		x: 150,
		// 		y: 1450,
		// 		gameMap: this,
		// 		scale: { x: -1, y: 1 },
		// 		steps: -1,
		// 	}),
		// );

		const dest = {
			x: clamp(
				-this.snake.parts.children[0].x,
				450 - RADIUS * 2 * level1.size * Math.sqrt(3),
				-450,
			),
			y: clamp(
				-this.snake.parts.children[0].y,
				800 - RADIUS * 2 * level1.size * 1.5,
				-800,
			),
		};
		this.tt.x = dest.x;
		this.tt.y = dest.y;
		this.dest.x = this.tt.x;
		this.dest.y = this.tt.y;

		this.scoreDisplay?.destroy();
		this.scoreDisplay = this.addChild(new Score({ y: 700 }));
		this.scoreDisplay?.setScore(this.score);

		// this.viewport.follow(this.snake.parts.children[0]);
	}

	gameOver() {
		this.startGame();
	}

	update(ticker: Ticker) {
		super.update(ticker);

		const dest = {
			x: -this.snake.parts.children[0].x,
			y: -this.snake.parts.children[0].y,
		};

		const v = {
			x: dest.x - this.dest.x,
			y: dest.y - this.dest.y,
		};
		const vh = Math.sqrt(v.x * v.x + v.y * v.y);
		const speed = (RADIUS * Math.sqrt(3)) / (1000 / SNAKE_SPEED);
		const desiredDistance = speed * ticker.deltaMS;
		this.dest =
			vh < desiredDistance ?
				{ ...dest }
			:	{
					x: this.dest.x + (v.x / vh) * desiredDistance,
					y: this.dest.y + (v.y / vh) * desiredDistance,
				};
		this.tt.x = clamp(
			this.dest.x,
			450 - RADIUS * 2 * level1.size * Math.sqrt(3),
			-450,
		);
		this.tt.y = clamp(
			this.dest.y,
			800 - RADIUS * 2 * level1.size * 1.5,
			-800,
		);
	}
	dest = { x: 0, y: 0 };

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
			this.collectAndRespawnApple(apple);
			this.score++;
			this.scoreDisplay.setScore(this.score);
			return true;
		}
		return false;
	}

	collectAndRespawnApple(apple: Apple) {
		apple.destroy();
		apple.removeFromParent();
		this.snake.pickTarget(this.apples);

		const newApple = addApple(this.map, level1.size, this.snake.positions);
		if (newApple) {
			this.apples.addChild(
				new Apple({
					gameMap: this,
					pos: newApple,
				}),
			);
		}
	}
}
