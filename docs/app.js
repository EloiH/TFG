var nodes = null;
var success = null;
var link = null;
var url = null;
var web_country = null;
var vip_elements = "S_palco";
var vips = null;
var vipResource = null;
var isVIP = Boolean;
var adDate = null;
var adTime = null;
ipLook(); //uncomment this line to check the ip of the user and get the access location

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

// callbacks 3Dview
var callbacks = {
    imageclicked: onimageclicked,
    videoclicked: onvideoclicked,
    loaded: onload3dview
};


// ---- INSTANCING ----
// TICKETING3D instance
var tk3d = new TICKETING3D("eu-es-00051-activation2");
// View 3D module instance
var view3d_module = new Ticketing3D("view3d-container","eu-es-00051-activation2");
view3d_module.addCallbacks(callbacks);



function start() {
    view3d_module.load("S_214-7-11");
}

//Event Listeners header
document.getElementById("header").addEventListener("click", function(event) {
    if(event.target.id === "navbar-logo3DDV") {
        window.open("https://3ddigitalvenue.com");
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
        selection: {
            block: {
                //this callback will be triggered every time that a block element is selected
                elementselected: function(element) { /*...*/ },
                //this callback will be triggered every time that a block element is unselected
                elementunselected: function(element) { /*...*/ }
            }
        }
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
    container: "map-container",
    plugins: ["SelectionPlugin","MapArrowsPlugin","RowsPlugin","ThumbnailPlugin"],
    config: config
};

// Shared map module instance
var map_module = tk3d.loadModule(map_init_config);




view3d_module.addCallbacks(callbacks);

// ---- LOADING A MAP ----
map_module.loadMap("blockmap", onLoadBlockmap);
getAllResources();

// ---- ON LOAD CALLBACKS ----
function onLoadBlockmap(err, module) {
    var dateInfo = document.getElementById("dateInfo");
    var userDate = getUserDate();
    dateInfo.innerHTML = userDate;
    getDateResource();
    if (err) {
        console.error(err);
        return;
    }
    isVIP = false;
    var available_blocks = getBlockAvailability();
    map_module.setAvailability(available_blocks);
    map_module.setElementAvailable(vip_elements); //make sure vip elements are available(for testing)
    map_module.addStatus(vip_elements, "vip");
    vips = map_module.getElementsByStatus("vip")[0].id;
    
    var palco = map_module.getElementById(vip_elements);
    palco.HTMLElement.style.fill = "rgb(0,0,0)";
    getVipResources();
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
    //getAllResources();
    if (obj && obj.isAvailable()) {
        var sectionbtn = document.getElementById("sectionBtn");
        sectionbtn.innerHTML = "Section: "+obj.id;
        console.log("CLICK:", obj.id);
        map_module.select(obj);
        map_module.loadMap(obj.id, onLoadSeatmap);

        if(obj.id === vips){
            isVIP = true;
        }
    }
}

// Called when user clicks a seat
function onClickSeat(obj) {
    document.getElementById("view3d-container").style.display = "block";
    document.getElementById("sectionBtn").style.display = "block";
    if (obj && obj.isAvailable()) {
        map_module.unselectAll();
        console.log("CLICK:", obj.id);
        map_module.select(obj);
        view3d_module.load(obj.id);
    }
}



function onload3dview(view) {
    var type = "images";
    
    if(isVIP === true){
        resource = vipResource;
        console.log("adding vip resource");
    }
    else {
        var resources = getItemsOfResource(type);
        var resource = getResourceByCountry(web_country, resources); //uncomment this line and comment next line to change the way to charge a resource, by id or by country
        //var resource = getSpecificResource("6", resources); 
    }


    if (nodes) {
        var stuff = nodes.s[view];
        if (stuff) {    
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
                    
                    url = resource.url;
                    link = resource.link;
                    if(type === "images") {
                        addImage(url, position, rotation, size);

                    }  
                    else {
                        addVideo(url, position, rotation, size);
                    }
                }
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
        console.log(success);
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
            images = success[props];
            return images;
        }
    }
}

//Return a specific image or video
function getSpecificResource(idPress, resources){
    var ids = getIds(resources);
    if(ids.includes(idPress)){
        for(var i =0; resources.length; i++){
            if(resources[i].id ===idPress){
                return resources[i];
            }
        }
    }
    else{
        alert("This item doesn't exists. Try another ID!");
    }
}

function getResourceByCountry(country, resources){
    var countries = getCountries(resources);
    if(countries.includes(country)){
        for(var i =0; resources.length; i++){
            if(resources[i].country === country){
                return resources[i];
            }
        }
    }
    else{
        return resources[0];
    }
}


function getIds(resources){
    var ids_array = [];
    for(var i=0; i<resources.length; i++){
        ids_array.push(resources[i].id);
    }
    return ids_array;
}

// Function to obtain the IP adress location
function ipLook(){
fetch('https://ipapi.co/json/')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    web_country = data.country_name;
    console.log(web_country);
  });
}

function getCountries(resources){
    var countries_array = [];
    for(var i=0; i<resources.length; i++){
        countries_array.push(resources[i].country);
    }
    return countries_array;
}


function getVipResources() {
    if(success.hasOwnProperty('images') && success.images.length != 0){  
        for(image in success.images){
            if(success.images[image].hasOwnProperty("vip")){
                vipResource =  success.images[image];
                return vipResource;
            }
        }

      }
      if(success.hasOwnProperty('videos') && success.videos.length != 0){  
        for(video in success.videos){
            if(success.videos[video].hasOwnProperty("vip")){
                vipResource =  success.videos[video];
                return vipResource;
            }
        }
      }
}

function getDateResource(){
    if(success.hasOwnProperty('images') && success.images.length != 0){  
        for(image in success.images){
            if(success.images[image].hasOwnProperty("data")){
                adDate =  success.images[image].data.day;
                console.log(adDate);
                adTime = success.images[image].data.time;
                console.log(adTime);
            }
        }

      }
      if(success.hasOwnProperty('videos') && success.videos.length != 0){  
        for(video in success.videos){
            if(success.videos[video].hasOwnProperty("data")){
                vipResource =  success.videos[video];
                return vipResource;
            }
        }
      }
}



function getUserDate(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}


// ---- INTERFACE ELEMENTS ----
// Button to go back to blockmap when a seatmap is loaded
var homebtn = document.getElementById("btn-home");
if (homebtn) {
    homebtn.addEventListener("click", function(event) {
        // event.preventDefault();
        document.getElementById("view3d-container").style.display = "none";
        document.getElementById("sectionBtn").style.display = "none";
        map_module.loadMap("blockmap", onLoadBlockmap);
    });
}