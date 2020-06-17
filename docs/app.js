var nodes, success = null;
var link, url = null;
var web_country = null;
var vip_elements = ["S_palco"]; //vip elements, usually provided by the venues
var vips = []; //array that will contai all the vip elements obatined using the MMC api methods
var vipResource, dateResource = null;
var isVIP = Boolean;
var dateActivated = Boolean;
var adDuration = "5 s";
var userDate, userTime = null;
var allResources =[];

ipLook(); // uncomment this line to check the ip of the user and get the access location


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
    container: "map-container",
    plugins: ["SelectionPlugin","MapArrowsPlugin","RowsPlugin","ThumbnailPlugin"],
    config: config
};

// Shared map module instance
var map_module = tk3d.loadModule(map_init_config);

// ---- LOADING A MAP ----
map_module.loadMap("blockmap", onLoadBlockmap);



// ---- ON LOAD CALLBACKS ----
function onLoadBlockmap(err, module) {
    if (err) {
        console.error(err);
        return;
    }
    isVIP = false;
    dateActivated = false;
    // Setting availability
    var available_blocks = getBlockAvailability();
    map_module.setAvailability(available_blocks);
    map_module.setElementAvailable(vip_elements);   // Make sure vip elements are available(for testing)
    map_module.addStatus(vip_elements, "vip");      // Add status vip to vip_elements
    vips = map_module.getElementsByStatus("vip");   

    // Change the color of vip elements to black, easy to see for testing
    for (vip in vips) {
        map_module.getElementById(vips[vip].id).HTMLElement.style.fill = "rgb(0,0,0)";
    }

    console.log("BLOCKMAP LOADED");
}

function onLoadSeatmap(err, module) {
    // Get the information of positions in the JSON of the venue provided by MMC
    readJsonMMC();

    if (err) {
        console.error(err);
        return;
    }
    // set the availability of seats
    var available_seats = getSeatAvailability();
    map_module.setAvailability(available_seats);

    console.log("SEATMAP LOADED:", map_module.getMapId());
}


