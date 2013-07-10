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
		
	// add a sky box
	var skybox = new CL3D.SkyBoxSceneNode();
	scene.getRootSceneNode().addChild(skybox);
		
	// set texture sides of the skybox
	for (var i=0; i<6; ++i)
	    skybox.getMaterial(i).Tex1 = engine.getTextureManager().getTexture("copperlichtdata/stars.jpg", true);
			
	// add a cube to test out
	var cubenode = new CL3D.CubeSceneNode();
	scene.getRootSceneNode().addChild(cubenode);
	cubenode.getMaterial(0).Tex1 = engine.getTextureManager().getTexture("copperlichtdata/crate_wood.jpg", true);
									
	// add a user controlled camera with a first person shooter style camera controller
	var cam = new CL3D.CameraSceneNode();
	cam.Pos.X = 20;
	cam.Pos.Y = 15;
		
	var animator = new CL3D.AnimatorCameraFPS(cam, engine);										
	cam.addAnimator(animator);										
	animator.lookAt(new CL3D.Vect3d(0,0,0));			
		
	scene.getRootSceneNode().addChild(cam);
	scene.setActiveCamera(cam);				
		
	// now, we want to use a custom material for our cube, lets write
	// a vertex and a fragment shader:
		
	var vertex_shader_source = "\
		#ifdef GL_ES								\n\
		precision highp float;						\n\
		#endif										\n\
		uniform mat4 worldviewproj;					\
		attribute vec4 vPosition;					\
		attribute vec4 vNormal;						\
		attribute vec2 vTexCoord1;					\
		attribute vec2 vTexCoord2;					\
		varying vec2 v_texCoord1;					\
		varying vec2 v_texCoord2;					\
		void main()									\
		{											\
			gl_Position = worldviewproj * vPosition;\
			v_texCoord1 = vTexCoord1.st;			\
			v_texCoord2 = vTexCoord2.st;			\
		}";
			
	var fragment_shader_source = "\
		#ifdef GL_ES												\n\
		precision highp float;										\n\
		#endif														\n\
		uniform sampler2D texture1;									\
		uniform sampler2D texture2;									\
																	\
		varying vec2 v_texCoord1;									\
		varying vec2 v_texCoord2;									\
																	\
		void main()													\
		{															\
			vec2 texCoord = vec2(v_texCoord1.s, v_texCoord1.t);		\
			gl_FragColor = texture2D(texture1, texCoord) * 2.0;		\
		}";
		
	// create a solid material using the shaders. For transparent materials, take a look
	// at the other parameters of createMaterialType
		
	var newMaterialType = engine.getRenderer().createMaterialType(vertex_shader_source, fragment_shader_source);
	if (newMaterialType != -1)
		cubenode.getMaterial(0).Type = newMaterialType;
	else
		alert('could not create shader'); //copperLicht will write the exact error line in the html
}