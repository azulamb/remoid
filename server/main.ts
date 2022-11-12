/// <reference path="../types.d.ts" />

import { Config } from './config.ts';
import * as Minirachne from 'https://raw.githubusercontent.com/Azulamb/minirachne/main/mod.ts';
import { RemoteWebSocket } from './remote.ts';
import { ClientWebSocket } from './client.ts';
import { TwitterLogin } from './twitter.ts';

const config = await new Config().loadFromJSONFile('./config.json');
const server = new Minirachne.Server();

const middlewares = ((enableTwitter) => {
	if (enableTwitter) {
		const auth = new TwitterLogin(
			server,
			config.getTwitter().callback,
			config.getTwitter().api_key,
			config.getTwitter().api_key_secret,
			[config.getTwitter().user],
		);
		server.router.add(auth);
		return auth.middlewares;
	}

	const through = new (class implements Minirachne.Middleware {
		// Middleware
		handle(): Promise<unknown> {
			return Promise.resolve();
		}
	})();
	return new Minirachne.Middlewares().add(through);
})(config.enableTwitter());

server.setURL(new URL(config.getURL()));

const remote = new RemoteWebSocket(server).setAuthCode(config.getAuthCode());
server.router.add('/remote', remote);

const client = new ClientWebSocket(server, remote);
server.router.add('/client', client, middlewares);

server.router.get('/capture', (data) => {
	const capture = remote.getCapture();
	if (!capture) {
		return Promise.reject(Minirachne.HTTPErrors.client.NotFound());
	}
	const response = new Response(capture, { headers: { 'content-type': 'image/png' } });
	return Promise.resolve(response);
}, middlewares);

console.log(Minirachne.createAbsolutePath(import.meta, '../docs'));
server.router.add('/*', new Minirachne.StaticRoute(Minirachne.createAbsolutePath(import.meta, '../remoid')), middlewares);

server.router.add('/*', new Minirachne.StaticRoute(Minirachne.createAbsolutePath(import.meta, '../docs')));
server.run();
