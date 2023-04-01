export class Ground {
    constructor(scene, mesh) {
        this.scene = scene;
        this.mesh = mesh;
        this.bounder = this.createBox();
        this.mesh.actionManager = new BABYLON.ActionManager(this.scene);
        this.mesh.setParent(this.bounder);
        this.handleCollisions();
    }

    createBox() {
        // create a box that will be used to bound the mesh
        let box = BABYLON.MeshBuilder.CreateBox("box", this.scene);
        let mat = new BABYLON.StandardMaterial("mat", this.scene);
        mat.alpha = 0.00;
        box.material = mat;

        this.mesh.computeWorldMatrix(true);
        box.computeWorldMatrix(true);
        // Récupère les dimension   s réelles de la mesh

        let size = this.mesh.getBoundingInfo().boundingBox.minimumWorld;
        let sizes = this.mesh.getBoundingInfo().boundingBox.maximumWorld;

        size = sizes.subtract(size);

        let pos = this.mesh.getAbsolutePosition();

        box.showBoundingBox = true;

        // Définit la nouvelle échelle en fonction de la taille de la boîte englobante
        box.scaling = new BABYLON.Vector3(
            size.x,
            size.y,
            size.z
        );

        box.position = pos;

        return box;
    }




    handleCollisions() {

        this.mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.bounder
                },
                (evt) => {
                    console.log("collision");
                }
            )
        );

    }
}