import { Assets, BlurFilter } from "pixi.js";
import { LoadScreen } from "./screens/LoadScreen";
import { StartScreen } from "./screens/StartScreen";
import { MapScreen } from "./screens/MapScreen";
import { Container } from "./PausableContainer";
import { PausePopup } from "./screens/PausePopup";
import { isAndroid } from "./utils/platform";

export class Navigation extends Container {
	constructor() {
		super();
		this.filter = new BlurFilter({ strength: 0 });
	}

	startScreen?: StartScreen;
	gameScreen?: MapScreen;

	async loadGame() {
		// Show the loading screen and start loading the main bundle
		const loadScreen = this.addChild(new LoadScreen());
		await Assets.loadBundle(["main"], (progress) => {
			loadScreen.onLoad(progress);
		});

		// When it’s done, show the start screen
		loadScreen.onLoad(1);
		await new Promise(requestAnimationFrame);
		this.removeChild(loadScreen);
		this.startScreen = this.addChild(new StartScreen());
	}

	async startGame() {
		if (isAndroid()) {
			try {
				await document.body.requestFullscreen();
			} catch {
				// Do nothing
			}
		}
		this.gameScreen = this.addChildAt(new MapScreen(), 0);
		if (this.startScreen) {
			await this.animate(
				this.startScreen,
				{ alpha: 0 },
				{ duration: 0.5 },
			);
			this.removeChild(this.startScreen);
		}
	}

	pausePopup?: PausePopup;
	filter: BlurFilter;
	async pauseGame() {
		if (this.pausePopup || !this.gameScreen) {
			return;
		}
		this.gameScreen.pause();

		this.gameScreen.filters = [this.filter];

		this.pausePopup = this.addChild(new PausePopup({ alpha: 0 }));

		await Promise.all([
			this.animate(this.filter, { strength: 3 }, { duration: 0.1 }),
			this.animate(this.pausePopup, { alpha: 1 }, { duration: 0.1 }),
		]);
	}

	async resumeGame() {
		if (!this.pausePopup || !this.gameScreen) {
			return;
		}
		this.gameScreen.resume();

		await Promise.all([
			this.animate(this.filter, { strength: 0 }, { duration: 0.1 }),
			this.animate(this.pausePopup, { alpha: 0 }, { duration: 0.1 }),
		]);

		this.gameScreen.filters = [];
		this.removeChild(this.pausePopup);
		this.pausePopup = undefined;
	}

	// Automatic blur/focus
	blur() {
		// Similar to pause but synchronous
		if (this.pausePopup || !this.gameScreen) {
			return;
		}
		this.gameScreen.pause();

		this.filter.strength = 3;
		this.gameScreen.filters = [this.filter];

		this.pausePopup = this.addChild(new PausePopup());
	}
	focus() {}
}
