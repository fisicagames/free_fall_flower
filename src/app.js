var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Color4, Sound, ScenePerformancePriority, SceneLoader } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import "@babylonjs/loaders";
var State;
(function (State) {
    State[State["default"] = 0] = "default";
    State[State["START"] = 1] = "START";
    State[State["GAME"] = 2] = "GAME";
    State[State["WIN"] = 3] = "WIN";
    State[State["LOSE"] = 4] = "LOSE";
    State[State["WIN_TRANSITION"] = 5] = "WIN_TRANSITION";
})(State || (State = {}));
class App {
    constructor() {
        Object.defineProperty(this, "_canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_engine", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_musicOn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "music", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isVasePicked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_camera", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_vase", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_rectangleMenu", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_rectangleGame", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_textBlockEquation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._canvas = this._createCanvas();
        this._state = State.START;
        this._init();
    }
    _createCanvas() {
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);
        this._adjustCanvas(this._canvas);
        return this._canvas;
    }
    _adjustCanvas(canvas) {
        let screenW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let screenH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if (screenH / screenW < 1.8) {
            canvas.style.width = "56svh";
            canvas.style.height = "100svh";
        }
        else {
            canvas.style.width = "98svw";
            canvas.style.height = "94svh";
        }
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._engine = new Engine(this._canvas, true, { disableWebGL2Support: true });
            this._engine.disableVertexArrayObjects = true;
            this._engine.disableUniformBuffers = true;
            this._scene = new Scene(this._engine);
            this._scene.skipPointerMovePicking = true;
            this._scene.getAnimationRatio();
            this._scene.performancePriority = ScenePerformancePriority.BackwardCompatible;
            window.addEventListener("keydown", (ev) => {
                if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                    if (this._scene.debugLayer.isVisible()) {
                        this._scene.debugLayer.hide();
                    }
                    else {
                        this._scene.debugLayer.show();
                    }
                }
            });
            yield this._main();
        });
    }
    _main() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._startGame();
            let time = 0;
            let height = 0;
            this._engine.runRenderLoop(() => {
                this._scene.render();
                switch (this._state) {
                    case State.START:
                        this._restartScene();
                        time = 0;
                        height = 0;
                        this._textBlockEquation.text = `For ${time.toFixed(1)} s, the vase fall ${height.toFixed(1)} m`;
                        break;
                    case State.GAME:
                        if (height < 4.99 && this._isVasePicked === false) {
                            this._vase.position.y = 5 - height;
                            this._camera.setTarget(new Vector3(0, 4 - height / 2, 0));
                            this._textBlockEquation.text = `For ${time.toFixed(1)} s, the vase fall ${height.toFixed(1)} m`;
                            time += this._engine.getDeltaTime() / 1000;
                            time = Number(time.toFixed(2));
                            height = (9.8 * Math.pow(time, 2)) / 2;
                        }
                        else if (this._isVasePicked === false) {
                            height = 5;
                            time = Math.sqrt(2 * height / 9.8);
                            this._textBlockEquation.text = `For ${time.toFixed(1)} s, the vase fall ${height.toFixed(1)} m`;
                            this._vase.rotate(Vector3.Backward(), Math.PI / 2);
                            this._vase.position.y = 0;
                            this._state = State.LOSE;
                        }
                        break;
                    case State.WIN:
                        this._rectangleGame.isVisible = true;
                    case State.LOSE:
                        this._rectangleGame.isVisible = true;
                        break;
                    default:
                        break;
                }
            });
            window.addEventListener('resize', () => {
                this._engine.resize();
            });
        });
    }
    _startGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this._engine.displayLoadingUI();
            this._scene = yield this._createScene(this._engine);
            yield this._loadGUI(this._scene);
            yield this._loadModels(this._scene);
            yield this._scene.whenReadyAsync();
            let root;
            root = this._scene.getMeshByName("__root__");
            root.rotation = new Vector3(0, 0, 0);
            this._scene.onPointerDown = () => {
                if (this._state === State.GAME) {
                    if (this._isVasePicked === false) {
                        this._isVasePicked = true;
                    }
                    this._state = State.WIN_TRANSITION;
                    setInterval(() => {
                        if (this._state === State.WIN_TRANSITION) {
                            this._state = State.WIN;
                        }
                    }, 1500);
                }
            };
            this._engine.hideLoadingUI();
            this._vase = this._scene.getTransformNodeByName("vaso");
        });
    }
    _createScene(engine) {
        return __awaiter(this, void 0, void 0, function* () {
            let scene = new Scene(engine);
            scene.clearColor = Color4.FromHexString("#096FBD");
            this._camera = new ArcRotateCamera("Camera", 0, 0, 10, new Vector3(0, 0, 0), scene);
            this._camera.position = new Vector3(3, 4, -12);
            this._camera.setTarget(new Vector3(0, 4, 0));
            var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
            light1.direction = new Vector3(-1, -1, -1);
            light1.intensity = 1.1;
            scene.imageProcessingConfiguration.contrast = 1.5;
            let soundReady = () => {
                this._musicOn = true;
                if (document.visibilityState === "visible" && this._musicOn) {
                    this.music.play();
                }
                document.addEventListener("visibilitychange", () => {
                    if (document.visibilityState === "visible" && this._musicOn) {
                        if (!this.music.isPlaying)
                            this.music.play();
                    }
                    else {
                        this.music.pause();
                    }
                });
            };
            this.music = new Sound("music", "./assets/sounds/catch-it-117676_comp.mp3", scene, soundReady, {
                volume: 0.3,
                loop: true,
                autoplay: false,
            });
            return scene;
        });
    }
    _loadGUI(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
            const loadedGUI = yield advancedTexture.parseFromURLAsync("./assets/gui/guiTexture.json");
            this._textBlockEquation =
                advancedTexture.getControlByName("TextBlockEquation");
            this._rectangleMenu =
                advancedTexture.getControlByName("RectangleMenu");
            this._rectangleGame =
                advancedTexture.getControlByName("RectangleGame");
            const buttonMenu = advancedTexture.getControlByName("ButtonMenu");
            buttonMenu.onPointerUpObservable.add(() => {
                this._rectangleMenu.isVisible = true;
                this._restartScene();
                this._state = State.default;
            });
            const buttonMenuStart = advancedTexture.getControlByName("ButtonMenuStart");
            buttonMenuStart.onPointerUpObservable.add(() => {
                this._rectangleMenu.isVisible = false;
                this._state = State.START;
                setTimeout(() => {
                    this._state = State.GAME;
                }, 2000);
            });
            const textblockMenuMusic = advancedTexture.getControlByName("TextblockMenuMusic");
            textblockMenuMusic.onPointerUpObservable.add(() => {
                this.music = scene.getSoundByName('music');
                if (this.music.isPlaying) {
                    this.music.stop();
                    this._musicOn = false;
                    textblockMenuMusic.text = "music: off";
                }
                else {
                    this.music.play();
                    this._musicOn = true;
                    textblockMenuMusic.text = "music: on";
                }
            });
        });
    }
    _loadModels(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            SceneLoader.AppendAsync("./assets/models/", "buildingScene.gltf", scene);
        });
    }
    _restartScene() {
        this._rectangleGame.isVisible = false;
        this._vase.position.y = 5;
        this._vase.rotation = Vector3.Zero();
        this._isVasePicked = false;
        this._camera.position = new Vector3(3, 4, -12);
        this._camera.setTarget(new Vector3(0, 4, 0));
        this._state = State.default;
    }
    ;
}
new App();
