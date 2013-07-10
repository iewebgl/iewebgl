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
		
		scene.setBackgroundColor(CL3D.createColor(1, 0, 0, 0));
		scene.setRedrawMode(CL3D.Scene.REDRAW_WHEN_SCENE_CHANGED);
		
		// add a transparent billboard scene node with a text sign
		for (var i=0; i<50; ++i)
		{
			var billboard = new CL3D.BillboardSceneNode();
			billboard.setSize(30, 30);
			billboard.Pos.X = Math.random() * 80 - 40;
			billboard.Pos.Y = Math.random() * 80 - 40;
			billboard.Pos.Z = Math.random() * 80 - 40;
			billboard.getMaterial(0).Tex1 = engine.getTextureManager().getTexture("copperlichtdata/particle.png", true);
			billboard.getMaterial(0).Type = CL3D.Material.EMT_TRANSPARENT_ADD_COLOR;
			scene.getRootSceneNode().addChild(billboard);
		}
							
		// add a user controlled camera with a first person shooter style camera controller
		var cam = new CL3D.CameraSceneNode();
		cam.Pos.X = 50;
		cam.Pos.Y = 20;
		
		var animator = new CL3D.AnimatorCameraFPS(cam, engine);										
		cam.addAnimator(animator);										
		animator.lookAt(new CL3D.Vect3d(0,20,0));			
		
		scene.getRootSceneNode().addChild(cam);
		scene.setActiveCamera(cam);				

		// draw handler
		var pos3d = new CL3D.Vect3d(0,0,0);
		
		engine.OnAnimate = function()
		{
			var element = document.getElementById('originlabel');
			if (element)
			{
				// set the position of the label to the 2d position of the 3d point
				
				var pos2d = engine.get2DPositionFrom3DPosition(pos3d);
				var hide = false;
				
				if (pos2d)
				{
					element.style.left = pos2d.X;
					element.style.top = pos2d.Y;
					
					// hide if outside of the border
					hide = pos2d.X < 0 || pos2d.Y < 0 || 
						pos2d.X > engine.getRenderer().getWidth()-60 || 
						pos2d.Y > engine.getRenderer().getHeight()-20;
				}
				else
					hide = true; 
					
				element.style.display = hide ? 'none' : 'block';
			}
		}
	}