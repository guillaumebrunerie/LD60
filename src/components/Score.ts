import type { ContainerOptions, TextStyleOptions } from "pixi.js";

import { Label } from "../components/Label";
import { FancyButton } from "@pixi/ui";
import { Container } from "../PausableContainer";

const style: TextStyleOptions = {
	fontFamily: "Roboto",
	fill: "#DDD",
	fontWeight: "bold",
	stroke: { color: "black", width: 6 },
	fontSize: 70,
};

/** Popup that shows up when gameplay is paused */
export class Score extends Container {
	score: FancyButton;

	constructor(options?: ContainerOptions) {
		super({
			...options,
			// onResize: (child, width, height) => {
			// 	child.position.set(width / 2, height / 2);
			// },
		});

		this.score = this.addChild(
			new FancyButton({
				text: new Label({
					text: "xxx",
					style,
				}),
			}),
		);
	}

	setScore(score: number) {
		this.score.text = `SCORE: ${score}`;
	}
}
