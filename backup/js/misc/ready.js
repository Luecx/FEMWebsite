
// make sure the div has the correct size
$(document).ready(function() {
    var canvas = document.getElementById("graphic-canvas");
    canvas.width  = $("#graphic-div").width();
    canvas.height = $("#graphic-div").height();

    window.onresize = function () {
        canvas.width  = $("#graphic-div").width();
        canvas.height = $("#graphic-div").height();
    }
    start_gl();
});



