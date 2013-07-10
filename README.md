IEWebGL
=======

#### WebGL plugin for Internet Explorer 10 and below. ####

IEWebGL is a plugin for Microsoft Internet Explorer web browser, that adds support for WebGL - modern web 3D graphics standard.

### Build ###

- install InnoSetup
- clone, build using Microsoft Visual Studio 2012 using *.sln file under `/Src` directory.
- run makesetup.cmd
- use iewebgl.exe under /Bin directory

### Usage ###

When your page runs under IE 10 or below you use IEWebGL plugin the following way:

```html
<!DOCTYPE html>
<html>
<head>
<script type="text/javascript">
    function InitWebGLContext() {
        var glCanvas = document.getElementById("glCanvas");
        // first, try standard WebGL context
        var gl = glCanvas.getContext("webgl");
        if (!gl) {
            // if failed, try experimental one
            gl = glCanvas.getContext("experimental-webgl");
        }
 
        if (!gl) {
            alert("Your browser does not support WebGL");
            return;
        }
 
        // here we get WebGL context - 
        // for demonstation let's show some info
        alert(
            "WebGL version=" + gl.getParameter(gl.VERSION) + "\n" +
            "WebGL vendor=" + gl.getParameter(gl.VENDOR) + "\n" +
            "WebGL renderer=" + gl.getParameter(gl.RENDERER) + "\n"
        );
    }
</script>
</head>
 
<body onload="InitWebGLContext()">
<object style="width:100%;height:100%" id="glCanvas"
type="application/x-webgl"></object>
</body>
 
</html>
```

For more detailed info, visit http://iewebgl.com or read `/WebSite2.0/Samples`


### Creators ###

- Ivan Modenov http://www.linkedin.com/pub/ivan-modenov/49/600/8b0
- Sergey Velnikovskiy vsergey3d@gmail.com
- Elena Velnikovskaya