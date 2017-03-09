/* Stylesheet by Jacob P. Hrubecky, 2017 */
var mydiv = document.getElementById("mydiv");
var mymap = L.map('mapid').setView([0, 0], 3);
var searchTab = document.getElementById("Search");

//tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamhydWJlY2t5IiwiYSI6ImNpcnBjemI3NjBmcWhmZ204cTJhcmlkZ28ifQ.shqnrtmNMVCAKQ8ldaFVhg', {
    maxZoom: 10,
	minZoom: 3,
    }).addTo(mymap);

$('#panel').append('<p><h><b>Annual Populations (Millions)</b></h></p>');

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
            createLegend(mymap, attributes);

        }
    });
}

function createSequenceControls(mymap, attributes){
    //create range input element (slider)
    $("#panel2").append("<h3>Worldwide Populations: 1980-2010</h3><p><i>Observing international population growth from 1980 to 2010.</i></p><p><b>View Population Growth</b></p>");
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
    $('#panel2').append('<b><p>1980---------2010</p></b>');
    
    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 29 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 29 : index;
        };
        //Step 8: update slider
        $('.range-slider').val(index);
        updatePropSymbols(mymap, attributes[index]);
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
    updateLegend(map, attribute);
};

function createPropSymbols(response, mymap){
    
    var attribute = "1980";
    
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    
    var layer = L.geoJSON(response, {
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
    
    search(response, mymap, layer);
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 6;
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
    
    var panelContent = "<p><h><b>Annual Populations (in Millions)</b></h></p><p><b>Country:</b> " + feature.properties.name + "</p>";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            if (property.startsWith(2) || property.startsWith(1)){
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
			openTab();
            $("#panel").html(panelContent);
        }
    });
};

function openClose(i,j,k){
	tabcontent = document.getElementsByClassName("tabcontent");
	jQuery(tabcontent[j]).slideUp(100);
	jQuery(tabcontent[k]).slideUp(100);
	jQuery(tabcontent[i]).slideToggle(100);
}
function openTab(){
	tabcontent = document.getElementsByClassName("tabcontent");
	jQuery(tabcontent[1]).slideUp(100);
	jQuery(tabcontent[2]).slideUp(100);
	jQuery(tabcontent[0]).slideDown(100);
}

function search(data, map, currLayer) {
        // the search variable
        var searchControl = new L.Control.Search({
                layer: currLayer,
                propertyName: 'name',
                marker: false,
                moveToLocation: function(latlng, title, map) {
                    console.log(latlng);
                    var zoom = 6;
                    map.setView(latlng, zoom); // access the zoom
                }
        });

        //when the search is found
        searchControl.on('search:locationfound', function(e) {
            e.layer.setStyle({fillColor: '#B8F6FF', color: '#B8F6FF'});
                if(e.layer._popup)
                        e.layer.openPopup();
                }).on('search:collapsed', function(e) {
                    currLayer.eachLayer(function(layer) {
                        currLayer.resetStyle(layer);
                });
        });
             
        //add the search control to the map
        map.addControl(searchControl);
}

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
			//position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = document.getElementById("Legend");

            //add temporal legend div to container
			$(container).append('<div id="temporal-legend">');
 
            //Step 1: start attribute legend svg string
			var svg = '<svg id="attribute-legend" width="180px" height="180px">';

			//array of circle names to base loop on
			var circles = ["max", "mean", "min"];
				
			for (var i=0; i<circles.length; i++){
				//circle string
				svg += '<circle class="legend-circle" id="' + circles[i] + 
            '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="90"/>';
			};

			//close svg string
			svg += "</svg>";

			//add attribute legend svg to container
			$(container).append(svg);

            //return container;
        }
    });

    map.addControl(new LegendControl());
};

function updateLegend(map, attribute){
    //create content for legend
    var year = attribute;
    var content = "<b>Viewing Population for Year: </b>" + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
};

//window.onload = initialize();
$(document).ready(initialize);
