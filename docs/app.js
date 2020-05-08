var nodes = null;
var success = null;
//var image_url = "https://tk3d.pre-tk3dapi.com/activation/images/november.jpg";

// ---- INSTANCING ----
// TICKETING3D instance
var tk3d = new TICKETING3D("eu-es-00051-activation2");
// View 3D module instance
var view3d_module = new Ticketing3D("view3d-container","eu-es-00051-activation2");


readJsonMMC();

function readJsonMMC(){
    fetch("./instances.json")
    .then(function(result) {
        return result.json();
    })
    .then(function(result) {
        nodes = result;
        //start();
    });
}

var id = 1;
const api_img_url = "https://my-json-server.typicode.com/eloih/tfg/images";
const api_vid_url = "https://my-json-server.typicode.com/eloih/tfg/videos"; 

fetch(api_img_url)
    .then(function(result) {
        return result.json();
    })
    .then(function(result) {
        success = result;
    })
    .catch(function(error)
    {
        console.log("something went wrong with retrieving images");
    });

    
// Map module config
var config = {
    callbacks: {
        block: {
            click: onClickBlock
        },
        seat: {
            click: onClickSeat
        },
    },
    selection: {
    default: {
            flags: {
                available_by_default: false // all map elements will be unavailable by default
            }
        },
        block: {
            style: {
                unavailable: {
                    fill: "grey !important"
                },
                "available:hover": {
                    fill: "green !important"
                },
                selected: {
                    fill: "blue !important"
                }
            }
        },
        seat: {
            style: {
                unavailable: {
                    fill: "grey !important"
                },
                "available:hover": {
                    fill: "green !important"
                },
                selected: {
                    fill: "blue !important"
                }
            }
        }
    }
};

// Shared map module init options
var map_init_config = {
    module:"map",
    container: "container",
    plugins: ["SelectionPlugin"],
    config: config
};

// Shared map module instance
var map_module = tk3d.loadModule(map_init_config);


// callbacks 3Dview
var callbacks = {
    imageclicked: onimageclicked,
    videoclicked: onvideoclicked,
    loaded: onload3dview
};

view3d_module.addCallbacks(callbacks);

// ---- LOADING A MAP ----
map_module.loadMap("blockmap", onLoadBlockmap);


// ---- ON LOAD CALLBACKS ----
function onLoadBlockmap(err, module) {
    if (err) {
        console.error(err);
        return;
    }

    var available_blocks = getBlockAvailability();
    map_module.setAvailability(available_blocks);
    console.log("BLOCKMAP LOADED");
}

function onLoadSeatmap(err, module) {
    if (err) {
        console.error(err);
        return;
    }

    var available_seats = getSeatAvailability();
    map_module.setAvailability(available_seats);
    console.log("SEATMAP LOADED:", map_module.getMapId());
}


// ---- AVAILABILITY FUNCTIONS ----
// Get blocks availability. For the purpose, we generate a RANDOM availability.
function getBlockAvailability() {
    var blocks = map_module.getAllElements();
    var available_blocks = [];

    for (var i = 0; i < blocks.length; ++i) {
        var block = blocks[i];
        if (Math.random() < 0.7) {
            available_blocks.push(block.id);
        }
    }

    return available_blocks;
}

// Get seats availability. For the purpose, we generate a RANDOM availability.
function getSeatAvailability() {
    var seats = map_module.getAllElements();
    var available_seats = [];

    for (var i = 0; i < seats.length; ++i) {
        var seat = seats[i];
        if (Math.random() < 0.7) {
            available_seats.push(seat.id);
        }
    }

    return available_seats;
}

// Called when user clicks a block
function onClickBlock(obj) {
    if (obj && obj.isAvailable()) {
        console.log("CLICK:", obj.id);
        map_module.select(obj);
        map_module.loadMap(obj.id, onLoadSeatmap);
    }
}

// Called when user clicks a seat
function onClickSeat(obj) {
    if (obj && obj.isAvailable()) {
        console.log("CLICK:", obj.id);
        map_module.select(obj);
        view3d_module.load(obj.id);
    }
}

function onload3dview(view) {
    console.log("hola");
    if (nodes) {
        var stuff = nodes.s[view];
        console.log(stuff);
        if (stuff) {
            for(let i=0; i<success.length; i++){
                setTimeout(function () {  
                    for (var plane_id in stuff) {
                        if (stuff.hasOwnProperty(plane_id)) {
                            var position = stuff[plane_id].p;
                            var rotation = stuff[plane_id].r;
                            var size = nodes.o[plane_id].s;
                            
                            image_url = success[i].url; 
                            //video_url = success[i].url; 
                            
                            addImage(image_url, position, rotation, size);
                            //addVideo(video_url, position, rotation, size);
                        }
                    }
                }, (i)*3000);
            }
        }
    }
}

function addImage(imgurl, position, rotation, size) {
    //console.log("Node");
    console.log(imgurl);
    var image_config = {
        url : imgurl,
        instances : [
            {
                position : position,
                rotation : rotation,
                size : size,
                lookAtCamera : false
            }
        ]
    };
    view3d_module.addImage(image_config);
}

function addVideo(vidurl, position, rotation, size) {
    //console.log("Node");
    console.log(vidurl);
    var video_config = {
        url : vidurl,
        instances : [
            {
                position : position,
                rotation : rotation,
                size : size,
                lookAtCamera : false
            }
        ]
    };
    view3d_module.addVideo(video_config);
}


function onimageclicked(res) {
    console.log("Click image!", res);
}

function onvideoclicked(res) {
    console.log("Click video!", res);
}
