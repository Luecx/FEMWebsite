
let render_scene = null;
let glContext = null;
let glContextExtension = null;
let glCanvas  = null;

function render() {

    glContext.clearColor(0.95,0.95,0.95,1.0);
    // glContext.enable(glContext.DEPTH_TEST);
    glContext.clear(glContext.COLOR_BUFFER_BIT);
    glContext.viewport(0,0,glCanvas.width,glCanvas.height);

    render_scene.render();

}

function renderLoop() {
    render();
    window.setTimeout(renderLoop, 1000 / 60);
}

function setup_scene(){
    // let geom = generate_rectangle(1,1,30,30,2);
    // let geom = generate_arc(1,2,3,180,150,15,1);
    render_scene = new Scene();
}

function getGLContext(){
    return glContext;
}

function getGLContextExtension(){
    return glContextExtension;
}

function getGLCanvas(){
    return glCanvas;
}

function start_gl(){
    const canvas = document.querySelector("#graphic-canvas");
    glCanvas  = canvas;
    glContext = canvas.getContext("webgl");

    // make sure gl is enabled
    if (!glContext) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // if debugging is enabled
    // glContext = WebGLDebugUtils.makeDebugContext(glContext, undefined, function (functionName, args) {
    //     console.log("gl." + functionName + "(" +
    //         WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
    // });

    // enable 32 bit integer for indices
    var uints_for_indices = glContext.getExtension("OES_element_index_uint");
    // if no 32 bit integers are available, throw an error
    if(!uints_for_indices){
        alert("WebGL is unable to use 32 Bit Indices which is not valid with this simulation");
    }
    const ext = glContext.getExtension('ANGLE_instanced_arrays');
    if(!ext){
        alert("WebGL is unable to use instanced rendering which is not valid with this simulation");
    }
    glContextExtension = ext;

    if (glContext) {
        setup_scene();
        loadcasemenu_init();
        loadcase_add.click();
        renderLoop();
    }

}

