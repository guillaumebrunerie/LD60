import { audio } from "../audio/audio";

class Storage {
	key: string;
	defaultValue: number;
	onChange?: (value: number) => void;

	constructor(
		key: string,
		defaultValue: number,
		onChange?: (value: number) => void,
	) {
		this.key = key;
		this.defaultValue = defaultValue;
		this.onChange = onChange;
	}

	init() {
		const value = this.get();
		this.onChange?.(value);
	}

	get() {
		const str = localStorage.getItem(this.key);
		if (str == null) {
			return this.defaultValue;
		} else {
			return Number(str);
		}
	}

	set(value: number) {
		localStorage.setItem(this.key, String(value));
		this.onChange?.(value);
	}

	reset() {
		localStorage.removeItem(this.key);
	}
}

/**
 * Persistent user settings of volumes.
 */
class UserSettings {
	masterVolume = new Storage("volume-master", 1, (value) => {
		audio.setMasterVolume(value);
	});

	// hintsLeft = new Storage("hints-left", 5);

	public init() {
		this.masterVolume.init();
	}
}

/** SHared user settings instance */
export const userSettings = new UserSettings();
