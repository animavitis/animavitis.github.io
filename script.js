
var watchface = {};
var zoom = 4;


function loadFile() {
    var input, file, fr;
    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
    }

    function receivedText(e) {
        json = e.target.result;
        watchface = JSON.parse(json);
        console.log(watchface);

        zoom = $('#zoom').val();
        $("#watchface").css("width", 144 * zoom);
        $("#watchface").css("height", 168 * zoom);
        drawWatchface(watchface);
    }
}

function saveFile() {
    var json_watchface = JSON.stringify(watchface);
    var url = 'data:text/json;charset=utf8,' + encodeURIComponent(json_watchface);
    window.open(url, '_blank');
    window.focus();


}



function drawWatchface(data) {
    $("#watchface").html("");
    $("#controlsList").html("");

    for (var i = 0; i < data.data.screens[0].controls.length; i++) {
        drawControl(data.data.screens[0].controls[i], i);

    }
}


function drawControl(controlData, index) {


    var control = $("<div class=\"draggable\" id=\"control_" + index + "\"/>")

    if (controlData.type !== undefined) {
        $("#watchface").append(control);
        if (controlData.type == "imageFromSet" || controlData.type == "number") {
            control.css("width", controlData.style.width * zoom);
            control.css("height", controlData.style.height * zoom);
        }
        if (controlData.type == "text") {
            control.css("width", controlData.size.width * zoom);
            control.css("height", controlData.size.height * zoom);

        }
        control.css("position", "absolute");
        control.css("left", controlData.position.x * zoom);
        control.css("top", controlData.position.y * zoom);
        control.css("background-color", "rgba(255,0,0,0.1)");
        control.append($("<span>x:" + control[0].offsetTop / zoom + "y:" + control[0].offsetLeft / zoom + "</span>"));
        control.append($("<br /><span>w:" + control[0].offsetWidth / zoom + "h:" + control[0].offsetHeight / zoom + "</span>"));
        control.prop("title", controlData.type + "_" + index);
        control.prop("controlId", index);
        control.draggable({
            containment: "parent",
            grid: [4, 4],
            stop: function (event, ui) {
                var i = 5;
                this.childNodes[0].innerText = "";
                this.childNodes[0].innerText = "x:" + control[0].offsetTop / zoom + " y:" + control[0].offsetLeft / zoom;
                watchface.data.screens[0].controls[control[0].controlId].position.x = control[0].offsetTop / zoom;
                watchface.data.screens[0].controls[control[0].controlId].position.y = control[0].offsetLeft / zoom;
            }
        });
        control.resizable({
            containment: "parent",
            grid: [4, 4],
            stop: function (event, ui) {
                var i = 5;
                this.childNodes[2].innerText = "";
                this.childNodes[2].innerText = "w:" + control[0].offsetWidth / zoom + " h:" + control[0].offsetHeight / zoom;

                if (watchface.data.screens[0].controls[control[0].controlId].type == "imageFromSet" || watchface.data.screens[0].controls[control[0].controlId].type == "number") {
                    watchface.data.screens[0].controls[control[0].controlId].style.width = control[0].offsetWidth / zoom
                    watchface.data.screens[0].controls[control[0].controlId].style.height = control[0].offsetHeight / zoom;

                }
                if (watchface.data.screens[0].controls[control[0].controlId].type == "text") {
                    watchface.data.screens[0].controls[control[0].controlId].size.width = control[0].offsetWidth / zoom;
                    watchface.data.screens[0].controls[control[0].controlId].size.height = control[0].offsetHeight / zoom
                }


            }
        }).tooltip();

        var controlsList = $("<div id=\"controlsList_" + index + "\"/>");
        var coltrolsListCheckbox = $("<input type=\"checkbox\" name=\"my-checkbox\" id=\"checkbox_" + index + "\"/>");

        $("#controlsList").append(controlsList);
        controlsList.append(coltrolsListCheckbox);
        controlsList.css("height", "50px");
        coltrolsListCheckbox.bootstrapSwitch({
            labelText: controlData.type + "_" + index,
            labelWidth: 200,
            state: "true",
            handleWidth: 50,
            onText: "displayed",
            offText: "hidden",
            size: "mini",
            onSwitchChange: function (event, state) {
                control.toggle();
            }





        });


    }


}