// ---- AVAILABILITY FUNCTIONS ----
// Get blocks availability. For the purpose, I generate a RANDOM availability.
function getBlockAvailability() {
    var blocks = map_module.getAllElements();
    var available_blocks = [];

    for (var i=0; i<blocks.length; i++) {
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

    for (var i=0; i<seats.length; i++) {
        var seat = seats[i];
        if (Math.random() < 0.7) {
            available_seats.push(seat.id);
        }
    }

    return available_seats;
}

// Function called when user clicks a block
function onClickBlock(obj) {
    // Get all resources from fake API (db.json)
    readAllResources();

    if (obj && obj.isAvailable()) {
        var sectionInfo = document.getElementById("sectionInfo");
        sectionInfo.innerHTML = "Section: " + obj.id;
        
        console.log("CLICK:", obj.id);
        
        map_module.select(obj);
        map_module.loadMap(obj.id, onLoadSeatmap);

        // check if the elements selected is vip
        for (vip in vips) {
            if (obj.id === vips[vip].id) {
                isVIP = true;
            }
        }
    }
}

// Function called when user clicks a seat
function onClickSeat(obj) {
    document.getElementById("view3d-container").style.display = "block";
    document.getElementById("sectionInfo").style.display = "block";

    if (obj && obj.isAvailable()) {
        console.log("CLICK:", obj.id);

        // unselect all elements before selecting one. There can only be one seat selected at time
        map_module.unselectAll();
        map_module.select(obj);
        
        // get actual date and display it on the screen
        getActualDate();
        var dateInfo = document.getElementById("dateInfo");
        dateInfo.innerHTML = userDate + " " + userTime;
        
        //get the resource that match with the user actual date and time, if there is
        getDateResource(userDate, userTime);
        
        //load 3d view of the selected seat
        view3d_module.load(obj.id);
    }
}


//Function that will be called when the view3d_module its load
function onload3dview(view) { 
    // if date is activated
    if (dateActivated === true) {
        // and vip is activated
        if (isVIP === true) {
            //the default resource is vip resource
            console.log("date and vip");

            var resources = getAllResources();
            resource = getResourceByCountry(web_country, resources);

            if (nodes) {
                var stuff = nodes.s[view];
                //show the vip resource, after 3 seconds change to date resource and then return to vip
                instantResource(getProp(resource.id), stuff, resource.vip);
                setTimeout(instantResource, 3000, getProp(resource.id), stuff, dateResource);
                setTimeout(instantResource, adDuration + 3000, getProp(resource.id), stuff, resource.vip);
            }
        }
        //if date is activated but vip is not
        else {
            //the default reosource its the default itself
            console.log("date and no vip");

            var resources = getAllResources();
            resource = getResourceByCountry(web_country, resources);
 
            if (nodes) {
                var stuff = nodes.s[view];
                //show the default resource, after 3 seconds change to date resource and then return to default
                instantResource(getProp(resource.id), stuff, resource.default);
                setTimeout(instantResource, 3000, getProp(resource.id), stuff, dateResource);
                setTimeout(instantResource, adDuration + 3000, getProp(resource.id), stuff, resource.default);
            }
        }    
    }
    // if vip is activated
    else if (isVIP === true){
        var resources = getAllResources();
        resource = getResourceByCountry(web_country, resources);
        console.log("adding vip resource");
        // the default resource will be vip resource
        if (nodes) {
            var stuff = nodes.s[view];
            instantResource(getProp(resource.id), stuff, resource.vip);
        }
    }
    //if vip is no activated and neither date
    else if (isVIP === false) {
        //the default resource will be the default itself
        var resources = getAllResources();
        //resource = getResourceByCountry(web_country, resources); //uncomment this line and comment next line to change the way to charge a resource, by id or by country
        var resource = getSpecificResource("99", resources); 
        if(nodes){
            var stuff = nodes.s[view];
            instantResource(getProp(resource.id), stuff, resource.default);
        }

    }



}
function instantResource(type, stuff, resource){
    console.log(type);

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
                    console.log(link);
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

function addImage(imgurl, position, rotation, size) {
    //console.log("hola2");
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
    console.log("hola3");
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
//Function to obtain the position information of the 3d venue by MMC
function readJsonMMC(){
    fetch("./instances.json")
    .then(function(result) {
        return result.json();
    })
    .then(function(result) {
        nodes = result;
    });
}


function readAllResources(){
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
            console.log(images);
            return images;
        }
    }
}
//Get all Resources together in a array
function getAllResources() {
    for(props in success){
        for(element in success[props]){
            allResources.push(success[props][element]);
        }
    }
    return allResources;
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
    console.log(country, resources);
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
function getProp (idResource){
    for(props in success){
        for(element in success[props]){
            if(success[props][element].id === idResource){
                return props;
            }
        }
    }
}

// function getVipResources() {
//     if(success.hasOwnProperty('images') && success.images.length != 0){  
//         for(image in success.images){
//             if(success.images[image].hasOwnProperty("vip")){
//                 vipResource =  success.images[image];
//                 return vipResource;
//             }
//         }

//       }
//       if(success.hasOwnProperty('videos') && success.videos.length != 0){  
//         for(video in success.videos){
//             if(success.videos[video].hasOwnProperty("vip")){
//                 vipResource =  success.videos[video];
//                 return vipResource;
//             }
//         }
//       }
// }

function getDateResource(userDate, userTime){
    if(success.hasOwnProperty('images') && success.images.length != 0){  
        for(image in success.images){
            if(success.images[image].hasOwnProperty("data")){
                    for(date in success.images[image].data){
                        if(success.images[image].data[date].hasOwnProperty("day") && success.images[image].data[date].hasOwnProperty("time")){
                            if(userDate.split("-")[0] === success.images[image].data[date].day.split("-")[0] &&  userDate.split("-")[1] === success.images[image].data[date].day.split("-")[1] &&
                            userTime.split(":")[0] === success.images[image].data[date].time.split(":")[0] && userTime.split(":")[1] === success.images[image].data[date].time.split(":")[1]){
                                dateActivated = true;
                                dateResource = success.images[image].data[date];
                                console.log(dateResource);
                            }
        
                        }
        
                        if(success.images[image].data[date].hasOwnProperty("duration")){
                            adDuration =  success.images[image].data[date].duration;
                            if(adDuration.split(" ")[1] ==="s"){
                                adDuration = adDuration.split(" ")[0] * 1000;
                            }
                            else if(adDuration.split(" ")[1] === "m"){
                                adDuration = adDuration.split(" ")[0] * 60 * 1000;
                            }
                            else if(adDuration.split(" ")[1] === "h"){
                                adDuration = adDuration.split(" ")[0] * 60 * 60 * 1000;
                            }
                        }
                    }
            }

        }

    }

}



function getActualDate(){
    var today = new Date();
    userDate = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    userTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
}


// ---- INTERFACE ELEMENTS ----
// Button to go back to blockmap when a seatmap is loaded
var homebtn = document.getElementById("btn-home");
if (homebtn) {
    homebtn.addEventListener("click", function(event) {
        // event.preventDefault();
        document.getElementById("view3d-container").style.display = "none";
        document.getElementById("sectionInfo").style.display = "none";
        map_module.loadMap("blockmap", onLoadBlockmap);
    });
}

document.getElementById("header").addEventListener("click", function(event) {
    if(event.target.id === "navbar-logo3DDV") {
        window.open("https://3ddigitalvenue.com");
    }
});