# File formats supported by METAL's HDX

---

## Travel Mapping Graph files (.tmg)

[Graph data files](http://tm.teresco.org/graphs/) created by the Travel Mapping site update process are created in this file format, which is described on the [main METAL site](http://courses.teresco.org/metal/graph-formats.shtml).  Any valid file created in .tmg format should be viewable in HDX.

## Travel Mapping Waypoint files (.wpt)

Routes in [Travel Mapping's Highway Data](https://github.com/TravelMapping/HighwayData) are stored in this format.  Each line represents a point on a route that is included in Travel Mapping (a "waypoint"), and includes a waypoint label and a URL that encodes its latitude and longitude.  Lines in the file represent points from one endpoint of the route to the other.  This format can be used for any list of named points with coordinates that one wishes to plot on the map.

## Path files (.pth)

A path file consists of a series of lines each containing a route name, zero or more intermediate points (latitude, longitude pairs), then a waypoint name and a latitude and a longitude, all space-separated, or a line containing a route name and waypoint name followed by a latitude,longitude pair in parentheses.

Two examples follow, first with the points in (lat,lng) format, including the parentheses and comma:

START YT2@BorRd (60.862343,-135.196595)
YT2 YT2@TakHSRd (60.85705,-135.202029)
YT2 (60.849881,-135.203934) (60.844649,-135.187111) (60.830141,-135.187454) YT1_N/YT2_N (60.810264,-135.205286)
YT1,YT2 (60.79662,-135.170288) YT1/YT2@KatRd (60.788579,-135.166302)
YT1,YT2 YT1/YT2@WannRd (60.772479,-135.15044)
YT1,YT2 YT1/YT2@CenSt (60.759893,-135.141191)

and this one with the points specified as numbers without the parentheses or comma:

START YT2@BorRd 60.862343 -135.196595
YT2 YT2@TakHSRd 60.85705 -135.202029
YT2 60.849881 -135.203934 60.844649 -135.187111 60.830141 -135.187454 YT1_N/YT2_N 60.810264 -135.205286
YT1,YT2 60.79662 -135.170288 YT1/YT2@KatRd 60.788579 -135.166302
YT1,YT2 YT1/YT2@WannRd 60.772479 -135.15044
YT1,YT2 YT1/YT2@CenSt 60.759893 -135.141191
