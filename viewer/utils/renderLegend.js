function getColor(meanv, intervals) {
	for (var key in intervals){
		var low = intervals[key][0];
		var high = intervals[key][1];
        // console.log(meanv + " | " + low + " " + high + " " +  key);
		if (meanv >= low && meanv <= high){
			return key;
		}
	}
	return "#FFFFFF";
}

export default function setLegend(intervals, map){

    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend');

        var grades = [];

        // Push all minimum values into grades.	 	
        for (var key in intervals){
            grades.push(intervals[key][0]);
        }
                
        // Then sort grades.
        grades.sort();
                
        var labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length - 1; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i + 1], intervals) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };    

    // Remove previous legend.
    var legendObj = $("div.info.legend.leaflet-control");
       
    if (legendObj){
        legendObj.remove();
    }

    legend.addTo(map);
    
} /**/