export class Config {
	protected url: string;
	protected authCode: string;
	protected twitter: {
		callback: string;
		api_key: string;
		api_key_secret: string;
		user: string;
	} = {
		callback: '',
		api_key: '',
		api_key_secret: '',
		user: '',
	};

	constructor() {
		this.url = '';
		this.authCode = '';
	}

	protected getFromEnv(env: string, defaultValue = '') {
		const value = Deno.env.get(env);
		return value || defaultValue;
	}

	public load(config?: {
		url?: string;
		auth_code?: string;
		twitter_callback?: string;
		twitter_api_key?: string;
		twitter_api_key_secret?: string;
		twitter_user?: string;
	}) {
		this.url = this.getFromEnv('REMOID_SERVER', 'http://localhost:8080/');
		this.authCode = this.getFromEnv('REMOID_AUTH_CODE', 'REMOID_AUTH');
		this.twitter.callback = this.getFromEnv('TWITTER_CALLBACK');
		this.twitter.api_key = this.getFromEnv('TWITTER_API_KEY');
		this.twitter.api_key_secret = this.getFromEnv('TWITTER_API_KEY_SECRET');
		this.twitter.user = this.getFromEnv('TWITTER_ENABLE_USER');

		if (!config) {
			return this;
		}

		if (config.url && typeof config.url === 'string') {
			this.url = config.url;
		}

		if (config.auth_code && typeof config.auth_code === 'string') {
			this.authCode = config.auth_code;
		}

		if (config.twitter_callback && typeof config.twitter_callback === 'string') {
			this.twitter.callback = config.twitter_callback;
		}
		if (config.twitter_api_key && typeof config.twitter_api_key === 'string') {
			this.twitter.api_key = config.twitter_api_key;
		}
		if (config.twitter_api_key_secret && typeof config.twitter_api_key_secret === 'string') {
			this.twitter.api_key_secret = config.twitter_api_key_secret;
		}
		if (config.twitter_user && typeof config.twitter_user === 'string') {
			this.twitter.user = config.twitter_user;
		}
		return this;
	}

	public async loadFromJSONFile(path: string) {
		try {
			const file = await Deno.readTextFileSync(path);
			const json = JSON.parse(file);
			if (typeof json !== 'object') {
				throw new Error(`${path} is not config.`);
			}
			return this.load(json);
		} catch (error) {
			// console.error(error);
			console.info(`Cannot load "${path}".`);
		}
		return this.load();
	}

	public getURL() {
		return this.url;
	}

	public getAuthCode() {
		return this.authCode;
	}

	public enableTwitter() {
		return this.twitter.callback && this.twitter.api_key && this.twitter.api_key_secret && this.twitter.user;
	}

	public getTwitter() {
		return this.twitter;
	}
}
