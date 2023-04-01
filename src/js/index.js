import { Archer } from "./Archer.js";
import { Ground } from "./Ground.js";
import { Wall } from "./Wall.js";
import { Tree } from "./Tree.js";
import { modifySettings, createLights, createFollowCamera, createFreeCamera, addKeyListener, createArcCamera, loadCrossHair } from "./Utils.js";


//sebavan, pour le forum

let canvas;
let engine;
let scene;
let camera;



window.onload = startGame;
window.addEventListener("resize", () => {
    engine.resize();
});

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    // enable physics
    scene.enablePhysics();

    // modify some default settings (i.e pointer events to prevent cursor to go
    // out of the game window)
    modifySettings(scene, document, window, canvas);
    addKeyListener(scene);


    scene.toRender = () => {
        // update the scene
        let archer = scene.getMeshByName("archer");

        if (archer) {
            //archer.Archer.moveInSquarre();
            archer.Archer.move();
        }

        // if (scene.ground !== undefined) {
        //     scene.ground.handleCollision();
        // }

        scene.render();
    };
    scene.assetsManager.load();
}

function createScene() {
    let scene = new BABYLON.Scene(engine);

    scene.assetsManager = configureAssetManager(scene);
    //scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    scene.CollisionsEnabled = true;

    //createGround(scene);

    loadGround(scene);

    // create lights
    createLights(scene);
    // create camera
    //camera = createFollowCamera(scene);
    camera = createFreeCamera(scene, new BABYLON.Vector3(-10, 20, -20), canvas);
    scene.activeCamera = camera;

    createArcher(scene);
    return scene;
}

function configureAssetManager(scene) {
    // useful for storing references to assets as properties. i.e scene.assets.cannonsound, etc.
    scene.assets = {};

    let assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onProgress = function(
        remainingCount,
        totalCount,
        lastFinishedTask
    ) {
        engine.loadingUIText =
            "We are loading the scene. " +
            remainingCount +
            " out of " +
            totalCount +
            " items still need to be loaded.";
        console.log(
            "We are loading the scene. " +
            remainingCount +
            " out of " +
            totalCount +
            " items still need to be loaded."
        );
    };

    assetsManager.onFinish = function(tasks) {
        engine.runRenderLoop(function() {
            scene.toRender();

        });
    };

    return assetsManager;
}


function createArcher(scene) {
    // load the archer
    let archerTask = scene.assetsManager.addMeshTask(
        "archerTask",
        "",
        "assets/archer/",
        "ArcherComplete.glb",
    );

    archerTask.onSuccess = function(task) {
        task.loadedMeshes[0].name = "archer";
        task.loadedMeshes[0].position.y += 1;
        let archer = new Archer(task.loadedMeshes[0], 1, 0.15, 3, scene, task.loadedSkeletons);
        scene.Archer = archer;

        camera = createFollowCamera(scene, archer.bounder, canvas);
        //camera = createArcCamera(scene, archer.bounder, canvas);
        scene.activeCamera = camera;

        // load the crosshair
        loadCrossHair(scene);

    }
}

function loadGround(scene) {
    let meshesEnvironment = [];
    let meshesGround = [];
    let groundTask = scene.assetsManager.addMeshTask(
        "groundTask",
        "",
        "assets/ground/",
        "SmallHouse.glb",
    );

    let i = 0;
    groundTask.onSuccess = function(task) {
        let root = task.loadedMeshes[0];
        root.scaling = new BABYLON.Vector3(2.5, 2.5, 2.5);

        task.loadedMeshes.forEach(element => {
            element.visibility = 1;
            // console.log(element.id)

            if (element.id.includes("GroundColloder_primitive1") || element.id.includes("StairsCollider") ||
                element.id.includes("FloorCollider")) {
                element.checkCollisions = false;

            } else {
                if (element.id.includes("LanternsCollider") ||
                    element.id.includes("UnderFloorCollider") ||
                    element.id.includes("UnderStairCollider") ||
                    element.id.includes("Roof") ||
                    element.id.includes("TableCollider") ||
                    element.id.includes("BoxCollider")
                ) {
                    let wall = new Wall(scene, element);
                } else if (element.id.includes("Tree")) {
                    let tree = new Tree(scene, element);
                } else if (element.id.includes("River")) {
                    let ground = new Ground(scene, element);
                }
            }


        });

    }
}