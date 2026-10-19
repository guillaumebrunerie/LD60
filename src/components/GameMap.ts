import { AnimatedSprite, Ticker, type ContainerOptions } from "pixi.js";
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
import { Snake } from "./Snake";
import { Apple } from "./Apple";
import { RADIUS, SNAKE_SPEED } from "../configuration";
import { clamp, length, mod } from "../utils/maths";
import { level1 } from "../game/levels";
import { Score } from "./Score";
import { GameOver } from "../screens/GameOverPopup";
import { audio } from "../audio/audio";
// import { Viewport } from "pixi-viewport";
// import { app } from "../getEngine";

type TilesOptions = ContainerOptions & {
	// setPlayerTarget: (i: number, j: number) => void;
};

class Tiles extends Container {
	constructor(options: TilesOptions) {
		super({ ...options, interactive: true });
	}
}

type GameMapOptions = ContainerOptions & {};

const highScoreKey = "hexnake-high-score";

export class GameMap extends Container {
	map: Map;
	tiles: Tile[] = [];
	apples: Container<Apple> = new Container<Apple>();
	snake: Snake;
	scoreDisplay: Score;
	score = 0;
	highScore = Number(localStorage.getItem(highScoreKey) || 0) || 0;

	constructor(options: GameMapOptions) {
		super(options);

		this.startGame();

		// this.filters = [new CRTFilter(CRT_CONFIGURATION)];

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
	startGame() {
		this.isGameOver = false;

		this.score = 0;
		this.scoreDisplay?.setScore(this.score, this.highScore);

		const tiles = (this.tt = this.addChild(new Tiles({})));

		this.snake?.destroy();
		this.snake = new Snake({ gameMap: this, level: level1 });

		this.map = createMap(level1, this.snake.positions);

		this.tiles.forEach((tile) => tile.destroy());
		for (const { pos, elevation } of this.map.tiles) {
			this.tiles.push(
				tiles.addChild(new Tile({ gameMap: this, pos, elevation })),
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

		tiles.addChild(this.snake);

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
		this.scoreDisplay?.setScore(this.score, this.highScore);
	}

	isGameOver = false;
	gameOver() {
		audio.playSound("HitObstacle");
		this.isGameOver = true;
		for (const part of this.snake.parts.children) {
			for (const child of part.children) {
				if (child instanceof AnimatedSprite) {
					child.stop();
				}
			}
		}
		this.highScore = Math.max(this.highScore, this.score);
		localStorage.setItem(highScoreKey, String(this.highScore));
		this.scoreDisplay?.setScore(this.score, this.highScore);

		// this.startGame();
		this.addChild(new GameOver({ onClick: () => this.startGame() }));
	}

	update(ticker: Ticker) {
		if (this.isGameOver) {
			return;
		}

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
			audio.playSound("Collect");
			this.collectAndRespawnApple(apple);
			this.score++;
			this.scoreDisplay.setScore(this.score, this.highScore);
			return true;
		}
		return false;
	}

	collectAndRespawnApple(apple: Apple) {
		apple.destroy();
		apple.removeFromParent();
		this.map.apples = this.map.apples.filter(
			(a) => a.col != apple.pos.col || a.row != apple.pos.row,
		);

		const newApple = addApple(this.map, level1.size, [
			...this.snake.allPositions(),
			apple.pos,
		]);
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
