export interface RemoidWebSocketOnOpenEvent {
	webSocket: WebSocket;
	event: Event;
}
export interface RemoidWebSocketOnMessageEvent<T> {
	webSocket: WebSocket;
	event: MessageEvent<T>;
	data?: RemoteWebsocketEventData;
}
export interface RemoidWebSocketOnErrorEvent {
	webSocket: WebSocket;
	event: Event | ErrorEvent;
}
export interface RemoidWebSocketOnCloseEvent {
	webSocket: WebSocket;
	event: CloseEvent;
}
export interface RemoidWebSocketEventCallback {
	onOpen(event: RemoidWebSocketOnOpenEvent): any;
	onMessage<T>(event: RemoidWebSocketOnMessageEvent<T>): any;
	onError(event: RemoidWebSocketOnErrorEvent): any;
	onClose(event: RemoidWebSocketOnCloseEvent): boolean;
}

export class RemoidWebSocket {
	protected url: URL;
	protected retryTime = 0;

	constructor(url: string) {
		this.url = new URL(url);
		this.url.pathname = '/remote';
		this.url.protocol = this.url.protocol === 'https' ? 'wss' : 'ws';
	}

	public setRetryTime(retryTime?: number) {
		if (!retryTime || retryTime < 0) {
			this.retryTime = 0;
		} else {
			this.retryTime = retryTime;
		}
		return this;
	}

	public connect(code: string, onEvent: RemoidWebSocketEventCallback) {
		return new Promise<void>((resolve, reject) => {
			this.url.search = `?code=${code}`;

			const socket = new WebSocket(this.url);
			socket.onopen = (event) => {
				onEvent.onOpen({ webSocket: socket, event: event });
			};
			socket.onmessage = (event) => {
				const data: RemoidWebSocketOnMessageEvent<any> = { webSocket: socket, event: event };
				try {
					data.data = <RemoteWebsocketEventData> JSON.parse(event.data);
				} catch (error) {
				}
				onEvent.onMessage(data);
			};
			socket.onerror = (event) => {
				onEvent.onError({ webSocket: socket, event: event });
			};
			socket.onclose = (event) => {
				if (!onEvent.onClose({ webSocket: socket, event: event })) {
					if (this.retryTime) {
						console.log(`Wait retry: (${this.retryTime}s)`);
						setTimeout(() => {
							console.log(`Retry: ${new Date()}`);
							this.connect(code, onEvent);
						}, this.retryTime * 1000);
					} else {
						resolve();
					}
				} else {
					resolve();
				}
			};

			return this;
		});
	}
}
