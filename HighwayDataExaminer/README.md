The Highway Data Examiner (HDX) can be installed on any web server.  In addition to installing the files here, it requires access to the Travel Mapping "lib" directory to find common code and images.  A copy of TravelMapping/Web can be installed for this purpose.  In the HDX installation directory, "tmlib" needs to be a copy of TravelMapping/Web/lib or be a link to one.

The JS code for HDX is split among several files for easier management.

* `hdxav.js` contains the  `hdxAV` object, which is the main AV engine.
* `hdxavcp.js` contains functionality of the Algorithm Visualization Control Panel (AVCP).
* `hdxbfchav.js` contains the implementation for the brute-force convex hull AV.
* `hdxcallbacks.js` contains implementation of UI callback functions.
* `hdxdegreeav.js` contains the implementation of the vertex degree extremes search AV.
* `hdxdfsrecav.hs` contains the implementation of the recursive depth-first traversal AV.
* `hdxedgeextremesav.js` contains the implementation of the edge-based extremes search AV.
* `hdxextremepairsav.js` contains the implementation of the extreme pairs (closest and furthest pairs) AV.
* `hdxgraphsearchbox.js` contains the functionality related to the "Option 1" search box for loading graph data.
* `hdxhover.js` contains the implementation of "hover over" highlighting of graph vertices and edges.
* `hdxinstructions.js` contains the implementation of the instructions panel that pops up when HDX is first loaded.
* `hdxjsfuncs.js` contains miscellaneous functions and data.
* `hdxlinear.js` contains the implementation of the `HDXLinear` objects, which reprsent the structures including stacks, queues, and priority queues, with a representation in the AVCP.
* `hdxkruskalav.js` contains the implementation of the Kruskal's algorithm AV.
* `hdxnoav.js` contains the implementation of the dummy "no AV selected" AV.
* `hdxpseudocode.js` contains functions related to pseudocode display and highlighting.
* `hdxtravspanavs.js` contains the implementations of the graph traversal (BFS, DFS, RFS) and spanning tree (Dijkstra's, Prim's) AVs.
* `hdxvertexextremesav.js` contains the implementation of the vertex-based extremes search AV.
* `hdxvertexselector.js` contains the implemenation of the vertex selector objects, which allow the selection of a vertex as an AV parameter by entering its number, clicking on it on the map, or clicking on it in the data table.
* `hdxvisualsettings.js` contains the object that defines visual settings (colors, sizes, opacities) that are used consistently across multiple AVs.
