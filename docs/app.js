var nodes = null;
var success = null;
var link = null;
var url = null;

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


//Event Listeners
document.getElementById("header").addEventListener("click", function(event) {
    if(event.target.id === "navbar-logo3DDV") {
        window.open("https://3ddigitalvenue.com");
    }
    if(event.target.id === "navbar-logoPress") {
        window.open("https://pressenger.com/");
    }
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
    getAllResources();
    if (obj && obj.isAvailable()) {
        console.log("CLICK:", obj.id);
        map_module.select(obj);
        view3d_module.load(obj.id);
    }
}



function onload3dview(view) {
    var type = "videos";
    var resources = getItemsOfResource(type);

    getSpecificResource("1", resources);
    if (nodes) {
        var stuff = nodes.s[view];
        if (stuff) {
            for(let i=0; i<resources.length; i++){
                setTimeout(function () {
                    if(type === "images") {
                        view3d_module.removeImages();
                    }  
                    else {
                        view3d_module.removeVideos();
                    }
                    for (var plane_id in stuff) {
                        if (stuff.hasOwnProperty(plane_id)) {
                            var position = stuff[plane_id].p;
                            var rotation = stuff[plane_id].r;
                            var size = nodes.o[plane_id].s;
                            
                            url = resources[i].url;
                            link = resources[i].link;
                            if(type === "images") {
                                addImage(url, position, rotation, size);
                            }  
                            else {
                                addVideo(url, position, rotation, size);
                            }
                        }
                    }
                }, (i)*6000);
            }
        }
    }
}

function addImage(imgurl, position, rotation, size) {
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
    window.open(link, "_blank");
    console.log("Click image!", res);
}

function onvideoclicked(res) {
    window.open(link, "_blank");
    console.log("Click video!", res);
}






/*-------------------Pressenger API simulation calls-----------------------------*/

function getAllResources(){
    const api_url = "https://my-json-server.typicode.com/eloih/tfg/db";

fetch(api_url)
    .then(function(result) {
        return result.json();
    })
    .then(function(result) {
        success = result;
    })
    .catch(function(error)
    {
        console.log("something went wrong with retrieving resources from Pressenger API");
    });

}

//Return all the items of a specific resource: images or videos (by the moment)
function getItemsOfResource(resourceType) {
    for(var props in success){
        if(props === resourceType){
            console.log(success[props]);
            images = success[props];
            return images;
        }
    }
}

//Return a specific image or video
function getSpecificResource(idPress, resources){
    for(var i=0; i<resources.length; i++){
        if(resources[i].id === idPress){
            return resources[i];
        }
        else {
            console.log("This item does not exists!");
            break;
        }
    }
}