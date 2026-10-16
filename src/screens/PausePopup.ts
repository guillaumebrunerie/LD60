import { Graphics, type ContainerOptions } from "pixi.js";

import { navigation } from "../getEngine";
import { Label } from "../components/Label";
import { FancyButton } from "@pixi/ui";
import { Container } from "../PausableContainer";

/** Popup that shows up when gameplay is paused */
export class PausePopup extends Container {
	constructor(options?: ContainerOptions) {
		super({
			...options,
			onResize: (child, width, height) => {
				child.position.set(width / 2, height / 2);
			},
		});

		// The blurred background
		this.addDynamicChild(
			new Graphics({
				interactive: true,
				onpointertap: async () => {
					await navigation().resumeGame();
				},
			})
				.rect(-1 / 2, -1 / 2, 1, 1)
				.fill("#00000040"),
			(child, width, height) => {
				child.scale.set(width, height);
			},
		);

		// Container for the buttons
		const container = this.addChild(
			new Container({
				onResize: (child, width, height) => {
					child.scale.set(Math.min(width / 1080, height / 1920));
				},
			}),
		);

		// The resume button
		const resumeButton = container.addChild(
			new FancyButton({
				text: new Label({
					text: `Go back to the game`,
					style: {
						fontFamily: "Roboto",
						fill: "#DDD",
						fontWeight: "bold",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resumeButton.y = -75;
		resumeButton.on(
			"pointertap",
			async () => await navigation().resumeGame(),
		);

		// The reset progress button
		const resetButton = container.addChild(
			new FancyButton({
				text: new Label({
					text: `Reset all progress`,
					style: {
						fontFamily: "Roboto",
						fill: "#D22",
						fontWeight: "bold",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resetButton.y = 150;
		resetButton.on("pointertap", () => {
			resetConfirmButton.visible = true;
		});

		// The confirm reset button, shown after clicking the reset button
		const resetConfirmButton = container.addChild(
			new FancyButton({
				text: new Label({
					text: `Confirm reset`,
					style: {
						fontFamily: "Roboto",
						fill: "#D00",
						fontWeight: "bold",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resetConfirmButton.visible = false;
		resetConfirmButton.y = 300;
		resetConfirmButton.on("pointertap", () => this.onReset());
	}

	onReset() {
		window.location.reload();
	}

	// /** Present the popup, animated */
	// public show() {
	// 	const currentEngine = engine();
	// 	if (currentEngine.navigation.currentScreen) {
	// 		currentEngine.navigation.currentScreen.filters = [
	// 			new BlurFilter({ strength: 3 }),
	// 		];
	// 	}
	// 	// this.alpha = 0;
	// 	// await animate<PausePopup>(
	// 	// 	this,
	// 	// 	{ alpha: 1 },
	// 	// 	{ duration: 0.2, ease: "linear" },
	// 	// );
	// }

	// 	/** Dismiss the popup, animated */
	// 	public async hide() {
	// 		const currentEngine = engine();
	// 		if (currentEngine.navigation.currentScreen) {
	// 			currentEngine.navigation.currentScreen.filters = [];
	// 		}
	// 		// await animate<PausePopup>(
	// 		// 	this,
	// 		// 	{ alpha: 0 },
	// 		// 	{ duration: 0.2, ease: "linear" },
	// 		// );
	// 	}
}
