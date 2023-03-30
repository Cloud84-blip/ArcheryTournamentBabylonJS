export class Ground {
    constructor(scene, position, scaling, meshesEnvironment, meshesGround) {
        this.scene = scene;
        this.position = position;
        this.scaling = scaling;
        this.meshesEnvironment = meshesEnvironment;
        this.meshesGround = meshesGround;
    }

    handleCollision() {
        // show 'collision' on interstion with environment meshes other than 
        this.meshesEnvironment.forEach(element => {
            let archer = this.scene.getMeshByName("archer");
            if (element.intersectsMesh(archer.Archer.bounder, true)) {
                console.log("collision between archer and " + element.name);
            }
        });
    }
}