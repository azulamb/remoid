import * as Minirachne from 'https://raw.githubusercontent.com/Azulamb/minirachne/main/mod.ts';
import { Dwitter, Types } from 'https://raw.githubusercontent.com/Azulamb/dwitter/main/mod.ts';

interface User extends Types.AccessToken {
	expires: Date;
}

export class TwitterLogin implements Minirachne.Route, Minirachne.Middleware {
	private callbackURL: string;
	private dwitter: Dwitter;
	private tmpUser: { [keys: string]: Date } = {};
	private user: { [keys: string]: User } = {};
	private enableUsers: string[];
	public LIMIT_MIN = 10;
	public LOGIN_HOURS = 24;
	// Route
	public order!: number;
	public pattern!: URLPattern;
	public middlewares: Minirachne.Middlewares;

	constructor(
		server: Minirachne.Server,
		callbackURL: string,
		API_KEY: string,
		API_KEY_SECRET: string,
		enableUsers: string[],
	) {
		this.callbackURL = callbackURL;
		this.enableUsers = enableUsers;
		this.dwitter = new Dwitter(
			API_KEY,
			API_KEY_SECRET,
		);
		this.pattern = server.router.path(`/auth/(login|callback|logout|user)`);
		this.middlewares = Minirachne.Middlewares.create(this);
	}

	private setCookie(headers: Headers, name: string, value: string) {
		Minirachne.Cookie.set(headers, { name: name, value: value, sameSite: 'Lax', secure: true, path: '/' });
	}

	private deleteCookie(headers: Headers, name: string) {
		Minirachne.Cookie.delete(headers, name, { path: '/' });
	}

	public async onRequest(data: Minirachne.RequestData) {
		const headers = new Headers();
		const response = (redirect: string) => {
			return Minirachne.Redirect.SeeOther(redirect, { headers: headers });
		};

		switch (this.getPath(data.request)) {
			case 'login': {
				return this.dwitter.oauth.request_token({
					oauth_callback: this.callbackURL,
				}).then((url) => {
					const uid = new URL(url).searchParams.get('oauth_token') || '';
					const now = new Date();
					now.setMinutes(now.getMinutes() + this.LIMIT_MIN);
					this.tmpUser[uid] = now;

					this.setCookie(headers, 'login', uid);

					return response(url);
				}).catch(() => {
					return response('/');
				});
			}
			case 'callback': {
				const now = new Date();
				this.deleteCookie(headers, 'login');

				const params = new URL(data.request.url).searchParams;
				const uid = params.get('oauth_token') || '';

				const limit = this.tmpUser[uid];
				if (!limit || limit < now) {
					break;
				}
				delete this.tmpUser[uid];
				const code = params.get('oauth_verifier') || '';

				return this.dwitter.oauth.access_token({
					oauth_token: uid,
					oauth_verifier: code,
				}).then((result) => {
					const uid = result.oauth_token;

					if (this.enableUsers.includes(uid.split('-')[0])) {
						throw Minirachne.HTTPErrors.client.Unauthorized();
					}
					const expires = new Date();
					expires.setHours(expires.getHours() + this.LOGIN_HOURS);

					this.user[uid] = Object.assign({
						expires: expires,
					}, result);

					this.setCookie(headers, 'logined', uid);

					return response('/');
				}).catch(() => {
					return response('/');
				});
			}
			case 'logout': {
				this.deleteCookie(headers, 'login');
				this.deleteCookie(headers, 'logined');
				break;
			}
			case 'user': {
				headers.set('Content-Type', 'application/json');
				const user = Object.assign({}, data.detail.user);
				delete user.oauth_token;
				delete user.oauth_token_secret;
				return new Response(JSON.stringify(user), {
					headers: headers,
				});
			}
		}

		return response('/');
	}

	// Middleware
	handle(data: Minirachne.RequestData): Promise<unknown> {
		const path = this.getPath(data.request) || '';
		const user = this.getUser(data.request);
		const skip = ['login', 'callback'];
		if (skip.indexOf(path) < 0 && !user) {
			return Promise.reject(new Error('Login Error.'));
		}
		// Add user data.
		data.detail.user = user;

		return Promise.resolve();
	}

	// Common
	protected getPath(request: Request) {
		const result = this.pattern.exec(request.url);

		return result?.pathname.groups[0];
	}

	protected getUser(request: Request): User | null {
		const now = new Date();
		const cookie = Minirachne.Cookie.get(request.headers);
		const user = this.user[cookie.logined];

		if (user && user.expires < now) {
			delete this.user[cookie.logined];
			return null;
		}

		return user || null;
	}
}
