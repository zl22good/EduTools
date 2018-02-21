# File formats supported by METAL's HDX

---

## Travel Mapping Graph files (.tmg)

[Graph data files](http://tm.teresco.org/graphs/) created by the Travel Mapping site update process are created in this file format, which is described on the [main METAL site](http://courses.teresco.org/metal/graph-formats.shtml).  Any valid file created in .tmg format should be viewable in HDX.

## Travel Mapping Waypoint files (.wpt)

Routes in [Travel Mapping's Highway Data](https://github.com/TravelMapping/HighwayData) are stored in this format.  Each line represents a point on a route that is included in Travel Mapping (a "waypoint"), and includes a waypoint label and a URL that encodes its latitude and longitude.  Lines in the file represent points from one endpoint of the route to the other.  This format can be used for any list of named points with coordinates that one wishes to plot on the map.


