export class Ground {
    constructor(scene, position, scaling) {
        this.scene = scene;
        this.position = position;
        this.scaling = scaling;
        this.groundMeshes = [];
        this.mesh = {};
        this.loadGround();
    }

    loadGround() {
        let meshesGround = [];
        let mesh = {};
        let scene = this.scene;


        let groundTask = this.scene.assetsManager.addMeshTask(
            "groundTask",
            "",
            "assets/ground/",
            "SmallHouse2.glb",
        );

        let i = 0;
        groundTask.onSuccess = function(task) {
            //task.loadedMeshes[0].name = "ground";

            task.loadedMeshes.forEach(element => {
                if (element.id.includes("Ground") ||
                    element.id.includes("Stepping stone") ||
                    element.id.includes("Bridge")) {
                    element.checkCollisions = false;
                    element.showBoundingBox = true;
                    meshesGround.push(element);
                } else {
                    element.checkCollisions = true;
                }

            });

            let ground = task.loadedMeshes[0];
            // ground.position = this.position;
            ground.scaling = new BABYLON.Vector3(2.5, 2.5, 2.5);
            // ground.checkCollisions = true;
            ground.showBoundingBox = true;
            ground.receiveShadows = true;

            ground.physicsImpostor = new BABYLON.PhysicsImpostor(
                ground,
                BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 },
                scene
            );

            mesh = ground;
            mesh.actionManager = new BABYLON.ActionManager(this.scene);
            mesh.Ground = this;
        }

        this.groundMeshes = meshesGround;
        this.mesh = mesh;
        this.handleCollision();
    }

    handleCollision() {
        console.log(this.groundMeshes)
        this.groundMeshes.forEach(mesh => {
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    function(evt) {
                        console.log("collision");
                    }
                )
            );
        })
    }
}