export class Ground {
    constructor(scene, position, scaling) {
        this.scene = scene;
        this.position = position;
        this.scaling = scaling;
        this.mesh = {};
        this.loadGround();
    }

    loadGround() {
        let groundTask = this.scene.assetsManager.addMeshTask(
            "groundTask",
            "",
            "assets/ground/",
            "SmallHouse.glb",
        );

        let i = 0;
        groundTask.onSuccess = function(task) {
            task.loadedMeshes[0].name = "ground";
            task.loadedMeshes.forEach(element => {
                if (element.id.includes("Floor") || element.id.includes("Bridge") || element.id.includes("Grass") || element.id.includes("Ground")) {
                    element.showBoundingBox = true;
                }
                element.checkCollisions = true;
                //element.showBoundingBox = true;
                //element.name = element.id;
                element.name = "ground" + i;
                console.log(element.id);
            });

            let ground = task.loadedMeshes[0];
            // ground.position = this.position;
            ground.scaling = new BABYLON.Vector3(2, 2, 2);
            // ground.checkCollisions = true;
            ground.showBoundingBox = true;
            ground.receiveShadows = true;

            ground.physicsImpostor = new BABYLON.PhysicsImpostor(
                ground,
                BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 },
                this.scene
            );

            this.mesh = ground;
            this.mesh.actionManager = new BABYLON.ActionManager(this.scene);
            this.mesh.Ground = this;
            //this.handleCollision();
        }
    }

    handleCollision() {
        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnIntersectionEnterTrigger,
                function(evt) {
                    console.log("collision");
                }
            )
        );
    }
}