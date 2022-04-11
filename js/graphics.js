
let render_scene = null;
let glCanvas  = null;
let glContext = null;
let glContextExtension = null;
let glTextCanvas = null;
let glTextContext = null;

function render() {

    glTextContext.save()
    glTextContext.setTransform(1, 0, 0, 1, 0, 0)
    glTextContext.clearRect(0, 0, glTextCanvas.width, glTextCanvas.height)
    glTextContext.restore()

    glContext.clearColor(0.95,0.95,0.95,1.0);
    glContext.clear(glContext.COLOR_BUFFER_BIT);
    glContext.viewport(0,0,glCanvas.width,glCanvas.height);

    render_scene.render();
}

let start = performance.now();;

function renderLoop() {
    let time = performance.now();
    start = time;
    render();
    window.setTimeout(renderLoop, 1000 / 100);
}

function setup_scene(){
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

function getGLTextContext(){
    return glTextContext;
}

function start_gl(){
    const canvas     = document.querySelector("#graphic-canvas");
    const textCanvas = document.getElementById("text-canvas");
    glCanvas      = canvas;
    glTextCanvas  = textCanvas;
    glContext     = glCanvas.getContext("webgl");
    glTextContext = glTextCanvas.getContext("2d")



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
        staticanalysis_init();
        topo_init();
        toolbar_init();
        loadcase_add.click();
    }
    renderLoop();

}

