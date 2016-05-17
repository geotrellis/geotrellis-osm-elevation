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
export default function unionElevation(oldRoads, newRoads){
    var combinedArrays = [];
    if (oldRoads != null)
        combinedArrays = oldRoads.concat(newRoads);
    else
        combinedArrays = newRoads.concat(oldRoads); 
    var indices = [];
    var unionAry = unique(combinedArrays, compareLineStringObjects);
    // Find null (undefined) objects indices.
    unionAry.forEach(function(element, index, array){
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