# Ideas on how to redesign METAL's algorithm visualizations with HDX

A goal here is to develop a system that separates out the specifics of
any algorithm from the underlying system that interacts with Google
Maps and the rest of our GUI.

For a given algorithm visualization, we can think of the following
objects in the system

* the map
* markers, polylines, infowindows on the map
* various overlay groups (legend/simulation control, waypoint/connection table)
* elements within those groups (specific controls, specific informational displays, etc.)
* the actual algorithm, its statements and variables
* the mapping between the algorithm and the visualization

One possibility: a system where the main "loop" is just a series of generic "events", each of which is responsible for one step of an algorithm.  This event would update data structures and variables, update corresponding items on the screen, including map, tabular, and other data, and set up the next event.

