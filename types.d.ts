type REMOID_WEBSOCKET_TYPE = 'capture' | 'button' | 'tap' | 'swipe' | 'motion' | 'drag' | 'config';

type RemoteWebsocketEventData = RemoidCapture | RemoidButton | RemoidTap | RemoidSwipe | RemoidMotion | RemoidDrag | RemoidConfig;
type ClientWebsocketEventData = RemoidCapture | RemoidConfig;

interface RemoidWebsocketEventDataBase {
	type: REMOID_WEBSOCKET_TYPE;
}

interface RemoidCapture extends RemoidWebsocketEventDataBase {
	type: 'capture';
}

interface RemoidButton extends RemoidWebsocketEventDataBase {
	type: 'button';
	button: string;
}

interface RemoidTap extends RemoidWebsocketEventDataBase {
	type: 'tap';
	x: number;
	y: number;
}

interface RemoidSwipe extends RemoidWebsocketEventDataBase {
	type: 'swipe';
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

interface RemoidMotion extends RemoidWebsocketEventDataBase {
	type: 'motion';
	mode: 'DOWN' | 'MOVE' | 'UP';
	x: number;
	y: number;
}

interface RemoidDrag extends RemoidWebsocketEventDataBase {
	type: 'drag';
	positions: number[];
}

interface RemoidConfigData {
	reducing: number;
}

interface RemoidConfig extends RemoidWebsocketEventDataBase {
	type: 'config';
	config?: RemoidConfigData;
}