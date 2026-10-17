import { Container } from "../PausableContainer";
import { FancyButton } from "@pixi/ui";
import { navigation } from "../getEngine";
import { Assets, Sprite, type ContainerOptions } from "pixi.js";
import { SoundButton } from "../components/SoundButton";
import { audio } from "../audio/audio";

export class StartScreen extends Container {
	constructor(options?: ContainerOptions) {
		super(options);

		const container = this.addChild(
			new Container({
				onResize: (child, width, height) => {
					child.scale.set(Math.min(width / 1080, height / 1920));
					child.position.set(width / 2, height / 2);
				},
			}),
		);

		container.addChild(
			new Sprite({
				texture: Assets.get("Logo.png"),
				anchor: 0.5,
			}),
		);

		const startButton = container.addChild(
			new FancyButton({
				defaultView: Assets.get("StartButton.png"),
				anchor: 0.5,
			}),
		);
		startButton.y = 1920 / 4;
		startButton.on("pointertap", () => this.startGame());

		container.addChild(
			new SoundButton({
				x: 1080 / 2 - 60,
				y: -1920 / 2 + 60,
			}),
		);
	}

	async startGame() {
		audio.playMusic("Music", { volume: 0.3 });
		audio.playSound("Click");
		navigator.vibrate?.(200);
		navigation().startGame();
	}
}
