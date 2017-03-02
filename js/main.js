/* Stylesheet by Jacob P. Hrubecky, 2017 */
var mydiv = document.getElementById("mydiv");
var mymap = L.map('mapid').setView([0, 0], 1);

//tile layer
var OpenStreetMap_HOT = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
    }).addTo(mymap);

function initialize(){
    getCountryPopData(mymap);
}

function getCountryPopData(mymap){
    
    $.ajax("data/countryPops_byMillions.geojson", {
        dataType: "json",
        success: function(response){
            
            var attributes = processData(response);
            
            createSequenceControls(mymap, attributes);
            createPropSymbols(response, mymap);

        }
    });
}

function createSequenceControls(mymap, attributes){
    //create range input element (slider)
    $('#panel2').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 30,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel2').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel2').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    
    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        var index = $(this).val();
        updatePropSymbols(mymap, attributes[index]);
    });    
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
        };
    });
};

function createPropSymbols(response, mymap){
    
    var attribute = "2010";
    
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    
    L.geoJSON(response, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {        
            //For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);
            //Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            
            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
            
        }
        //pointToLayer: function (feature, latlng) {
          //  return pointToLayer(feature, latlng);
        //}
    }).addTo(mymap);
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 3;
    //area based on attribute value and scale factor
    //currently showing people/square mile
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("1") > -1 || attribute.indexOf("2") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    //console.log(attributes);

    return attributes;
};

function pointToLayer(feature, latlng, attributes){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    return attribute;
    //check
    //console.log(attribute);
}
    
function onEachFeature(feature, layer) {
    
    var popupContent = "<p><b>Country:</b> " + feature.properties.name + "</p>";
    popupContent += "<p><b> 2010 Population: </b>" +
        feature.properties[2010] + "</p>";
    
    var panelContent = "<p><b>Country:</b> " + feature.properties.name + "</p>";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            if (property.startsWith(2)){
                panelContent += "<p><b>" + property + ": </b>" + feature.properties[property] + "</p>";            
            };            
        };
    };
        
    layer.bindPopup(popupContent,{
        //offset: new L.Point(0,-options.radius),
        closeButton: false
    });
    
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
        }
    });
};


//window.onload = initialize();
$(document).ready(initialize);
