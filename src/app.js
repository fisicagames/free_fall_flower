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
    State[State["START"] = 0] = "START";
    State[State["GAME"] = 1] = "GAME";
    State[State["LOSE"] = 2] = "LOSE";
    State[State["WIN"] = 3] = "WIN";
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
        Object.defineProperty(this, "_vase", {
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
            yield this._goToStart();
            let time = 0;
            this._engine.runRenderLoop(() => {
                this._scene.render();
                switch (this._state) {
                    case State.START:
                        break;
                    case State.GAME:
                        if (this._vase.position.y > 0 && this._isVasePicked == false) {
                            time += this._engine.getDeltaTime() / 1000;
                            this._vase.position.y = 5 - 9.8 / 2 * Math.pow(time, 2);
                        }
                        else if (this._isVasePicked == false) {
                            this._vase.rotate(Vector3.Backward(), Math.PI / 2);
                            this._vase.position.y = 0;
                            console.log("time: ", time);
                            this._state = State.LOSE;
                        }
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
    _goToStart() {
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
                if (this._state = State.GAME) {
                    this._isVasePicked = true;
                    this._state = State.WIN;
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
            let camera = new ArcRotateCamera("Camera", 0, 0, 10, new Vector3(0, 0, 0), scene);
            camera.position = new Vector3(3, 4, -12);
            camera.setTarget(new Vector3(0, 4, 0));
            var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
            light1.direction = new Vector3(-1, -1, -1);
            light1.intensity = 1.1;
            scene.imageProcessingConfiguration.contrast = 1.5;
            let soundReady = () => {
                this._musicOn = true;
                if (document.visibilityState == "visible" && this._musicOn) {
                    music.play();
                    music.setVolume(0.1);
                }
                document.addEventListener("visibilitychange", () => {
                    if (document.visibilityState == "visible" && this._musicOn) {
                        if (!music.isPlaying)
                            music.play();
                    }
                    else {
                        music.pause();
                    }
                });
            };
            const music = new Sound("music", "./assets/sounds/catch-it-117676_comp.mp3", scene, soundReady, {
                volume: 0.1,
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
            const rectangleMenu = advancedTexture.getControlByName("RectangleMenu");
            const buttonMenuStart = advancedTexture.getControlByName("ButtonMenuStart");
            ;
            console.log("buttonMenuStart: ", this._state);
            buttonMenuStart.onPointerUpObservable.add(() => {
                console.log("buttonMenuStart: ", this._state);
                this._state = State.GAME;
                rectangleMenu.isVisible = false;
                console.log("buttonMenuStart: ", this._state);
            });
            const textblockMenuMusic = advancedTexture.getControlByName("TextblockMenuMusic");
            textblockMenuMusic.onPointerUpObservable.add(function () {
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
}
new App();
