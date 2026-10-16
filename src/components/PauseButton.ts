import { FancyButton } from "@pixi/ui";
import { Assets, Container, type ContainerOptions } from "pixi.js";
import { navigation } from "../getEngine";

export class PauseButton extends Container {
	private button: FancyButton;
	constructor(options?: ContainerOptions) {
		super(options);
		this.button = this.addChild(
			new FancyButton({
				defaultView: Assets.get("PauseButton.png"),
			}),
		);
		this.button.anchor.set(0.5);
		this.button.on("pointertap", async () => {
			await navigation().pauseGame();
		});
	}
}
