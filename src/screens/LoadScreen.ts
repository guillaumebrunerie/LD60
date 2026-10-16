import type { ContainerOptions } from "pixi.js";
import { Container } from "../PausableContainer";
import { Label } from "../components/Label";

export class LoadScreen extends Container {
	onLoad: (progress: number) => void;

	constructor(options?: ContainerOptions) {
		super(options);

		const loadingText = this.addDynamicChild(
			new Label({
				text: "0%",
				style: {
					fontFamily: "Helvetica",
					fill: "white",
					fontSize: 30,
				},
			}),
			(child, width, height) => {
				child.scale.set(height / 1920);
				child.position.set(width / 2, height / 2);
			},
		);
		this.onLoad = (progress: number) => {
			loadingText.text = `${Math.floor(progress * 100)}%`;
		};
	}
}
