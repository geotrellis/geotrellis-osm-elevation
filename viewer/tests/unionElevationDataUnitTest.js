const TRUE = 0;
const FALSE = 1;

function compareLineStringObjects(obj1, obj2){
    if (obj1 != null && obj2 != null){
        // coord is an array with 2 arrays.
        var coord1 = obj1.geometry.coordinates;
        var coord2 = obj2.geometry.coordinates;
        var type1 = obj1.geometry.type;
        var type2 = obj2.geometry.type;
        if (type1 != type2) return FALSE;
        if (coord1.length != coord2.length) return FALSE;
        for (var i = 0;i < coord1.length; i++){
            for (var j = 0; j < coord1[i].length; j++){
                if (coord1[i][j] != coord2[i][j]) return FALSE;
            }
        }
        var meanv1 = obj1.properties.MEANV;
        var meanv2 = obj2.properties.MEANV;
        if (meanv1 != meanv2) return FALSE;
        return TRUE;
    }    
    // At least one obj is null.
    return FALSE;
}

/* Return an array containing distinct items. */
function unique(a, compareFunc){
    a.sort( compareFunc );
    for(var i = 1; i < a.length; ){
        if( compareFunc(a[i-1], a[i]) === 0){
            a.splice(i, 1);
        } else {
            i++;
        }
    }
    return a;
}

/* Takes two arrays of objects and returns the union of them. */
function unionElevation(oldRoads, newRoads){
    var combinedArrays = [];
    if (oldRoads != null)
        combinedArrays = oldRoads.concat(newRoads);
    else
        combinedArrays = newRoads.concat(oldRoads); 
    var indices = [];
    var unionAry = unique(combinedArrays, compareLineStringObjects);
    // Find null (undefined) objects indices.
    unionAry.forEach(function(element, index, array){
        console.log(element);
        if (element == null)
            indices.push(index);
    });
    var i = 0;
    while (i < indices.length){
        var ind = indices[i];
        if (ind > -1) {
            // Remove 1 item at index.
            unionAry.splice(ind, 1);
        }
        i++;
    } 
    return unionAry;
}

/********************************* TEST CASES *********************************/

var o1 = null;
var o2 = null;
var a1 = [];
var a2 = [];

/* COMPARE FUNCTION: "EQUAL" OBJECTS */
o1 = { "geometry":{ "coordinates":[[1, 3.452],[6.7, 45]], "type":"LineString" }, "properties":{ "MEANV":1.6 } };
o2 = { "geometry":{ "coordinates":[[1, 3.452],[6.7, 45]], "type":"LineString" }, "properties":{ "MEANV":1.6 } };
console.assert(compareLineStringObjects(o1, o2) === 0);

/* COMPARE FUNCTION: "NOT EQUAL" OBJECTS */
o1 = { "geometry":{ "coordinates":[[1, 3.452],[6.7, 45]], "type":"LineString" }, "properties":{ "MEANV":1.6 } };
o2 = { "geometry":{ "coordinates":[[1, 3.452],[6.7, 45]], "type":"LineString" }, "properties":{ "MEANV":1.5 } };
console.assert(compareLineStringObjects(o1, o2) === 1);
o1 = { "geometry":{ "coordinates":[[1, 3.452],[6.7, 45]], "type":"LineString" }, "properties":{ "MEANV":1.6 } };
o2 = { "geometry":{ "coordinates":[[1, 3.452],[6.7, 45]], "type":"C_String" }, "properties":{ "MEANV":1.6 } };
console.assert(compareLineStringObjects(o1, o2) === 1);
o1 = { "geometry":{ "coordinates":[[1, 3.452],[6.7, 45]], "type":"LineString" }, "properties":{ "MEANV":3.6 } };
o2 = { "geometry":{ "coordinates":[[1, 3.452],[6.7435, 45]], "type":"LineString" }, "properties":{ "MEANV":1.6 } };
console.assert(compareLineStringObjects(o1, o2) === 1);

/* CASE 1: INTERSECTION */
// o1 and o2 are different objects.
var o3 = { "geometry":{ "coordinates":[[5, 3.452],[6.7435, 45]], "type":"LineString" }, "properties":{ "MEANV":2 } };
var o4 = { "geometry":{ "coordinates":[[8, 3.4],[24, 4]], "type":"LineString" }, "properties":{ "MEANV":3.81 } };
a1 = [o1, o3];
a2 = [o3, o2];
console.log(unionElevation(a1, a2));

/* CASE 2: DISJOINT */
a1 = [o1, o2];
a2 = [o3, o4];
console.log(unionElevation(a1, a2));

/* CASE 3: SUBSET */
a1 = [o1,o2,o3];
a2 = [o2];
console.log(unionElevation(a1, a2));

/* CASE 4: EMPTY ARRAYS */
a1 = [];
a2 = [o1,o3];
console.log(unionElevation(a1, a2));
a2 = [];
a1 = [o1,o3];
console.log(unionElevation(a1, a2));
a1 = a2 = [];
console.log(unionElevation(a1, a2));

console.log("ALL TEST CASES PASSED!!!");