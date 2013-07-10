var canvas;
var gl;

function OnCanvasCreated(canvasElement, elementId) {
    
    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    gl = WebGLHelper.GetGLContext(canvasElement);

    if (gl != null) {
        main();
    }
    else {
        OnCanvasFailed(null, elementId);
    }
}

function OnCanvasFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), WebGLHelper.notSupportWebGLMsg);
}

function main() {
    // create the 3d engine
    var engine = new CL3D.CopperLicht('WebGLCanvas');

    if (!engine.initRenderer())
        return; // this browser doesn't support WebGL

    // add a new 3d scene

    var scene = new CL3D.Scene();
    engine.addScene(scene);

    scene.setBackgroundColor(CL3D.createColor(1, 0, 0, 64));

    // add our own scene node
    var mynode = new MySceneNode(engine);
    scene.getRootSceneNode().addChild(mynode);
    mynode.addAnimator(new CL3D.AnimatorRotation(new CL3D.Vect3d(0, 0.6, 0.8)));

    // add a transparent billboard scene node with a text sign
    var billboard = new CL3D.BillboardSceneNode();
    billboard.setSize(20, 20);
    billboard.Pos.Y = 30;
    billboard.getMaterial(0).Tex1 = engine.getTextureManager().getTexture("copperlichtdata/actionsign.jpg", true);
    billboard.getMaterial(0).Type = CL3D.Material.EMT_TRANSPARENT_ADD_COLOR;
    scene.getRootSceneNode().addChild(billboard);

    // add a user controlled camera with a first person shooter style camera controller
    var cam = new CL3D.CameraSceneNode();
    cam.Pos.X = 50;
    cam.Pos.Y = 20;

    var animator = new CL3D.AnimatorCameraFPS(cam, engine);
    cam.addAnimator(animator);
    animator.lookAt(new CL3D.Vect3d(0, 20, 0));

    scene.getRootSceneNode().addChild(cam);
    scene.setActiveCamera(cam);
}

// helper function for quickly creating a 3d vertex from 3d position and texture coodinates
createVertex = function (x, y, z, s, t) {
    var vtx = new CL3D.Vertex3D(true);
    vtx.Pos.X = x;
    vtx.Pos.Y = y;
    vtx.Pos.Z = z;
    vtx.TCoords.X = s;
    vtx.TCoords.Y = t;
    return vtx;
}

// our own scene node implementation
MySceneNode = function (engine) {
    this.init();  // init scene node specific members

    // create a 3d mesh with one mesh buffer

    this.MyMesh = new CL3D.Mesh();
    var buf = new CL3D.MeshBuffer();
    this.MyMesh.AddMeshBuffer(buf);

    // set indices and vertices

    buf.Indices = [0, 2, 3, 2, 1, 3, 1, 0, 3, 2, 0, 1];

    buf.Vertices.push(createVertex(0, 0, 10, 0, 0));
    buf.Vertices.push(createVertex(10, 0, -10, 1, 0));
    buf.Vertices.push(createVertex(0, 20, 0, 0, 1));
    buf.Vertices.push(createVertex(-10, 20, -10, 1, 1));

    // set the texture of the material

    buf.Mat.Tex1 = engine.getTextureManager().getTexture("copperlichtdata/test.jpg", true);
}
MySceneNode.prototype = new CL3D.SceneNode(); // derive from SceneNode

MySceneNode.prototype.OnRegisterSceneNode = function (scene) {
    scene.registerNodeForRendering(this, CL3D.Scene.RENDER_MODE_DEFAULT);
    CL3D.SceneNode.prototype.OnRegisterSceneNode.call(this, scene); // call base class
}

MySceneNode.prototype.render = function (renderer) {
    renderer.setWorld(this.getAbsoluteTransformation());
    renderer.drawMesh(this.MyMesh);
}