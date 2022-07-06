"use strict";

// Vertex shader program
const VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_select;\n' +
    'attribute vec4 a_normal;\n' +
    'uniform mat4 u_mvpMatrix;\n' +
    'uniform float u_pointSize;\n' +
    'uniform float u_pointSizeSelect;\n' +
    'uniform vec4 u_color;\n' +
    'uniform vec4 u_colorSelect;\n' +
    'varying vec4 v_color;\n' +
    'varying vec4 v_normal;\n' +
    'varying vec4 v_position;\n' +
    'void main() {\n' +
    '  gl_Position = u_mvpMatrix * a_Position;\n' +
    '  if (a_select != 0.0)\n' +
    '  {\n' +
    '    v_color = u_colorSelect;\n' +
    '    gl_PointSize = u_pointSizeSelect;\n' +
    '  }\n' +
    '  else\n' +
    '  {\n' +
    '    v_color = u_color;\n' +
    '    gl_PointSize = u_pointSize;\n' +
    '  }\n' +
    '  v_normal = a_normal;\n' +
    '  v_position = a_Position;\n' +
    '}\n';

// Fragment shader program
const FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_color;\n' +
    'varying vec4 v_normal;\n' +
    'varying vec4 v_position;\n' +
    'uniform bool u_drawPolygon;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec4 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
    'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
    'uniform vec3 u_colorAmbient;\n' +
    'uniform vec3 u_colorSpec;\n' +
    'uniform float u_shininess;\n' +
    'void main() {\n' +
    '  if (u_drawPolygon) {\n' +
    '    vec3 normal =  normalize(gl_FrontFacing ? v_normal.xyz : -v_normal.xyz);\n' +
    '    vec3 lightDirection = normalize(vec3(u_LightPosition - v_position));\n' +
    '    float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    '    vec3 diffuse = u_LightColor * v_color.rgb * nDotL;\n' +
    '    vec3 ambient = u_AmbientLight * u_colorAmbient;\n' +
    '    vec3 r = reflect( -lightDirection, normal );\n' +
    '    vec3 spec = vec3(0.0);\n' +
    '    if( nDotL > 0.0 )\n' +
    '      spec = u_LightColor * u_colorSpec *\n' +
    '             pow( max( dot(r,lightDirection), 0.0 ), u_shininess );\n' +
    '    \n' +
    '    gl_FragColor = vec4(spec + diffuse + ambient, v_color.a);\n' +
    '  } else {\n' +
    '    gl_FragColor = v_color;\n' +
    '  }\n' +
    '}\n';

