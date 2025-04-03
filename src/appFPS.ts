// Free Fall Flower (c) 2024 by Rafael João Ribeiro

//See todos in the code before build:  
//1. remove imports: inspector and debugLayer before build
//2. change images paths.. in gui:  ./assets/gui/equation.png
//3. Add ./ in index.html
//4. Remove test lines //* 

// To do: Tools.CreateScreenshot(this._engine,this._camera, {width:540, height:960});

//import "@babylonjs/core/Debug/debugLayer";

//import "@babylonjs/inspector";
//import "@babylonjs/inspector";

import {
    Engine, Scene, ArcRotateCamera, Vector3,
    HemisphericLight, Color4, Sound, ScenePerformancePriority,
    SceneLoader, TransformNode, AbstractMesh
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture, TextBlock, Button,
    Rectangle
} from "@babylonjs/gui";
import "@babylonjs/loaders";


//WEB SITES REFERENCES:
//https://github.com/BabylonJS/SummerFestival/tree/master

//https://gui.babylonjs.com/#JSGZVD#30
//https://latex.codecogs.com/png.image?\huge&space;\dpi{150}{\color{white}h=\frac{g\cdot&space;t^{2}}{2}}
//https://colorhunt.co/palette/00bdaa400082fe346ef1e7b6
//https://color.adobe.com/pt/create/color-wheel

//https://pixabay.com/pt/music/otimista-catch-it-117676/



//enum for states
enum State {
    default,
    START,
    GAME,
    WIN,
    LOSE,
    WIN_IN,
    WIN_OUT,
    LOSE_IN,
    LOSE_OUT
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
    private _camera: ArcRotateCamera;
    private _level: number = 1;
    private _lastScore: number = 0;
    private _bestScore: number = 0;
    private _lang: number = 0;

    //Models
    private _vase: TransformNode;
    private _extraFloors: TransformNode[] = [];

    //GUI
    private _rectangleMenu: Rectangle;
    private _rectangleGame: Rectangle;

    private _textBlockEquation: TextBlock;
    private _textblockScoreGame: TextBlock;
    private _textblockEnd: TextBlock;
    private _textblockLevel: TextBlock;
    private _textblockMenuBest: TextBlock;

    private _buttonMenuContinuar: Button;


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

        await this._startGame();

        let time: number = 0;
        let height: number = 0;
        let score: number = 0;
        let heightMax: number;
        heightMax = Number((2.5 * (this._level + 1)).toFixed(1));
        let timeMax: number;
        timeMax = Math.sqrt(2 * heightMax / 9.8);


