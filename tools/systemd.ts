function exec(...command: string[]) {
	const process = Deno.run({
		cmd: command,
		stdout: 'piped',
	});
	return process.status().then(() => {
		return process.output();
	}).then((stdout) => {
		const decoder = new TextDecoder();
		return decoder.decode(stdout).replace(/\s$/g, '');
	});
}

const USER = await exec('whoami');
const DIR = await exec('pwd');
const DENO = await exec('echo', '$DENO_INSTALL');

const template = `[Unit]
Description=Remoid remote program.
Documentation=https://github.com/azulamb/remoid/blob/main/systemd.md
After=network-online.target

[Service]
Environment=PATH=${DENO}
WorkingDirectory=${DIR}
ExecStart=deno task remote
Restart=on-failure
Type=simple
User=${USER}

[Install]
WantedBy=multi-user.target
`;

await Deno.writeTextFile('remoid.service', template);

console.log(`Exec install command.
sudo ln -s ${DIR}/remoid.service /etc/systemd/system/remoid.service`);