function main() {
    // Retrieve <canvas> element
    const canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    const gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    const viewport = [0, 0, canvas.width, canvas.height];
    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);

    const Xmin = document.getElementById("Xmin");
    const Xmax = document.getElementById("Xmax");
    const Ymin = document.getElementById("Ymin");
    const Ymax = document.getElementById("Ymax");
	const Zmin = document.getElementById("Zmin");
    const Zmax = document.getElementById("Zmax");
    // const Z = document.getElementById("Z");
    const N_ctr = document.getElementById("N_ctr");
    const M_ctr = document.getElementById("M_ctr");
    const N = document.getElementById("N");
    const M = document.getElementById("M");
    const alpha = document.getElementById("alpha");
	const nu = document.getElementById("nu");
    // const uniform = document.getElementById("uniform");
    // const chordal = document.getElementById("chordal");
    // const centripetal = document.getElementById("centripetal");

    Data.init(gl, viewport, eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value), eval(Zmax.value),
              N_ctr, M_ctr, N, M, alpha, nu);

    canvas.onmousemove = function (ev) { mousemove(ev, canvas); };

    canvas.onmousedown = function (ev) { mousedown(ev, canvas); };

    canvas.onmouseup = function (ev) { mouseup(ev, canvas); };

    (function () {

        function handleMouseWheel(event) {
            event = EventUtil.getEvent(event);
            const delta = EventUtil.getWheelDelta(event);
            Data.mousewheel(delta);
            EventUtil.preventDefault(event);
        }

        EventUtil.addHandler(document, "mousewheel", handleMouseWheel);
        EventUtil.addHandler(document, "DOMMouseScroll", handleMouseWheel);

    })();

    const lineSurfaceSpline = document.getElementById("chkLineSurfaceSpline");
    const controlPolygon = document.getElementById("chkControlPolygon");
    const showControlPoints = document.getElementById("chkShowPoints");
	
    const visualizeSplineWithPoints = document.getElementById("chkVisualizeWithPoints");
    const visualizeSplineWithLines = document.getElementById("chkVisualizeWithLines");
    const visualizeSplineWithSurface = document.getElementById("chkVisualizeWithSurface");
	
	const visualizeMeshWithPoints = document.getElementById("chk2DMeshPoints");
    const visualizeMeshWithLines = document.getElementById("chk2DMeshLines");
    const visualizeMeshWithSurface = document.getElementById("chk2DMeshSurface");

    lineSurfaceSpline.onclick = function () { Data.plotMode(1); };
    visualizeSplineWithPoints.onclick = function () { Data.plotMode(4); };
    visualizeSplineWithLines.onclick = function () { Data.plotMode(5); };
    visualizeSplineWithSurface.onclick = function () { Data.plotMode(6); };
	
	visualizeMeshWithPoints.onclick = function () { Data.plotMode(7); };
    visualizeMeshWithLines.onclick = function () { Data.plotMode(8); };
    visualizeMeshWithSurface.onclick = function () { Data.plotMode(9); };
	
    showControlPoints.onclick = function () { Data.plotMode(10); };

    Xmin.onchange = function () {
        Data.setDependentGeomParameters(
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
    Xmax.onchange = function () {
        Data.setDependentGeomParameters(
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
    Ymin.onchange = function () {
        Data.setDependentGeomParameters(
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
    Ymax.onchange = function () {
        Data.setDependentGeomParameters(
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
    Zmin.onchange = function () {
        Data.setDependentGeomParameters(
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
	Zmax.onchange = function () {
        Data.setDependentGeomParameters(
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
    N_ctr.onchange = function () {
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
    M_ctr.onchange = function () {
        Data.generateControlPoints(N_ctr.value, M_ctr.value,
            eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
    };
    N.onchange = function () { Data.plotMode(2); };
    M.onchange = function () { Data.plotMode(2); };
    alpha.onchange = function () { Data.plotMode(11); };
	
	nu.onchange = function () { Data.plotMode(11); };
	
    // uniform.onclick = function () { Data.plotMode(2); };
    // chordal.onclick = function () { Data.plotMode(2); };
    // centripetal.onclick = function () { Data.plotMode(2); };
    controlPolygon.onclick = function () { Data.plotMode(3); };

    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);

    // Specify the color for clearing <canvas>
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    Data.generateControlPoints(N_ctr.value, M_ctr.value,
        eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Zmin.value),eval(Zmax.value));
}

function project(obj, mvpMatrix, viewport) {
    const win = vec4.transformMat4(vec4.create(), obj, mvpMatrix);

    if (win[3] == 0.0)
        return;

    win[0] /= win[3];
    win[1] /= win[3];
    win[2] /= win[3];

    win[0] = win[0] * 0.5 + 0.5;
    win[1] = win[1] * 0.5 + 0.5;
    win[2] = win[2] * 0.5 + 0.5;

    win[0] = viewport[0] + win[0] * viewport[2];
    win[1] = viewport[1] + win[1] * viewport[3];

    return win;
}

function unproject(win, modelView, projection, viewport) {

    const invertMV = mat4.invert(mat4.create(), modelView);
    const invertP = mat4.invert(mat4.create(), projection);

    const invertMVP = mat4.multiply(mat4.create(), invertMV, invertP);

    win[0] = (win[0] - viewport[0]) / viewport[2];
    win[1] = (win[1] - viewport[1]) / viewport[3];

    win[0] = win[0] * 2 - 1;
    win[1] = win[1] * 2 - 1;
    win[2] = win[2] * 2 - 1;

    const obj = vec4.transformMat4(vec4.create(), win, invertMVP);

    if (obj[3] == 0.0)
        return;

    obj[0] /= obj[3];
    obj[1] /= obj[3];
    obj[2] /= obj[3];

    return obj;
}

class Point
{	
    constructor(x, y, z) {
        this.select = false;

        this.x = x;
        this.y = y;
        this.z = z;
        this.winx = 0.0;
        this.winz = 0.0;
        this.winy = 0.0;
		
		this.u = 0.0;
		this.v = 0.0;
		this.t = 0.0;
    }
    setRect() {
        this.left = this.winx - 5;
        this.right = this.winx + 5;
        this.bottom = this.winy - 5;
        this.up = this.winy + 5;
    }
    calculateWindowCoordinates(mvpMatrix, viewport) {
        const worldCoord = vec4.fromValues(this.x, this.y, this.z, 1.0);

        //------------Get window coordinates of point-----------
        const winCoord = project(worldCoord, mvpMatrix, viewport);
        winCoord[1] = (winCoord[1]); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        this.winx = winCoord[0];
        this.winy = winCoord[1];
        this.winz = winCoord[2];

        this.setRect();//create a bounding rectangle around point
    }
    ptInRect(x, y) {
        const inX = this.left <= x && x <= this.right;
        const inY = this.bottom <= y && y <= this.up;
        return inX && inY;
    }
}

const Camera = {
    //cartesian coordinates
	    //point the viewer is looking at
    x0: 0.0,
    y0: 0.0,
    z0: 0.0,
	// xm: 3.81,
	// ym: 3.81,
	// zm: 3.81,
    //spherical coordinates
    r: 0.0,
    theta: 0.0,
    phi: 0.0,
    //initial spherical coordinates
    r_0: 0.0,
    theta_0: 0.0,
    phi_0: 0.0,
    //point the viewer is looking from
    x_ref: 0,
    y_ref: 0,
    z_ref: 0,
    //up vector
    Vx: 0.0,
    Vy: 0.0,
    Vz: 0.0,
    //view volume bounds
    xw_min: 0.0,
    xw_max: 0.0,
    yw_min: 0.0,
    yw_max: 0.0,
    d_near: 0.0,
    d_far: 0.0,
    convertFromCartesianToSpherical: function () {
        const R = this.r + this.r_0;
        const Theta = this.theta + this.theta_0;
        const Phi = this.phi + this.phi_0;

        this.convertFromCartesianToSphericalCoordinates(R, Theta, Phi);

        this.Vx = -R * Math.cos(Theta) * Math.cos(Phi);
        this.Vy = -R * Math.cos(Theta) * Math.sin(Phi);
        this.Vz = R * Math.sin(Theta);

        this.xw_min = -R;
        this.xw_max = R;
        this.yw_min = -R;
        this.yw_max = R;
        this.d_near = -R;
        this.d_far = 2 * R;
    },
    convertFromCartesianToSphericalCoordinates: function (r, theta, phi) {
        this.x0 = r * Math.sin(theta) * Math.cos(phi);
        this.y0 = r * Math.sin(theta) * Math.sin(phi);
        this.z0 = r * Math.cos(theta);
    },
    normalizeAngle: function (angle) {
        let lAngle = angle;
        while (lAngle < 0)
            lAngle += 360 * 16;
        while (lAngle > 360 * 16)
            lAngle -= 360 * 16;

        return lAngle;
    },
    getLookAt: function (r, theta, phi) {
        this.r = r;
        this.phi = glMatrix.toRadian(phi / 16.0);
        this.theta = glMatrix.toRadian(theta / 16.0);
        this.convertFromCartesianToSpherical();

        return mat4.lookAt(mat4.create(),
            [Camera.x0, Camera.y0, Camera.z0],
            [Camera.x_ref, Camera.y_ref, Camera.z_ref],
            [Camera.Vx, Camera.Vy, Camera.Vz]);
    },
    getProjMatrix: function () {
        return mat4.ortho(mat4.create(),
            this.xw_min, this.xw_max, this.yw_min, this.yw_max, this.d_near, this.d_far);
    },
    getAxesPoints: function () {
    		return [0.5 * this.xw_min, 0, 0,
					      this.xw_max, 0, 0,
					0, 0.5 * this.yw_min, 0,
					0, this.yw_max, 0,
					0, 0, -0.5 * (this.d_far - this.d_near) / 2.0,
					0, 0,  (this.d_far - this.d_near) / 2.0];
    },
    getAxesTipLength: function () {
    		return 0.15 * (this.d_far - this.d_near);

    }
}

const Data = {
    pointsCtr: [],
	buildCtr: [],
	m20Ctr: [],
	m02Ctr: [],
    indicesCtr: [],
    indicesAxesTip: [],
	
    pointsSpline: [],
    indicesSplineLines: [],
    indicesSplineSurface: [],	
    normalsSpline: [],
	
	pointsMesh: [],
    indicesMeshLines: [],
    indicesMeshSurface: [],	
    normalsMesh: [],
	
    countAttribData: 4, //x,y,z,sel
	
    verticesAxes: {},
    verticesCtr: {},
    verticesSpline: {},
	vetricesMesh: {},
	
    FSIZE: 0,
    ISIZE: 0,
    gl: null,
    vertexBufferAxes: null,
    vertexBufferAxesTip: null,
    indexBufferAxesTip: null,
    vertexBufferCtr: null,
    indexBufferCtr: null,
	
    vertexBufferSpline: null,
    indexBufferSplineLines: null,
    indexBufferSplineSurface: null,
	
	vertexBufferMesh: null,
    indexBufferMeshLines: null,
    indexBufferMeshSurface: null,
	
    verticesAxesTip: {},
    a_Position: -1,
    a_select: -1,
    a_normal: -1,
    u_color: null,
    u_colorSelect: null,
    u_pointSize: null,
    u_pointSizeSelect: null,
    u_drawPolygon: false,
    u_mvpMatrix: null,
    u_LightColor: null,
    u_LightPosition: null,
    u_AmbientLight: null,
    u_colorAmbient: null,
    u_colorSpec: null,
    u_shininess: null,
    movePoint: false,
	lMove: -1,
	lMoveArr: [],
	iMoveArr: [],
	jMoveArr: [],
	MoveArr: [],
    iMove: -1,
    jMove: -1,
    leftButtonDown: false,
    drawControlPolygon: false,
    drawLineSurfaceSpline: false,
    showControlPoints: true,
	
    visualizeSplineWithPoints: true,
    visualizeSplineWithLines: false,
    visualizeSplineWithSurface: false,
	
	visualizeMeshWithPoints: false,
    visualizeMeshWithLines: false,
    visualizeMeshWithSurface: false,
	
    // uniform: null,
    // chordal: null,
    // centripetal: null,
    N_ctr: null,
    M_ctr: null,
    N: null,
    M: null,
	
    alpha: null,
	nu: null,
	
	Xmax: 0.0,
	Xmin: 0.0,
	Ymax: 0.0,
	Ymin: 0.0,
	Zmin: 0.0,
	Zmax: 0.0,
	
    Xmid: 0.0,
    Ymid: 0.0,
	Zmid: 0.0,
	
    xRot: 0,
    yRot: 0,
    wheelDelta: 0.0,
    proj: mat4.create(),
    cam: mat4.create(),
    world: mat4.create(),
    viewport: [],
    lastPosX: 0,
    lastPosY: 0,
	
    init: function (gl, viewport, Xmin, Xmax, Ymin, Ymax, Zmin, Zmax, N_ctr, M_ctr, N, M, alpha, nu) {
        this.gl = gl;
        
        this.verticesAxes = new Float32Array(18); // 6 points * 3 coordinates
        
        // Create a buffer object
        this.vertexBufferAxes = this.gl.createBuffer();
        if (!this.vertexBufferAxes) {
            console.log('Failed to create the buffer object for axes');
            return -1;
        }
        
        this.vertexBufferAxesTip = this.gl.createBuffer();
        if (!this.vertexBufferAxesTip) {
            console.log('Failed to create the buffer object for axes tips');
            return -1;
        }
        
        this.vertexBufferCtr = this.gl.createBuffer();
        if (!this.vertexBufferCtr) {
            console.log('Failed to create the buffer object for control points');
            return -1;
        }
		
        this.vertexBufferSpline = this.gl.createBuffer();
        if (!this.vertexBufferSpline) {
            console.log('Failed to create the buffer object for spline points');
            return -1;
        }
		
		this.vertexBufferMesh = this.gl.createBuffer();
        if (!this.vertexBufferMesh) {
            console.log('Failed to create the buffer object for mesh points');
            return -1;
        }
        
        this.indexBufferAxesTip = this.gl.createBuffer();
        if (!this.indexBufferAxesTip) {
            console.log('Failed to create the index object for axes tips');
            return -1;
        }

        this.indexBufferCtr = this.gl.createBuffer();
        if (!this.indexBufferCtr) {
            console.log('Failed to create the index object for control points');
            return -1;
        }

        this.indexBufferSplineLines = this.gl.createBuffer();
        if (!this.indexBufferSplineLines) {
            console.log('Failed to create the index object for spline lines');
            return -1;
        }
		
		this.indexBufferMeshLines = this.gl.createBuffer();
        if (!this.indexBufferMeshLines) {
            console.log('Failed to create the index object for mesh lines');
            return -1;
        }
		
        this.indexBufferSplineSurface = this.gl.createBuffer();
        if (!this.indexBufferSplineSurface) {
            console.log('Failed to create the index object for spline surface');
            return -1;
        }
		
		this.indexBufferMeshSurface = this.gl.createBuffer();
        if (!this.indexBufferMeshSurface) {
            console.log('Failed to create the index object for mesh surface');
            return -1;
        }

        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        if (this.a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }

        this.a_select = this.gl.getAttribLocation(this.gl.program, 'a_select');
        if (this.a_select < 0) {
            console.log('Failed to get the storage location of a_select');
            return -1;
        }

        this.a_normal = this.gl.getAttribLocation(this.gl.program, 'a_normal');
        if (this.a_normal < 0) {
            console.log('Failed to get the storage location of a_normal');
            return -1;
        }

        // Get the storage location of u_color
        this.u_color = this.gl.getUniformLocation(this.gl.program, 'u_color');
        if (!this.u_color) {
            console.log('Failed to get u_color variable');
            return;
        }

        // Get the storage location of u_colorSelect
        this.u_colorSelect = gl.getUniformLocation(this.gl.program, 'u_colorSelect');
        if (!this.u_colorSelect) {
            console.log('Failed to get u_colorSelect variable');
            return;
        }

        // Get the storage location of u_pointSize
        this.u_pointSize = gl.getUniformLocation(this.gl.program, 'u_pointSize');
        if (!this.u_pointSize) {
            console.log('Failed to get u_pointSize variable');
            return;
        }

        // Get the storage location of u_pointSize
        this.u_pointSizeSelect = gl.getUniformLocation(this.gl.program, 'u_pointSizeSelect');
        if (!this.u_pointSizeSelect) {
            console.log('Failed to get u_pointSizeSelect variable');
            return;
        }

        // Get the storage location of u_drawPolygon
        this.u_drawPolygon = this.gl.getUniformLocation(this.gl.program, 'u_drawPolygon');
        if (!this.u_drawPolygon) {
            console.log('Failed to get u_drawPolygon variable');
            return;
        }

        // Get the storage location of u_LightColor
        this.u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
        if (!this.u_LightColor) {
            console.log('Failed to get u_LightColor variable');
            return;
        }

        // Get the storage location of u_LightPosition
        this.u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
        if (!this.u_LightPosition) {
            console.log('Failed to get u_LightPosition variable');
            return;
        }

        // Get the storage location of u_AmbientLight
        this.u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
        if (!this.u_AmbientLight) {
            console.log('Failed to get u_AmbientLight variable');
            return;
        }

        // Get the storage location of u_colorAmbient
        this.u_colorAmbient = gl.getUniformLocation(gl.program, 'u_colorAmbient');
        if (!this.u_colorAmbient) {
            console.log('Failed to get u_colorAmbient variable');
            return;
        }

        // Get the storage location of u_colorSpec
        this.u_colorSpec = gl.getUniformLocation(gl.program, 'u_colorSpec');
        if (!this.u_colorSpec) {
            console.log('Failed to get u_colorSpec variable');
            return;
        }

        // Get the storage location of u_shininess
        this.u_shininess = gl.getUniformLocation(gl.program, 'u_shininess');
        if (!this.u_shininess) {
            console.log('Failed to get u_shininess variable');
            return;
        }

        this.u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
        if (!this.u_mvpMatrix) {
            console.log('Failed to get the storage location of u_mvpMatrix');
            return;
        }

        this.gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
        this.gl.uniform3f(this.u_AmbientLight, 0.2, 0.2, 0.2);
        this.gl.uniform3f(this.u_colorSpec, 0.2313, 0.2313, 0.2313);
        this.gl.uniform3f(this.u_colorSpec, 0.7739, 0.7739, 0.7739);
        this.gl.uniform1f(this.u_shininess, 90);

        this.viewport = viewport;

        this.N_ctr = N_ctr;
        this.M_ctr = M_ctr;
        this.N = N;
        this.M = M;
        // this.uniform = uniform;
        // this.chordal = chordal;
        // this.centripetal = centripetal;
        this.alpha = alpha;
		this.nu = nu;
		
		this.Xmax = Xmax;
		this.Xmin = Xmin;
		this.Ymax = Ymax;
		this.Ymin = Ymin;
		this.Zmin = Zmin;
		this.Zmax = Zmax;
		
        this.setDependentGeomParameters(Xmin, Xmax, Ymin, Ymax, Zmin, Zmax);
    },
	
    setDependentGeomParameters: function (Xmin, Xmax, Ymin, Ymax, Zmin, Zmax) {
        this.Xmid = Xmin + (Xmax - Xmin) / 2.0;
        this.Ymid = Ymin + (Ymax - Ymin) / 2.0;
		this.Zmid = Zmin + (Zmax - Zmin) / 2.0;

        Camera.r_0 = Math.sqrt(Math.pow((Xmax - Xmin) / 2.0, 2) +
            Math.pow((Ymax - Ymin) / 2.0, 2) +
            Math.pow((Zmax - Zmin) / 2.0, 2));

        this.resetCamera();
    },
	
    generateControlPoints: function (n, m, Xmin, Xmax, Ymin, Ymax, Zmin, Zmax) {
        this.pointsCtr = new Array(6);
		// this.buildCtr = new Array(6);
		this.m20Ctr = new Array(6);
		this.m02Ctr = new Array(6);
		
		for(let k = 0; k < 6; ++k)
		{
			this.pointsCtr[k] = new Array(n);
			this.m20Ctr[k] = new Array(n);
			this.m02Ctr[k] = new Array(n);
			
			for (let i = 0; i < n; ++i) {
				this.pointsCtr[k][i] = new Array(m);
				this.m20Ctr[k][i] = new Array(m);
				this.m02Ctr[k][i] = new Array(m);
			}
		}
		
		let X, Y, Z;
		
		
		for (let i = 0; i < n; i++)
		{
			for (let j = 0; j < m; j++) {
				if ((i > 0) && (i < n - 1) && (j > 0) && (j < m - 1))
					continue;
				// a - Zmin, c - Zmax
				X = Xmin + i * (Xmax - Xmin) / (n - 1) - this.Xmid;
				Y = Ymin + j * (Ymax - Ymin) / (m - 1) - this.Ymid;
				this.pointsCtr[0][i][j] = new Point(X, Y, Zmin - this.Zmid);
				this.pointsCtr[2][i][j] = new Point(X, Y, Zmax - this.Zmid);
				this.m20Ctr[0][i][j] = new Point;
				this.m02Ctr[0][i][j] = new Point;
				this.m20Ctr[2][i][j] = new Point;
				this.m02Ctr[2][i][j] = new Point;
			}
		}
		for (let i = 0; i < n; i++)
		{
			for (let j = 0; j < m; j++) {
				if ((i > 0) && (i < n - 1) && (j > 0) && (j < m - 1))
					continue;
				// b - Ymax, d - Ymin
				X = Xmin + i * (Xmax - Xmin) / (n - 1) - this.Xmid;
				Z = Zmin + j * (Zmax - Zmin) / (m - 1) - this.Zmid;
				let newPointYmax = new Point(X, Ymax - this.Ymid, Z);
				let newPointYmin = new Point(X, Ymin - this.Ymid, Z);
				for (let c = 0; c < 3; c = c + 2){
					for (let a = 0; a < n; a++){
						for (let b = 0; b < m; b++){
							if ((a > 0) && (a < n - 1) && (b > 0) && (b < m - 1))
								continue;
							if (this.pointsCtr[c][a][b].x == newPointYmax.x && this.pointsCtr[c][a][b].y == newPointYmax.y && this.pointsCtr[c][a][b].z == newPointYmax.z)
							{
								this.pointsCtr[1][i][j] = this.pointsCtr[c][a][b];
							}
							else 
								this.pointsCtr[1][i][j] = newPointYmax;
							
							
							if (this.pointsCtr[c][a][b].x == newPointYmin.x && this.pointsCtr[c][a][b].y == newPointYmin.y && this.pointsCtr[c][a][b].z == newPointYmin.z)
							{	
								// console.log('yes');
								this.pointsCtr[3][i][j] = this.pointsCtr[c][a][b];
							}
							else 
								this.pointsCtr[3][i][j] = newPointYmin;
						}
					}
				}

				this.m20Ctr[1][i][j] = new Point;
				this.m02Ctr[1][i][j] = new Point;
				this.m20Ctr[3][i][j] = new Point;
				this.m02Ctr[3][i][j] = new Point;
			}
		}
		for (let i = 0; i < n; i++)
		{
			for (let j = 0; j < m; j++) {
				if ((i > 0) && (i < n - 1) && (j > 0) && (j < m - 1))
					continue;
			
			
				// e - Xmax, f - Xmin
				Z = Zmin + i * (Zmax - Zmin) / (n - 1) - this.Zmid;
				Y = Ymin + j * (Ymax - Ymin) / (m - 1) - this.Zmid;
				let newPointXmax = new Point(Xmax - this.Xmid, Y, Z);
				let newPointXmin = new Point(Xmin - this.Xmid, Y, Z);
				for (let c = 0; c < 4; ++c){
					for (let a = 0; a < n; a++){
						for (let b = 0; b < m; b++){
							if ((a > 0) && (a < n - 1) && (b > 0) && (b < m - 1))
							continue;

							if (this.pointsCtr[c][a][b].x == newPointXmax.x && this.pointsCtr[c][a][b].y == newPointXmax.y && this.pointsCtr[c][a][b].z == newPointXmax.z)
								this.pointsCtr[4][i][j] = this.pointsCtr[c][a][b];
							else 
								this.pointsCtr[4][i][j] = newPointXmax;
							
							if (this.pointsCtr[c][a][b].x == newPointXmin.x && this.pointsCtr[c][a][b].y == newPointXmin.y && this.pointsCtr[c][a][b].z == newPointXmin.z)
								this.pointsCtr[5][i][j] = this.pointsCtr[c][a][b];
							else 
								this.pointsCtr[5][i][j] = newPointXmin;
						}
					}
				}
				this.m20Ctr[4][i][j] = new Point;
				this.m02Ctr[4][i][j] = new Point;
				this.m20Ctr[5][i][j] = new Point;
				this.m02Ctr[5][i][j] = new Point;
				
			}
		}

        this.add_vertices(n, m);
        this.FSIZE = this.verticesCtr.BYTES_PER_ELEMENT;

        this.createIndicesCtr(n, m);
        this.ISIZE = this.indicesCtr.BYTES_PER_ELEMENT;

        if (this.drawCoonsLinearSurface) {
            this.calculateCoonsLinearSurface();
			this.calculateMechanicalMesh();
		}

        this.setVertexBuffersAndDraw();
    },
	
    resetCamera: function () {
        this.xRot = 0;
        this.yRot = 0;
        this.wheelDelta = 0.0;
    },
	
    setLeftButtonDown: function (value) {
        this.leftButtonDown = value;
    },
	

	
    setAxes: function () {
    		this.verticesAxes.set(Camera.getAxesPoints());
    },
	
    create_coord_tip: function () {
        let r, phi, x, y, z;
        let i, j, k;

        let pt;

		const height = Camera.getAxesTipLength();
        const rTop = 0;
        const rBase = 0.2 * height;
        this.nLongitudes = 36;
        this.nLatitudes = 2;

        const count = this.nLatitudes * this.nLongitudes * 3; //x,y,z
        this.verticesAxesTip = new Float32Array(count);

        k = 0;
        for (i = 0; i < this.nLatitudes; i++)
            for (j = 0; j < this.nLongitudes; j++) {
                r = rBase + (rTop - rBase) / (this.nLatitudes - 1) * i;
                phi = 2 * Math.PI / this.nLongitudes * j;

                x = r * Math.cos(phi);
                y = r * Math.sin(phi);
                z = height / (this.nLatitudes - 1) * i - height;


                this.verticesAxesTip[k++] = x;
                this.verticesAxesTip[k++] = y;
                this.verticesAxesTip[k++] = z;
            }
    },
	
    create_indexes_tip: function () {
        let i, j, k, p, q;
        let m_countTipIndices;
        let indicesVectorCtr;

        const countIndices = (this.nLatitudes - 1) * this.nLongitudes * 2 * 3;
        
        this.indicesAxesTip = new Uint16Array(countIndices);

        k = 0;

        for (i = 0; i < this.nLatitudes - 1; i++)
            for (j = 0; j < this.nLongitudes; j++) {
                if (j != this.nLongitudes - 1) {
                    this.indicesAxesTip[k++] = this.nLongitudes * i + j;
                    this.indicesAxesTip[k++] = this.nLongitudes * i + j + 1;
                    this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j + 1;

                    this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j + 1;
                    this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j;
                    this.indicesAxesTip[k++] = this.nLongitudes * i + j;
                }
                else {
                    this.indicesAxesTip[k++] = this.nLongitudes * i + j;
                    this.indicesAxesTip[k++] = this.nLongitudes * i;
                    this.indicesAxesTip[k++] = this.nLongitudes * (i + 1);

                    this.indicesAxesTip[k++] = this.nLongitudes * (i + 1);
                    this.indicesAxesTip[k++] = this.nLongitudes * (i + 1) + j;
                    this.indicesAxesTip[k++] = this.nLongitudes * i + j;
                }
            }
    },
	
    createIndicesCtr: function (n, m) {
		let count = 6;
        let i, j, k = 0;
        this.indicesCtr = new Uint16Array(count * 2 * n * m);

		for(let l = 0; l < count; ++l) {
			for (i = 0; i < n; i++)
				for (j = 0; j < m; j++)
					this.indicesCtr[k++] = l * m * n + i * m + j; 
				
			for (j = 0; j < m; j++)
				for (i = 0; i < n; i++)
					this.indicesCtr[k++] = l * m * n + i * m + j;
		}
    },
	
    createIndicesSplineLines: function (n, m) {
		let count = 6;
        let i, j, k = 0;
        this.indicesSplineLines = new Array(count);
		for(let l = 0; l < count; ++l) 
		{
			this.indicesSplineLines[l] = new Uint16Array(2 * n * m);
			k = 0;
			for (i = 0; i < n; i++) 
			{
				for (j = 0; j < m; j++)
					this.indicesSplineLines[l][k++] = l * m * n + i * m + j;
			}
			for (j = 0; j < m; j++) 
			{
				for (i = 0; i < n; i++)
					this.indicesSplineLines[l][k++] = l * m * n + i * m + j;
			}
		}
    },		
	
    createIndicesSplineSurface: function (n, m) {
		let count = 6;
        let k = 0;
        this.indicesSplineSurface = new Uint16Array(count * 6 * (n - 1) * (m - 1));
		for(let l = 0; l < count; ++l) {					
			for (let i = 0; i < n - 1; i++)
				for (let j = 0; j < m - 1; j++) {
					this.indicesSplineSurface[k++] = l * m * n + i * m + j;                            
					this.indicesSplineSurface[k++] = l * m * n +  (i + 1) * m + j;
					this.indicesSplineSurface[k++] = l * m * n +  i * m + j + 1;
					this.indicesSplineSurface[k++] = l * m * n +  i * m + j + 1;
					this.indicesSplineSurface[k++] = l * m * n +  (i + 1) * m + j;
					this.indicesSplineSurface[k++] = l * m * n +  (i + 1) * m + j + 1;
				}
		}
    },
	
    setXRotation: function (angle) {
        const lAngle = Camera.normalizeAngle(angle);
        if (lAngle != this.xRot) {
            this.xRot = lAngle;
        }
    },
	
    setYRotation: function (angle) {
        const lAngle = Camera.normalizeAngle(angle);
        if (lAngle != this.yRot) {
            this.yRot = lAngle;
        }
    },
	
    mousemoveHandler: function (x, y) {
        if (this.leftButtonDown) {
            if (this.movePoint) {
				for (let st = 0; st < 3; ++st){
					const offset = this.lMoveArr[st] * this.M_ctr.value * this.N_ctr.value + this.iMoveArr[st] * this.M_ctr.value + this.jMoveArr[st];
					const winCoord = vec4.create();

					winCoord[0] = x;
					winCoord[1] = y;
					winCoord[2] = this.pointsCtr[this.lMoveArr[st]][this.iMoveArr[st]][this.jMoveArr[st]].winz;
					winCoord[3] = 1.0;

					const mvMatr = mat4.mul(mat4.create(), this.cam, this.world);

					const worldCoord = unproject(winCoord, mvMatr, this.proj, this.viewport);

					this.pointsCtr[this.lMoveArr[st]][this.iMoveArr[st]][this.jMoveArr[st]].x = worldCoord[0];
					this.pointsCtr[this.lMoveArr[st]][this.iMoveArr[st]][this.jMoveArr[st]].y = worldCoord[1];
					this.pointsCtr[this.lMoveArr[st]][this.iMoveArr[st]][this.jMoveArr[st]].z = worldCoord[2];

					this.verticesCtr[offset * this.countAttribData] = this.pointsCtr[this.lMoveArr[st]][this.iMoveArr[st]][this.jMoveArr[st]].x;
					this.verticesCtr[offset * this.countAttribData + 1] = this.pointsCtr[this.lMoveArr[st]][this.iMoveArr[st]][this.jMoveArr[st]].y;
					this.verticesCtr[offset * this.countAttribData + 2] = this.pointsCtr[this.lMoveArr[st]][this.iMoveArr[st]][this.jMoveArr[st]].z;

					if (this.drawCoonsLinearSurface) {
						this.calculateCoonsLinearSurface();
						this.calculateMechanicalMesh();
					}
				}
            }
            else {
                const dx = x - this.lastPosX;
                const dy = y - this.lastPosY;

                this.setXRotation(this.xRot - 8 * dy);
                this.setYRotation(this.yRot + 8 * dx);

                this.lastPosX = x;
                this.lastPosY = y;
            }
            this.setVertexBuffersAndDraw();
        }
        else
		{
			for (let l = 0; l < 6; ++l)
			{
				for (let i = 0; i < this.N_ctr.value; i++)
				{
					for (let j = 0; j < this.M_ctr.value; j++) {
						 if ((i > 0) && (i < this.N_ctr.value-1) && (j > 0) && (j < this.M_ctr.value-1))
									continue;
							
						this.pointsCtr[l][i][j].select = false;

						if (this.pointsCtr[l][i][j].ptInRect(x, y))
							this.pointsCtr[l][i][j].select = true;

						this.verticesCtr[(l * this.M_ctr.value * this.N_ctr.value + i * this.M_ctr.value + j) * this.countAttribData + 3] = this.pointsCtr[l][i][j].select;

						this.setVertexBuffersAndDraw();
					}
				}
			}
		}
    },
	
    mousedownHandler: function (button, x, y) {
        switch (button) {
            case 0: //left button
                this.movePoint = false;
				let lMoveArr = new Uint16Array(3);
				let iMoveArr = new Uint16Array(3);
				let jMoveArr = new Uint16Array(3);
				let MoveArr = new Array(3);
				let counter = 0;
				let count = 6;
				for (let l = 0; l < count; ++l)
				{
		            for (let i = 0; i < this.N_ctr.value; i++) {
		                for (let j = 0; j < this.M_ctr.value; j++) {
			                	if ((i > 0) && (i < this.N_ctr.value-1) && (j > 0) && (j < this.M_ctr.value-1))
			            					continue;
		                    if (this.pointsCtr[l][i][j].select == true){
								for (let c = 0; c < 6; ++c){
									for (let a = 0; a < N_ctr.value; a++){
										for (let b = 0; b < M_ctr.value; b++){
											if ((a > 0) && (a < this.N_ctr.value-1) && (b > 0) && (b < this.M_ctr.value-1))
			            					continue;
											if (this.pointsCtr[l][i][j].x == this.pointsCtr[c][a][b].x && this.pointsCtr[l][i][j].y == this.pointsCtr[c][a][b].y && this.pointsCtr[l][i][j].z == this.pointsCtr[c][a][b].z){
												this.movePoint = true;
												this.lMoveArr[counter] = c;
												this.iMoveArr[counter] = a;
												this.jMoveArr[counter] = b;
												counter++;
											}
										}
									}
								}
		                        
		                    }
		                }
					}
				}
                if (!this.movePoint) {
                    this.lastPosX = x;
                    this.lastPosY = y;
                }

                this.setLeftButtonDown(true);
                break;
				
            case 2: //right button
                this.resetCamera();
                this.setVertexBuffersAndDraw();
                break;
        }
    },
	
    mouseupHandler: function (button, x, y) {
        if (button == 0) //left button
            this.setLeftButtonDown(false);
    },
	
    mousewheel: function (delta) {
        const d = Camera.r_0 * (-1.) * delta / 8000.0;
        if ((this.wheelDelta + d >= -Camera.r_0) && (this.wheelDelta + d <= Camera.r_0 * 3.0))
            this.wheelDelta += d;

        this.setVertexBuffersAndDraw();
    },
	
    add_vertices: function (n, m) {
		let count = 6;
        this.verticesCtr = new Float32Array(count * n * m * this.countAttribData);
		for (let k = 0; k < count; ++k)
			for (let i = 0; i < n; i++)
				for (let j = 0; j < m; j++) {
					  if ((i > 0) && (i < n-1) && (j > 0) && (j < m-1))
									continue;
									
					const offset = k * m * n + (i * m + j);
					this.verticesCtr[offset * this.countAttribData] = this.pointsCtr[k][i][j].x;
					this.verticesCtr[offset * this.countAttribData + 1] = this.pointsCtr[k][i][j].y;
					this.verticesCtr[offset * this.countAttribData + 2] = this.pointsCtr[k][i][j].z;
					this.verticesCtr[offset * this.countAttribData + 3] = this.pointsCtr[k][i][j].select;
				}
    },
	
    setVertexBuffersAndDraw: function () {
        let i, j;
        let q, rotateMatrix, translateMatrix, transformMatrix, axesTransformMatrix;
        
        this.cam = Camera.getLookAt(this.wheelDelta, -this.xRot, -this.yRot);
        this.proj = Camera.getProjMatrix();

        this.gl.uniform4f(this.u_LightPosition, Camera.x0, Camera.y0, Camera.z0, 1.0);

        this.gl.uniform1f(this.u_drawPolygon, false);

        // Clear <canvas>
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.setAxes();
        this.create_coord_tip();
        this.create_indexes_tip();
        
        // Bind the buffer object to target
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferAxes);
        // Write date into the buffer object
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesAxes, this.gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Position variable
        this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        this.gl.enableVertexAttribArray(this.a_Position);
        // Disable the assignment to a_select variable
        this.gl.disableVertexAttribArray(this.a_select);
        // Disable the assignment to a_normal variable
        this.gl.disableVertexAttribArray(this.a_normal);
        
        const axes_scale = 0.1;     // lower-right basis vectors size
        const half_axes_scale_length = 1.5 * (this.verticesAxes[17] - this.verticesAxes[14]) * axes_scale / 2;
        const scaleMatrix = mat4.fromScaling(mat4.create(), [axes_scale, axes_scale, axes_scale]);
        translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(
		    this.verticesAxes[3] - half_axes_scale_length, //x_max - half_axes_scale_length
           -this.verticesAxes[10] + half_axes_scale_length, //-y_max + half_axes_scale_length 
        	this.verticesAxes[17] - half_axes_scale_length)); //z_max - half_axes_scale_length 
		    transformMatrix = mat4.mul(mat4.create(), scaleMatrix, this.world);
		    transformMatrix = mat4.mul(mat4.create(), this.cam, transformMatrix);
		    transformMatrix = mat4.mul(mat4.create(), translateMatrix, transformMatrix);
		    transformMatrix = mat4.mul(mat4.create(), this.proj, transformMatrix);
		    this.gl.uniformMatrix4fv(this.u_mvpMatrix, false, transformMatrix);
        
        // Draw lower-right basis
        this.gl.uniform4f(this.u_color, 1.0, 0.0, 0.0, 1.0);
        this.gl.drawArrays(this.gl.LINES, 0, 2);
        this.gl.uniform4f(this.u_color, 0.0, 1.0, 0.0, 1.0);
        this.gl.drawArrays(this.gl.LINES, 2, 2);
        this.gl.uniform4f(this.u_color, 0.0, 0.0, 1.0, 1.0);
        this.gl.drawArrays(this.gl.LINES, 4, 2);
        
        const countTipIndices = (this.nLatitudes - 1) * this.nLongitudes * 2 * 3;
        // Bind the buffer object to target
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferAxesTip);
        // Write date into the buffer object
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesAxesTip, this.gl.DYNAMIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferAxesTip);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesAxesTip, this.gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Position variable
        this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        this.gl.enableVertexAttribArray(this.a_Position);
        // Disable the assignment to a_select variable
        this.gl.disableVertexAttribArray(this.a_select);
        // Disable the assignment to a_normal variable
        this.gl.disableVertexAttribArray(this.a_normal);
        this.gl.uniform4f(this.u_color, 0.0, 0.0, 0.0, 1.0);

				for (i=0; i<3; i++) {
						switch (i) {
						case 0:
        				q = quat.rotationTo(quat.create(), [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]);
		        		translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(this.verticesAxes[3], this.verticesAxes[4], this.verticesAxes[5])); //x_max
								break;
						case 1:
        				q = quat.rotationTo(quat.create(), [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]);
		        		translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(this.verticesAxes[9], this.verticesAxes[10], this.verticesAxes[11])); //y_max
								break;
						case 2:
        				q = quat.rotationTo(quat.create(), [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]);
		        		translateMatrix = mat4.fromTranslation(mat4.create(), vec3.fromValues(this.verticesAxes[15], this.verticesAxes[16], this.verticesAxes[17])); //z_max
								break;
						}
		        rotateMatrix = mat4.fromQuat(mat4.create(), q);
		        axesTransformMatrix = mat4.mul(mat4.create(), translateMatrix, rotateMatrix);
		        axesTransformMatrix = mat4.mul(mat4.create(), transformMatrix, axesTransformMatrix);
		        this.gl.uniformMatrix4fv(this.u_mvpMatrix, false, axesTransformMatrix);
		        this.gl.drawElements(this.gl.TRIANGLES, countTipIndices, this.gl.UNSIGNED_SHORT, 0);
            
        }
        
        const mvMatr = mat4.mul(mat4.create(), this.cam, this.world);
        const mvpMatr = mat4.mul(mat4.create(), this.proj, mvMatr);
        
        this.gl.uniformMatrix4fv(this.u_mvpMatrix, false, mvpMatr);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCtr);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesCtr, this.gl.DYNAMIC_DRAW);
        this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, this.FSIZE * 4, 0);
        this.gl.enableVertexAttribArray(this.a_Position);
        this.gl.vertexAttribPointer(this.a_select, 1, this.gl.FLOAT, false, this.FSIZE * 4, this.FSIZE * 3);
        this.gl.enableVertexAttribArray(this.a_select);
        this.gl.disableVertexAttribArray(this.a_normal);

        this.gl.uniform4f(this.u_color, 0.0, 0.0, 0.0, 1.0);
        this.gl.uniform4f(this.u_colorSelect, 0.5, 0.5, 0.0, 1.0);
        this.gl.uniform1f(this.u_pointSize, 4.0);
        this.gl.uniform1f(this.u_pointSizeSelect, 7.0);

        // Draw 
		for(let k = 0; k < 6; ++k)
			for (i = 0; i < this.N_ctr.value; i++)
				for (j = 0; j < this.M_ctr.value; j++) {
					if ((i > 0) && (i < this.N_ctr.value-1) && (j > 0) && (j < this.M_ctr.value-1))
									continue;
					this.pointsCtr[k][i][j].calculateWindowCoordinates(mvpMatr, this.viewport);
					
				}
		if (this.showControlPoints)
			this.gl.drawArrays(this.gl.POINTS, 0, 6 * this.M_ctr.value * this.N_ctr.value);



        if (this.drawControlPolygon) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferCtr);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesCtr, this.gl.DYNAMIC_DRAW);
			for (let k = 0; k < 7 ; k=k+2)
			{
				this.gl.uniform4f(this.u_color, 0.0, 1.0, 0.0, 1.0);
				this.gl.uniform4f(this.u_colorSelect, 0.0, 1.0, 0.0, 1.0);
				this.gl.drawElements(this.gl.LINE_STRIP, this.M_ctr.value, this.gl.UNSIGNED_SHORT, (k * this.N_ctr.value * this.M_ctr.value) * this.ISIZE); // k * this.N_ctr.value * this.M_ctr.value
				
				this.gl.uniform4f(this.u_color, 0.0, 1.0, 1.0, 1.0);
				this.gl.uniform4f(this.u_colorSelect, 0.0, 1.0, 1.0, 1.0);
				this.gl.drawElements(this.gl.LINE_STRIP, this.M_ctr.value, this.gl.UNSIGNED_SHORT, ( k * this.N_ctr.value * this.M_ctr.value + (this.N_ctr.value-1) * this.M_ctr.value) * this.ISIZE);



				this.gl.uniform4f(this.u_color, 0.0, 0.0, 1.0, 1.0);
				this.gl.uniform4f(this.u_colorSelect, 0.0, 0.0, 1.0, 1.0);
				this.gl.drawElements(this.gl.LINE_STRIP, this.N_ctr.value, this.gl.UNSIGNED_SHORT, ((k * this.N_ctr.value * this.M_ctr.value +  this.N_ctr.value * this.M_ctr.value) * this.ISIZE));
				
				this.gl.uniform4f(this.u_color, 1.0, 0.0, 1.0, 1.0);
				this.gl.uniform4f(this.u_colorSelect, 1.0, 0.0, 1.0, 1.0);
				this.gl.drawElements(this.gl.LINE_STRIP, this.N_ctr.value, this.gl.UNSIGNED_SHORT, ((k * this.N_ctr.value * this.M_ctr.value +  this.N_ctr.value * this.M_ctr.value + (this.M_ctr.value-1) * this.N_ctr.value) * this.ISIZE));
			}
		}
		


        if (this.drawCoonsLinearSurface) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferSpline);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesSpline, this.gl.DYNAMIC_DRAW);
            this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, this.FSIZE * 6, 0);
            this.gl.vertexAttribPointer(this.a_normal, 3, this.gl.FLOAT, false, this.FSIZE * 6, this.FSIZE * 3);

            this.gl.enableVertexAttribArray(this.a_Position);
            this.gl.disableVertexAttribArray(this.a_select);
            this.gl.enableVertexAttribArray(this.a_normal);

            this.gl.uniform4f(this.u_color, 1.0, 0.0, 0.0, 1.0);
            this.gl.uniform1f(this.u_pointSize, 5.);
            //points
            if (this.visualizeSplineWithPoints)
                this.gl.drawArrays(this.gl.POINTS, 0, 6 * this.N.value * this.M.value);
            //lines
            if (this.visualizeSplineWithLines) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineLines);
				for (let l = 0; l < 6; ++l)
				{
					this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineLines[l], this.gl.DYNAMIC_DRAW);
					this.gl.uniform4f(this.u_color, 1.0, 0.0, 0.0, 1.0);
					for (i = 0; i < this.N.value; i++)
						this.gl.drawElements(this.gl.LINE_STRIP, this.M.value, this.gl.UNSIGNED_SHORT, ((i * this.M.value) * this.ISIZE));
					
					this.gl.uniform4f(this.u_color, 1.0, 0., 0., 1.0);
					for (j = 0; j < this.M.value; j++)
						this.gl.drawElements(this.gl.LINE_STRIP, this.N.value, this.gl.UNSIGNED_SHORT, ((this.N.value * this.M.value + j * this.N.value) * this.ISIZE));
				}
			}
            //surface
            if (this.visualizeSplineWithSurface) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineSurface);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineSurface, this.gl.DYNAMIC_DRAW);

                this.gl.uniform1f(this.u_drawPolygon, true);
                this.gl.depthMask(false);
                this.gl.enable(this.gl.BLEND);
                this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                this.gl.uniform4f(this.u_color, 0., 0.2775, 0.2775, this.alpha.value);
                this.gl.drawElements(this.gl.TRIANGLES, 6 * 6 * (this.N.value - 1) * (this.M.value - 1), this.gl.UNSIGNED_SHORT, 0);
                this.gl.disable(this.gl.BLEND);
                this.gl.depthMask(true);
            }
			
			
			
			// MESH
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferMesh);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesMesh, this.gl.DYNAMIC_DRAW);
            this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, this.FSIZE * 6, 0);
            this.gl.vertexAttribPointer(this.a_normal, 3, this.gl.FLOAT, false, this.FSIZE * 6, this.FSIZE * 3);

            this.gl.enableVertexAttribArray(this.a_Position);
            this.gl.disableVertexAttribArray(this.a_select);
            this.gl.enableVertexAttribArray(this.a_normal);
			
			//points
            if (this.visualizeMeshWithPoints) {
				this.gl.uniform4f(this.u_color, 0, 0, 1., 1.0);
				// this.gl.uniform1f(this.u_pointSize, 3.7);
                this.gl.drawArrays(this.gl.POINTS, 0, 6 * this.N.value * this.M.value);
			}
			
            //lines
            if (this.visualizeMeshWithLines) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineLines);
				for (let l = 0; l < 6; ++l) {
					this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineLines[l], this.gl.DYNAMIC_DRAW);

					this.gl.uniform4f(this.u_color, 0.16, 0.47, 0.08, 1.0);

					for (i = 0; i < this.N.value; i++)
						this.gl.drawElements(this.gl.LINE_STRIP, this.M.value, this.gl.UNSIGNED_SHORT, ((i * this.M.value) * this.ISIZE));

					this.gl.uniform4f(this.u_color, 0.16, 0.47, 0.08, 1.0);

					for (j = 0; j < this.M.value; j++)
						this.gl.drawElements(this.gl.LINE_STRIP, this.N.value, this.gl.UNSIGNED_SHORT, ((this.N.value * this.M.value + j * this.N.value) * this.ISIZE));
				}
            }
			
            //surface
            if (this.visualizeMeshWithSurface) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineSurface);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineSurface, this.gl.DYNAMIC_DRAW);

                this.gl.uniform1f(this.u_drawPolygon, true);
                this.gl.depthMask(false);
                this.gl.enable(this.gl.BLEND);
                this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                this.gl.uniform4f(this.u_color, 0.59, 0.16, 0.7, this.alpha.value);
                this.gl.drawElements(this.gl.TRIANGLES, 6 * 6 * (this.N.value - 1) * (this.M.value - 1), this.gl.UNSIGNED_SHORT, 0);
                this.gl.disable(this.gl.BLEND);
                this.gl.depthMask(true);
            }
        }
    },
	
    plotMode: function (selOption) {
        switch (selOption) {
            case 1:
                this.drawCoonsLinearSurface = !this.drawCoonsLinearSurface;
				
                if (this.drawCoonsLinearSurface) {
                    this.calculateCoonsLinearSurface();
					this.calculateMechanicalMesh();
				}
                break;
            case 2:
                if (this.drawCoonsLinearSurface) {
                    this.calculateCoonsLinearSurface();
					this.calculateMechanicalMesh();
				}
                break;
            case 3:
                this.drawControlPolygon = !this.drawControlPolygon;
                break;
            case 4:
                this.visualizeSplineWithPoints = !this.visualizeSplineWithPoints;
                break;
            case 5:
                this.visualizeSplineWithLines = !this.visualizeSplineWithLines;
                break;
            case 6:
                this.visualizeSplineWithSurface = !this.visualizeSplineWithSurface;
                break;
			case 7:
                this.visualizeMeshWithPoints = !this.visualizeMeshWithPoints;
                break;
			case 8:
                this.visualizeMeshWithLines = !this.visualizeMeshWithLines;
                break;
			case 9:
                this.visualizeMeshWithSurface = !this.visualizeMeshWithSurface;
                break;
            case 10:
                this.showControlPoints = !this.showControlPoints;
                break;
			case 11:
				if(this.drawCoonsLinearSurface)
					this.calculateMechanicalMesh();
				break;
        }
        this.setVertexBuffersAndDraw();
    },
	
	step: function(l, dim, i, j) {
		switch(l)
		{
			case 0:
			case 2:
				return dim == 1 ? this.h(l, i, j) : this.d(l, i, j);
				break;
			case 1:
			case 3:
				return dim == 1 ? this.h(l, i, j) : this.g(l, i, j);
				break;
			case 4:
			case 5:
				return dim == 1 ? this.g(l, i, j) : this.d(l, i, j);
		}
	},
	
	derivarive: function(l, dim, ii, jj) {
		switch(l)
		{
			case 0:
			case 2:
				return dim == 1 ? this.pointsCtr[l][ii][jj].u : this.pointsCtr[l][ii][jj].v;
				break;
			case 1:
			case 3:
				return dim == 1 ? this.pointsCtr[l][ii][jj].u : this.pointsCtr[l][ii][jj].t;
				break;
			case 4:
			case 5:
				return dim == 1 ? this.pointsCtr[l][ii][jj].t : this.pointsCtr[l][ii][jj].v;
		}
	},
	
	components_normals: function(l, i, j, normal){
		switch(l)
		{
			case 0:
				return this.normalsSpline[l][i][j][0] = normal[0],
				 this.normalsSpline[l][i][j][1] = normal[1],
				 this.normalsSpline[l][i][j][2] = -normal[2];
				break;
			case 1:
				return this.normalsSpline[l][i][j][0] = normal[0],
				 this.normalsSpline[l][i][j][1] = -normal[1],
				 this.normalsSpline[l][i][j][2] = normal[2];
				break;
			case 4:
				return this.normalsSpline[l][i][j][0] = -normal[0],
				 this.normalsSpline[l][i][j][1] = normal[1],
				 this.normalsSpline[l][i][j][2] = normal[2]; 
				break;
			case 2:
			case 3:
			case 5:
				return this.normalsSpline[l][i][j][0] = normal[0],
				 this.normalsSpline[l][i][j][1] = normal[1],
				 this.normalsSpline[l][i][j][2] = normal[2];
				break;
		}
	},	

	initial_parameters: function(l, dim, i) {
		switch(l)
		{
			case 0:
			case 2:
				return dim == 1 ? this.Xmin + i * (this.Xmax - this.Xmin) / (this.N.value - 1) - this.Xmid : this.Ymin + i * (this.Ymax - this.Ymin) / (this.M.value - 1) - this.Ymid;
				break;
			case 1:
			case 3:
				return dim == 1 ? this.Xmin + i * (this.Xmax - this.Xmin) / (this.N.value - 1) - this.Xmid : this.Zmin + i * (this.Zmax - this.Zmin) / (this.M.value - 1) - this.Zmid;
				break;
			case 4:
			case 5:
				return dim == 1 ? this.Zmin + i * (this.Zmax - this.Zmin) / (this.N.value - 1) - this.Zmid : this.Ymin + i * (this.Ymax - this.Ymin) / (this.M.value - 1) - this.Ymid;
		}
	},	
	
	splinePoints_parameters: function(l, dim, i, j) {
		switch(l)
		{
			case 0:
			case 2:
				return dim == 1 ? this.pointsSpline[l][i][j].x : this.pointsSpline[l][i][j].y;
				break;
			case 1:
			case 3:
				return dim == 1 ? this.pointsSpline[l][i][j].x : this.pointsSpline[l][i][j].z;
				break;
			case 4:
			case 5:
				return dim == 1 ? this.pointsSpline[l][i][j].z : this.pointsSpline[l][i][j].y;
		}
	},
	
	h: function(l, i, j) {																		
		return (this.pointsCtr[l][i + 1][j].u - this.pointsCtr[l][i][j].u);		
	},
	
	d: function(l, i, j) {															
		return (this.pointsCtr[l][i][j + 1].v - this.pointsCtr[l][i][j].v);		
	},
	
	g: function(l, i, j) {		
		switch (l)
		{
			case 1:
			case 3:
				return (this.pointsCtr[l][i][j + 1].t - this.pointsCtr[l][i][j].t);
				break;
			case 4:
			case 5:
				return (this.pointsCtr[l][i + 1][j].t - this.pointsCtr[l][i][j].t);
		}	
	},
	
	triDiagonalMatrixAlgorithm: function(A, B, C, D, size) {				// Алгоритм прогонки					
                                                                            // A - элементы под главной диагональю матрицы СЛАУ	
		let alpha = new Array(size);										// B - элементы на главной диагонали матрицы СЛАУ
		let beta = new Array(size);											// C - элементы над главной диагональю матрицы СЛАУ
																			// D - элементы правой части СЛАУ
		alpha[0] = -C[0]/B[0];												// size - размерность матрицы СЛАУ
		beta[0] = D[0]/B[0];
		
		for(let i = 1; i < size; ++i)
		{
			alpha[i] = -C[i] / (B[i] + A[i] * alpha[i-1]);
			beta[i] = (-A[i] * beta[i-1] + D[i]) / (A[i] * alpha[i-1] + B[i]);
		}
		for(let i = size - 2; i > -1; --i)
		{
			beta[i] += alpha[i] * beta[i + 1];
		}
		
		return beta;
	},
	
    calculateCoonsLinearSurface: function () {
        let i, j, d1 = 0, d2 = 0, d3 = 0, d4 = 0;

        const N_ctr = this.N_ctr.value;
        const M_ctr = this.M_ctr.value;
        const N = this.N.value;
        const M = this.M.value;
		
		
		for (i = 0; i < N_ctr; ++i)
		{
			for (j = 0; j < M_ctr; ++j)
			{						
				if(j == 0 || j == M_ctr - 1)
				{
					this.pointsCtr[0][i][j].u = i / (N_ctr - 1);
					this.pointsCtr[2][i][j].u = i / (N_ctr - 1);
					
					this.pointsCtr[1][i][j].u = i / (N_ctr - 1);
					this.pointsCtr[3][i][j].u = i / (N_ctr - 1);
					
					this.pointsCtr[4][i][j].t = i / (N_ctr - 1);
					this.pointsCtr[5][i][j].t = i / (N_ctr - 1);
				}
					
				if(i == 0 || i == N_ctr - 1) 
				{
					this.pointsCtr[0][i][j].v = j / (M_ctr - 1);
					this.pointsCtr[2][i][j].v = j / (M_ctr - 1);
					
					this.pointsCtr[1][i][j].t = j / (M_ctr - 1);
					this.pointsCtr[3][i][j].t = j / (M_ctr - 1);
					
					this.pointsCtr[4][i][j].v = j / (M_ctr - 1);
					this.pointsCtr[5][i][j].v = j / (M_ctr - 1);
				}
				
			}
		}

		let surf = 6;

        this.pointsSpline = new Array(6);
		let derivateSpline = new Array(6);		
        this.normalsSpline = new Array(6);
		
		for (let l = 0; l < surf; ++l)
		{
			this.pointsSpline[l] = new Array(N);
			this.normalsSpline[l] = new Array(N);
			derivateSpline[l] = new Array(N);
			
			for (i = 0; i < N; i++) 
			{
				this.pointsSpline[l][i] = new Array(M);
				this.normalsSpline[l][i] = new Array(M);
				derivateSpline[l][i] = new Array(M);
				
				for (j = 0; j < M; j++) 
				{
					this.normalsSpline[l][i][j] = new Array(3);
					derivateSpline[l][i][j] = new Array(2); // 0,2 - u,v; 1,3 - u,t; 4,5 - t,v;  
				}
			}
        }

		this.verticesSpline = new Float32Array(N * M * 36);
		
		for (let l = 0; l < surf ; ++l)              // Алгоритм нахождения 2 производной 	
		{				
			let a_coef = new Array(N_ctr - 2);		// 1 шаг алгоритма (2-ая производная по param1)
			let b_coef = new Array(N_ctr - 2);
			let c_coef = new Array(N_ctr - 2);
			let d_coef_x = new Array(N_ctr - 2);
			let d_coef_y = new Array(N_ctr - 2);
			let d_coef_z = new Array(N_ctr - 2);
			
			let lambda = 0;
			let mu = 0;
			
			for(let j = 0; j < M_ctr; j += M_ctr - 1) 
			{
				a_coef[0] = 0;
				b_coef[0] = this.step(l, 1, 0, j) + 2 * this.step(l, 1, 1, j);
				c_coef[0] = this.step(l, 1, 1, j) - this.step(l, 1, 0, j);
				
				lambda = this.step(l,1,1,j)/(this.step(l,1,1,j) + this.step(l,1,0,j));
				
				d_coef_x[0] = lambda * ((this.pointsCtr[l][2][j].x - this.pointsCtr[l][1][j].x) / this.step(l,1,1,j) - (this.pointsCtr[l][1][j].x - this.pointsCtr[l][0][j].x) / this.step(l,1,0,j)); 
				d_coef_y[0] = lambda * ((this.pointsCtr[l][2][j].y - this.pointsCtr[l][1][j].y) / this.step(l,1,1,j) - (this.pointsCtr[l][1][j].y - this.pointsCtr[l][0][j].y) / this.step(l,1,0,j)); 
				d_coef_z[0] = lambda * ((this.pointsCtr[l][2][j].z - this.pointsCtr[l][1][j].z) / this.step(l,1,1,j) - (this.pointsCtr[l][1][j].z - this.pointsCtr[l][0][j].z) / this.step(l,1,0,j)); 
				
				for(let i = 1; i < N_ctr - 3; ++i)
				{			
					a_coef[i] = this.step(l,1,i,j);
					b_coef[i] = 2 * (this.step(l,1,i,j) + this.step(l,1,i+1,j));
					c_coef[i] = this.step(l,1,i+1,j);
					
					d_coef_x[i] = ((this.pointsCtr[l][i + 1][j].x - this.pointsCtr[l][i][j].x) / this.step(l,1,i,j) - (this.pointsCtr[l][i][j].x - this.pointsCtr[l][i - 1][j].x) / this.step(l,1,i - 1,j));
					d_coef_y[i] = ((this.pointsCtr[l][i + 1][j].y - this.pointsCtr[l][i][j].y) / this.step(l,1,i,j) - (this.pointsCtr[l][i][j].y - this.pointsCtr[l][i - 1][j].y) / this.step(l,1,i - 1,j));
					d_coef_z[i] = ((this.pointsCtr[l][i + 1][j].z - this.pointsCtr[l][i][j].z) / this.step(l,1,i,j) - (this.pointsCtr[l][i][j].z - this.pointsCtr[l][i - 1][j].z) / this.step(l,1,i - 1,j));
				}
				
				a_coef[N_ctr - 3] = this.step(l,1,N_ctr - 3,j) - this.step(l,1,N_ctr - 2,j);
				b_coef[N_ctr - 3] = 2 * this.step(l,1,N_ctr - 3,j) + this.step(l,1,N_ctr - 2,j);
				c_coef[N_ctr - 3] = 0;
				
				mu = this.step(l,1,N_ctr - 3,j) / (this.step(l,1,N_ctr - 2,j) + this.step(l,1,N_ctr - 3,j));
				
				d_coef_x[N_ctr - 3] = mu * ((this.pointsCtr[l][N_ctr - 1][j].x - this.pointsCtr[l][N_ctr - 2][j].x) / this.step(l,1,N_ctr - 2,j) - (this.pointsCtr[l][N_ctr - 2][j].x - this.pointsCtr[l][N_ctr - 3][j].x) / this.step(l,1,N_ctr - 3,j)); 
				d_coef_y[N_ctr - 3] = mu * ((this.pointsCtr[l][N_ctr - 1][j].y - this.pointsCtr[l][N_ctr - 2][j].y) / this.step(l,1,N_ctr - 2,j) - (this.pointsCtr[l][N_ctr - 2][j].y - this.pointsCtr[l][N_ctr - 3][j].y) / this.step(l,1,N_ctr - 3,j)); 
				d_coef_z[N_ctr - 3] = mu * ((this.pointsCtr[l][N_ctr - 1][j].z - this.pointsCtr[l][N_ctr - 2][j].z) / this.step(l,1,N_ctr - 2,j) - (this.pointsCtr[l][N_ctr - 2][j].z - this.pointsCtr[l][N_ctr - 3][j].z) / this.step(l,1,N_ctr - 3,j)); 
				
				let m20_x = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef_x, N_ctr - 2);
				let m20_y = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef_y, N_ctr - 2);
				let m20_z = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef_z, N_ctr - 2);
				
				for(let i = 1; i < N_ctr - 1; i++)
				{
					this.m20Ctr[l][i][j].x = m20_x[i - 1];
					this.m20Ctr[l][i][j].y = m20_y[i - 1];
					this.m20Ctr[l][i][j].z = m20_z[i - 1];
				}
				
				this.m20Ctr[l][0][j].x = ((this.step(l,1,0,j) + this.step(l,1,1,j)) * this.m20Ctr[l][1][j].x - this.step(l,1,0,j) * this.m20Ctr[l][2][j].x) / this.step(l,1,1,j);
				this.m20Ctr[l][0][j].y = ((this.step(l,1,0,j) + this.step(l,1,1,j)) * this.m20Ctr[l][1][j].y - this.step(l,1,0,j) * this.m20Ctr[l][2][j].y) / this.step(l,1,1,j);
				this.m20Ctr[l][0][j].z = ((this.step(l,1,0,j) + this.step(l,1,1,j)) * this.m20Ctr[l][1][j].z - this.step(l,1,0,j) * this.m20Ctr[l][2][j].z) / this.step(l,1,1,j);
				
				this.m20Ctr[l][N_ctr - 1][j].x = ((this.step(l,1,N_ctr - 3,j) + this.step(l,1,N_ctr - 2,j)) * this.m20Ctr[l][N_ctr - 2][j].x - this.step(l,1,N_ctr - 2,j) * this.m20Ctr[l][N_ctr - 3][j].x) / this.step(l,1,N_ctr - 3,j);
				this.m20Ctr[l][N_ctr - 1][j].y = ((this.step(l,1,N_ctr - 3,j) + this.step(l,1,N_ctr - 2,j)) * this.m20Ctr[l][N_ctr - 2][j].y - this.step(l,1,N_ctr - 2,j) * this.m20Ctr[l][N_ctr - 3][j].y) / this.step(l,1,N_ctr - 3,j);
				this.m20Ctr[l][N_ctr - 1][j].z = ((this.step(l,1,N_ctr - 3,j) + this.step(l,1,N_ctr - 2,j)) * this.m20Ctr[l][N_ctr - 2][j].z - this.step(l,1,N_ctr - 2,j) * this.m20Ctr[l][N_ctr - 3][j].z) / this.step(l,1,N_ctr - 3,j);
			}
			
			a_coef = new Array(M_ctr - 2); // 2 шаг алгоритма (2-ая производная по param2)
			b_coef = new Array(M_ctr - 2);
			c_coef = new Array(M_ctr - 2);
			d_coef_x = new Array(M_ctr - 2);
			d_coef_y = new Array(M_ctr - 2);
			d_coef_z = new Array(M_ctr - 2);
			
			for(let i = 0; i < N_ctr; i += N_ctr - 1)
			{
				a_coef[0] = 0;
				b_coef[0] = this.step(l,2,i,0) + 2 * this.step(l,2,i,1);
				c_coef[0] = this.step(l,2,i,1) - this.step(l,2,i,0);
				
				lambda = this.step(l,2,i,1)/(this.step(l,2,i,1) + this.step(l,2,i,0));
				
				d_coef_x[0] = lambda * ((this.pointsCtr[l][i][2].x - this.pointsCtr[l][i][1].x) / this.step(l,2,i,1) - (this.pointsCtr[l][i][1].x - this.pointsCtr[l][i][0].x) / this.step(l,2,i,0)); 
				d_coef_y[0] = lambda * ((this.pointsCtr[l][i][2].y - this.pointsCtr[l][i][1].y) / this.step(l,2,i,1) - (this.pointsCtr[l][i][1].y - this.pointsCtr[l][i][0].y) / this.step(l,2,i,0)); 
				d_coef_z[0] = lambda * ((this.pointsCtr[l][i][2].z - this.pointsCtr[l][i][1].z) / this.step(l,2,i,1) - (this.pointsCtr[l][i][1].z - this.pointsCtr[l][i][0].z) / this.step(l,2,i,0)); 

				for(let j = 1; j < M_ctr - 3; ++j)
				{
					a_coef[j] = this.step(l,2,i,j);
					b_coef[j] = 2 * (this.step(l,2,i,j) + this.step(l,2,i,j+1));
					c_coef[j] = this.step(l,2,i,j+1);
					
					d_coef_x[j] = ((this.pointsCtr[l][i][j + 1].x - this.pointsCtr[l][i][j].x) / this.step(l,2,i,j) - (this.pointsCtr[l][i][j].x - this.pointsCtr[l][i][j - 1].x) / this.step(l,2,i,j - 1));
					d_coef_y[j] = ((this.pointsCtr[l][i][j + 1].y - this.pointsCtr[l][i][j].y) / this.step(l,2,i,j) - (this.pointsCtr[l][i][j].y - this.pointsCtr[l][i][j - 1].y) / this.step(l,2,i,j - 1));
					d_coef_z[j] = ((this.pointsCtr[l][i][j + 1].z - this.pointsCtr[l][i][j].z) / this.step(l,2,i,j) - (this.pointsCtr[l][i][j].z - this.pointsCtr[l][i][j - 1].z) / this.step(l,2,i,j - 1));
				}
		
				a_coef[M_ctr - 3] = this.step(l,2,i,M_ctr - 3) - this.step(l,2,i,M_ctr - 2);
				b_coef[M_ctr - 3] = 2 * this.step(l,2,i,M_ctr - 3) + this.step(l,2,i,M_ctr - 2);
				c_coef[M_ctr - 3] = 0;
				
				mu = this.step(l,2,i,M_ctr - 3)/(this.step(l,2,i,M_ctr - 2) + this.step(l,2,i,M_ctr - 3));
				
				d_coef_x[M_ctr - 3] = mu * ((this.pointsCtr[l][i][M_ctr - 1].x - this.pointsCtr[l][i][M_ctr - 2].x) / this.step(l,2,i,M_ctr - 2) - (this.pointsCtr[l][i][M_ctr - 2].x - this.pointsCtr[l][i][M_ctr - 3].x) / this.step(l,2,i,M_ctr - 3)); 
				d_coef_y[M_ctr - 3] = mu * ((this.pointsCtr[l][i][M_ctr - 1].y - this.pointsCtr[l][i][M_ctr - 2].y) / this.step(l,2,i,M_ctr - 2) - (this.pointsCtr[l][i][M_ctr - 2].y - this.pointsCtr[l][i][M_ctr - 3].y) / this.step(l,2,i,M_ctr - 3)); 
				d_coef_z[M_ctr - 3] = mu * ((this.pointsCtr[l][i][M_ctr - 1].z - this.pointsCtr[l][i][M_ctr - 2].z) / this.step(l,2,i,M_ctr - 2) - (this.pointsCtr[l][i][M_ctr - 2].z - this.pointsCtr[l][i][M_ctr - 3].z) / this.step(l,2,i,M_ctr - 3)); 

				
				let m02_x = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef_x, M_ctr - 2);
				let m02_y = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef_y, M_ctr - 2);
				let m02_z = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef_z, M_ctr - 2);
				
				for(let j = 1; j < M_ctr - 1; j++)
				{
					this.m02Ctr[l][i][j].x = m02_x[j - 1];
					this.m02Ctr[l][i][j].y = m02_y[j - 1];
					this.m02Ctr[l][i][j].z = m02_z[j - 1];
				}
				
				this.m02Ctr[l][i][0].x = ((this.step(l,2,i,0) + this.step(l,2,i,1)) * this.m02Ctr[l][i][1].x - this.step(l,2,i,0) * this.m02Ctr[l][i][2].x) / this.step(l,2,i,1);
				this.m02Ctr[l][i][0].y = ((this.step(l,2,i,0) + this.step(l,2,i,1)) * this.m02Ctr[l][i][1].y - this.step(l,2,i,0) * this.m02Ctr[l][i][2].y) / this.step(l,2,i,1);
				this.m02Ctr[l][i][0].z = ((this.step(l,2,i,0) + this.step(l,2,i,1)) * this.m02Ctr[l][i][1].z - this.step(l,2,i,0) * this.m02Ctr[l][i][2].z) / this.step(l,2,i,1);
				
				this.m02Ctr[l][i][M_ctr - 1].x = ((this.step(l,2,i,M_ctr - 3) + this.step(l,2,i,M_ctr - 2)) * this.m02Ctr[l][i][M_ctr - 2].x - this.step(l,2,i,M_ctr - 2) * this.m02Ctr[l][i][M_ctr - 3].x) / this.step(l,2,i,M_ctr - 3);
				this.m02Ctr[l][i][M_ctr - 1].y = ((this.step(l,2,i,M_ctr - 3) + this.step(l,2,i,M_ctr - 2)) * this.m02Ctr[l][i][M_ctr - 2].y - this.step(l,2,i,M_ctr - 2) * this.m02Ctr[l][i][M_ctr - 3].y) / this.step(l,2,i,M_ctr - 3);
				this.m02Ctr[l][i][M_ctr - 1].z = ((this.step(l,2,i,M_ctr - 3) + this.step(l,2,i,M_ctr - 2)) * this.m02Ctr[l][i][M_ctr - 2].z - this.step(l,2,i,M_ctr - 2) * this.m02Ctr[l][i][M_ctr - 3].z) / this.step(l,2,i,M_ctr - 3);

			}
			
			// расчет производных по двум переменным в точках сплайна
			let param1 = 0, param2 = 0;
			let ii = 0, jj = 0;
			const d_p1 = (this.derivarive(l, 1, N_ctr - 1, 0) - this.derivarive(l, 1, 0, 0)) / (N - 1);
			const d_p2 = (this.derivarive(l, 2, 0, M_ctr - 1) - this.derivarive(l, 2, 0, 0)) / (M - 1);
			// const du = 1.0 / (N - 1), dv =  1.0 / (M - 1);
			let xr, yr, zr;

			for (i = 0; i < N; i++)
			{
				for (j = 0; j < M; j += M - 1)
				{
					jj = j == 0 ? 0 : M_ctr - 1;
					
					xr = this.m20Ctr[l][ii][jj].x * (this.derivarive(l, 1, ii+1, jj) - param1)**3 / (this.step(l,1,ii,jj)) + 
						 this.m20Ctr[l][ii+1][jj].x * (param1 - this.derivarive(l, 1, ii, jj))**3 / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj].x - this.m20Ctr[l][ii][jj].x * this.step(l,1,ii,jj)**2) * (this.derivarive(l, 1, ii+1, jj) - param1) / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii+1][jj].x - this.m20Ctr[l][ii + 1][jj].x * this.step(l,1,ii,jj)**2) * (param1 - this.derivarive(l, 1, ii, jj)) / (this.step(l,1,ii,jj));
					
					yr = this.m20Ctr[l][ii][jj].y * (this.derivarive(l, 1, ii+1, jj)- param1)**3 / (this.step(l,1,ii,jj)) + 
						 this.m20Ctr[l][ii+1][jj].y * (param1 - this.derivarive(l, 1, ii, jj))**3 / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj].y - this.m20Ctr[l][ii][jj].y * this.step(l,1,ii,jj)**2) * (this.derivarive(l, 1, ii+1, jj) - param1) / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii+1][jj].y - this.m20Ctr[l][ii + 1][jj].y * this.step(l,1,ii,jj)**2) * (param1 - this.derivarive(l, 1, ii, jj)) / (this.step(l,1,ii,jj));
					
					zr = this.m20Ctr[l][ii][jj].z * (this.derivarive(l, 1, ii+1, jj) - param1)**3 / (this.step(l,1,ii,jj)) + 
						 this.m20Ctr[l][ii+1][jj].z * (param1 - this.derivarive(l, 1, ii, jj))**3 / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj].z - this.m20Ctr[l][ii][jj].z * this.step(l,1,ii,jj)**2) * (this.derivarive(l,1,ii+1,jj) - param1) / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii+1][jj].z - this.m20Ctr[l][ii + 1][jj].z * this.step(l,1,ii,jj)**2) * (param1 - this.derivarive(l, 1, ii, jj)) / (this.step(l,1,ii,jj));
					
					let pt = new Point(xr, yr, zr);
					this.pointsSpline[l][i][j] = pt;
					
					xr = -3 * this.m20Ctr[l][ii][jj].x * (this.derivarive(l, 1, ii+1, jj) - param1)**2 / (this.step(l,1,ii,jj)) + 
						 3 * this.m20Ctr[l][ii+1][jj].x * (param1 - this.derivarive(l, 1, ii, jj))**2 / (this.step(l,1,ii,jj)) -
						 (this.pointsCtr[l][ii][jj].x - this.m20Ctr[l][ii][jj].x * this.step(l,1,ii,jj)**2) / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii+1][jj].x - this.m20Ctr[l][ii + 1][jj].x * this.step(l,1,ii,jj)**2) / (this.step(l,1,ii,jj));
					
					yr = -3 * this.m20Ctr[l][ii][jj].y * (this.derivarive(l, 1, ii+1, jj) - param1)**2 / (this.step(l,1,ii,jj)) + 
						 3 * this.m20Ctr[l][ii+1][jj].y * (param1 - this.derivarive(l, 1, ii, jj))**2 / (this.step(l,1,ii,jj)) - 
						 (this.pointsCtr[l][ii][jj].y - this.m20Ctr[l][ii][jj].y * this.step(l,1,ii,jj)**2) / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii+1][jj].y - this.m20Ctr[l][ii + 1][jj].y * this.step(l,1,ii,jj)**2) / (this.step(l,1,ii,jj));
					
					zr = -3 * this.m20Ctr[l][ii][jj].z * (this.derivarive(l, 1, ii+1, jj) - param1)**2 / (this.step(l,1,ii,jj)) + 
						 3 * this.m20Ctr[l][ii+1][jj].z * (param1 - this.derivarive(l, 1, ii, jj))**2 / (this.step(l,1,ii,jj)) - 
						 (this.pointsCtr[l][ii][jj].z - this.m20Ctr[l][ii][jj].z * this.step(l,1,ii,jj)**2) / (this.step(l,1,ii,jj)) + 
						 (this.pointsCtr[l][ii+1][jj].z - this.m20Ctr[l][ii + 1][jj].z * this.step(l,1,ii,jj)**2) / (this.step(l,1,ii,jj)); 
						 
					pt = new Point(xr, yr, zr);
					derivateSpline[l][i][j][0] = pt;
					
					param2 += d_p2;
				}
				
				param1 += d_p1;
				while ((ii < N_ctr - 2) && (param1 > this.derivarive(l, 1, ii+1, jj)))
				{
					ii++;
				}
			}
			
			ii = 0;
			jj = 0;
			param2 = 0;
			
			for (j = 0; j < M; j++)
			{
				for (i = 0; i < N; i += N - 1)
				{
					ii = i == 0 ? 0 : N_ctr - 1;
																			   
					xr = this.m02Ctr[l][ii][jj].x * (this.derivarive(l, 2, ii, jj+1) - param2)**3 / (this.step(l,2,ii,jj)) + 
						 this.m02Ctr[l][ii][jj+1].x * (param2 - this.derivarive(l, 2, ii, jj))**3 / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj].x - this.m02Ctr[l][ii][jj].x * this.step(l,2,ii,jj)**2) * (this.derivarive(l, 2, ii, jj+1) - param2) / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj+1].x - this.m02Ctr[l][ii][jj+1].x * this.step(l,2,ii,jj)**2) * (param2 - this.derivarive(l, 2, ii, jj)) / (this.step(l,2,ii,jj));
																			   
					yr = this.m02Ctr[l][ii][jj].y * (this.derivarive(l, 2, ii, jj+1) - param2)**3 / (this.step(l,2,ii,jj)) + 
						 this.m02Ctr[l][ii][jj+1].y * (param2 - this.derivarive(l, 2, ii, jj))**3 / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj].y - this.m02Ctr[l][ii][jj].y * this.step(l,2,ii,jj)**2) * (this.derivarive(l, 2, ii, jj+1) - param2) / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj+1].y - this.m02Ctr[l][ii][jj+1].y * this.step(l,2,ii,jj)**2) * (param2 - this.derivarive(l, 2, ii, jj)) / (this.step(l,2,ii,jj));
																			   
					zr = this.m02Ctr[l][ii][jj].z * (this.derivarive(l, 2, ii, jj+1) - param2)**3 / (this.step(l,2,ii,jj)) + 
						 this.m02Ctr[l][ii][jj+1].z * (param2 - this.derivarive(l, 2, ii, jj))**3 / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj].z - this.m02Ctr[l][ii][jj].z * this.step(l,2,ii,jj)**2) * (this.derivarive(l, 2, ii, jj+1) - param2) / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj+1].z - this.m02Ctr[l][ii][jj+1].z * this.step(l,2,ii,jj)**2) * (param2 - this.derivarive(l, 2, ii, jj)) / (this.step(l,2,ii,jj));
					
					let pt = new Point(xr, yr, zr);
					this.pointsSpline[l][i][j] = pt;
					
					xr = -3 * this.m02Ctr[l][ii][jj].x * (this.derivarive(l, 2, ii, jj+1) - param2)**2 / (this.step(l,2,ii,jj)) + 
						 3 * this.m02Ctr[l][ii][jj+1].x * (param2 - this.derivarive(l, 2, ii, jj))**3 / (this.step(l,2,ii,jj)) - 
						 (this.pointsCtr[l][ii][jj].x - this.m02Ctr[l][ii][jj].x * this.step(l,2,ii,jj)**2) / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj+1].x - this.m02Ctr[l][ii][jj+1].x * this.step(l,2,ii,jj)**2) / (this.step(l,2,ii,jj));
																			   
					yr = -3 * this.m02Ctr[l][ii][jj].y * (this.derivarive(l, 2, ii, jj+1) - param2)**2 / (this.step(l,2,ii,jj)) + 
						 3 * this.m02Ctr[l][ii][jj+1].y * (param2 - this.derivarive(l, 2, ii, jj))**2 / (this.step(l,2,ii,jj)) -
						 (this.pointsCtr[l][ii][jj].y - this.m02Ctr[l][ii][jj].y * this.step(l,2,ii,jj)**2) / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj+1].y - this.m02Ctr[l][ii][jj+1].y * this.step(l,2,ii,jj)**2) / (this.step(l,2,ii,jj));
																			   
					zr = -3 * this.m02Ctr[l][ii][jj].z * (this.derivarive(l, 2, ii, jj+1) - param2)**2 / (this.step(l,2,ii,jj)) + 
						 3 * this.m02Ctr[l][ii][jj+1].z * (param2 - this.derivarive(l, 2, ii, jj))**2 / (this.step(l,2,ii,jj)) -
						 (this.pointsCtr[l][ii][jj].z - this.m02Ctr[l][ii][jj].z * this.step(l,2,ii,jj)**2) / (this.step(l,2,ii,jj)) + 
						 (this.pointsCtr[l][ii][jj+1].z - this.m02Ctr[l][ii][jj+1].z * this.step(l,2,ii,jj)**2) / (this.step(l,2,ii,jj));
						 
					pt = new Point(xr, yr, zr);
					derivateSpline[l][i][j][1] = pt;
				}
				
				param2 += d_p2;
				while ((jj < M_ctr - 2) && (param2 > this.derivarive(l,2,ii,jj + 1)))
				{
					jj++;
				}
			}
			
			// console.log(derivateSpline);
			
			param1 = 0;
			param2 = 0;
			for (i = 0; i < N; i++)
			{
				param2 = 0;
				
				for (j = 0; j < M; j++)
				{
					xr = ((1 - param2) * this.pointsSpline[l][i][0].x + param2 * this.pointsSpline[l][i][M - 1].x) -
						 (1 - param1) * (((1 - param2) * this.pointsSpline[l][0][0].x + param2 * this.pointsSpline[l][0][M - 1].x) - this.pointsSpline[l][0][j].x) -
						  param1 * (((1 - param2) * this.pointsSpline[l][N-1][0].x + param2 * this.pointsSpline[l][N-1][M - 1].x) - this.pointsSpline[l][N-1][j].x);
					
					yr = ((1 - param2) * this.pointsSpline[l][i][0].y + param2 * this.pointsSpline[l][i][M - 1].y) -
						 (1 - param1) * (((1 - param2) * this.pointsSpline[l][0][0].y + param2 * this.pointsSpline[l][0][M - 1].y) - this.pointsSpline[l][0][j].y) -
						  param1 * (((1 - param2) * this.pointsSpline[l][N-1][0].y + param2 * this.pointsSpline[l][N-1][M - 1].y) - this.pointsSpline[l][N-1][j].y);
						  
					zr = ((1 - param2) * this.pointsSpline[l][i][0].z + param2 * this.pointsSpline[l][i][M - 1].z) -
						 (1 - param1) * (((1 - param2) * this.pointsSpline[l][0][0].z + param2 * this.pointsSpline[l][0][M - 1].z) - this.pointsSpline[l][0][j].z) -
						  param1 * (((1 - param2) * this.pointsSpline[l][N-1][0].z + param2 * this.pointsSpline[l][N-1][M - 1].z) - this.pointsSpline[l][N-1][j].z);
					
					let xr_p1 = (1 - param2) * derivateSpline[l][i][0][0].x + param2 * derivateSpline[l][i][M - 1][0].x +
							   ((1 - param2) * this.pointsSpline[l][0][0].x + param2 * this.pointsSpline[l][0][M - 1].x) - this.pointsSpline[l][0][j].x -
							   ((1 - param2) * this.pointsSpline[l][N-1][0].x + param2 * this.pointsSpline[l][N-1][M - 1].x - this.pointsSpline[l][N-1][j].x);
							   
					let yr_p1 = (1 - param2) * derivateSpline[l][i][0][0].y + param2 * derivateSpline[l][i][M - 1][0].y +
							   ((1 - param2) * this.pointsSpline[l][0][0].y + param2 * this.pointsSpline[l][0][M - 1].y) - this.pointsSpline[l][0][j].y -
							   ((1 - param2) * this.pointsSpline[l][N-1][0].y + param2 * this.pointsSpline[l][N-1][M - 1].y - this.pointsSpline[l][N-1][j].y);
							   
					let zr_p1 = (1 - param2) * derivateSpline[l][i][0][0].z + param2 * derivateSpline[l][i][M - 1][0].z +
							   ((1 - param2) * this.pointsSpline[l][0][0].z + param2 * this.pointsSpline[l][0][M - 1].z) - this.pointsSpline[l][0][j].z -
							   ((1 - param2) * this.pointsSpline[l][N-1][0].z + param2 * this.pointsSpline[l][N-1][M - 1].z - this.pointsSpline[l][N-1][j].z);
							   
					const pt_p1 = vec3.fromValues(xr_p1, yr_p1, zr_p1);
					
					let xr_p2 = (-this.pointsSpline[l][i][0].x + this.pointsSpline[l][i][M - 1].x) -
							   (1 - param1) * (-this.pointsSpline[l][0][0].x + this.pointsSpline[l][0][M - 1].x - derivateSpline[l][0][j][1].x) -
								param1 * (-this.pointsSpline[l][N-1][0].x + this.pointsSpline[l][N-1][M - 1].x - derivateSpline[l][N-1][j][1].x);
					
					let yr_p2 = (-this.pointsSpline[l][i][0].y + this.pointsSpline[l][i][M - 1].y) -
							   (1 - param1) * (-this.pointsSpline[l][0][0].y + this.pointsSpline[l][0][M - 1].y - derivateSpline[l][0][j][1].y) -
								param1 * (-this.pointsSpline[l][N-1][0].y + this.pointsSpline[l][N-1][M - 1].y - derivateSpline[l][N-1][j][1].y);
						  
					let zr_p2 = (-this.pointsSpline[l][i][0].z + this.pointsSpline[l][i][M - 1].z) -
							   (1 - param1) * (-this.pointsSpline[l][0][0].z + this.pointsSpline[l][0][M - 1].z - derivateSpline[l][0][j][1].z) -
								param1 * (-this.pointsSpline[l][N-1][0].z + this.pointsSpline[l][N-1][M - 1].z - derivateSpline[l][N-1][j][1].z);
							   
					const pt_p2 = vec3.fromValues(xr_p2, yr_p2, zr_p2);
					
					let normal = vec3.create();

					vec3.cross(normal, pt_p1, pt_p2);

					this.components_normals(l,i,j, normal);
					let pt = new Point(xr, yr, zr);
					this.pointsSpline[l][i][j] = pt;
					param2 += d_p2;
				}
				
				param1 += d_p1;
			}
			
			
			for (i = 0; i < N; i++)
				for (j = 0; j < M; j++) {
					const offset = l * M * N + i * M + j;                                       ////////////////
					this.verticesSpline[offset * 6] = this.pointsSpline[l][i][j].x;
					this.verticesSpline[offset * 6 + 1] = this.pointsSpline[l][i][j].y;
					this.verticesSpline[offset * 6 + 2] = this.pointsSpline[l][i][j].z;
					this.verticesSpline[offset * 6 + 3] = this.normalsSpline[l][i][j][0];
					this.verticesSpline[offset * 6 + 4] = this.normalsSpline[l][i][j][1];
					this.verticesSpline[offset * 6 + 5] = this.normalsSpline[l][i][j][2];
				}

			this.createIndicesSplineLines(N, M);
			this.createIndicesSplineSurface(N, M);
		}
	},


	calculateMechanicalMesh: function () {
		
		const N = Number(this.N.value);
		const M = Number(this.M.value);
		const nu = Number(this.nu.value);
		const A = (1 - nu) / 2;
		const B = (1 + nu) / 2;
		
		let h = 1.0 / N, tau = 1.0 / M;
		
		let Par1_0 = new Array(6),
			Par2_0 = new Array(6),
			deformed_Par1 = new Array(6),
			deformed_Par2 = new Array(6),
			U = new Array(6);
			
		for (let l = 0; l < 6; ++l) {
			Par1_0[l] = new Array(N);
			Par2_0[l] = new Array(N);
			deformed_Par1[l] = new Array(N);
			deformed_Par2[l] = new Array(N);
			U[l] = new Array(N);
		}

		this.pointsMesh = new Array(6);	
		this.normalsMesh = new Array(6);
		this.verticesMesh = new Float32Array(N * M * 36);
		
		for (let l = 0; l < 6; ++l){
			
			this.pointsMesh[l] = new Array(N);	
			this.normalsMesh[l] = new Array(N);	 
			for (let i = 0; i < N; ++i) {
				
				this.pointsMesh[l][i] = new Array(M);
				this.normalsMesh[l][i] = new Array(M);
				
				U[l][i] = new Array(M);
					
				Par1_0[l][i] = new Array(M);
				Par2_0[l][i] = new Array(M);
				
				deformed_Par1[l][i] = new Array(M);	
				deformed_Par2[l][i] = new Array(M);
				
				for (let j = 0; j < M; ++j) {
					this.normalsMesh[l][i][j] = new Array(3);
					U[l][i][j] = new Array(2); // x, y
					
					Par1_0[l][i][j] = this.initial_parameters(l, 1, i);   
					Par2_0[l][i][j] = this.initial_parameters(l, 2, j);

					deformed_Par1[l][i][j] = this.splinePoints_parameters(l, 1, i, j);  
					deformed_Par2[l][i][j] = this.splinePoints_parameters(l, 2, i, j);
					
					U[l][i][j][0] = deformed_Par1[l][i][j] - Par1_0[l][i][j];            
					U[l][i][j][1] = deformed_Par2[l][i][j] - Par2_0[l][i][j];
				}
			}
			
			let a_coef = new Array(N - 2);			
			let b_coef = new Array(N - 2);
			let c_coef = new Array(N - 2);
			
			let d_coef = new Array(N - 2);

			let i, j;
			
			for( j = 1; j < M - 1; ++j)
			{
				for( i = 1; i < N - 1; ++i)
				{
					a_coef[i-1] = - 1 / h**2;
					b_coef[i-1] = 2 / h**2 + 2*A / tau**2;
					c_coef[i-1] = - 1 / h**2;
					
					d_coef[i-1] = A * (U[l][i][j+1][0] + U[l][i][j-1][0]) / tau**2 + B * (U[l][i+1][j+1][1] - U[l][i+1][j-1][1] - U[l][i-1][j+1][1] + U[l][i-1][j-1][1]) / (4 * h * tau);
				}
				
				let ux = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef, N - 2);
				
				for(let i = 1; i < N - 1; ++i) {
					U[l][i][j][0] = ux[i-1];
				}
			}
			
			for( j = 1; j < M - 1; ++j)
			{
				for( i = 1; i < N - 1; ++i)
				{
					a_coef[i-1] = - A / h**2;
					b_coef[i-1] = 2 / tau**2 + 2*A / h**2;
					c_coef[i-1] = - A / h**2;
					
					d_coef[i-1] = (U[l][i][j+1][1] + U[l][i][j-1][1]) / h**2 + B * (U[l][i+1][j+1][0] - U[l][i+1][j-1][0] - U[l][i-1][j+1][0] + U[l][i-1][j-1][0]) / (4 * h * tau);
				}
				
				let uy = this.triDiagonalMatrixAlgorithm(a_coef, b_coef, c_coef, d_coef, N - 2);
				for(i = 1; i < N - 1; ++i) {
					U[l][i][j][1] = uy[i-1];
				}		
			}

			
			for(let i = 0; i < N; ++i)
				for(let j = 0; j < M; ++j) {
					
					if (l == 0 || l == 2){
						this.pointsMesh[l][i][j] = new Point(Par1_0[l][i][j] + U[l][i][j][0], Par2_0[l][i][j] + U[l][i][j][1], this.pointsSpline[l][i][j].z);
					}
					else if (l == 1 || l == 3){
						this.pointsMesh[l][i][j] = new Point(Par1_0[l][i][j] + U[l][i][j][0], this.pointsSpline[l][i][j].y, Par2_0[l][i][j] + U[l][i][j][1]);
					}
					else if (l == 4 || l == 5){
						this.pointsMesh[l][i][j] = new Point(this.pointsSpline[l][i][j].x, Par2_0[l][i][j] + U[l][i][j][1], Par1_0[l][i][j] + U[l][i][j][0]);
					}
				}

			for (let i = 0; i < N; i++)
				for (let j = 0; j < M; j++) {
					const offset = l * M * N + i * M + j;
					this.verticesMesh[offset * 6] = this.pointsMesh[l][i][j].x;
					this.verticesMesh[offset * 6 + 1] = this.pointsMesh[l][i][j].y;
					this.verticesMesh[offset * 6 + 2] = this.pointsMesh[l][i][j].z;
					this.verticesMesh[offset * 6 + 3] = this.normalsSpline[l][i][j][0];
					this.verticesMesh[offset * 6 + 4] = this.normalsSpline[l][i][j][1];
					this.verticesMesh[offset * 6 + 5] = this.normalsSpline[l][i][j][2];
				}	
		}
		console.log(this.normalsMesh);
		
	}
}

function mousedown(ev, canvas) {
    event = EventUtil.getEvent(event);

    const x = ev.clientX; // x coordinate of a mouse pointer
    const y = ev.clientY; // y coordinate of a mouse pointer
    const rect = ev.target.getBoundingClientRect();

    Data.mousedownHandler(EventUtil.getButton(ev), x - rect.left, canvas.height - (y - rect.top));
}

function mouseup(ev, canvas) {
    event = EventUtil.getEvent(event);

    const x = ev.clientX; // x coordinate of a mouse pointer
    const y = ev.clientY; // y coordinate of a mouse pointer
    const rect = ev.target.getBoundingClientRect();

    Data.mouseupHandler(EventUtil.getButton(ev), x - rect.left, canvas.height - (y - rect.top));
}

function mousemove(ev, canvas) {
    const x = ev.clientX; // x coordinate of a mouse pointer
    const y = ev.clientY; // y coordinate of a mouse pointer
    const rect = ev.target.getBoundingClientRect();

    Data.mousemoveHandler(x - rect.left, canvas.height - (y - rect.top));
}