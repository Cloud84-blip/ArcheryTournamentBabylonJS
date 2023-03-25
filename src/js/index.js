import { Archer } from "./Archer.js";
import { modifySettings, createLights, createFollowCamera, createFreeCamera, addKeyListener, createArcCamera, loadCrossHair } from "./Utils.js";

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
        scene.render();
    };
    scene.assetsManager.load();
}

function createScene() {
    let scene = new BABYLON.Scene(engine);

    scene.assetsManager = configureAssetManager(scene);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

    createGround(scene);

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
        let archer = new Archer(task.loadedMeshes[0], 1, 0.1, 3, scene, task.loadedSkeletons);
        scene.Archer = archer;

        camera = createFollowCamera(scene, archer.bounder, canvas);
        //camera = createArcCamera(scene, archer.bounder, canvas);
        scene.activeCamera = camera;

        // load the crosshair
        loadCrossHair(scene);

    }
}


function createGround(scene) {
    const groundOptions = {
        width: 2000,
        height: 2000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 100,
        onReady: onGroundCreated,
    };
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        "assets/ground/hmap2.jpg",
        groundOptions,
        scene
    );

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial(
            "groundMaterial",
            scene
        );
        groundMaterial.diffuseTexture = new BABYLON.Texture("assets/ground/ground2.jpg");
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;

        // for physic engine
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 },
            scene
        );

        console.log(ground);
    }
    return ground;
}