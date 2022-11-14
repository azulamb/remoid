/// <reference path="../types.d.ts" />

import { createCanvas, loadImage } from 'https://deno.land/x/canvas/mod.ts';
import { Config } from './config.ts';
import { ADB, ADB_KEY_EVENTS } from './adb.ts';
import { RemoidWebSocket, RemoidWebSocketEventCallback } from './ws.ts';
import * as WS from './ws.ts';

class App implements RemoidWebSocketEventCallback {
	protected socket: WebSocket | null = null;
	protected adb: ADB;
	protected timer = 0;
	protected captureTime = 0;
	protected latest = 0;
	protected waitTime = 1000;
	protected waitTimer = 0;
	protected config: RemoidConfigData = {
		reducing: 2,
	};

	constructor(adb: ADB) {
		this.adb = adb;
	}

	public setCaptureTime(time?: number) {
		if (!time || time < 0) {
			this.captureTime = 0;
		} else {
			this.captureTime = time * 1000;
		}

		return this;
	}

	public autoCapture() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = 0;
		}
		this.timer = setInterval(() => {
			const now = Date.now();
			if (now - this.latest < this.captureTime) {
				return;
			}
			this.capture();
		}, 1000);
		return this;
	}

	protected waitCapture() {
		if (this.waitTimer) {
			clearTimeout(this.waitTimer);
		}
		this.waitTimer = setTimeout(() => {
			this.capture();
			this.waitTimer = 0;
		}, this.waitTime);
	}

	protected async sendCapture() {
		if (!this.socket) {
			return Promise.reject(new Error('Not connected.'));
		}
		await new Promise((resolve) => {
			setTimeout(resolve, 500);
		});
		const latest = this.latest;
		try {
			this.latest = Date.now();
			const filepath = await this.adb.capture();
			const image = await loadImage(filepath);
			const w = Math.floor(image.width() / this.config.reducing);
			const h = Math.floor(image.height() / this.config.reducing);
			const canvas = createCanvas(w, h);
			const context = canvas.getContext('2d');
			context.drawImage(image, 0, 0, image.width(), image.height(), 0, 0, w, h);
			const binary = canvas.toBuffer();
			//const binary = await Deno.readFile(filepath);
			this.socket.send(binary);
			this.latest = Date.now();
		} catch (error) {
			this.latest = latest;
			console.error(error);
		}
	}

	protected async sendConfig() {
		if (!this.socket) {
			return Promise.reject(new Error('Not connected.'));
		}
		const data: RemoidConfig = {
			'type': 'config',
			config: this.config,
		};
		this.socket.send(JSON.stringify(data));
	}

	public onOpen(event: WS.RemoidWebSocketOnOpenEvent) {
		console.log('Connect:');
		this.socket = event.webSocket;
		this.capture();
	}

	public onMessage<T>(event: WS.RemoidWebSocketOnMessageEvent<T>) {
		const data = event.data;
		if (!data) {
			return;
		}
		this.parseMessage(data).catch((error) => {
			console.error(error);
		});
	}

	public onError(event: WS.RemoidWebSocketOnErrorEvent) {
		console.error(event.event);
	}

	public onClose(event: WS.RemoidWebSocketOnCloseEvent) {
		console.log('Close:');
		this.socket = null;
		return false;
	}

	protected parseMessage(data: RemoteWebsocketEventData) {
		switch (data.type) {
			case 'capture':
				return this.capture();
			case 'button':
				return this.button(data);
			case 'tap':
				return this.tap(data);
			case 'swipe':
				return this.swipe(data);
			case 'motion':
				return this.motion(data);
			case 'drag':
				return this.drag(data);
			case 'config':
				return this.setConfig(data);
		}
		return Promise.reject(new Error('Unknown type.'));
	}

	protected capture() {
		return this.sendCapture().then(() => {
		}).catch((error) => {
			console.error(error);
		});
	}

	protected setConfig(data: RemoidConfig) {
		if (data.config) {
			if (typeof data.config.reducing === 'number') {
				const reducing = Math.floor(data.config.reducing);
				if (0 < reducing) {
					this.config.reducing = reducing;
				}
			}
		}

		return this.sendConfig();
	}

	protected button(data: RemoidButton) {
		if (!this.adb.keyevents[<ADB_KEY_EVENTS> data.button]) {
			return Promise.reject(new Error(`Unknown Button: ${data.button}`)); // TODO:
		}
		return this.adb.keyevents[<ADB_KEY_EVENTS> data.button]().finally(() => {
			this.waitCapture();
		});
	}

	protected tap(data: RemoidTap) {
		return this.adb.tap(this.calcPosition(data.x), this.calcPosition(data.y)).finally(() => {
			this.waitCapture();
		});
	}

	protected swipe(data: RemoidSwipe) {
		return this.adb.swipe(this.calcPosition(data.x0), this.calcPosition(data.y0), this.calcPosition(data.x1), this.calcPosition(data.y1)).finally(() => {
			this.waitCapture();
		});
	}

	protected motion(data: RemoidMotion) {
		return this.adb.motionEvent(data.mode, this.calcPosition(data.x), this.calcPosition(data.y)).finally(() => {
			this.waitCapture();
		});
	}

	protected async drag(data: RemoidDrag) {
		if (data.positions.length % 2) {
			data.positions.pop();
		}
		if (data.positions.length < 4) {
			return Promise.reject(new Error('Too few position '));
		}

		await this.adb.motionEvent('DOWN', this.calcPosition(<number> data.positions.shift()), this.calcPosition(<number> data.positions.shift()));

		const [endY, endX] = [<number> data.positions.pop(), <number> data.positions.pop()];

		while (0 < data.positions.length) {
			await this.adb.motionEvent('MOVE', this.calcPosition(<number> data.positions.shift()), this.calcPosition(<number> data.positions.shift()));
		}

		return this.adb.motionEvent('UP', endX, endY).finally(() => {
			this.waitCapture();
		});
	}

	protected calcPosition(value: number) {
		return value * this.config.reducing;
	}
}

const config = await new Config().loadFromJSONFile('./config.json');
const adb = new ADB({
	adb: config.getADB(),
});
//await adb.prepare();
//await adb.keyevents.WAKEUP();
//await adb.capture();
//await adb.getevent();
//await adb.getprop();

const app = new App(adb);
app.setCaptureTime(30).autoCapture();

const ws = new RemoidWebSocket(config.getURL());
ws.setRetryTime(60).connect(config.getAuthCode(), app);
