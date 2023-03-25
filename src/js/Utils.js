export function modifySettings(OrigineScene, OrigineDocument, OrigineWindow, canvas) {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    OrigineScene.onPointerDown = () => {
        if (!OrigineScene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    };

    OrigineDocument.addEventListener("pointerlockchange", () => {
        let element = OrigineDocument.pointerLockElement || null;
        if (element) {
            // lets create a custom attribute
            OrigineScene.alreadyLocked = true;
        } else {
            OrigineScene.alreadyLocked = false;
        }
    });
}


export function addKeyListener(scene) {
    scene.inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyDownTrigger,
            function(evt) {
                evt.sourceEvent.preventDefault();
                scene.inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
            }
        )
    );
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyUpTrigger,
            function(evt) {
                evt.sourceEvent.preventDefault();
                scene.inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
            }));
}


export function loadCrossHair(scene) {
    var crossHair = new BABYLON.Mesh.CreateBox("crossHair", .1, scene);
    crossHair.parent = scene.activeCamera;

    crossHair.position.z += 2;
    crossHair.position.y += 0.5;

    crossHair.material = new BABYLON.StandardMaterial("crossHair", scene);
    crossHair.material.diffuseTexture = new BABYLON.Texture("assets/archer/gunaims.png", scene);
    crossHair.material.diffuseTexture.hasAlpha = true;
    crossHair.isPickable = false;
}


export function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight(
        "dir0",
        new BABYLON.Vector3(-1, -1, 0),
        scene
    );
}

export function createFollowCamera(scene, target, canvas) {
    let targetName = target.name;

    // use the target name to name the camera
    let camera = new BABYLON.FollowCamera(
        targetName + "FollowCamera",
        target.position,
        scene,
        target
    );

    //camera.attachControl(target, true);
    camera.checkCollisions = true;
    camera.applyGravity = true;

    // default values
    camera.radius = 40; // how far from the object to follow
    camera.heightOffset = 14; // how high above the object to place the camera
    camera.rotationOffset = 0; // the viewing angle
    camera.cameraAcceleration = 0.01; // how fast to move
    camera.maxCameraSpeed = 1; // speed limit

    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 35;

    // specific values
    switch (target.name) {
        case "archer":
            camera.rotationOffset = 180; // the viewing angle
            break;
    }

    return camera;
}

export function createArcCamera(scene, target, canvas) {
    var camera1 = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 10, target.position, scene);
    //target.position
    scene.activeCamera = camera1;
    scene.activeCamera.attachControl(canvas, true);
    camera1.lowerRadiusLimit = 10;
    camera1.upperRadiusLimit = 35;
    camera1.wheelDeltaPercentage = 0.01;
    camera1.checkCollisions = true;

    camera1.setPosition(new BABYLON.Vector3(0, 21, 20));

    return camera1;
}


export function createFreeCamera(scene, initialPosition, canvas) {
    let camera = new BABYLON.FreeCamera("freeCamera", initialPosition, scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true;
    // avoid flying with the camera
    camera.applyGravity = false;

    // Make it small as we're going to put in on top of the Dude
    camera.ellipsoid = new BABYLON.Vector3(.1, .1, .1); // very small ellipsoid/sphere 
    camera.ellipsoidOffset.y = 4;
    // Add extra keys for camera movements
    // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
    camera.keysUp.push("z".charCodeAt(0));
    camera.keysDown.push("s".charCodeAt(0));
    camera.keysLeft.push("q".charCodeAt(0));
    camera.keysRight.push("d".charCodeAt(0));
    camera.keysUp.push("Z".charCodeAt(0));
    camera.keysDown.push("S".charCodeAt(0));
    camera.keysLeft.push("Q".charCodeAt(0));
    camera.keysRight.push("D".charCodeAt(0));

    return camera;
}