//
// HDX pseudocode support functions
//
// METAL Project
//
// Primary Author: Jim Teresco
//

// update a chunk of pseudocode with an id based on given visualsettings
// now also managing execution counts
function highlightPseudocode(id, vs) {

    let codeChunk = document.getElementById(id);
    if (codeChunk != null) {
        codeChunk.style.backgroundColor = vs.color;
        codeChunk.style.color = vs.textColor;
        hdxAV.previousHighlight = id;

        // execution counting
        if (id in hdxAV.execCounts) {
            hdxAV.execCounts[id]++;
        }
        else {
            hdxAV.execCounts[id] = 1;
        }

        // if we have a new largest count, we'll recolor
        if (hdxAV.execCounts[id] > hdxAV.maxExecCount) {
            hdxAV.maxExecCount = hdxAV.execCounts[id];
            hdxAV.execCountRecolor = true;
        }
        codeChunk.title = "Exec count: " + hdxAV.execCounts[id];
    }
}

// unhighlight previously-highlighted pseudocode
function unhighlightPseudocode() {

    if (hdxAV.previousHighlight != null) {
        let codeChunk = document.getElementById(hdxAV.previousHighlight);
        if (codeChunk != null) {
            codeChunk.style.backgroundColor =
                hdxAV.execCountColor(hdxAV.execCounts[hdxAV.previousHighlight]);
            // above was: visualSettings.pseudocodeDefault.color;
            codeChunk.style.color = visualSettings.pseudocodeDefault.textColor;
            hdxAV.previousHighlight = null;
        }
    }
    // did we trigger a recolor?  if so, recolor all
    if (hdxAV.execCountRecolor) {
        hdxAV.execCountRecolor = false;
        for (let key in hdxAV.execCounts) {
            let codeChunk = document.getElementById(key);
            codeChunk.style.backgroundColor =
                hdxAV.execCountColor(hdxAV.execCounts[key]);
        }
    }
        
}

// function to help build the table of pseudocode for highlighting
// indent: number of indentation levels
// code: line or array of code lines to place in block
// id: DOM id to give the enclosing td element
function pcEntry(indent, code, id) {

    let entry;
    if (entry != "") {
        entry = '<tr><td id="' + id + '">';
    }
    else {
        entry = '<tr><td>';
    }
    if (Array.isArray(code)) {
        for (var i = 0; i < code.length; i++) {
            for (var j = 0; j < indent; j++) {
                entry += "&nbsp;&nbsp;";
            }
            entry += code[i] + "<br />";
        }
    }
    else {
        for (var i = 0; i < indent; i++) {
            entry += "&nbsp;&nbsp;";
        }
        entry += code;
    }
    entry += '</td></tr>';
    return entry;
}
