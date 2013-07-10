var canvas;
var gl;

var engine = null;
var cubeCollisionPosition = null;

// this is called when loading the 3d scene has finished
function OnLoadingComplete() {		
	var scene = engine.getScene();
	if (!scene)
		return;
			
	// in the CopperCube 3d editor, we already created a camera which collides against the wall in this scene.
	// But to demonstrate how this would work manually, we create a new camera here which does this as well:
		
	// add a user controlled camera
		
	var cam = new CL3D.CameraSceneNode();
		
	// ensure to place the camera inside the room, or it will fall out, into the endless void
		
	cam.Pos.X = -50; 
	cam.Pos.Y = 180;
	cam.Pos.Z = -20;
		
	// add an animator which makes the camera move by keyboard and mouse input
		
	var animator = new CL3D.AnimatorCameraFPS(cam, engine);	
	animator.MoveSpeed = 0.2;
	animator.RotateSpeed = 250;
	animator.setLookByMouseDown(false); //  look when the mouse is moved
	cam.addAnimator(animator);										
	animator.lookAt(new CL3D.Vect3d(-200,90,200));			
		
	scene.getRootSceneNode().addChild(cam);
	scene.setActiveCamera(cam);		
		
	// add the collision response animator to collide against walls
		
	var colanimator = new CL3D.AnimatorCollisionResponse(
		new CL3D.Vect3d(20,40,20), // size of the player ellipsoid
		new CL3D.Vect3d(0,-10,0), // gravity direction
		new CL3D.Vect3d(0,30,0), // position of the eye in the ellipsoid
		scene.getCollisionGeometry());
			
	cam.addAnimator(colanimator);	
}

function OnCanvasCreated(canvasElement, elementId) {

    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    gl = WebGLHelper.GetGLContext(canvasElement);

    if (gl != null) {

        engine = startCopperLichtFromFile('WebGLCanvas', 'copperlichtdata/room.ccbjs');
        engine.OnLoadingComplete = OnLoadingComplete();
    }
    else {
        OnCanvasFailed(null, elementId);
    }
}

function OnCanvasFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), WebGLHelper.notSupportWebGLMsg);
}

// every time the user presses space, we want to do a collision test with the wall
// and create a cube where we hit the wall
document.onkeyup = function (event) {
    var scene = engine.getScene();
    if (!scene)
        return;

    if (event.keyCode == 32) // space has been pressed
    {
        var cam = scene.getActiveCamera();

        // calculate the start and end 3d point of the line, the beinning being
        // the camera position and the end about 2000 units away in the direction of the
        // camera target

        var startLine = cam.getAbsolutePosition();
        var endLine = startLine.add(cam.getTarget().substract(startLine).multiplyWithScal(2000));

        // test our line for a collision with the world

        var collisionPoint = scene.getCollisionGeometry().getCollisionPointWithLine(startLine, endLine, true, null);

        if (collisionPoint) {
            // a collision has been found.
            // create a cube at the point where the collision happened

            if (!cubeCollisionPosition) {
                cubeCollisionPosition = new CL3D.CubeSceneNode();
                scene.getRootSceneNode().addChild(cubeCollisionPosition);
                cubeCollisionPosition.getMaterial(0).Tex1 = engine.getTextureManager().getTexture('copperlichtdata/ground_stone.jpg', true);
            }

            cubeCollisionPosition.Pos = collisionPoint;
        }
    }

    // we need to call the key handler of the 3d engine as well, so that the user is
    // able to move the camera using the keys
    engine.handleKeyUp(event);
};