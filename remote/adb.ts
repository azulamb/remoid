/// <reference path="./adb.d.ts" />

import { basename } from 'https://deno.land/std@0.150.0/path/win32.ts';

type INPUT_SOURCE = 'dpad' | 'keyboard' | 'mouse' | 'touchpad' | 'gamepad' | 'touchnavigation' | 'joystick' | 'touchscreen' | 'stylus' | 'trackball';
type INPUT_COMMAND = 'text' | 'keyevent' | 'tap' | 'swipe' | 'draganddrop' | 'press' | 'roll' | 'motionevent';
export type ADB_KEY_EVENTS = 'HOME' | 'APP_SWITCH' | 'SWITCH' | 'BACK' | 'MENU' | 'SEARCH' | 'CAMERA' | 'POWER' | 'SLEEP' | 'WAKEUP';

export class ADB {
	protected adb: string;
	protected pc = './capture/';
	protected capturing: null | Promise<string> = null;
	protected motionLock = false;

	constructor(option?: { adb?: string }) {
		this.adb = 'adb';

		if (option) {
			if (option.adb && typeof option.adb === 'string') {
				this.adb = option.adb;
			}
		}
	}

	/*public async prepare(pcDir?: string) {
		if(pcDir) {
			this.pc = pcDir;
		}
		try{
			await Deno.mkdir(this.pc);
		}catch(error) {
			if ( !error || error.name !== 'AlreadyExists' ) {
				console.error(error);
			}
		}
		return this;
	}*/

	public async version() {
		if (this.motionLock) {
			return Promise.reject(new Error('Locked.'));
		}
		const p = Deno.run({
			cmd: [this.adb, '--version'],
			stdout: 'piped',
			stderr: 'piped',
		});

		const result = await p.status();

		if (result.code) {
			const decoder = new TextDecoder();
			throw new Error(decoder.decode(await p.stderrOutput()));
		} else {
			const decoder = new TextDecoder();
			return decoder.decode(await p.output());
		}
	}

	protected parseValue(value: string): any {
		if (value === 'null') {
			return null;
		}
		if (value === 'true') {
			return true;
		}
		if (value === 'false') {
			return false;
		}
		if (value.match(/^-{0,1}[0-9]+$/)) {
			return parseInt(value);
		}
		if (value.match(/^0x[0-9a-fA-F]+$/)) {
			return parseInt(value, 16);
		}
		if (value.match(/^-{0,1}[0-9]*\.[0-9]+$/)) {
			return parseFloat(value);
		}
		if (value.match(/\r\n|\r|\n/)) {
			return value.split(/\r\n|\r|\n/).map((value) => {
				return this.parseValue(value);
			});
		}
		if (value.match(',')) {
			return value.split(',').map((value) => {
				return this.parseValue(value);
			});
		}

		return value;
	}

