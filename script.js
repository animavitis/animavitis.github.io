
var watchface = {};
var zoom = 4;
var editor;

function positionToggle() {
    $("#position").show();
    $("#jsonEditor").hide();
    $("#size").hide();
    editor.disable();
    $("#watchface-position").css("width", 144 * zoom);
    $("#watchface-position").css("height", 168 * zoom);
    $("#watchface-position").css("background-color", "#eee");

    drawWatchface(watchface, "-position");

}

function sizeToggle() {
    $("#position").hide();
    $("#jsonEditor").hide();
    $("#size").show();
    editor.disable();
    $("#watchface-size").css("width", 144 * zoom);
    $("#watchface-size").css("height", 168 * zoom);
    $("#watchface-size").css("background-color", "#eee");
    drawWatchface(watchface, "-size");

}

function jsonEditorToggle() {
    $("#position").hide();
    $("#jsonEditor").show();
    $("#size").hide(); editor.disable();
    editor.enable();
    editor.setValue(watchface);
}




function initEditor() {
    // Initialize the editor
    editor = new JSONEditor(document.getElementById('editor_holder'), {
        // Enable fetching schemas via ajax
        ajax: true,

        // The schema for the editor
        schema: {
            $ref: "schema.json",
            format: "grid"
        },

        // Seed the form with a starting value
        startval: {}
    });

    editor.on('change', function () {
        // Get an array of errors from the validator
        var errors = editor.validate();

        var indicator = document.getElementById('valid_indicator');

        watchface = editor.getValue();


        // Not valid
        if (errors.length) {
            indicator.className = 'label alert';
            indicator.textContent = 'not valid';
        }
        // Valid
        else {
            indicator.className = 'label success';
            indicator.textContent = 'valid';
        }
    });



}






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
        $("#watchface-position").css("width", 144 * zoom);
        $("#watchface-position").css("height", 168 * zoom);
        $("#watchface-position").css("background-color", "#eee");
        
        if ($("#watchface-position").is(":visible")) {
        drawWatchface(watchface, "-position");
        }
        if ($("#watchface-size").is(":visible")) {
        drawWatchface(watchface, "-size");
        }
        if ($("#jsonEditor").is(":visible")) {
        editor.setValue(watchface);
        }
    }
}

function saveFile() {
    var json_watchface = JSON.stringify(watchface);
    var url = 'data:text/json;charset=utf8,' + encodeURIComponent(json_watchface);
    window.open(url, '_blank');
    window.focus();


}



function drawWatchface(data, sufix) {
    $("#watchface" + sufix).html("");
    $("#controlsList" + sufix).html("");
    if (!!data.data.screens.length > 0) {
        for (var i = 0; i < data.data.screens[0].controls.length; i++) {
            drawControl(data.data.screens[0].controls[i], i, sufix);
        }
    }
}


function drawControl(controlData, index, sufix) {


    var control = $("<div class=\"draggable\" id=\"control_" + index + "\"/>")

    if (controlData.type !== undefined) {
        $("#watchface" + sufix).append(control);
        if (controlData.type == "imageFromSet" || controlData.type == "number") {
            control.css("width", controlData.style.width * zoom);
            control.css("height", controlData.style.height * zoom);
        }
        if (controlData.type == "text") {
            control.css("width", controlData.size.width * zoom);
            control.css("height", controlData.size.height * zoom);

        }
        control.css("position", "absolute");
        control.css("box-shadow", " 0px 0px 1px black inset");
        control.css("left", controlData.position.x * zoom);
        control.css("top", controlData.position.y * zoom);
        var color = ["rgba(255,0,0,0.1)", "rgba(0,255,0,0.1)", "rgba(0,0,255,0.1)", "rgba(255,255,0,0.1)", "rgba(255,0,255,0.1)", "rgba(0,255,255,0.1)"];
        var random = color[index % color.length];
        control.css("background-color", random);
        control.append($("<span>x:" + control[0].offsetLeft / zoom + " y:" + control[0].offsetTop / zoom + "</span>"));
        control.append($("<br /><span>w:" + control[0].offsetWidth / zoom + " h:" + control[0].offsetHeight / zoom + "</span>"));
        control.prop("title", controlData.type + "_" + index);
        control.prop("controlId", index);

        if ($("#watchface-position").is(":visible")) {
            control.draggable({
                containment: "parent",
                grid: [zoom, zoom],
                stop: function (event, ui) {
                    this.childNodes[0].innerText = "";
                    this.childNodes[0].innerText = "x:" + control[0].offsetLeft / zoom + " y:" + control[0].offsetTop / zoom;
                    watchface.data.screens[0].controls[control[0].controlId].position.x = control[0].offsetLeft / zoom;
                    watchface.data.screens[0].controls[control[0].controlId].position.y = control[0].offsetTop / zoom;

                }
            });
        }

        if ($("#watchface-size").is(":visible")) {
            control.resizable({
                containment: "parent",
                grid: [4, 4],
                stop: function (event, ui) {
                    this.childNodes[2].innerText = "";
                    this.childNodes[2].innerText = "w:" + control[0].offsetWidth / zoom + " h:" + control[0].offsetHeight / zoom;

                    if (watchface.data.screens[0].controls[control[0].controlId].type == "imageFromSet" || watchface.data.screens[0].controls[control[0].controlId].type == "number") {
                        watchface.data.screens[0].controls[control[0].controlId].style.width = control[0].offsetWidth / zoom;
                        watchface.data.screens[0].controls[control[0].controlId].style.height = control[0].offsetHeight / zoom;


                    }
                    if (watchface.data.screens[0].controls[control[0].controlId].type == "text") {
                        watchface.data.screens[0].controls[control[0].controlId].size.width = control[0].offsetWidth / zoom;
                        watchface.data.screens[0].controls[control[0].controlId].size.height = control[0].offsetHeight / zoom;

                    }


                }
            });
        }
        control.tooltip();

        var controlsList = $("<div id=\"controlsList_" + index + "\"/>");
        var coltrolsListCheckbox = $("<input type=\"checkbox\" name=\"my-checkbox\" id=\"checkbox_" + index + "\"/>");

        $("#controlsList" + sufix).append(controlsList);
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

