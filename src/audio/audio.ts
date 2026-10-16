import { type PlayOptions, Sound, sound } from "@pixi/sound";
import { animate } from "motion";

/**
 * Handles music background, playing only one audio file in loop at time,
 * and fade/stop the music if a new one is requested. Also provide volume
 * control for music background only, leaving other sounds volumes unchanged.
 */
class BGM {
	/** Alias of the current music being played */
	public currentAlias?: string;
	/** Current music instance being played */
	public current?: Sound;
	/** Current volume set */
	private volume = 1;

	/** Play a background music, fading out and stopping the previous, if there is one */
	public async play(alias: string, options?: PlayOptions) {
		// Do nothing if the requested music is already being played
		if (this.currentAlias === alias) return;

		// Fade out then stop current music
		if (this.current) {
			const current = this.current;
			animate(
				current,
				{ volume: 0 },
				{ duration: 1, ease: "linear" },
			).then(() => {
				current.stop();
			});
		}

		// Find out the new instance to be played
		this.current = sound.find(alias);

		// Play and fade in the new music
		this.currentAlias = alias;
		this.current.play({ loop: true, ...options });
		this.current.volume = 0;
		animate(
			this.current,
			{ volume: this.volume },
			{ duration: 3, ease: (t) => t * t },
		);
	}

	public stop() {
		if (this.current) {
			const current = this.current;
			this.current = undefined;
			this.currentAlias = undefined;
			animate(
				current,
				{ volume: 0 },
				{ duration: 1, ease: "linear" },
			).then(() => {
				current.stop();
			});
		}
	}

	public pause() {
		this.current?.pause();
	}

	public resume() {
		this.current?.resume();
	}

	/** Get background music volume */
	public getVolume() {
		return this.volume;
	}

	/** Set background music volume */
	public setVolume(v: number) {
		this.volume = v;
		if (this.current) this.current.volume = this.volume;
	}
}

/**
 * Handles short sound special effects, mainly for having its own volume settings.
 * The volume control is only a workaround to make it work only with this type of sound,
 * with a limitation of not controlling volume of currently playing instances - only the new ones will
 * have their volume changed. But because most of sound effects are short sounds, this is generally fine.
 */
class SFX {
	/** Volume scale for new instances */
	private volume = 1;

	/** Play an one-shot sound effect */
	public play(alias: string, options?: PlayOptions) {
		const volume = this.volume * (options?.volume ?? 1);
		sound.play(alias, { ...options, volume });
	}

	/** Set sound effects volume */
	public getVolume() {
		return this.volume;
	}

	/** Set sound effects volume. Does not affect instances that are currently playing */
	public setVolume(v: number) {
		this.volume = v;
	}
}

class Audio {
	bgm = new BGM();
	sfx = new SFX();
	playMusic(alias: string, options?: PlayOptions) {
		this.bgm.play(`main/sounds/${alias}.mp3`, options);
	}
	stopMusic() {
		this.bgm.stop();
	}
	pauseMusic() {
		this.bgm.pause();
	}
	resumeMusic() {
		this.bgm.resume();
	}
	playSound(alias: string, options?: PlayOptions) {
		this.sfx.play(`main/sounds/${alias}.mp3`, options);
	}
	getMasterVolume() {
		return sound.volumeAll;
	}
	setMasterVolume(volume: number) {
		sound.volumeAll = volume;
		if (!volume) {
			sound.muteAll();
		} else {
			sound.unmuteAll();
		}
	}
}

export const audio = new Audio();
