//
// HDX Vertex Extremes AV
//
// METAL Project
//
// Primary Author: Jim Teresco, contributions from many
//

// helper functions

// function to create the table entry for the leader for extreme points
function extremePointLeaderString(category) {
    
    let ans = category.label + ':<br />#' + category.index +
        ' (' + waypoints[category.index].lat + ',' +
        waypoints[category.index].lon +
        ') ' + waypoints[category.index].label;

    if (category.tiedWith.length > 0) {
        ans += ' <span title="';
        for (let i = 0; i < category.tiedWith.length; i++) {
            ans += '[#' + category.tiedWith[i] +
        ' (' + waypoints[category.tiedWith[i]].lat + ',' +
        waypoints[category.tiedWith[i]].lon +
        ') ' + waypoints[category.tiedWith[i]].label + ']';
        }
        ans += '">[tie with ' +
            category.tiedWith.length + ' other' +
            (category.tiedWith.length > 1 ? 's' : '') + ']</span>';
    }
    return ans;
}

// function to create the table entry for the leader for
// label-based comparisons
function vertexLabelLeaderString(category) {
    
    let ans =  category.label + ':<br />#' + category.index +
        ' (length ' + waypoints[category.index].label.length + ') ' +
        waypoints[category.index].label;
    
    if (category.tiedWith.length > 0) {
        ans += ' <span title="';
        for (let i = 0; i < category.tiedWith.length; i++) {
            ans += '[#' + category.tiedWith[i] + ' (length ' +
                waypoints[category.tiedWith[i]].label.length + ') ' +
                waypoints[category.tiedWith[i]].label + ']';
        }
        ans += '">[tie with ' + category.tiedWith.length + ' other' +
            (category.tiedWith.length > 1 ? 's' : '') + ']</span>';
    }

    return ans;
}


