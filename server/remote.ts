/// <reference path="../types.d.ts" />
import * as Minirachne from 'https://raw.githubusercontent.com/Azulamb/minirachne/main/mod.ts';
import { ClientWebSocket } from './client.ts';

export class RemoteWebSocket extends Minirachne.WebSocketListener implements Minirachne.RouteLike {
	protected server!: Minirachne.Server;
	protected client: ClientWebSocket = <any> null;
	protected socket: WebSocket | null = null;
	protected code = 'REMOID_AUTH';
	protected capture: ArrayBuffer | null = null;

	constructor(server: Minirachne.Server) {
		super();
		this.server = server;
	}

	public getCapture() {
		return this.capture;
	}

	public setAuthCode(code: string) {
		if (code) {
			this.code = code;
		}
		return this;
	}

	public setClient(client: ClientWebSocket) {
		this.client = client;
		return this;
	}

	// RouteLike

	public async onRequest(data: Minirachne.RequestData) {
		const url = new URL(data.request.url);
		console.log(url);
		if (url.searchParams.get('code') !== this.code) {
			return Promise.reject(Minirachne.HTTPErrors.client.Forbidden());
		}
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
		if (event.data instanceof ArrayBuffer) {
			// Capture image.
			this.capture = event.data;
			this.client.onGetCapture();
		} else {
			// Other event.
			try {
				const data = <ClientWebsocketEventData> JSON.parse(event.data);
				switch (data.type) {
					case 'config':
						return this.client.onSendConfig(<RemoidConfigData> data.config);
				}
			} catch (error) {
				console.error(error);
			}
		}
	}

	public onClose(ws: WebSocket, event: CloseEvent) {
		this.socket = null;
		console.log(`Close WebSocket[remote]:`);
	}

	public onError(ws: WebSocket, event: Event | ErrorEvent) {
		this.socket = null;
		console.log(`Error WebSocket[remote]:`);
	}

	// Remote
	public setConfig(config?: RemoidConfigData) {
		if (!this.socket) {
			return false;
		}
		const data: RemoidConfig = {
			type: 'config',
			config: config,
		};
		this.socket.send(JSON.stringify(data));
	}

	public requireCapture() {
		if (!this.socket) {
			return false;
		}

		const data: RemoidCapture = {
			type: 'capture',
		};
		this.socket.send(JSON.stringify(data));

		return true;
	}

	public button(button: string) {
		if (!this.socket) {
			return false;
		}

		const data: RemoidButton = {
			type: 'button',
			button: button,
		};
		this.socket.send(JSON.stringify(data));

		return true;
	}

	public tap(x: number, y: number) {
		if (!this.socket) {
			return false;
		}

		const data: RemoidTap = {
			type: 'tap',
			x: x,
			y: y,
		};
		this.socket.send(JSON.stringify(data));

		return true;
	}

	public swipe(x0: number, y0: number, x1: number, y1: number) {
		if (!this.socket) {
			return false;
		}

		const data: RemoidSwipe = {
			type: 'swipe',
			x0: x0,
			y0: y0,
			x1: x1,
			y1: y1,
		};
		this.socket.send(JSON.stringify(data));

		return true;
	}

	public motion(mode: 'DOWN' | 'MOVE' | 'UP', x: number, y: number) {
		if (!this.socket) {
			return false;
		}

		const data: RemoidMotion = {
			type: 'motion',
			mode: mode,
			x: x,
			y: y,
		};
		this.socket.send(JSON.stringify(data));

		return true;
	}

	public drag(positions: number[]) {
		if (!this.socket) {
			return false;
		}

		const data: RemoidDrag = {
			type: 'drag',
			positions: positions,
		};
		this.socket.send(JSON.stringify(data));

		return true;
	}
}
