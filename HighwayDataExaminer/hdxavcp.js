//
// HDX Algorithm Visualization Control Panel
//
// METAL Project
//
// Primary Author: Jim Teresco
//

/* functions for algorithm visualization control panel */
var AVCPsuffix = "AVCPEntry";
var AVCPentries = [];

/* add entry to the algorithm visualization control panel */
function addEntryToAVControlPanel(namePrefix, vs) {
    
    let avControlTbody = document.getElementById('algorithmVars');
    let infoBox = document.createElement('td');
    let infoBoxtr= document.createElement('tr');
    infoBox.setAttribute('id', namePrefix + AVCPsuffix);
    infoBox.setAttribute('style', "color:" + vs.textColor +
                         "; background-color:" + vs.color);
    infoBoxtr.appendChild(infoBox);
    avControlTbody.appendChild(infoBoxtr);
    AVCPentries.push(namePrefix);
}

/* clean up all entries from algorithm visualization control panel */
function cleanupAVControlPanel() {

    document.getElementById("algorithmStatus").innerHTML = "";
    document.getElementById("pseudoText").innerHTML = "";
    while (AVCPentries.length > 0) {
        removeEntryFromAVControlPanel(AVCPentries.pop());
    }
}

/* remove entry from algorithm visualization control panel */
function removeEntryFromAVControlPanel(namePrefix) {

    let avControlTbody = document.getElementById('algorithmVars');
    let infoBox = document.getElementById(namePrefix + AVCPsuffix);
    if (infoBox != null) {
        let infoBoxtr= infoBox.parentNode;
        avControlTbody.removeChild(infoBoxtr);
    }
}

/* set the HTML of an AV control panel entry */
function updateAVControlEntry(namePrefix, text) {

    document.getElementById(namePrefix + AVCPsuffix).innerHTML = text;
    if(hdxAV.delay != 0)
    {
        customTitle();
    }
    
}

/* set the visualSettings of an AV control panel entry */
function updateAVControlVisualSettings(namePrefix, vs) {

    let infoBox = document.getElementById(namePrefix + AVCPsuffix);
    infoBox.setAttribute('style', "color:" + vs.textColor +
                         "; background-color:" + vs.color);
}

/* get the document element of an AV control entry */
function getAVControlEntryDocumentElement(namePrefix) {

    return document.getElementById(namePrefix + AVCPsuffix);
}

