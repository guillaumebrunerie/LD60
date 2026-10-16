import { FancyButton } from "@pixi/ui";
import { Assets, type ContainerOptions } from "pixi.js";
import { userSettings } from "../utils/userSettings";
import { Container } from "../PausableContainer";

export class SoundButton extends Container {
	private button: FancyButton;
	constructor(options?: ContainerOptions) {
		super(options);
		this.button = this.addChild(new FancyButton({ anchor: 0.5 }));
		this.button.on("pointertap", () => {
			this.toggleSound();
		});
		this.updateButton();
	}

	isSoundOn() {
		return userSettings.masterVolume.get() > 0.5;
	}

	updateButton() {
		this.button.defaultView =
			this.isSoundOn() ?
				Assets.get("SoundOnButton.png")
			:	Assets.get("SoundOffButton.png");
	}

	toggleSound() {
		if (this.isSoundOn()) {
			userSettings.masterVolume.set(0);
		} else {
			userSettings.masterVolume.set(1);
		}
		this.updateButton();
	}
}
