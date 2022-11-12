/// <reference path="../types.d.ts" />
import * as Minirachne from 'https://raw.githubusercontent.com/Azulamb/minirachne/main/mod.ts';
import { RemoteWebSocket } from './remote.ts';

export class ClientWebSocket extends Minirachne.WebSocketListener implements Minirachne.RouteLike {
	protected server!: Minirachne.Server;
	protected remote: RemoteWebSocket;
	protected socket: WebSocket | null = null;
	protected sendCaptureMode = true;

	constructor(server: Minirachne.Server, remote: RemoteWebSocket) {
		super();
		this.server = server;
		this.remote = remote.setClient(this);
	}

	// RouteLike

	public async onRequest(data: Minirachne.RequestData) {
		const url = new URL(data.request.url);
		console.log(url);
		return this.server.upgradeWebSocket(data, this);
	}

	// WebSocketListener

	public onOpen(ws: WebSocket, event: Event) {
		this.socket = ws;
	}

	public onMessage(ws: WebSocket, event: MessageEvent) {
		if (!event.data) {
			return;
		}
		try {
			const data = <RemoteWebsocketEventData> JSON.parse(event.data);
			switch (data.type) {
				case 'capture':
					return this.remote.requireCapture();
				case 'button':
					if (typeof data.button !== 'string') {
						throw new Error('type: button, need button<string> value.');
					}
					return this.remote.button(data.button);
				case 'tap':
					if (typeof data.x !== 'number') {
						throw new Error('type: tap, need x<number>.');
					}
					if (typeof data.y !== 'number') {
						throw new Error('type: tap, need y<number>.');
					}
					return this.remote.tap(data.x, data.y);
				case 'swipe':
					if (typeof data.x0 !== 'number') {
						throw new Error('type: tap, need x<number>.');
					}
					if (typeof data.y0 !== 'number') {
						throw new Error('type: tap, need y<number>.');
					}
					if (typeof data.x1 !== 'number') {
						throw new Error('type: tap, need x<number>.');
					}
					if (typeof data.y1 !== 'number') {
						throw new Error('type: tap, need y<number>.');
					}
					return this.remote.swipe(data.x0, data.y0, data.x1, data.y1);
				case 'motion':
					if (typeof data.mode !== 'string') {
						throw new Error('type: motion, need mode<"DOWN"|"MOVE"|"UP">.');
					}
					if (typeof data.x !== 'number') {
						throw new Error('type: motion, need x<number>.');
					}
					if (typeof data.y !== 'number') {
						throw new Error('type: motion, need y<number>.');
					}
					return this.remote.motion(data.mode, data.x, data.y);
				case 'drag':
					return this.remote.drag(data.positions);
				case 'config':
					return this.remote.setConfig(data.config);
			}
		} catch (error) {
			console.error(error);
		}
	}

	public onClose(ws: WebSocket, event: CloseEvent) {
		this.socket = null;
		console.log(`Close WebSocket[client]:`);
	}

	public onError(ws: WebSocket, event: Event | ErrorEvent) {
		this.socket = null;
		console.log(`Error WebSocket[client]:`);
	}

	// Remoid Client event.
	public onGetCapture() {
		if (!this.socket) {
			return;
		}
		const img = this.remote.getCapture();
		if (!img) {
			return;
		}
		if (this.sendCaptureMode) {
			this.socket.send(img);
		} else {
			const data: RemoidCapture = {
				type: 'capture',
			};
			this.socket.send(JSON.stringify(data));
		}
	}

	public onSendConfig(config: RemoidConfigData) {
		if (!this.socket) {
			return;
		}
		const data: RemoidConfig = {
			type: 'config',
			config: config,
		};
		this.socket.send(JSON.stringify(data));
	}
}
