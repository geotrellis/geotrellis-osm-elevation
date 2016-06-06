function getColor(index) {
    // Predefined colours
    const colours = [
    "#006400",
    "#008000",  
    "#00FF00",
    "#ADFF2F",
    "#FFFF00",
    "#FFD700",
    "#FFA500",
    "#FF8C00",
    "#FF4500",
    "#FF0000"
    ];    
	return colours[index];
}

function round2Decimal(value){
    return Math.round(value * 100)/100;
}

export default function setLegend(ranges, map){
    var legend = L.control({position: 'bottomleft'});        
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = [];
        // Push all minimum values into grades.	 
        for (var j = 0; j < ranges.length; j++){
            grades.push(ranges[j]);
        }	                     
        var labels = [];
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(i) + '"></i> ' +
                round2Decimal(grades[i]) + ( (grades[i + 1] && (i + 1) != (grades.length) ) ? '&ndash;' + round2Decimal(grades[i + 1]) + '<br>' : '+');
        }
        return div;
    };         
    var legendObj = document.querySelector("div.info.legend.leaflet-control");
    // Remove previous legend.   
    if (legendObj){
        legendObj.remove();
    }
    legend.addTo(map);   
}