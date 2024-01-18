// Free Fall Flower (c) 2024 by Rafael João Ribeiro

//See todos in the code before build:  
//1. remove imports: inspector and debugLayer before build
//2. change images paths.. in gui:  ./assets/gui/equation.png
//3. Add ./ in index.html
//4. Remove test lines //* 


//import "@babylonjs/core/Debug/debugLayer";

//import "@babylonjs/inspector";

import {
    Engine, Scene, ArcRotateCamera, Vector3,
    HemisphericLight, Mesh, MeshBuilder,
    Color4, Sound, ScenePerformancePriority,
    SceneLoader, TransformNode, AbstractMesh,
    Matrix
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture, TextBlock, Button,
    Rectangle
} from "@babylonjs/gui";
import "@babylonjs/loaders";


//WEB SITES REFERENCES:
//https://github.com/BabylonJS/SummerFestival/tree/master

//https://gui.babylonjs.com/#JSGZVD#1
//https://colorhunt.co/palette/00bdaa400082fe346ef1e7b6
//https://color.adobe.com/pt/create/color-wheel

//https://pixabay.com/pt/music/otimista-catch-it-117676/



//enum for states
enum State {
    START,
    GAME,
    LOSE,
    WIN,
}

// App class is our entire game application
class App {

    // General Entire Application
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;

    //Sounds
    private _musicOn: boolean = true;
    public music: Sound;

    //Game State Related
    private _state: State;
    private _isVasePicked: boolean = false;

    //Models
    private _vase: TransformNode;


    constructor() {

        this._canvas = this._createCanvas();
        // initialize babylon scene and engine
        this._state = State.START;
        this._init();

    }

    //Set up the canvas
    private _createCanvas(): HTMLCanvasElement {

        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);
        this._adjustCanvas(this._canvas);

        return this._canvas;
    }

    private _adjustCanvas(canvas: HTMLCanvasElement) {
        let screenW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let screenH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if (screenH / screenW < 1.8) {
            canvas.style.width = "56svh";
            canvas.style.height = "100svh"
        }
        else {
            canvas.style.width = "98svw";
            canvas.style.height = "94svh"
        }
    }

    private async _init(): Promise<void> {

        this._engine = new Engine(this._canvas, true, { disableWebGL2Support: true });
        this._engine.disableVertexArrayObjects = true;
        this._engine.disableUniformBuffers = true;

        this._scene = new Scene(this._engine);

        this._scene.skipPointerMovePicking = true;
        this._scene.getAnimationRatio();
        this._scene.performancePriority = ScenePerformancePriority.BackwardCompatible;




        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });




        //MAIN render loop & state machine
        await this._main();
    }

    private async _main(): Promise<void> {

        await this._goToStart();

        let time: number = 0;

        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
            switch (this._state) {
                case State.START:
                    //this._scene.render();
                    //console.log(this._state);
                    break;

                case State.GAME:
                    //console.log("games");
                    if (this._vase.position.y > 0 && this._isVasePicked == false) {
                        time += this._engine.getDeltaTime() / 1000;
                        this._vase.position.y = 5 - 9.8 / 2 * Math.pow(time, 2);
                    }

                    else if (this._isVasePicked == false) {
                        this._vase.rotate(Vector3.Backward(), Math.PI / 2)
                        this._vase.position.y = 0;
                        console.log("time: ", time);
                        this._state = State.LOSE;

                    }
                    break;

                default:
                    break;
            }


        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });


    }

    private async _goToStart() {

        //make sure to wait for start to load
        this._engine.displayLoadingUI();

        //--CREATE SCENE--
        this._scene = await this._createScene(this._engine);

        //--GUI--
        await this._loadGUI(this._scene);

        //--IMPORTING MESH--

        await this._loadModels(this._scene);

        //--SCENE FINISHED LOADING--
        await this._scene.whenReadyAsync();

        //*
        //this._scene.debugLayer.show();


        let root: AbstractMesh;
        root = this._scene.getMeshByName("__root__");
        root.rotation = new Vector3(0, 0, 0);

        //--PICK SIMPLES OR PICK RAY --
        this._scene.onPointerDown = () => {
            if (this._state = State.GAME) {
                this._isVasePicked = true;
                this._state = State.WIN;
            }
        }


        this._engine.hideLoadingUI(); //when the scene is ready, hide loading
        //lastly set the current state to the start state and set the scene to the start scene

        //Get Main Models
        this._vase = this._scene.getTransformNodeByName("vaso");

    }

    private async _createScene(engine: Engine) {
        //--SCENE SETUP--

        //dont detect any inputs from this ui while the game is loading
        //this._scene.detachControl();

        let scene = new Scene(engine);
        scene.clearColor = Color4.FromHexString("#096FBD");

        //creates and positions a free camera

        let camera = new ArcRotateCamera("Camera", 0, 0, 10, new Vector3(0, 0, 0), scene);

        //* camera.attachControl(this._canvas, true);

        camera.position = new Vector3(3, 4, -12);

        camera.setTarget(new Vector3(0, 4, 0)); //targets the camera to scene origin
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        light1.direction = new Vector3(-1, -1, -1);
        light1.intensity = 1.1;
        scene.imageProcessingConfiguration.contrast = 1.5;

        //--SOUNDS--

        let soundReady = () => {
            this._musicOn = true;
            if (document.visibilityState == "visible" && this._musicOn) {
                music.play();
                music.setVolume(0.1);
            }
            document.addEventListener("visibilitychange", () => {
                //https://forum.babylonjs.com/t/pointer-over-action-vs-lost-focus/18836/3
                if (document.visibilityState == "visible" && this._musicOn) {
                    if (!music.isPlaying) music.play();
                } else {
                    music.pause();
                }
            })

        }

        const music = new Sound("music", "./assets/sounds/catch-it-117676_comp.mp3", scene, soundReady, {
            volume: 0.1,
            loop: true,
            autoplay: false,
        });

        return scene;
    }

    private async _loadGUI(scene: Scene): Promise<void> {

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
        const loadedGUI = await advancedTexture.parseFromURLAsync("./assets/gui/guiTexture.json");

        const rectangleMenu: Rectangle =
            advancedTexture.getControlByName("RectangleMenu") as Rectangle;

        const buttonMenuStart: Button =
            advancedTexture.getControlByName("ButtonMenuStart") as Button;;

        console.log("buttonMenuStart: ", this._state);
        buttonMenuStart.onPointerUpObservable.add(() => {
            console.log("buttonMenuStart: ", this._state);
            this._state = State.GAME;
            rectangleMenu.isVisible = false;
            console.log("buttonMenuStart: ", this._state);
        });

        const textblockMenuMusic: TextBlock =
            advancedTexture.getControlByName("TextblockMenuMusic") as TextBlock;

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
    }

    private async _loadModels(scene: Scene) {


        SceneLoader.AppendAsync("./assets/models/", "buildingScene.gltf", scene);

    }
}
new App();