        // run the main render loop
        let nFrames: number = -240;
        let sumFrames: number = 0;
        let sumDropFrames: number = 0;
        this._engine.runRenderLoop(() => {

            this._scene.render();

            switch (this._state) {
                //1
                case State.START:

                    this._restartScene();
                    heightMax = Number((2.5 * (this._level + 1)).toFixed(1));
                    timeMax = Math.sqrt(2 * heightMax / 9.8);

                    time = 0;
                    height = 0;

                    if (this._lang == 0) {

                        this._textblockLevel.text = `Nível: ${this._level}     h = ${heightMax.toFixed(1).replace(".", ",")} m     t = ${timeMax.toFixed(1).replace(".", ",")} s `;

                        this._textBlockEquation.text = `Para ${time.toFixed(1).replace(".", ",")} s, a queda é de ${height.toFixed(1).replace(".", ",")} m.`;
                    }
                    else {
                        this._textblockLevel.text = `Level: ${this._level}     h = ${heightMax.toFixed(1)} m     t = ${timeMax.toFixed(1)} s `;

                        this._textBlockEquation.text = `For ${time.toFixed(1)} s, the fall is ${height.toFixed(1)} m.`;

                    }

                    break;
                //2
                case State.GAME:
                    if (height < heightMax - 0.05 && this._isVasePicked === false) {
                        this._vase.rotation = new Vector3(0.1, 0, -0.1);
                        this._vase.position.y = heightMax - height;
                        this._camera.setTarget(new Vector3(0, 2.5 * (this._level + 1) - 1 - height, 0));
                        this._camera.position = new Vector3(3, 2.5 * (this._level + 1) - 1, -12);

                        this._lang == 0 ? this._textBlockEquation.text = `Para ${time.toFixed(1).replace(".", ",")} s, a queda é de ${height.toFixed(1).replace(".", ",")} m.` : this._textBlockEquation.text = `For ${time.toFixed(1)} s, the fall is ${height.toFixed(1)} m.`

                        score = height;
                        time += this._engine.getDeltaTime() / 1000;
                        time = Number(time.toFixed(2));
                        height = (9.8 * time ** 2) / 2;


                    }
                    else if (this._isVasePicked === false) {

                        height = 2.5 * (this._level + 1);
                        time = Math.sqrt(2 * height / 9.8);

                        this._lang == 0 ? this._textBlockEquation.text = `Para ${time.toFixed(1).replace(".", ",")} s, a queda é de ${height.toFixed(1).replace(".", ",")} m.` : this._textBlockEquation.text = `For ${time.toFixed(1)} s, the fall is ${height.toFixed(1)} m.`

                        this._vase.rotate(Vector3.Backward(), Math.PI / 2)
                        this._vase.position.y = 0;
                        this._state = State.LOSE_IN;

                        setInterval(() => {
                            if (this._state === State.LOSE_IN) {
                                this._state = State.LOSE;
                            }
                        }, 1000);
                        //this._state = State.default;
                    }
                    else if (this._isVasePicked === true) {

                        if (score > this._lastScore) {
                            this._lastScore = score;
                            if (this._lastScore > this._bestScore) {
                                this._bestScore = this._lastScore;
                                this._lang == 0 ? this._textblockMenuBest.text = this._lastScore.toFixed(1).toString().replace(".", ",") : this._textblockMenuBest.text = this._lastScore.toFixed(1).toString();

                            }


                            this._state = State.WIN_IN;
                            setInterval(() => {
                                if (this._state === State.WIN_IN) {
                                    this._state = State.WIN;
                                }
                            }, 1500);
                        }
                        else {
                            this._state = State.LOSE;
                        }
                    }
                    break;
                //3
                case State.WIN:

                    this._level++;

                    if (this._lang === 0) {
                        this._textblockScoreGame.text = `Pontos: ${score.toFixed(1).replace(".", ",")} m  em ${time.toFixed(1).replace(".", ",")} s`;
                        this._textblockEnd.text = `Para passar o próximo nível, é necessário fazer uma pontuação maior que a anterior: ${this._lastScore.toFixed(1).replace(".", ",")} m.`;
                        this._buttonMenuContinuar.textBlock.text = "Próximo nível!";
                    } else {
                        this._textblockScoreGame.text = `Points: ${score.toFixed(1)} m  in ${time.toFixed(1)} s`;
                        this._textblockEnd.text = `To advance to the next level, you need to score higher than before: ${this._lastScore.toFixed(1)} m.`;
                        this._buttonMenuContinuar.textBlock.text = "Next Level!";
                    }

                    this._rectangleGame.isVisible = true;

                    this._state = State.WIN_OUT;


                    break;

                //4
                case State.LOSE:

                    if (this._lang === 0) {
                        this._textblockScoreGame.text = `Pontos: 0,0`;
                        this._textblockEnd.text = `Para passar deste nível você deveria ter feito uma pontuação maior que a anterior: ${this._lastScore.toFixed(1)} m.`;
                        this._buttonMenuContinuar.textBlock.text = "Tentar novamente!";
                    } else {
                        this._textblockScoreGame.text = `Points: 0.0`;
                        this._textblockEnd.text = `To advance from this level, you should have scored higher than before: ${this._lastScore.toFixed(1)} m.`;
                        this._buttonMenuContinuar.textBlock.text = "Try again!";
                    }


                    this._rectangleGame.isVisible = true;
                    this._state = State.LOSE_OUT;

                    break;

                default:
                    break;
            }
            nFrames += 1;
            let fpsRate = this._scene.getEngine().getFps();
            if (nFrames > 0 && nFrames <= 1000) {
                sumFrames += fpsRate;
                if (fpsRate < 30) sumDropFrames++;
                this._textBlockEquation.text = `FPS médio: ${(sumFrames/nFrames).toFixed(1).replace('.', ',')}  FPS drop: ${(sumDropFrames).toFixed(0).replace('.', ',')}/${nFrames}`;
            }
            else if(nFrames > 1000){
                this._textBlockEquation.text = `FPS médio: ${(sumFrames/1000).toFixed(1).replace('.', ',')}  FPS drop: ${(sumDropFrames).toFixed(0).replace('.', ',')}/${1000}`;
            }
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });


    }

    private async _startGame() {

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
        //this._scene.debugLayer.show();


        let root: AbstractMesh;
        root = this._scene.getMeshByName("__root__");
        root.rotation = new Vector3(0, 0, 0);

        //--PICK SIMPLES OR PICK RAY --

        this._scene.onPointerDown = () => {
            if (this._state === State.GAME) {
                if (this._isVasePicked === false) {
                    this._isVasePicked = true;
                }
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

        this._camera = new ArcRotateCamera("Camera", 0, 0, 10, new Vector3(0, 0, 0), scene);

        //* camera.attachControl(this._canvas, true);

        this._camera.position = new Vector3(3, 4, -12);

        this._camera.setTarget(new Vector3(0, 4, 0)); //targets the camera to scene origin
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        light1.direction = new Vector3(-1, -1, -1);
        light1.intensity = 1.1;
        scene.imageProcessingConfiguration.contrast = 1.5;

        //--SOUNDS--

        let soundReady = () => {
            this._musicOn = true;
            if (document.visibilityState === "visible" && this._musicOn) {
                this.music.play();
            }
            document.addEventListener("visibilitychange", () => {
                //https://forum.babylonjs.com/t/pointer-over-action-vs-lost-focus/18836/3
                if (document.visibilityState === "visible" && this._musicOn) {
                    if (!this.music.isPlaying) this.music.play();
                } else {
                    this.music.pause();
                }
            })

        }

        this.music = new Sound("music", "./assets/sounds/catch-it-117676_comp.mp3", scene, soundReady, {
            volume: 0.3,
            loop: true,
            autoplay: false,
        });

        return scene;
    }

    private async _loadGUI(scene: Scene): Promise<void> {




        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
        const loadedGUI = await advancedTexture.parseFromURLAsync("./assets/gui/guiTexture.json");

        this._textBlockEquation = advancedTexture.getControlByName("TextBlockEquation") as TextBlock;

        this._textblockScoreGame = advancedTexture.getControlByName("TextblockScoreGame") as TextBlock;

        this._textblockEnd = advancedTexture.getControlByName("TextblockEnd") as TextBlock;

        this._textblockLevel = advancedTexture.getControlByName("TextblockLevel") as TextBlock;

        this._textblockMenuBest = advancedTexture.getControlByName("TextblockMenuBest") as TextBlock;

        this._rectangleMenu = advancedTexture.getControlByName("RectangleMenu") as Rectangle;

        this._rectangleGame = advancedTexture.getControlByName("RectangleGame") as Rectangle;

        const buttonMenu: Button = advancedTexture.getControlByName("ButtonMenu") as Button;

        const buttonLang: Button = advancedTexture.getControlByName("ButtonLang") as Button;
        
        //Feature added on 2024-12-13: Automatically set the language based on the browser's settings.
        const browserLanguage = navigator.language || "en";
        if (!browserLanguage.startsWith("pt")) {
            this._lang == 1 ? this._lang = 0 : this._lang = 1;
            this._changeLanguage(this._lang, advancedTexture);
            this._lang == 0 ? this._textblockMenuBest.text = this._textblockMenuBest.text.replace(".", ",") : this._textblockMenuBest.text = this._textblockMenuBest.text.replace(",", ".");
        }
        //
        
        buttonLang.onPointerUpObservable.add(() => {

            this._lang == 1 ? this._lang = 0 : this._lang = 1;
            this._changeLanguage(this._lang, advancedTexture);

            this._lang == 0 ? this._textblockMenuBest.text = this._textblockMenuBest.text.replace(".", ",") : this._textblockMenuBest.text = this._textblockMenuBest.text.replace(",", ".");


        });

        const textblockMenuLink: TextBlock = advancedTexture.getControlByName("TextblockMenuLink") as TextBlock;
        textblockMenuLink.onPointerUpObservable.add(()=> {
            //window.open("https://fisicagames.com.br")
            location.href = "https://fisicagames.com.br";

        });




        buttonMenu.onPointerUpObservable.add(() => {

            this._rectangleMenu.isVisible = true;
            this._level = 1;
            this._lastScore = 0;

            for (let i = 0; i < this._extraFloors.length; i++) {
                if (this._extraFloors[i].name.startsWith("Clone")) {
                    this._extraFloors[i].dispose();
                }
            }

            this._restartScene();

            this._state = State.default;

        });

        this._buttonMenuContinuar = advancedTexture.getControlByName("ButtonMenuContinuar") as Button;
        this._buttonMenuContinuar.onPointerUpObservable.add(() => {

            if (this._state === State.WIN_OUT) {

                let newFloor: TransformNode;

                newFloor = this._scene.getTransformNodeByName("building1").instantiateHierarchy();

                newFloor.position.y += ((this._level - 1) * 2.5);

                this._extraFloors.push(newFloor);


                this._state = State.START;
                setTimeout(() => {
                    this._state = State.GAME;
                }, 2000);

            }
            else if (this._state === State.LOSE_OUT) {
                this._rectangleMenu.isVisible = true;
                this._level = 1;
                this._lastScore = 0;

                for (let i = 0; i < this._extraFloors.length; i++) {
                    if (this._extraFloors[i].name.startsWith("Clone")) {
                        this._extraFloors[i].dispose();
                    }
                }

                this._restartScene();

                this._state = State.default;

            }


        });


        const buttonMenuStart: Button =
            advancedTexture.getControlByName("ButtonMenuStart") as Button;

        buttonMenuStart.onPointerUpObservable.add(() => {
            this._rectangleMenu.isVisible = false;
            this._state = State.START;
            setTimeout(() => {
                this._state = State.GAME;
            }, 2000);
        });

        const textblockMenuMusic: TextBlock =
            advancedTexture.getControlByName("TextblockMenuMusic") as TextBlock;

        textblockMenuMusic.onPointerUpObservable.add(() => {

            this.music = scene.getSoundByName('music');

            if (this.music.isPlaying) {
                this.music.stop();
                this._musicOn = false;
                textblockMenuMusic.text = "🔈";
            }
            else {
                this.music.play();
                this._musicOn = true;
                textblockMenuMusic.text = "🔊";
            }
        });
    }

    private async _loadModels(scene: Scene) {


        SceneLoader.AppendAsync("./assets/models/", "buildingScene.gltf", scene);

    }

    private _restartScene() {


        this._rectangleGame.isVisible = false;

        this._vase.position.y = 2.5 * (this._level + 1);
        this._vase.rotation = Vector3.Zero();
        this._isVasePicked = false;
        this._camera.position = new Vector3(3, 2.5 * (this._level + 1) - 1, -12);
        this._camera.setTarget(new Vector3(0, 2.5 * (this._level + 1) - 1, 0)); //targets the camera to scene origin


        this._state = State.default;



    };

    private _strings: Record<string, string[]> = {
        TextBlockHeigh: ["Equação da queda livre:", "Free fall equation:"],
        TextblockObjetivo: ["Ganhe mais pontos pegando o vaso mais próximo do chão!", "Earn more points by catching the vase closest to the ground!"],
        ButtonMenuStart: ["Iniciar", "Start"],
        TextblockMenuScore: ["Maior pontuação:", "High Score:"],
        TextBlockValueOfG: ["Na superfície da Terra: g = 9,8 m/s².", "On the surface of the Earth: g = 9.8 m/s²."],
        TextblockLevel: ["Nível: 1     h = 5,0 m     t = 1,0 s", "Level: 1     h = 5.0 m     t = 1.0 s"],
        TextblockMeta: ["Objetivo: Pegue o vaso que cai da janela antes que ele quebre no chão.", "Objective: Catch the vase falling from the window before it breaks on the ground."],
        TextBlockEquation: ["Para 0,0 s, a queda é de 0,0 m.", "For 0.0 s, the fall is 0.0 m."],
        TextblockEnd: ["Para passar de nível é necessário fazer uma pontuação maior que a anteior: 0 m.", "To advance to the next level, you need to score higher than the previous: 0 m."],
        TextblockScoreGame: ["Pontos: 0 m", "Points: 0 m"],
        ButtonMenuContinuar: ["Próximo nível", "Next Level"],
        ButtonLang: ["ENGLISH", "PORTUGUÊS"]
    };


    private _changeLanguage(lang: number, advancedTexture: AdvancedDynamicTexture) {
        
        for (const key in this._strings) {
            if (this._strings.hasOwnProperty(key)) {
                const translations = this._strings[key];
                if (key.startsWith(`Tex`)) {
                    const textBlock = advancedTexture.getControlByName(key) as TextBlock;
                    textBlock.text = translations[lang];
                }
                else {
                    const textBlock = advancedTexture.getControlByName(key) as Button;
                    textBlock.textBlock.text = translations[lang];
                }

            }
        }
    }


}
new App();