var hdxVertexExtremesSearchAV = {

    // entries for list of AVs
    value: "vertex",
    name: "Vertex Extremes Search",
    description: "Search for extreme values based on vertex (waypoint) locations and labels.",

    // state variables for vertex extremes search
    nextToCheck: 0,
    discarded: 0,
    foundNewLeader: false,
    
    // list of polylines showing the directional bounds, updated by
    // directionalBoundingBox function below
    boundingPoly: [],

    // the categories for which we are finding our extremes,
    // with names for ids, labels to display, indicies of leader,
    // comparison function to determine if we have a new leader,
    // visual settings for the display, and a function to determine
    // if the category is among those currently chosen to include
    categories: [
        {
            name: "north",
            label: "North extreme",
            index: -1,
            tiedWith: [],
            
            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) >
                        parseFloat(waypoints[this.index].lat));
            },

            tiedForLead: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) ==
                        parseFloat(waypoints[this.index].lat));
            },

            leaderString: extremePointLeaderString,

            visualSettings: {
                color: "#000080",
                textColor: "white",
                scale: 6,
                name: "northLeader",
                value: 0
            },

            include: function(thisAV) {
                return true;
            }
        },

        {
            name: "south",
            label: "South extreme",
            index: -1,
            tiedWith: [],

            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) <
                        parseFloat(waypoints[this.index].lat));
            },
            tiedForLead: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lat) ==
                        parseFloat(waypoints[this.index].lat));
            },
            leaderString: extremePointLeaderString,
            
            visualSettings: {
                color: "#ee0000",
                textColor: "white",
                scale: 6,
                name: "southLeader",
                value: 0
            },

            include: function(thisAV) {
                return true;
            }
        },

        {
            name: "east",
            label: "East extreme",
            index: -1,
            tiedWith: [],

            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) >
                        parseFloat(waypoints[this.index].lon));
            },
            tiedForLead: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) ==
                        parseFloat(waypoints[this.index].lon));
            },
            leaderString: extremePointLeaderString,
            visualSettings: {
                color: "#8b0000",
                textColor: "white",
                scale: 6,
                name: "eastLeader",
                value: 0
            },

            include: function(thisAV) {
                return true;
            }
        },

        {
            name: "west",
            label: "West extreme",
            index: -1,
            tiedWith: [],

            newLeader: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) <
                        parseFloat(waypoints[this.index].lon));
            },
            tiedForLead: function() {
                return (parseFloat(waypoints[hdxVertexExtremesSearchAV.nextToCheck].lon) ==
                        parseFloat(waypoints[this.index].lon));
            },
            leaderString: extremePointLeaderString,
            visualSettings: {
                color: "#551A8B",
                textColor: "white",
                scale: 6,
                name: "westLeader",
                value: 0
            },

            include: function(thisAV) {
                return true;
            }
        },

        {
            name: "shortest",
            label: "Shortest vertex label",
            index: -1,
            tiedWith: [],
            
            newLeader: function() {
                return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length <
                        waypoints[this.index].label.length);
            },
            tiedForLead: function() {
                return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length ==
                        waypoints[this.index].label.length);
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.shortLabelLeader,

            include: function(thisAV) {
                return thisAV.longshort;
            }
        },
        
        {
            name: "longest",
            label: "Longest vertex label",
            index: -1,
            tiedWith: [],
            
            newLeader: function() {
                return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length >
                        waypoints[this.index].label.length);
            },
            tiedForLead: function() {
                return (waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.length ==
                        waypoints[this.index].label.length);
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.longLabelLeader,

            include: function(thisAV) {
                return thisAV.longshort;
            }
        },
        
        {
            name: "firstalpha",
            label: "First vertex label alphabetically",
            index: -1,
            tiedWith: [],
            
            newLeader: function() {
                return waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.localeCompare(waypoints[this.index].label) < 0;
            },
            tiedForLead: function() {
                return waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.localeCompare(waypoints[this.index].label) == 0;
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.firstLabelLeader,

            include: function(thisAV) {
                return thisAV.firstlast;
            }
        },
        
        {
            name: "lastalpha",
            label: "Last vertex label alphabetically",
            index: -1,
            tiedWith: [],
            
            newLeader: function() {
                return waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.localeCompare(waypoints[this.index].label) > 0;
            },
            tiedForLead: function() {
                return waypoints[hdxVertexExtremesSearchAV.nextToCheck].label.localeCompare(waypoints[this.index].label) == 0;
            },
            leaderString: vertexLabelLeaderString,
            visualSettings: visualSettings.lastLabelLeader,

            include: function(thisAV) {
                return thisAV.firstlast;
            }
        },
    ],

    // the actions that make up this algorithm
    avActions: [
        {
            label: "START",
            comment: "initialize all leader indices to 0",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                for (var i = 0; i < thisAV.categories.length; i++) {
                    thisAV.categories[i].index = 0;
                    thisAV.categories[i].tiedWith = [];
                }
                
                // highlight vertex 0 as leader in all categories and current
                thisAV.nextToCheck = 0;
                thisAV.discarded = 0;

                updateAVControlEntry("undiscovered", waypoints.length + "vertices not yet visited");
                updateAVControlEntry("visiting", "Visiting #0 (initial leader in each category: #0 " + waypoints[0].label);
                updateAVControlEntry("discarded", "0 vertices discarded");

                // show marker 0 as the leader in each category
                // on the map and in the table
                for (var i = 0; i < thisAV.categories.length; i++) {
                    if (!thisAV.categories[i].include(thisAV)) continue;
                    updateMarkerAndTable(thisAV.categories[i].index,
                                         thisAV.categories[i].visualSettings, 
                                         40, false);
                    updateAVControlEntry(
                        thisAV.categories[i].name, 
                        thisAV.categories[i].leaderString(thisAV.categories[i])
                    );
                }
                hdxAV.iterationDone = true;
                hdxAV.nextAction = "forLoopTop";
            },
            logMessage: function(thisAV) {
                return "Initializing leaders to vertex 0";
            }
        },
        {
            label: "forLoopTop",
            comment: "for loop to iterate over remaining vertices",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                thisAV.nextToCheck++;
                if (thisAV.nextToCheck == waypoints.length) {
                    hdxAV.nextAction = "cleanup";
                }
                else {
                    // highlight nextToCheck as current vertex
                    hdxAV.nextAction = "checkNextCategory";
                    thisAV.nextCategory = 0;
                    thisAV.foundNewLeader = false;
                    updateMarkerAndTable(thisAV.nextToCheck, visualSettings.visiting,
                                         30, false);
                    updateAVControlEntry("undiscovered", (waypoints.length - thisAV.nextToCheck) + " vertices not yet visited");
                    updateAVControlEntry("visiting", "Visiting: #" + thisAV.nextToCheck + " " + waypoints[thisAV.nextToCheck].label);
                }
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Top of main for loop over vertices, check=" + thisAV.nextToCheck;
            }
        },
        {
            label: "checkNextCategory",
            comment: "check if current vertex is a new category leader",
            code: function(thisAV) {
                highlightPseudocode(this.label+thisAV.nextCategory,
                                    thisAV.categories[thisAV.nextCategory].visualSettings);
                thisAV.checkedCategory = thisAV.nextCategory;
                if (thisAV.categories[thisAV.nextCategory].newLeader()) {
                    hdxAV.nextAction = "updateNextCategory";
                }
                else {
                    // if handling ties, go to the "else if"
                    if (thisAV.trackTies) {
                        hdxAV.nextAction = "checkTieCategory";
                    }
                    else {
                        // advance category, skipping if necessary
                        do {
                            thisAV.nextCategory++;
                        } while (thisAV.nextCategory < thisAV.categories.length &&
                                 !thisAV.categories[thisAV.nextCategory].include(thisAV));
                        if (thisAV.nextCategory == thisAV.categories.length) {
                            hdxAV.nextAction = "forLoopBottom";
                        }
                        else {
                            hdxAV.nextAction = "checkNextCategory";
                        }
                    }
                }
            },
            logMessage: function(thisAV) {
                return "Check for new " + thisAV.categories[thisAV.checkedCategory].label + " leader";
            }
        },
        {
            label: "updateNextCategory",
            comment: "update new category leader",
            code: function(thisAV) {

                highlightPseudocode(this.label+thisAV.nextCategory,
                                    thisAV.categories[thisAV.nextCategory].visualSettings);
                // remember that we have a new leader so this doesn't
                // get discarded at the end of the loop
                thisAV.foundNewLeader = true;

                // if the old leader is still leading in some other category,
                // color it as such, and if not, discard
                let oldLeaders = thisAV.categories[thisAV.nextCategory].tiedWith.concat([ thisAV.categories[thisAV.nextCategory].index ]);
                
                // this is a loop to check all old leaders
                // not just the first when checking ties
                for (var oldLIndex = 0; oldLIndex < oldLeaders.length; oldLIndex++) {
                    let oldLeader = oldLeaders[oldLIndex];
                    let stillALeader = false;
                    for (var i = 0; i < thisAV.categories.length; i++) {
                        if (i == thisAV.nextCategory) continue;
                        if (!thisAV.categories[i].include(thisAV)) continue;
                        if ((thisAV.categories[i].index == oldLeader) ||
                            thisAV.categories[i].tiedWith.includes(oldLeader)) {
                            stillALeader = true;
                            updateMarkerAndTable(oldLeader,
                                                 thisAV.categories[i].visualSettings, 
                                                 40, false);
                            break;  // could lead in others, but pick the first
                        }
                    }
                    if (!stillALeader) {
                        updateMarkerAndTable(oldLeader, visualSettings.discarded,
                                             20, true);
                        thisAV.discarded++;
                        updateAVControlEntry("discarded", thisAV.discarded + " vertices discarded");
                    }
                }

                // remove all old "tied" values
                if (thisAV.trackTies) {
                    thisAV.categories[thisAV.nextCategory].tiedWith = [];
                }
                
                // update this category to indicate its new leader
                // but keep it shown as the vertex being visited on the
                // map and in the table until the end of the iteration
                thisAV.categories[thisAV.nextCategory].index = thisAV.nextToCheck;

                // update bounding box
                if (thisAV.showBB) {
                    thisAV.directionalBoundingBox();
                }
                
                updateAVControlEntry(
                    thisAV.categories[thisAV.nextCategory].name, 
                    thisAV.categories[thisAV.nextCategory].leaderString(
                        thisAV.categories[thisAV.nextCategory])
                );
                // advance category, skipping if necessary
                do {
                    thisAV.nextCategory++;
                } while (thisAV.nextCategory < thisAV.categories.length &&
                         !thisAV.categories[thisAV.nextCategory].include(thisAV));
                if (thisAV.nextCategory == thisAV.categories.length) {
                    hdxAV.nextAction = "forLoopBottom";
                }
                else {
                    hdxAV.nextAction = "checkNextCategory";
                }
            },
            logMessage: function(thisAV) {
                return "New " + thisAV.categories[thisAV.checkedCategory].label + " leader";
            }
        },

        {
            label: "checkTieCategory",
            comment: "check for tie in a category lead",
            code: function(thisAV) {
                highlightPseudocode(this.label+thisAV.nextCategory,
                                    thisAV.categories[thisAV.nextCategory].visualSettings);
                if (thisAV.categories[thisAV.nextCategory].tiedForLead()) {
                    hdxAV.nextAction = "updateTieCategory";
                }
                else {
                    // advance category, skipping if necessary
                    do {
                        thisAV.nextCategory++;
                    } while (thisAV.nextCategory < thisAV.categories.length &&
                             !thisAV.categories[thisAV.nextCategory].include(thisAV));
                    if (thisAV.nextCategory == thisAV.categories.length) {
                        hdxAV.nextAction = "forLoopBottom";
                    }
                    else {
                        hdxAV.nextAction = "checkNextCategory";
                    }
                }

            },
            
            logMessage: function(thisAV) {
                return "Check for tie in " + thisAV.categories[thisAV.checkedCategory].label;
            }
        },
        {
            label: "updateTieCategory",
            comment: "update tied category leader",
            code: function(thisAV) {

                highlightPseudocode(this.label+thisAV.nextCategory,
                                    thisAV.categories[thisAV.nextCategory].visualSettings);
                // remember that we have a new leader so this doesn't
                // get discarded at the end of the loop
                thisAV.foundNewLeader = true;

                // add to list of values tied for the lead
                thisAV.categories[thisAV.nextCategory].tiedWith.push(thisAV.nextToCheck);
                updateAVControlEntry(
                    thisAV.categories[thisAV.nextCategory].name, 
                    thisAV.categories[thisAV.nextCategory].leaderString(
                        thisAV.categories[thisAV.nextCategory])
                );
                // advance category, skipping if necessary
                do {
                    thisAV.nextCategory++;
                } while (thisAV.nextCategory < thisAV.categories.length &&
                         !thisAV.categories[thisAV.nextCategory].include(thisAV));
                if (thisAV.nextCategory == thisAV.categories.length) {
                    hdxAV.nextAction = "forLoopBottom";
                }
                else {
                    hdxAV.nextAction = "checkNextCategory";
                }
            },
            logMessage: function(thisAV) {
                return "New tie for " + thisAV.categories[thisAV.checkedCategory].label + " leader";
            }
        },

        {
            label: "forLoopBottom",
            comment: "end of for loop iteration",
            code: function(thisAV){

                // if this waypoint is the leader in any category, show it,
                // otherwise it gets discarded
                if (thisAV.foundNewLeader) {
                    for (var i = 0; i < thisAV.categories.length; i++) {
                        if (!thisAV.categories[i].include(thisAV)) continue;
                        if ((thisAV.nextToCheck == thisAV.categories[i].index) ||
                            thisAV.categories[i].tiedWith.includes(thisAV.nextToCheck)) {
                            updateMarkerAndTable(thisAV.nextToCheck,
                                                 thisAV.categories[i].visualSettings, 
                                                 40, false);
                            break;  // just use the first we find
                        }
                    }
                }
                else {
                    updateMarkerAndTable(thisAV.nextToCheck, visualSettings.discarded,
                                         20, true);
                    thisAV.discarded++;
                    updateAVControlEntry("discarded", thisAV.discarded + " vertices discarded");

                }
                hdxAV.iterationDone = true;
                hdxAV.nextAction = "forLoopTop";
            },
            logMessage: function(thisAV) {
                return "Update/discard on map and table";
            }
        },
        {
            label: "cleanup",
            comment: "cleanup and updates at the end of the visualization",
            code: function(thisAV) {
                hdxAV.algStat.innerHTML =
                    "Done! Visited " + markers.length + " waypoints.";
                updateAVControlEntry("undiscovered", "0 vertices not yet visited");
                updateAVControlEntry("visiting", "");
                hdxAV.nextAction = "DONE";
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Cleanup and finalize visualization";
            }
        }
    ],

    // function to draw or update a bounding box of polylines
    // that encloses the directional extremes found so far
    directionalBoundingBox() {

        // note this assumes that the order of the categories
        // has north at 0, south at 1, east at 2, west at 3
        let n = waypoints[this.categories[0].index].lat;
        let s = waypoints[this.categories[1].index].lat;
        let e = waypoints[this.categories[2].index].lon;
        let w = waypoints[this.categories[3].index].lon;
        let nEnds = [[n,w],[n,e]];
        let sEnds = [[s,w],[s,e]];
        let eEnds = [[n,e],[s,e]];
        let wEnds = [[n,w],[s,w]];

        // create or update as appropriate
        if (this.boundingPoly.length == 0) {
            this.boundingPoly.push(
                L.polyline(nEnds, {
                    color: this.categories[0].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            this.boundingPoly.push(
                L.polyline(sEnds, {
                    color: this.categories[1].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            this.boundingPoly.push(
                L.polyline(eEnds, {
                    color: this.categories[2].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            this.boundingPoly.push(
                L.polyline(wEnds, {
                    color: this.categories[3].visualSettings.color,
                    opacity: 0.6,
                    weight: 3
                })
            );
            for (var i = 0; i < 4; i++) {
                this.boundingPoly[i].addTo(map);
            }
        }
        else {
            this.boundingPoly[0].setLatLngs(nEnds);
            this.boundingPoly[1].setLatLngs(sEnds);
            this.boundingPoly[2].setLatLngs(eEnds);
            this.boundingPoly[3].setLatLngs(wEnds);
        }
    },
    
    // required prepToStart function
    // initialize a vertex-based search
    prepToStart() {

        hdxAV.algStat.innerHTML = "Initializing";

        // show waypoints, hide connections
        initWaypointsAndConnections(true, false,
                                    visualSettings.undiscovered);

        // honor bounding box checkbox
        this.showBB = document.getElementById("boundingBox").checked;

        // are we handling ties?
        let tS = document.getElementById("tieHandling");
        this.trackTies = tS.options[tS.selectedIndex].value == "all";
        
        // are we finding shortest/longest labels?
        this.longshort = document.getElementById("longshort").checked;

        // are we finding first/last labels alphabetically?
        this.firstlast = document.getElementById("firstlast").checked;

        // start the search by initializing with the value at pos 0
        updateMarkerAndTable(0, visualSettings.visiting, 40, false);

        // build pseudocode based on options selected
        this.code = '<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">';

        if (this.trackTies) {
            this.code += `
north &larr; {0}, 
south &larr; {0}, 
east &larr; {0}, 
west &larr; {0}<br />
`;
        }
        else {
            this.code += `
north &larr; 0, 
south &larr; 0, 
east &larr; 0, 
west &larr; 0<br />
`;
        }

        if (this.longshort) {
            if (this.trackTies) {
                this.code += `
longest &larr; {0},
shortest &larr; {0}<br />
`;
            }
            else {
                this.code += `
longest &larr; 0,
shortest &larr; 0<br />
`;
            }
        }

        if (this.firstlast) {
            if (this.trackTies) {
                this.code += `
firstalpha &larr; {0},
lastalpha &larr; {0}<br />
`;
            }
            else {
                this.code += `
firstalpha &larr; 0,
lastalpha &larr; 0<br />
`;
            }
        }
        
        this.code += '</td></tr>' +
            pcEntry(0, "for (check &larr; 1 to |V|-1)", "forLoopTop");

        // north
        this.code += pcEntry(1, "if (v[check].lat > v[north].lat)",
                             "checkNextCategory0");
        this.code += pcEntry(2, (this.trackTies ?
                                 "north &larr; {check}" :
                                 "north &larr; check"), "updateNextCategory0");

        if (this.trackTies) {
            this.code += pcEntry(1, "else if (v[check].lat = v[north].lat)",
                                 "checkTieCategory0");
            this.code += pcEntry(2, "north.add(check)", "updateTieCategory0");
        }

        // south
        this.code += pcEntry(1, "if (v[check].lat < v[south].lat)",
                             "checkNextCategory1");
        this.code += pcEntry(2, (this.trackTies ?
                                 "south &larr; {check}" :
                                 "south &larr; check"), "updateNextCategory1");

        if (this.trackTies) {
            this.code += pcEntry(1, "else if (v[check].lat = v[south].lat)",
                                 "checkTieCategory1");
            this.code += pcEntry(2, "south.add(check)", "updateTieCategory1");
        }
        
        // east
        this.code += pcEntry(1, "if (v[check].lng > v[east].lng)",
                             "checkNextCategory2");
        this.code += pcEntry(2, (this.trackTies ?
                                 "east &larr; {check}" :
                                 "east &larr; check"), "updateNextCategory2");

        if (this.trackTies) {
            this.code += pcEntry(1, "else if (v[check].lng = v[east].lng)",
                                 "checkTieCategory2");
            this.code += pcEntry(2, "east.add(check)", "updateTieCategory2");
        }

        // west
        this.code += pcEntry(1, "if (v[check].lng < v[west].lng)",
                             "checkNextCategory3");
        this.code += pcEntry(2, (this.trackTies ?
                                 "west &larr; {check}" :
                                 "west &larr; check"), "updateNextCategory3");

        if (this.trackTies) {
            this.code += pcEntry(1, "else if (v[check].lng = v[west].lng)",
                                 "checkTieCategory3");
            this.code += pcEntry(2, "west.add(check)", "updateTieCategory3");
        }

        if (this.longshort) {
            // shortest
            this.code += pcEntry(1, "if (len(v[check].label) < len(v[shortest].label))",
                                 "checkNextCategory4");
            this.code += pcEntry(2, (this.trackTies ?
                                     "shortest &larr; {check}" :
                                     "shortest &larr; check"), "updateNextCategory4");
            
            if (this.trackTies) {
                this.code += pcEntry(1, "else (len(v[check].label) = len(v[shortest].label))",
                                     "checkTieCategory4");
                this.code += pcEntry(2, "shortest.add(check)", "updateTieCategory4");
            }
            // longest
            this.code += pcEntry(1, "if (len(v[check].label) > len(v[longest].label))",
                                 "checkNextCategory5");
            this.code += pcEntry(2, (this.trackTies ?
                                     "longest &larr; {check}" :
                                     "longest &larr; check"), "updateNextCategory5");
            
            if (this.trackTies) {
                this.code += pcEntry(1, "else (len(v[check].label) = len(v[longest].label))",
                                     "checkTieCategory5");
                this.code += pcEntry(2, "longest.add(check)", "updateTieCategory5");
            }
        }

        if (this.firstlast) {
            // first alphabetically
            this.code += pcEntry(1, "if (v[check].label < v[firstalpha].label)",
                                 "checkNextCategory6");
            this.code += pcEntry(2, (this.trackTies ?
                                     "firstalpha &larr; {check}" :
                                     "firstalpha &larr; check"), "updateNextCategory6");

            if (this.trackTies) {
                this.code += pcEntry(1, "else if (v[check].label = v[firstalpha].label)",
                                     "checkTieCategory6");
                this.code += pcEntry(2, "firstalpha.add(check)", "updateTieCategory6");
            }                    
            // last alphabetically
            this.code += pcEntry(1, "if (v[check].label > v[lastalpha].label)",
                                 "checkNextCategory7");
            this.code += pcEntry(2, (this.trackTies ?
                                     "lastalpha &larr; {check}" :
                                     "lastalpha &larr; check"), "updateNextCategory7");

            if (this.trackTies) {
                this.code += pcEntry(1, "else if (v[check].label = v[lastalpha].label)",
                                     "checkTieCategory7");
                this.code += pcEntry(2, "lastalpha.add(check)", "updateTieCategory7");
            }                    
        }
        
        this.code += "</table>";
        
        addEntryToAVControlPanel("undiscovered", visualSettings.undiscovered);
        addEntryToAVControlPanel("visiting", visualSettings.visiting);
        addEntryToAVControlPanel("discarded", visualSettings.discarded);
        for (var i = 0; i < this.categories.length; i++) {
            if (this.categories[i].include(this)) {
                addEntryToAVControlPanel(this.categories[i].name,
                                         this.categories[i].visualSettings);
            }
        }
    },

    // set up UI for the start of this algorithm
    setupUI() {

        hdxAV.algStat.style.display = "";
        hdxAV.algStat.innerHTML = "Setting up";
        hdxAV.logMessageArr = [];
        hdxAV.logMessageArr.push("Setting up");
        hdxAV.algOptions.innerHTML = `
<input id="boundingBox" type="checkbox" name="Show Bounding Box" checked />&nbsp;
Show Extremes Bounding Box<br />
For Ties, Remember:<br />
<select id="tieHandling">
<option value="first" selected>First Leader Encountered</option>
<option value="all">All Leaders</option>
</select><br />
<input id="longshort" type="checkbox" name="Find Longest/Shortest Labels" checked />
&nbsp;Find Longest/Shortest Labels<br />
<input id="firstlast" type="checkbox" name="Find First/Last Alphabetically" checked />
&nbsp;Find First/Last Labels Alphabetically<br />
`;

    },
        
        
    // remove UI modifications made for vertex extremes search
    cleanupUI() {

        for (var i = 0; i < this.boundingPoly.length; i++) {
            this.boundingPoly[i].remove();
        }
        this.boundingPoly = [];
    },
    
    idOfAction(action){
        if(action.label == "forLoopTop")
        {
            return action.label;
        }
        else
        {
            var category = this.nextCategory;
            var currAction = action.label;
            return (currAction + "" + category);
        }
    }
};
