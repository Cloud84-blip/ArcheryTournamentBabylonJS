export class Archer {
    constructor(archerMesh, id, speed, scaling, scene, skeletons) {
        this.archerMesh = archerMesh;
        this.skeletons = skeletons;
        this.id = id;
        this.speed = new BABYLON.Vector3(speed / 2, speed, speed);
        this.constSpeed = speed;
        this.rotationSpeed = 0.03;
        this.backwardSpeed = 0.01;
        this.scene = scene;
        this.scaling = scaling;
        this.health = 2;
        this.archerMesh.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
        this.bounder = this.createBox();
        this.archerMesh.setParent(this.bounder);
        this.archerMesh.Archer = this;

        this.animating = false;
        this.animations = {};
        scene.animationGroups.forEach((anim) => {
            this.animations[anim.name] = anim;
        });
        //this.arcAnimation = scene.getAnimationGroupByName("ARC");

        // print all animations
        scene.animationGroups.forEach((anim) => {
            console.log(anim.name);
        });

        this.setCurrentAnimation("IDLE");
        this.doAnimation(true);

    }

    createBox() {
        // create a box that will be used to bound the archer
        let box = BABYLON.MeshBuilder.CreateBox("box", { width: 0.8, height: 1, depth: 0.8 }, this.scene);
        let mat = new BABYLON.StandardMaterial("mat", this.scene);
        mat.alpha = 0.02;
        box.material = mat;

        let pos = this.archerMesh.position;
        box.position = new BABYLON.Vector3(pos.x, pos.y + this.scaling, pos.z);

        let scal = this.archerMesh.scaling;
        box.scaling = new BABYLON.Vector3(scal.x, scal.y * 2, scal.z);
        box.showBoundingBox = true;
        box.checkCollisions = true;


        return box;
    }

    getGroundHeight() {
        // create a ray that starts above the box, and goes down vertically
        // to find the ground height
        let ray = new BABYLON.Ray(
            this.bounder.position.add(new BABYLON.Vector3(0, 100, 0)),
            new BABYLON.Vector3(0, -1, 0),
            1000
        );
        let groundHeight = 0;
        let pickInfo = this.scene.pickWithRay(ray, (mesh) => {
            return mesh.name.includes("ground") || mesh.name.includes("Bridge") || mesh.name.includes("Floor");
        });
        if (pickInfo.hit) {
            groundHeight = pickInfo.pickedPoint.y;
        }
        return groundHeight;
    }

    doAnimation(looping) {
        //this.currentAnimation.stop();
        this.currentAnimation.start(looping, 1.0, this.currentAnimation.from, this.currentAnimation.to, false);
    }

    setCurrentAnimation(animation) {
        this.currentAnimation = this.scene.getAnimationGroupByName(animation);
    }

    move() {
        let scene = this.scene;

        // handle keyboard input and move the archer
        // src https://playground.babylonjs.com/#AHQEIB#17

        var keydown = false;
        if (scene.inputMap["z"] || scene.inputMap["ArrowUp"]) {
            if (scene.inputMap["s"] === undefined || !scene.inputMap["s"]) {
                this.bounder.moveWithCollisions(this.bounder.forward.scaleInPlace(-this.speed.y));
                keydown = true;
            }
        }
        if (scene.inputMap["s"] || scene.inputMap["ArrowDown"]) {
            if (scene.inputMap["z"] === undefined || !scene.inputMap["z"]) {
                this.bounder.moveWithCollisions(this.bounder.forward.scaleInPlace(this.speed.y / 2));
                keydown = true;
            }
        }
        if (scene.inputMap["q"] || scene.inputMap["ArrowLeft"]) {
            this.bounder.rotate(BABYLON.Vector3.Up(), -this.rotationSpeed);
            // run left
            // this.bounder.moveWithCollisions(this.bounder.right.scaleInPlace(this.speed.x));
            keydown = true;
        }
        if (scene.inputMap["d"] || scene.inputMap["ArrowRight"]) {
            this.bounder.rotate(BABYLON.Vector3.Up(), this.rotationSpeed);
            // this.bounder.moveWithCollisions(this.bounder.right.scaleInPlace(-this.speed.x));
            keydown = true;
        }
        if (scene.inputMap[" "]) {
            this.setCurrentAnimation("DIVE");
            this.doAnimation(false);
            keydown = true;
        }
        if (scene.inputMap["shift"]) {
            const name = this.currentAnimation.name;
            if (name === "StdWalkFwd") {
                this.setCurrentAnimation("StdRunFwd");
                this.speed = new BABYLON.Vector3(this.constSpeed * 2, this.constSpeed * 2, this.constSpeed * 2);
            } else if (name === "StdWalkBack") {
                this.speed = new BABYLON.Vector3(this.constSpeed * 1.3, this.constSpeed * 1.3, this.constSpeed * 1.3);
                this.setCurrentAnimation("StdRunBack");
            }
            this.doAnimation(false);
            keydown = true;
        }
        if (scene.inputMap["shift"] === undefined || !scene.inputMap["shift"]) {
            // if shift isn't pressed, set the speed back to normal
            // and set the animation to walking instead of running
            // this will allow the player to walk after running, and run again if forward is not released
            if (this.currentAnimation.name === "StdRunFwd") {
                this.setCurrentAnimation("StdWalkFwd");
            }
            if (this.currentAnimation.name === "StdRunBack") {
                this.setCurrentAnimation("StdWalkBack");
            }
            this.speed = new BABYLON.Vector3(this.constSpeed, this.constSpeed, this.constSpeed);
        }




        this.bounder.position.y = this.getGroundHeight() + this.scaling;

        if (keydown) {
            // console.log("animating -> " + this.animating);
            // console.log(scene.inputMap)
            if (!this.animating) {
                this.animating = true;
                if (scene.inputMap[" "]) {
                    this.setCurrentAnimation("Dive");
                    this.doAnimation(false);
                } else if (scene.inputMap["s"]) {
                    this.setCurrentAnimation("StdWalkBack");
                    this.doAnimation(true);
                } else {
                    this.setCurrentAnimation("StdWalkFwd");
                    this.doAnimation(true);
                }
            }

            if (!scene.inputMap["shift"]) {
                console.log("stop");
                scene.getAnimationGroupByName("StdRunFwd").stop();
                scene.getAnimationGroupByName("StdRunBack").stop();
            }

        } else {
            if (this.animating) {
                this.animating = false;

                scene.animationGroups.forEach((anim) => {
                    anim.stop();
                });

                this.setCurrentAnimation("IDLE");
                this.doAnimation(true);
            }
        }
    }

    moveInSquarre() {
        //this.doAnimation();
        // ajust the ninja position to be inside the square and turn it to face the right direction
        if (this.archerMesh.position.z < -40) {
            this.setCurrentAnimation("ARC");
            this.archerMesh.position.z = -39;
            this.archerMesh.frontVector = new BABYLON.Vector3(1, 0, 0);
            this.archerMesh.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
        }
        if (this.archerMesh.position.z > 40) {
            this.archerMesh.position.z = 39;
            this.archerMesh.frontVector = new BABYLON.Vector3(-1, 0, 0);
            this.archerMesh.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
        }
        if (this.archerMesh.position.x > 40) {
            this.archerMesh.position.x = 39;
            this.archerMesh.frontVector = new BABYLON.Vector3(0, 0, 1);
            this.archerMesh.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
        }
        if (this.archerMesh.position.x < -40) {
            this.archerMesh.position.x = -39;
            this.archerMesh.frontVector = new BABYLON.Vector3(0, 0, -1);
            this.archerMesh.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
        }
        // move the ninja

        this.archerMesh.moveWithCollisions(this.archerMesh.frontVector.multiplyByFloats(this.speed.x / 10, this.speed.y, this.speed.z / 10));
        this.bounder.position = new BABYLON.Vector3(this.archerMesh.position.x, this.getGroundHeight() + this.scaling, this.archerMesh.position.z);
        this.archerMesh.position.y = this.getGroundHeight() + 1;

    }
}