	public async getProp() {
		const result = await this.shell('getprop');
		const props: DeviceProps = <any> {};
		//for (const line of result.split(/\r\n|\r|\n/)) {
		for (const line of result.split(/\]\s+\[/m)) {
			if (!line.match(':')) {
				continue;
			}
			const [k, v] = line.split(':');
			const key = k.replace(/^\[/, '').replace(/^(.+)\].*$/, '$1');
			const value = v.replace(/^[^\[]*\[/, '').replace(/\]\s*$/m, '');
			const keys = key.split('.');
			const last = <string> keys.pop();
			let obj = <any> props;
			for (const key of keys) {
				if (typeof obj[key] !== 'object') {
					obj[key] = {};
				}
				obj = obj[key];
			}
			obj[last] = v === value ? '' : this.parseValue(value);
		}
		return props;
	}

	public async shell(...args: string[]) {
		if (this.motionLock) {
			return Promise.reject(new Error('Locked.'));
		}
		const p = Deno.run({
			cmd: [this.adb, 'shell', ...args],
			stdout: 'piped',
			stderr: 'piped',
		});

		const result = await p.status();

		if (result.code) {
			const decoder = new TextDecoder();
			throw new Error(decoder.decode(await p.stderrOutput()));
		} else {
			const decoder = new TextDecoder();
			return decoder.decode(await p.output());
		}
	}

	public input(source: INPUT_SOURCE, command: INPUT_COMMAND, ...args: string[]) {
		if (this.motionLock && command !== 'motionevent') {
			return Promise.reject(new Error('Locked.'));
		}
		const p = Deno.run({
			cmd: [this.adb, 'shell', 'input', source, command, ...args],
		});
		return p.status();
	}

	/*public async getevent() {
		const p = Deno.run({
			cmd: [this.adb, 'shell', 'getevent', '-tl'],
			stdout: 'piped',
			stderr: 'piped',
		});

		const decoder = new TextDecoder();
		const buffer = new Uint8Array(64);
		decoder.decode(await p.output());

		while (await p.stdout.read(buffer) !== null) {
			for (const msg of decoder.decode(buffer).split('\n')) {
				console.log(msg);
			}
		}

		return await p.status();
	}*/

	protected async _capture(path: string) {
		try {
			console.log('Start capture:');
			await this.shell('screencap', '-p', path);
			console.log('Pull capture:');
			const p = Deno.run({
				cmd: [this.adb, 'pull', path],
				stdout: 'piped',
				stderr: 'piped',
			});
			const result = await p.status();
			if (result.code) {
				const decoder = new TextDecoder();
				const message = decoder.decode(await p.stderrOutput());
				throw new Error(message);
			}
			console.log('Remove capture:');
			await this.shell('rm', path);
		} catch (error) {
			return Promise.reject(error);
		}
		return basename(path);
	}

	public capture(path = '/sdcard/capture.png'): Promise<string> {
		if (this.motionLock) {
			return Promise.reject(new Error('Locked.'));
		}
		if (this.capturing) {
			return this.capturing;
		}

		this.capturing = this._capture(path);
		return this.capturing.then((result) => {
			this.capturing = null;
			return result;
		}).catch((error) => {
			this.capturing = null;
			return Promise.reject(error);
		});
	}

	//text

	public keyevent(key: string) {
		return this.input('keyboard', 'keyevent', key);
	}

	public tap(x: number, y: number) {
		return this.input('touchscreen', 'tap', x + '', y + '');
	}

	public swipe(x0: number, y0: number, x1: number, y1: number) {
		return this.input('touchscreen', 'swipe', x0 + '', y0 + '', x1 + '', y1 + '');
	}

	//draganddrop
	//press
	//roll

	public motionEvent(type: 'DOWN' | 'MOVE' | 'UP', x: number, y: number) {
		/*type = <'DOWN' | 'MOVE' | 'UP'>type.replace(/[a-z]/g, (char) => {
			return String.fromCharCode(char.charCodeAt(0) & ~32);
		});*/
		if (type === 'DOWN' || type === 'MOVE' || type === 'UP') {
			this.motionLock = type !== 'UP';
			return this.input('touchscreen', 'motionevent', type, x + '', y + '');
		}
		return Promise.reject(new Error(`Type error: type wants "DOWN", "MOVE" or "UP" but given "${type}"`));
	}

	public keyevents: { [key in ADB_KEY_EVENTS]: () => Promise<Deno.ProcessStatus> } = {
		HOME: () => {
			return this.keyevent('KEYCODE_HOME');
		},
		APP_SWITCH: () => {
			return this.keyevent('KEYCODE_APP_SWITCH');
		},
		SWITCH: () => {
			return this.keyevent('KEYCODE_APP_SWITCH');
		},
		BACK: () => {
			return this.keyevent('KEYCODE_BACK');
		},
		MENU: () => {
			return this.keyevent('KEYCODE_MENU');
		},
		SEARCH: () => {
			return this.keyevent('KEYCODE_SEARCH');
		},
		CAMERA: () => {
			return this.keyevent('KEYCODE_CAMERA');
		},
		POWER: () => {
			return this.keyevent('KEYCODE_POWER');
		},
		SLEEP: () => {
			return this.keyevent('KEYCODE_SLEEP');
		},
		WAKEUP: () => {
			return this.keyevent('KEYCODE_WAKEUP');
		},
	};
}
