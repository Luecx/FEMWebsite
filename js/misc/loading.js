let loading_canvas = document.getElementById("loading-canvas")
let loading_canvas_context = loading_canvas.getContext('2d');
let loading_animation = true;
let loading_counter = 0;

let loading_animation_start_time = performance.now();
let loading_frame_timeout = 10; // milliseconds between animation updates

function loading_disable(){
    loading_animation = false;
    loading_canvas.style.pointerEvents = "none";
}

function loading_enable(notifiers){
    loading_animation = true;
    loading_counter = notifiers;
    loading_canvas.style.pointerEvents = "auto";
}

function loading_notify(){
    loading_counter -= 1;
    if(loading_counter === 0){
        loading_disable();
    }
}

function loading_render(){

    // clear
    loading_canvas_context.save()
    loading_canvas_context.setTransform(1, 0, 0, 1, 0, 0)
    loading_canvas_context.clearRect(0, 0, loading_canvas.width, loading_canvas.height)
    loading_canvas_context.restore()

    if(loading_animation){
        // center of canvas
        let center_x = loading_canvas.width / 2;
        let center_y = loading_canvas.height / 2;

        // elapsed time
        let elapsed_time = performance.now() - loading_animation_start_time;

        // offset of different arcs
        let offset_1 =  0.7  * 2 * Math.PI * elapsed_time / 1000;
        let offset_2 = -1.5  * 2 * Math.PI * elapsed_time / 1000;
        let offset_3 =  1.1  * 2 * Math.PI * elapsed_time / 1000;
        let offset_4 = -1.4  * 2 * Math.PI * elapsed_time / 1000;


        // background
        loading_canvas_context.fillStyle = '#ABABAB'
        loading_canvas_context.globalAlpha = 0.9
        loading_canvas_context.fillRect(0,0,loading_canvas.width,loading_canvas.height);

        // render animation
        loading_canvas_context.lineWidth = 3;
        loading_canvas_context.globalAlpha = 1;
        loading_canvas_context.fillStyle = '#000000'

        loading_canvas_context.beginPath();
        loading_canvas_context.arc(center_x, center_y, 72+26, 0 + offset_1, 1.5 + offset_1);
        loading_canvas_context.stroke();

        loading_canvas_context.beginPath();
        loading_canvas_context.arc(center_x, center_y, 72+32, 0 + offset_2, 1.5 + offset_2);
        loading_canvas_context.stroke();

        loading_canvas_context.beginPath();
        loading_canvas_context.arc(center_x, center_y, 72+38, 0 + offset_3, 1.5 + offset_3);
        loading_canvas_context.stroke();

        loading_canvas_context.beginPath();
        loading_canvas_context.arc(center_x, center_y, 72+46, 0 + offset_4, 1.5 + offset_4);
        loading_canvas_context.stroke();

        // render animation 2
        loading_canvas_context.lineWidth = 1;
        loading_canvas_context.globalAlpha = 1;

        let coord_func = (P,t) => {
            return P[0] * Math.sin(t * P[1] + P[2])
                 + P[3] * Math.cos(t * P[4] + P[5])
                 + P[6] * Math.cos(t * P[7]) * Math.sin(t * P[8]);
        }
        let point_func = (P1,P2,t) => {
            return [40 * coord_func(P1,t), 40 * coord_func(P2,t)];
        }
        let random_params = () => {
            return Array.from(Array(9)).map(x=>Math.random());
        }

        if( typeof loading_render.params == 'undefined' ){
            loading_render.params = [
                [random_params(), random_params()],
                [random_params(), random_params()],
                [random_params(), random_params()],
                [random_params(), random_params()],
                [random_params(), random_params()]];
        }


        let p1 = point_func(loading_render.params[0][0], loading_render.params[0][1], elapsed_time / 200);
        let p2 = point_func(loading_render.params[1][0], loading_render.params[1][1], elapsed_time / 200);
        let p3 = point_func(loading_render.params[2][0], loading_render.params[2][1], elapsed_time / 200);
        let p4 = point_func(loading_render.params[3][0], loading_render.params[3][1], elapsed_time / 200);
        let p5 = point_func(loading_render.params[4][0], loading_render.params[4][1], elapsed_time / 200);

        p1[0] += center_x;
        p2[0] += center_x;
        p3[0] += center_x;
        p4[0] += center_x;
        p5[0] += center_x;

        p1[1] += center_y;
        p2[1] += center_y;
        p3[1] += center_y;
        p4[1] += center_y;
        p5[1] += center_y;

        loading_canvas_context.beginPath();
        loading_canvas_context.moveTo(p1[0], p1[1]);
        loading_canvas_context.lineTo(p2[0], p2[1]);
        loading_canvas_context.lineTo(p3[0], p3[1]);
        loading_canvas_context.lineTo(p1[0], p1[1]);
        loading_canvas_context.fillStyle = 'rgba(255,255,255,0.1)'
        loading_canvas_context.fill();
        loading_canvas_context.alpha = 1;
        loading_canvas_context.stroke();

        loading_canvas_context.beginPath();
        loading_canvas_context.moveTo(p1[0], p1[1]);
        loading_canvas_context.lineTo(p2[0], p2[1])
        loading_canvas_context.lineTo(p4[0], p4[1]);
        loading_canvas_context.lineTo(p1[0], p1[1]);
        loading_canvas_context.fillStyle = 'rgba(255,255,255,0.1)'
        loading_canvas_context.fill();
        loading_canvas_context.alpha = 1;
        loading_canvas_context.stroke();

        loading_canvas_context.beginPath();
        loading_canvas_context.moveTo(p1[0], p1[1]);
        loading_canvas_context.lineTo(p2[0], p2[1])
        loading_canvas_context.lineTo(p5[0], p5[1]);
        loading_canvas_context.lineTo(p1[0], p1[1]);
        loading_canvas_context.fillStyle = 'rgba(255,255,255,0.1)'
        loading_canvas_context.fill();
        loading_canvas_context.alpha = 1;
        loading_canvas_context.stroke();

        loading_canvas_context.beginPath();
        loading_canvas_context.moveTo(p2[0], p2[1]);
        loading_canvas_context.lineTo(p3[0], p3[1])
        loading_canvas_context.lineTo(p4[0], p4[1]);
        loading_canvas_context.lineTo(p2[0], p2[1]);
        loading_canvas_context.fillStyle = 'rgba(255,255,255,0.1)'
        loading_canvas_context.fill();
        loading_canvas_context.alpha = 1;
        loading_canvas_context.stroke();

        loading_canvas_context.beginPath();
        loading_canvas_context.moveTo(p3[0], p3[1]);
        loading_canvas_context.lineTo(p4[0], p4[1])
        loading_canvas_context.lineTo(p5[0], p5[1]);
        loading_canvas_context.lineTo(p3[0], p3[1]);
        loading_canvas_context.fillStyle = 'rgba(255,255,255,0.1)'
        loading_canvas_context.fill();
        loading_canvas_context.alpha = 1;
        loading_canvas_context.stroke();

        // loading_canvas_context.beginPath();
        // loading_canvas_context.arc(center_x-300, center_y, 32, 0 + offset_2, 1.5 + offset_2);
        // loading_canvas_context.stroke();
        //
        // loading_canvas_context.beginPath();
        // loading_canvas_context.arc(center_x-300, center_y, 44, 0 + offset_3, 1.5 + offset_3);
        // loading_canvas_context.stroke();
        //
        // loading_canvas_context.beginPath();
        // loading_canvas_context.arc(center_x-300, center_y, 56, 0 + offset_4, 1.5 + offset_4);
        // loading_canvas_context.str

    }

    // Set timout
    setTimeout(() => {
        loading_render() // Call function again.
    }, Math.floor(loading_frame_timeout)) // Iterate every second.
}

function getMaxWidth() {
    return Math.max(
        document.documentElement.clientWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

function getMinWidth() {
    return Math.min(
        document.documentElement.clientWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

function getMaxHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}

function getMinHeight() {
    return Math.min(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}

// start the canvas loading
$( document ).ready(function() {
    // set the size of the canvas
    loading_canvas.width  = getMaxWidth();
    loading_canvas.height = getMaxHeight();

    // make sure resize is handled properly
    window.addEventListener('resize', function (){
        loading_canvas.width  = getMaxWidth();
        loading_canvas.height = getMaxHeight();
    });
    // Handler for .ready() called.
    loading_enable(3);
    loading_render();
});