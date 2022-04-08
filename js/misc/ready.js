
// make sure the div has the correct size
$(document).ready(function() {
    let jqgraphicdiv = $("#graphic-div");

    let glcanvas = document.getElementById("graphic-canvas");
    let txcanvas = document.getElementById("text-canvas");
    glcanvas.width  = jqgraphicdiv.width();
    glcanvas.height = jqgraphicdiv.height();
    txcanvas.width  = jqgraphicdiv.width();
    txcanvas.height = jqgraphicdiv.height();

    window.onresize = function () {
        glcanvas.width  = jqgraphicdiv.width();
        glcanvas.height = jqgraphicdiv.height();
        txcanvas.width  = jqgraphicdiv.width();
        txcanvas.height = jqgraphicdiv.height();
    }
    start_gl();
});



