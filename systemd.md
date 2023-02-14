# systemd

## Install

+ Generate
+ Add symbolic link
  * `ln -s ./remoid.service /etc/systemd/system/remoid.service`
+ Start

## Update

+ Generate
+ Reload
  * `systemctl daemon-reload`
+ Start

## Generate

Login user & move repository dir.

Exec command.

```sh
deno task systemd
```

### Add symbolic link

```sh
ln -s ./remoid.service /etc/systemd/system/remoid.service
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
systemctl daemon-reload
systemctl status remoid.service
```

#### Start

```sh
systemctl daemon-reload
systemctl start remoid.service
```

#### Stop

```sh
systemctl start remoid.service
```

### Delete symbolic link

```sh
rm /etc/systemd/system/remoid.service
systemctl daemon-reload
```
