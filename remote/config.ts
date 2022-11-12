export class Config {
	protected adb: string;
	protected url: string;
	protected authCode: string;

	constructor() {
		this.adb = '';
		this.url = '';
		this.authCode = '';
	}

	protected getFromEnv(env: string, defaultValue = '') {
		const value = Deno.env.get(env);
		return value || defaultValue;
	}

	public load(config?: {
		adb?: string;
		url?: string;
		auth_code?: string;
	}) {
		this.adb = this.getFromEnv('REMOID_ADB');
		this.url = this.getFromEnv('REMOID_URL');
		this.authCode = this.getFromEnv('REMOID_AUTH_CODE', 'REMOID_CODE');

		if (!config) {
			return this;
		}

		if (config.adb && typeof config.adb === 'string') {
			this.adb = config.adb;
		}

		if (config.url && typeof config.url === 'string') {
			this.url = config.url;
		}
		if (config.auth_code && typeof config.auth_code === 'string') {
			this.authCode = config.auth_code;
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

	public getADB() {
		return this.adb;
	}

	public getURL() {
		return this.url;
	}

	public getAuthCode() {
		return this.authCode;
	}
}
