var canvas;
var gl;

var engine = null;
var lastPlayedAnimation = 0;

function OnCanvasCreated(canvasElement, elementId) {

    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    gl = WebGLHelper.GetGLContext(canvasElement);

    if (gl != null) {

        engine = startCopperLichtFromFile('WebGLCanvas', 'copperlichtdata/animation.ccbjs');
    }
    else {
        OnCanvasFailed(null, elementId);
    }
}

function OnCanvasFailed(canvasElement, elementId) {
    WebGLHelper.ShowMessage(document.getElementById('WebGLCanvasContainer'), WebGLHelper.notSupportWebGLMsg);
}

document.onkeyup = function (event) {
    var scene = engine.getScene();
    if (!scene)
        return;

    // soldier is an AnimatedMeshSceneNode.
    var soldier = scene.getSceneNodeFromName('soldier');

    if (soldier) {
        if (event.keyCode == 32) // space has been pressed
        {
            // switch to next animation				
            // select the next animation:

            var animations = ['walk', 'stand', 'idle_a', 'aim'];
            ++lastPlayedAnimation;
            if (lastPlayedAnimation > animations.length - 1)
                lastPlayedAnimation = 0;

            var nextAnimationName = animations[lastPlayedAnimation];

            // and set it to be played

            soldier.setAnimation(nextAnimationName);
        }
        else {
            if (event.keyCode == 67 || event.keyCode == 99) // 'c' has been pressed
            {
                // clone soldier

                var clone = soldier.createClone(scene.getRootSceneNode());
                clone.Pos.X += (Math.random() * 50) - 25;
                clone.Pos.Z += (Math.random() * 50) - 25;
            }
        }
    }

    // we need to call the key handler of the 3d engine as well, so that the user is
    // able to move the camera using the keys
    engine.handleKeyUp(event);
};