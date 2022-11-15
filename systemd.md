# systemd

## Generate remoid.service

Login user & move repository dir.

Exec command.

```sh
deno task systemd
```

### Check

#### File

```sh
ls -al /etc/systemd/system/ | grep remoid
```

```
lrwxrwxrwx  1 root root   34 Nov 15 20:26 remoid.service -> /home/USER/remoid/remoid.service
```

#### Status

```sh
systemctl status remoid.service
```

### Delete

```sh
ln -s ./remoid.service /etc/systemd/system/remoid.service
```
