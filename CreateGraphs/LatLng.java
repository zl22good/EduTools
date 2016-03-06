/**
   Store a latitude/longitude pair

   @author Jim Teresco, Mount Holyoke College, Siena College

   Modification History

   2009-11-?? JDT  Initial implementation
   2010-01-03 JDT  Added OSM support to constructor
   2013-08-19 JDT  Added ability to override "nearby" value

*/
/* $Id: LatLng.java 2152 2013-08-20 19:36:41Z terescoj $ */

import java.util.Scanner;

public class LatLng {

    /** the lat/lng coordinates */
    protected double lat, lng;

    /** tolerance for considering two points equal */
    public static final double TOLERANCE = 0.0000001;

    /** default tolerance for considering two points almost equal */
    public static final double DEFAULT_NEARBY = 0.0001;

    /** actual tolerance for considering two points almost equal */
    private static double nearby = DEFAULT_NEARBY;

    /**
       Constructor for a LatLng object, specifying lat/lng points.

       @param lat latitude
       @param lng longitude
    */
    public LatLng(double lat, double lng) {
	this.lat = lat;
	this.lng = lng;
    }

    /**
       Construct a LatLng from a Google Maps or Open Street Maps URL.

       @param url the String specifying a Google Maps or OSM URL
       @pre url contains a Google Maps URL (at least an ll= query string
       parameter that specifies lat,lng), OR url contains a OpenStreetMaps
       URL (at least the lat= and lon= query string parameters)
    */
    public LatLng(String url) {
	String latStr = null;
	String lonStr = null;

	int index = url.indexOf("ll=");
	if (index >= 0) { // it's a GGM
	    String llpart = url.substring(index+3);
	    if (llpart.indexOf("&") > 0) {
		llpart = llpart.substring(0, llpart.indexOf("&"));
	    }
	    String parts[] = llpart.split(",");
	    latStr = parts[0];
	    lonStr = parts[1];
	}
	else {
	    index = url.indexOf("lat=");
	    if (index >= 0) { // it's OSM
		latStr = url.substring(index+4);
		if (latStr.indexOf("&") > 0) {
		    latStr = latStr.substring(0, latStr.indexOf("&"));
		}
		index = url.indexOf("lon=");
		if (index >= 0) {
		    lonStr = url.substring(index+4);
		    if (lonStr.indexOf("&") > 0) {
			lonStr = lonStr.substring(0, lonStr.indexOf("&"));
		    }
		}
	    }
	}
	if ((latStr == null) || (lonStr == null)) {
	    throw new IllegalArgumentException("Could not find lat/lng in \"" + url + "\"");
	}
	lat = Double.parseDouble(latStr);
	lng = Double.parseDouble(lonStr);
    }

    /**
       Set the tolerance, measured in degrees latitude or longitude
       for points to be considered "nearby" for consolidation or "near
       miss" status.  For two points to be considered "nearby" the
       differences in both latitude and longitude must be less than
       this tolerance.

       Note: this takes effect globally (for all comparisons)

       @param the new tolerance in degrees latitude and longitude
    */
    public static void setNearbyTolerance(double newTol) {

	nearby = newTol;
    }

    /**
       @return the latitude
    */
    public double lat() {
	return lat;
    }

    /**
       @return the longitude
    */
    public double lng() {
	return lng;
    }

    /**
       Compare another LatLng with this for equality, subject to the
       specified tolerance.

       @param o the other LatLng
       @pre o instanceof LatLng
       @return whether the two lat/lng pairs should be considered equal
    */
    public boolean equals(Object o) {
	LatLng other = (LatLng)o;

	return ((Math.abs(other.lat-lat) < TOLERANCE) &&
		(Math.abs(other.lng-lng) < TOLERANCE));
    }

    /**
       Compare another LatLng with this for near equality, subject to
       the specified distance.

       @param o the other LatLng
       @pre o instanceof LatLng
       @return whether the two lat/lng pairs should be considered nearly equal
    */
    public boolean almostEquals(Object o) {
	LatLng other = (LatLng)o;

	return ((Math.abs(other.lat-lat) < nearby) &&
		(Math.abs(other.lng-lng) < nearby));
    }

    /**
       Formatted String representation of this LatLng.

       @return a formatted String representation of this LatLng
    */
    public String toString() {

	return "(" + lat + "," + lng + ")";
    }

    /**
       main method for testing of LatLng class

       @param args testing parameters -- if args contains anything,
          its entries will be used as the URL to test, otherwise,
          builtin tests will be used.
    */
    public static void main(String args[]) {
	String testCases[];

	if (args.length >= 1) {
	    testCases = args;
	}
	else {
	    testCases = new String[8];
	    testCases[0] = "http://www.openstreetmap.org/?lat=42.603772&lon=-79.028263";
	    testCases[1] = "lat=42.603772&lon=-79.028263";
	    testCases[2] = "lat=42.603779&lon=-79.028283&somethinglse=xiuh";
	    testCases[3] = "http://maps.google.com/?ie=UTF8&ll=42.93748,-74.192777&spn=0.004658,0.011222&z=17";
	    testCases[4] = "ll=42.93748,-74.192777";
	    testCases[5] = "ie=UTF8&ll=42.93748,-74.192777&spn=0.004658,0.011222&z=17";
	    testCases[6] = "this isn't valid at all, is it?";
	    testCases[7] = "lat=33.23234";
	}

	// base case for testing equality
	LatLng base = new LatLng(42.603772, -79.028263);
	System.out.println("Original point: " + base);

	for (int i = 0; i < testCases.length; i++) {
	    try {
		System.out.println("URL string: " + testCases[i]);
		LatLng ll = new LatLng(testCases[i]);
		System.out.println("Found point: " + ll);
		System.out.println("Equal to original?: " + base.equals(ll));
	    }
	    catch (Exception e) {
		System.out.println(e);
	    }
	}
    }
}
