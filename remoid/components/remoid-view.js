((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    class RemoidConnection {
        view;
        socket = null;
        constructor(view) {
            this.view = view;
        }
        start(url) {
            console.log(url);
            this.socket = new WebSocket(url);
            this.socket.addEventListener('open', (event) => {
                this.onOpen(event);
            });
            this.socket.addEventListener('message', (event) => {
                this.onMessage(event);
            });
            this.socket.addEventListener('close', (event) => {
                this.onClose(event);
            });
            this.socket.addEventListener('error', (event) => {
                this.onError(event);
            });
            return this;
        }
        stop() {
            this.socket?.close();
        }
        button(key) {
            if (!this.socket) {
                return;
            }
            const data = {
                type: 'button',
                button: key,
            };
            this.socket.send(JSON.stringify(data));
        }
        tap(x, y) {
            if (!this.socket) {
                return;
            }
            const data = {
                type: 'tap',
                x: x,
                y: y,
            };
            this.socket.send(JSON.stringify(data));
        }
        motion(mode, x, y) {
            if (!this.socket) {
                return;
            }
            const data = {
                type: 'motion',
                mode: mode,
                x: x,
                y: y,
            };
            this.socket.send(JSON.stringify(data));
        }
        drag(positions) {
            if (!this.socket) {
                return;
            }
            const data = {
                type: 'drag',
                positions: positions,
            };
            this.socket.send(JSON.stringify(data));
        }
        swipe(positions) {
            if (!this.socket) {
                return;
            }
            const data = {
                type: 'swipe',
                x0: positions[0],
                y0: positions[1],
                x1: positions[positions.length - 2],
                y1: positions[positions.length - 1],
            };
            this.socket.send(JSON.stringify(data));
        }
        capture() {
            if (!this.socket) {
                return;
            }
            const data = {
                type: 'capture',
            };
            this.socket.send(JSON.stringify(data));
        }
        config(config) {
            if (!this.socket) {
                return;
            }
            const data = {
                type: 'config',
                config: config,
            };
            this.socket.send(JSON.stringify(data));
        }
        onOpen(event) {
            this.config();
        }
        onMessage(event) {
            if (event.data instanceof ArrayBuffer) {
                return this.view.setCapture(new Blob([event.data], { type: 'image/png' }));
            }
            else if (event.data instanceof Blob) {
                return this.view.setCapture(event.data);
            }
            try {
                const json = JSON.parse(event.data);
                switch (json.type) {
                    case 'capture':
                        return this.view.update();
                    case 'config':
                        return this.view.setConfig(json.config);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
        onClose(event) {
            this.socket = null;
            console.log(`Close WebSocket[client]:`);
        }
        onError(event) {
            this.socket = null;
            console.log(`Error WebSocket[client]:`);
        }
    }
    ((component, tagname = 'remoid-view') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        connect;
        canvas;
        latest;
        cacheImg = '';
        drag = { x: 0, y: 0, positions: [], start: 0 };
        uniteMotion = true;
        reducing;
        constructor() {
            super();
            this.connect = new RemoidConnection(this);
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; width: 100%; height: 100%; --footer: 1rem; }',
                ':host > div { width: 100%; height: 100%; display: grid; grid-template-rows: calc(100% - var(--footer)) var(--footer); grid-template-columns: 1fr; position: relative; }',
                ':host > div > div { display: grid; grid-template-columns: var(--footer) 1fr 1fr 1fr var(--footer); grid-template-rows: var(--footer); }',
                'canvas { display: block; width: 100%; height: 100%; object-fit: contain; }',
                'canvas:active { cursor: pointer; }',
                '#capture { position: absolute; top: 0; right: 0; width: var(--footer); height: var(--footer); }',
                'button { cursor: pointer; font-family: "Noto Sans Symbols 2", sans-serif; line-height: 1rem; }',
                'dialog.menu { bottom: var(--footer); right: 0; left: auto; margin: 0; border: none; padding: 0; }',
                'dialog.menu[open]{ display: flex; }',
                'dialog.menu button { width: var(--footer); height: var(--footer); }',
                'dialog.config { padding: 0; background: transparent; border: none; }',
                'dialog.config::backdrop { background: rgba(0, 0, 0, 0.7); }',
                'dialog.config > div { background: #fff; padding: 0.5rem; border-radius: 0.2rem; }',
                'input[type=range].invalid::-webkit-slider-runnable-track { background: #ff7777; }',
            ].join('');
            this.canvas = document.createElement('canvas');
            this.canvas.draggable = true;
            this.canvas.addEventListener('click', (event) => {
                const result = this.calcClickPosition(event);
                if (result.in) {
                    this.connect.tap(result.x, result.y);
                }
                else {
                    this.connect.capture();
                }
            });
            const transparent = document.createElement('img');
            transparent.src = 'data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7';
            this.canvas.addEventListener('dragstart', (event) => {
                if (event.dataTransfer) {
                    event.dataTransfer.setDragImage(transparent, 0, 0);
                }
            });
            this.canvas.addEventListener('dragstart', (event) => {
                const result = this.calcClickPosition(event);
                if (result.in) {
                    this.dragStart(result.x, result.y);
                }
            });
            this.canvas.addEventListener('drag', (event) => {
                const result = this.calcClickPosition(event);
                if (result.in) {
                    this.dragMove(result.x, result.y);
                }
                else {
                    this.dragEnd();
                }
            });
            this.canvas.addEventListener('dragend', (event) => {
                this.dragEnd();
            });
            const buttons = document.createElement('div');
            buttons.appendChild((() => {
                const button = document.createElement('button');
                button.textContent = '⚙';
                button.addEventListener('click', () => {
                    config.showModal();
                });
                return button;
            })());
            [
                { text: '◀', value: 'BACK' },
                { text: '●', value: 'HOME' },
                { text: '■', value: 'SWITCH' },
            ].forEach((data) => {
                const button = document.createElement('button');
                button.textContent = data.text;
                button.value = data.value;
                button.addEventListener('click', () => {
                    this.connect.button(data.value);
                });
                buttons.appendChild(button);
            });
            buttons.appendChild((() => {
                const button = document.createElement('button');
                button.textContent = '▲';
                button.addEventListener('click', () => {
                    if (menu.hasAttribute('open')) {
                        menu.close();
                    }
                    else {
                        menu.show();
                    }
                });
                return button;
            })());
            const menu = document.createElement('dialog');
            menu.classList.add('menu');
            menu.addEventListener('click', (event) => {
                event.stopPropagation();
                menu.close();
            });
            menu.appendChild((() => {
                const button = document.createElement('button');
                button.textContent = '≡';
                button.addEventListener('click', () => {
                    this.connect.button('MENU');
                });
                return button;
            })());
            menu.appendChild((() => {
                const button = document.createElement('button');
                button.textContent = '⏻';
                button.addEventListener('click', () => {
                    this.connect.button('POWER');
                });
                return button;
            })());
            const capture = document.createElement('button');
            capture.textContent = '📷';
            capture.id = 'capture';
            capture.addEventListener('click', (event) => {
                event.stopPropagation();
                this.connect.capture();
            });
            const config = document.createElement('dialog');
            config.classList.add('config');
            config.addEventListener('click', (event) => {
                event.stopPropagation();
                config.close();
            });
            config.appendChild(((parent) => {
                parent.addEventListener('click', (event) => {
                    event.stopPropagation();
                });
                const dl = document.createElement('dl');
                parent.appendChild(dl);
                dl.appendChild(((title) => {
                    title.textContent = 'Reducing';
                    return title;
                })(document.createElement('dt')));
                dl.appendChild(((dd) => {
                    const input = document.createElement('input');
                    this.reducing = input;
                    input.type = 'range';
                    input.min = `1`;
                    input.max = '16';
                    input.step = '1';
                    input.value = input.max;
                    const points = [1, 2, 4, 8, 16];
                    input.addEventListener('input', () => {
                        const value = parseInt(input.value);
                        if (points.includes(value)) {
                            input.classList.remove('invalid');
                            return;
                        }
                        input.classList.add('invalid');
                    });
                    input.addEventListener('change', () => {
                        input.classList.remove('invalid');
                        const value = parseInt(input.value);
                        if (points.includes(value)) {
                            this.changeReducing(input);
                            return;
                        }
                        const diff = points.map((v) => {
                            return {
                                value: v,
                                diff: Math.abs(v - value),
                            };
                        });
                        diff.sort((a, b) => {
                            return a.diff - b.diff;
                        });
                        input.value = diff[0].value + '';
                        this.changeReducing(input);
                    });
                    dd.appendChild(input);
                    return dd;
                })(document.createElement('dd')));
                dl.appendChild(((title) => {
                    title.textContent = 'Opacity';
                    return title;
                })(document.createElement('dt')));
                dl.appendChild(((dd) => {
                    const input = document.createElement('input');
                    input.type = 'range';
                    input.min = `0`;
                    input.max = '255';
                    input.step = '1';
                    input.value = localStorage.getItem('remoid:opacity') || input.max;
                    input.addEventListener('change', () => {
                        this.changeOpacity(parseInt(input.value));
                    });
                    dd.appendChild(input);
                    return dd;
                })(document.createElement('dd')));
                return parent;
            })(document.createElement('div')));
            const contents = document.createElement('div');
            contents.appendChild(this.canvas);
            contents.appendChild(buttons);
            contents.appendChild(capture);
            contents.appendChild(menu);
            contents.appendChild(config);
            shadow.appendChild(style);
            shadow.appendChild(contents);
            this.update();
            this.connect.start(this.clientURL());
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Delete') {
                    this.connect.stop();
                    document.body.innerHTML = '';
                }
            });
        }
        get src() {
            return this.getAttribute('src') || '/capture';
        }
        set src(value) {
            if (!value) {
                this.removeAttribute('src');
            }
            else {
                this.setAttribute('src', value);
            }
        }
        get client() {
            return this.getAttribute('client') || '/client';
        }
        set client(value) {
            if (!value) {
                this.removeAttribute('client');
            }
            else {
                this.setAttribute('client', value);
            }
        }
        changeReducing(input) {
            const value = parseInt(input.value);
            const max = parseInt(input.max);
            const reducing = Math.floor(max / value);
            this.connect.config({ reducing: reducing });
        }
        changeOpacity(opacity) {
            localStorage.setItem('remoid:opacity', opacity + '');
            this.style.opacity = `${opacity / 255}`;
            this.updateCapture(this.latest);
        }
        setConfig(config) {
            if (!config) {
                return;
            }
            this.reducing.value = `${parseInt(this.reducing.max) / config.reducing}`;
        }
        clientURL() {
            try {
                const url = new URL(this.client);
                return url;
            }
            catch (error) {
                const url = new URL(location.href);
                url.protocol = url.protocol.replace(/http/, 'ws');
                url.pathname = this.client;
                return url;
            }
        }
        createCaptureURL() {
            try {
                return new URL(this.src);
            }
            catch (error) {
                const url = new URL(location.href);
                url.pathname = this.src;
                url.search = `?${Date.now()}`;
                return url;
            }
        }
        getCapture() {
            return new Promise((resolve, reject) => {
                const img = document.createElement('img');
                img.onabort = reject;
                img.onerror = reject;
                img.onload = () => {
                    resolve(img);
                };
                img.src = this.createCaptureURL().toString();
                this.cacheImg = '';
            });
        }
        setCapture(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.onabort = reject;
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }).then((dataURL) => {
                if (this.cacheImg === dataURL) {
                    return Promise.reject(null);
                }
                this.cacheImg = dataURL;
                return new Promise((resolve, reject) => {
                    const img = document.createElement('img');
                    img.onabort = reject;
                    img.onerror = reject;
                    img.onload = () => {
                        resolve(img);
                    };
                    img.src = dataURL;
                });
            }).then((img) => {
                return this.updateCapture(img);
            }).catch((error) => {
                if (!error) {
                    return;
                }
                console.error(error);
            });
        }
        calcClickPosition(event) {
            const width = this.canvas.width;
            const height = this.canvas.height;
            const WIDTH = this.canvas.clientWidth;
            const HEIGHT = this.canvas.clientHeight;
            const _x = event.offsetX;
            const _y = event.offsetY;
            if (height / width < HEIGHT / WIDTH) {
                const scale = width / WIDTH;
                const h = (HEIGHT - WIDTH * height / width) / 2;
                const x = _x * scale;
                const y = (_y - h) * scale;
                const inArea = 0 <= x && x < width && 0 <= y && y < height;
                return { x: x, y: y, in: inArea };
            }
            else {
                const scale = height / HEIGHT;
                const w = (WIDTH - HEIGHT * width / height) / 2;
                const x = (_x - w) * scale;
                const y = _y * scale;
                const inArea = 0 <= x && x < width && 0 <= y && y < height;
                return { x: x, y: y, in: inArea };
            }
        }
        updateCapture(img) {
            this.latest = img;
            const context = this.canvas.getContext('2d');
            if (!context) {
                throw new Error('Failure getContext("2d")');
            }
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            context.drawImage(img, 0, 0);
            context.fillStyle = `rgba(255, 255, 255, ${(255 - parseInt(localStorage.getItem('remoid:opacity') || '255')) / 255})`;
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        update() {
            return this.getCapture().then((img) => {
                return this.updateCapture(img);
            });
        }
        dragStart(x, y) {
            if (!this.drag.start) {
                this.drag.positions = [];
                this.dragEnd();
            }
            this.drag.start = Date.now();
            this.drag.x = Math.floor(x);
            this.drag.y = Math.floor(y);
            this.drag.positions = [this.drag.x, this.drag.y];
            if (!this.uniteMotion) {
                this.connect.motion('DOWN', this.drag.x, this.drag.y);
            }
        }
        dragMove(x, y) {
            if (!this.drag.start) {
                return;
            }
            x = Math.floor(x);
            y = Math.floor(y);
            if (this.drag.x === x || this.drag.y === y) {
                return;
            }
            this.drag.x = x;
            this.drag.y = y;
            this.drag.positions.push(this.drag.x, this.drag.y);
            if (!this.uniteMotion) {
                this.connect.motion('MOVE', x, y);
            }
        }
        dragEnd() {
            if (!this.drag.start) {
                return;
            }
            const diffTime = Date.now() - this.drag.start;
            this.drag.start = 0;
            if (this.drag.positions.length < 4) {
                return;
            }
            if (diffTime < 500) {
                this.connect.swipe(this.drag.positions);
                return;
            }
            if (!this.uniteMotion) {
                this.connect.motion('UP', this.drag.x, this.drag.y);
            }
            else {
                this.connect.drag(this.drag.positions);
            }
        }
    }, script.dataset.tagname);
});
