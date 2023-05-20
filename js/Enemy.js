import { getGroundHeightFromMesh } from './Utils.js';

export class Enemy {
    constructor(scene, mesh, game, speed = .1) {
        this.scene = scene;
        this.game = game;
        this.mesh = BABYLON.MeshBuilder.CreateBox("enemy", { height: 2, width: 1, depth: 1 }, this.scene);
        this.mesh.isVisible = false;
        this.canHitArcher = true;
        this.speed = speed;
        this.bounder = this.createBounder();
        this.mesh.setParent(this.bounder);
        this.kills = 0;
        this.canFire = true;
        this.fireTimeout = 1000;
        this.arrows = [];
    }

    destruct() {
        this.bounder.dispose();
        this.mesh.dispose();
    }

    createBounder() {
        let bounder = BABYLON.MeshBuilder.CreateBox("bounder", { height: 2, width: 1, depth: 1 }, this.scene);
        bounder.name = "enemyBounder";

        if (this.game.map_name === "Map 1") {
            let ground = this.scene.getMeshByName("GroundColloder");
            bounder.position = new BABYLON.Vector3(Math.random() * 100 - 50, ground.position.y, Math.random() * 60 - 30);
            bounder.position.y = getGroundHeightFromMesh(this.scene, bounder) + 3;
            bounder.position.y += 3;
        } else if (this.game.map_name === "Map 2") {
            // here we need to load enemy in the tribune, they won't move
            let tribune = this.scene.getMeshByName("Tribune_0");
            // TO-DO check position of tribune in game... after resize...
            // bounder.position = new BABYLON.Vector3(tribune.position.x, tribune.position.y, tribune.position.z);

        } else if (this.game.map_name === "Map 3") {

        }



        bounder.scaling = new BABYLON.Vector3(3, 3, 3);
        bounder.showBoundingBox = true;
        bounder.checkCollisions = true;



        return bounder;
    }

    update() {
        this.bounder.position.y = getGroundHeightFromMesh(this.scene, this.bounder) + 3;
    }

    followArcher(scene) {
        // this is use in the first map where the archer needs to avoid to be touched by the enemy

        // as move can be called even before the bbox is ready.
        if (!this.bounder) return;


        let archer = scene.getMeshByName("archer").Archer;

        let direction = archer.bounder.position.subtract(this.bounder.position);
        let distance = direction.length(); // we take the vector that is not normalized, not the dir vector

        // normalize the direction vector (convert to vector of length 1)
        let dir = direction.normalize();

        // angle between the direction vector and the z axis
        let alpha = Math.atan2(-dir.x, -dir.z);

        this.bounder.rotation.y = alpha;
        this.bounder.position.y = getGroundHeightFromMesh(this.scene, this.bounder) + 3;


        // move the enemy, if enemy touches archer, it reduces his health
        if (distance >= 2) {
            this.bounder.moveWithCollisions(
                dir.multiplyByFloats(this.speed, this.speed, this.speed)
            );
        } else {
            if (this.canHitArcher) {
                this.canHitArcher = false;
                archer.health -= 20;

                setTimeout(() => {
                    this.canHitArcher = true;
                }, 2000);
            }
        }
    }

    fireArrow() {
        if (!this.canFire) return;
        this.canFire = false;

        setTimeout(() => {
            this.canFire = true;
        }, this.fireTimeout);

        this.arrows.push(new Arrow(this.scene, null, this));
        this.arrows[this.arrows.length - 1].fire();
    }
}