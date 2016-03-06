/**
   Create mapping lab input files from GGM/WPT files from the Clinched
   Highway Mapping project.

   These input files can be found at http://cmap.m-plex.com/data/

   This program will take all of the files in a given CSV file or files
   (specified on the command line) and reformat that data for more
   convenient use as a single graph.

   @author Jim Teresco

   Mount Holyoke College, Siena College, The College of Saint Rose
 */
/*

   Modification History

   2009-11-27  JDT Initial implementation
   2011-01-03  JDT Updated for WPT files
   2011-06-13  JDT Improvements to waypoint label/intersection names
   2011-06-14  JDT Many more improvements to waypoint labels
   2011-06-16  JDT Added region restriction support
   2011-06-20  JDT More waypoint label simplification improvements
   2013-08-13  JDT Fixed to work with new CHM WPT file format (multiple labels)

   $Id: MakeData.java 2152 2013-08-20 19:36:41Z terescoj $
*/

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Scanner;
import structure5.*;

// non-public class to represent the information of a waypoint label
// this encapsulates a route name, region name, and label
class WaypointLabel {

    protected String routeName;
    protected String suffix;
    protected String region;
    protected String label;
    protected boolean usingSuffix;
    protected boolean usingRegion;

    public WaypointLabel(String routeName, String suffix,
			 String region, String label) {

	this.routeName = routeName;
	this.suffix = suffix;
	this.region = region;
	this.label = label;
	usingSuffix = false;
	usingRegion = false;
    }

    public void setRouteName(String newName) {

	routeName = newName;
    }

    public String getRouteName() {

	return routeName;
    }

    public void setSuffix(String suffix) {

	this.suffix = suffix;
    }


    public String getSuffix() {

	return suffix;
    }

    public String getRegion() {

	return region;
    }

    public String getLabel() {

	return label;
    }

    public void setLabel(String newLabel) {

	label = newLabel;
    }

    public void setUsingSuffix(boolean b) {

	usingSuffix = b;
    }

    public void setUsingRegion(boolean b) {

	usingRegion = b;
    }

    public boolean isUsingSuffix() {

	return usingSuffix;
    }

    public boolean isUsingRegion() {

	return usingRegion;
    }

    public boolean equals(Object o) {

	WaypointLabel other = (WaypointLabel)o;
	return routeName.equals(other.routeName) &&
	    suffix.equals(other.suffix) &&
	    region.equals(other.region) &&
	    label.equals(other.label);
    }

    public String toString() {
	StringBuffer s = new StringBuffer();

	s.append(getRouteName());
	if (isUsingSuffix())
	    s.append(getSuffix());
	if (isUsingRegion())
	    s.append(getRegion());
	s.append("@" + getLabel());

	return s.toString();
    }

}

// non-public class to represent the data we will store in graph vertices,
// which is the information about a point location
class Waypoint {

    // the coordinates of the waypoint
    protected LatLng point;

    // the list of labels of this waypoint
    protected ArrayList<WaypointLabel> labels;

    // simplified label, if one exists
    protected String simplifiedLabel;

    // the number of primes added to this waypoint to distinguish its
    // name from otherwise identical other waypoints
    protected int primes;

    public Waypoint(LatLng point) {
	this.point = point;
	labels = new ArrayList<WaypointLabel>(1); // most are just one
	simplifiedLabel = null;
	primes = 0;
    }

    public void addLabel(String highway, String suffix, 
			 String region, String pointName) {
	labels.add(new WaypointLabel(highway,suffix,region,pointName));
    }

    public String toString() {

	// may not want this - may wish to include hidden labels here
	return vertexInfo();

	// old:
	//StringBuffer s = new StringBuffer();
	//s.append(point);
	//for (WaypointLabel label : labels) {
	//    s.append(" " + label.getRouteName() + ":" + label.getLabel());
	//}
	//return s.toString();
    }

    // return if this waypoint has only hidden labels
    public boolean isHiddenOnly() {

	for (WaypointLabel label : labels) {
	    if (label.getLabel().indexOf('+') == -1) return false;
	}

	return true;
    }

    // return the name that would be used for this Waypoint only,
    // without the latitude and longitude information.  Hidden labels
    // (those that contain a +) are included only if all labels are
    // hidden.
    public String vertexLabel() {

	// if we've done a simplification, use it
	if (simplifiedLabel != null)
	    return simplifiedLabel;

	StringBuffer s = new StringBuffer();

	boolean hasNonHidden = !isHiddenOnly();
	//	for (WaypointLabel label : labels) {
	//    if (label.getValue().indexOf('+') == -1) hasNonHidden = true;
	//}

	for (WaypointLabel label : labels) {
	    if (!hasNonHidden || (label.getLabel().indexOf('+') == -1)) {
		s.append("&" + label);
	    }
	}
	for (int i=0; i<primes; i++) {
	    s.append("'");
	}

	if (s.length() == 0) return "";
	return s.substring(1);
    }

    // return a string containing the information about this Waypoint
    // in a format convenient for inclusion in a graph data file
    // including a name and the latitude/longitude pair
    public String vertexInfo() {

	return vertexLabel() + " " + point.lat() + " " + point.lng();
    }

    public boolean equals(Object o) {
	Waypoint other = (Waypoint)o;
	return other.point.equals(point);
    }

    public boolean almostEquals(Object o) {
	Waypoint other = (Waypoint)o;
	return other.point.almostEquals(point);
    }

    // break a naming collision between this and another Waypoint
    public void distinguishFrom(Waypoint other) {

	// sanity checks
	if (!vertexLabel().equals(other.vertexLabel())) {
	    System.err.println("distingishFrom: called on already distinct Waypoints " + vertexInfo() + " and " + other.vertexInfo());
	    System.exit(1);
	}

	if (labels.size() != other.labels.size()) {
	    System.err.println("distinguishFrom: waypoint label count mismatch: " + vertexInfo() + " has " + labels.size() + ", and " + other.vertexInfo() + " has " + other.labels.size());
	    System.exit(1);
	}

	// first, try to add a suffix to one or the other
	for (int i=0; i<labels.size(); i++) {
	    WaypointLabel mine = labels.get(i);
	    mine.setUsingSuffix(true);
	    if (!vertexLabel().equals(other.vertexLabel())) {
		if (MakeData.debug) {
		    System.out.println("Distinguished " + vertexLabel() + " from " + other.vertexLabel() + " by using suffix " + mine.getSuffix() + ".");
		}
		return;
	    }
	    WaypointLabel theirs = other.labels.get(i);
	    theirs.setUsingSuffix(true);
	    if (!vertexLabel().equals(other.vertexLabel())) {
		if (MakeData.debug) {
		    System.out.println("Distinguished " + vertexLabel() + " from " + other.vertexLabel() + " by using suffix " + theirs.getSuffix() + ".");
		}
		return;
	    }
	}

	// try to add the region to one or the other, avoiding a
	// region that is a prefix to the route name (e.g., a region
	// "YT" would not be used to distinguish "YT1" points
	for (int i=0; i<labels.size(); i++) {
	    WaypointLabel mine = labels.get(i);
	    if (!mine.getRouteName().startsWith(mine.getRegion())) {
		mine.setUsingRegion(true);
		if (!vertexLabel().equals(other.vertexLabel())) {
		    if (MakeData.debug) {
			System.out.println("Distinguished " + vertexLabel() + " from " + other.vertexLabel() + " by using region " + mine.getRegion() + ".");
		    }
		    return;
		}
	    }
	    WaypointLabel theirs = other.labels.get(i);
	    if (!theirs.getRouteName().startsWith(theirs.getRegion())) {
		theirs.setUsingRegion(true);
		if (!vertexLabel().equals(other.vertexLabel())) {
		    if (MakeData.debug) {
			System.out.println("Distinguished " + vertexLabel() + " from " + other.vertexLabel() + " by using region " + theirs.getRegion() + ".");
		    }
		    return;
		}
	    }
	}

	// last resort: add a "prime" to the label of this one
	primes++;
	if (MakeData.debug) {
	    System.out.println("Distinguished " + vertexLabel() + " from " + other.vertexLabel() + " by adding a prime.");
	}
    }

    // simplify the label if possible to account for simple intersections,
    // internal multiplex points, etc.
    public void simplify() {

	// redundancies (borders, usually)
	//
	// Example:
	//
	// YT1@YT/BC&YT1@YT/BC
	//
	// becomes
	//
	// YT1@YT/BC
	//
	// remove all redundant as determined by the WaypointLabel toString
	// output (suffix, region ignored where possible)
	for (int i=0; i<labels.size()-1; i++) {
	    String thisLabel = labels.get(i).toString();
	    for (int j=i+1; j<labels.size(); j++) {
		if (thisLabel.equals(labels.get(j).toString())) {
		    // we have found a redundant entry -- remove it
		    if (MakeData.debug) {
			System.out.print("Removing redundant label " + thisLabel + " from " + vertexLabel() + " to obtain ");
		    }
		    labels.remove(j);
		    j--;
		    if (MakeData.debug) {
			System.out.println(vertexLabel());
		    }
		}
	    }
	}

	// multiplex internal point for any number of concurrent routes
	//
	// Example:
	//
	// YT1@CenSt&YT2@CenSt
	//
	// becomes
	//
	// YT1/YT2@CenSt
	//
	// add second (or other subsequent routes) to route of first
	// then remove second

	for (int i=0; i<labels.size()-1; i++) {
	    String thisLabel = labels.get(i).getLabel();
	    for (int j=i+1; j<labels.size(); j++) {
		if (thisLabel.equals(labels.get(j).getLabel())) {
		    // we have found a redundant entry -- remove it
		    if (MakeData.debug) {
			System.out.print("Multiplex internal simplification using " + thisLabel + " from " + vertexLabel() + " to obtain ");
		    }
		    labels.get(i).setRouteName(labels.get(i).getRouteName()+"/"+labels.get(j).getRouteName());
		    labels.remove(j);
		    j--;
		    if (MakeData.debug) {
			System.out.println(vertexLabel());
		    }
		}
	    }
	}

	// nothing to do if we don't have at least two remaining
	// WaypointLabel entries to work with
	if (labels.size() < 2) return;


	// multiplex endpoints and simple intersection
	//
	// Example:
	//
	// YT1@YT6&YT6@YT1
	//
	// becomes
	//
	// YT1/YT6
	//
	// Example:
	//
	// US1@US90_W&US90@US1_N
	//
	// becomes
	//
	// US1_N/US90_W
	//
	// US1@US23_N&US23@US1_N
	//
	// becomes
	//
	// US1_N/US23_N
	if ((labels.size() == 2) &&
	    (labels.get(0).getLabel().startsWith(labels.get(1).getRouteName())) &&
	    (labels.get(1).getLabel().startsWith(labels.get(0).getRouteName()))) {
	    String newLabel = labels.get(1).getLabel() + "/" + labels.get(0).getLabel();
	    if (MakeData.debug) {
		System.out.println("Intersection/Multiplex endpoint simplification of " + vertexLabel() + " to " + newLabel);
	    }
	    simplifiedLabel = newLabel;
	    return;
	}

	// numbered exit concurrency or multiple crossing
	//
	// Example:
	// HenHudPkwy@11&NY9A@HenHudPkwy(11)
	//
	// becomes
	//
	// HenHudPkwy@11/NY9A
	//
	if (labels.size() == 2) {
	    String route0 = labels.get(0).getRouteName();
	    String label0 = labels.get(0).getLabel();
	    String route1 = labels.get(1).getRouteName();
	    String label1 = labels.get(1).getLabel();
	    String newLabel = null;
	    if (label1.equals(route0 + "(" + label0 + ")")) {
		newLabel = route0 + "@" + label0 + "/" + route1 ;
	    }
	    else if (label0.equals(route1 + "(" + label1 + ")")) {
		newLabel = route1 + "@" + label1 + "/" + route0 ;
	    }
	    if (newLabel != null) {
		if (MakeData.debug) {
		    System.out.println("Numbered exit crossing/multiplex simplification of " + vertexLabel() + " to " + newLabel);
		}
		simplifiedLabel = newLabel;
		return;
	    }
	}
	// Yet to consider:

	// simple interstate exit with non-interstate cross route in set
	//
	// I-190@5&MA140@I-190
	//
	// becomes
	//
	// I-190@5/MA140



	// multiway intersection?
	//
	// Example:
	//
	// US1@US202/322&US202@US1/322&US322@US1/202
	//
	// should become:
	//
	// US1/US202/US322

	// Unaddressed problematic cases:
	//
	// interstate mplex with one using exit numbers from other
	// I-10@155C(35)&I-35@155C
	//
	// interstate crossing
	// I-12@38&I-55@29
	//
	// interstate intersection with another highway in set
	// I-10@140A&US90@I-10(140A)
	// or worse yet
	// I-25@151&US20@I-25(151)&US26@I-25(151)&US87@I-25(151)
	//
	// intersections with bannered/suffixed routes
	// US211BusLur@US340Bus&US340BusLur@US211Bus
	//
	// interstate (or similar) route using exit numbers where
	// another route multiplexes
	// I-95@42&MA128@42(95)
	//
	// many roads meet/multiplex
	// NY5/NY12@NY8/840&NY8@NY5/840&NY840@NY5/8s
    }

    // if the point has a mixture of hidden and visible labels,
    // remove the hidden ones
    public void removeUnneededHiddenLabels() {

	if (!isHiddenOnly()) {
	    Iterator<WaypointLabel> i = labels.iterator();
	    while (i.hasNext()) {
		WaypointLabel label = i.next();
		if (label.getLabel().indexOf('+') == 0) {
		    if (MakeData.debug) {
			System.out.println("Removing unneeded hidden label " + label + " from " + vertexLabel());
		    }
		    i.remove();
		}
	    }
	}
    }

}

public class MakeData {

    static protected ArrayList<Waypoint> waypoints;
    static protected ArrayList<ArrayList<String>> connections;
    static protected Graph<Integer,Integer> data;
    static protected boolean debug = false;
    static protected ArrayList<String> errorMessages;
    static protected ArrayList<String> regionFilter;

    protected static void usage() {
	System.err.println("Usage: java MakeData -h");
	System.err.println("Usage: java MakeData [-d] [-f] [-r regionlist] [-c] [-C] [-M] [-t tolerance] -i inputpath -o outputbase csvfile [csvfile] ...");
    }

    public static void main(String args[]) {

	if (args.length == 0) {
	    usage();
	    System.exit(1);
	}

	// -h shows detailed help
	if (args[0].equals("-h")) {
	    System.out.println("This program transforms a set of Clinched Highway Mapping waypoint files into");
	    System.out.println("graph data files that can be used as input for a graph algorithm implementation.");
	    System.out.println("Input is one or more 'csv' files that specify the highways in a system, and");
	    System.out.println("the 'wpt' files listed in the csv that list the names and coordinates of all");
	    System.out.println("of the points that make up the route.");
	    usage();
	    System.out.println("-d turns on debug mode");
	    System.out.println("-f disables waypoint label simplifications");
	    System.out.println("-c enables warnings about very close but not equally positioned points.");
	    System.out.println("-C create a file containing very close but not equally positioned points.");
	    System.out.println("-M merge very close but not equally positioned points.");
	    System.out.println("-t tolerance sets tolerance (in degrees latitude/longitude) for points");
	    System.out.println("              to be considered \"very close\".");
	    System.out.println("-r regionlist specifies one or more comma-separated regions to restrict to,");
	    System.out.println("              any route in a region not listed will be ignored");
	    System.out.println("-i inputpath specifies a path to the input csv files and which should contain");
	    System.out.println("             the subdirectories for each system containing the waypoint files");
	    System.out.println("-o outputbase specifies that output should be in outputbase.{nmp,gra}");
	    System.out.println("csvfile [csvfile] ... are the CSV files containing route lists.");
	    System.exit(0);
	}

	// all error messages will be placed here in addition to being
	// output to make sure they are seen at the end of the run's
	// output
	errorMessages = new ArrayList<String>();

	// region filter -- if this exists, its contents specify a
	// filter on regional data to include from all csv files
	regionFilter = null;

	// Create the Graph to store the data we read in. Vertices are
	// indices into a ArrayList that contains the details of the
	// Vertex.  This ArrayList contains Waypoint objects, which
	// associate a LatLng with a ArrayList of WaypointLabel
	// objects.  The WaypointLabel encapsulates the highway name,
	// the region in which it exists, the suffix used to
	// differentiate between multiple routes with the same name
	// within a region, and label associated with this point by
	// this highway.  Edges are a ArrayList of Strings, each of
	// which specifies a highway that connects the two points.

	waypoints = new ArrayList<Waypoint>();
	connections = new ArrayList<ArrayList<String>>();
	data = new GraphListUndirected<Integer,Integer>();
	String outputBase = null;
	String inputPath = ".";
	boolean simplifyLabels = true;
	boolean reportNearMatches = false;
	boolean outputNearMatches = false;
	boolean mergeNearMatches = false;

	for (int i=0; i<args.length; i++) {

	    // -d turns on a debug mode
	    if (args[i].equals("-d")) {
		debug = true;
		System.out.println("Debug mode enabled.");
		continue;
	    }

	    // -c enables warnings for nearly colocated points
	    if (args[i].equals("-c")) {
		reportNearMatches = true;
		System.out.println("Near match warnings enabled.");
		continue;
	    }
	    // -C enables output to a file for nearly colocated points
	    if (args[i].equals("-C")) {
		outputNearMatches = true;
		System.out.println("Near match output file enabled.");
		continue;
	    }

	    // -M enables merging of nearly colocated points
	    if (args[i].equals("-M")) {
		mergeNearMatches = true;
		System.out.println("Near match merging enabled.");
		continue;
	    }

	    if (args[i].equals("-t")) {
		i++;
		double newTolerance = Double.parseDouble(args[i]);
		LatLng.setNearbyTolerance(newTolerance);
		if (debug)
		    System.out.println("Set \"nearby\" tolerance to " +
				       newTolerance);
		continue;
	    }

	    // -f turns off point label simplifications
	    if (args[i].equals("-f")) {
		simplifyLabels = false;
		System.out.println("Point simplification disabled.");
		continue;
	    }

	    // -o specifies an output file name
	    if (args[i].equals("-o")) {
		i++;
		outputBase = args[i];
		if (debug)
		    System.out.println("Setting base name for output graphs to " + outputBase);
		continue;
	    }

	    // -i specifies a path to input files
	    if (args[i].equals("-i")) {
		i++;
		inputPath = args[i];
		if (debug)
		    System.out.println("Setting input path to " + inputPath);
		continue;
	    }

	    // -r specifies a comma-separated region filter list
	    if (args[i].equals("-r")) {
		i++;
		if (debug) {
		    System.out.print("Restricting to regions:");
		}
		String regions[] = args[i].split(",");
		regionFilter = new ArrayList<String>(regions.length);
		for (int j=0; j<regions.length; j++) {
		    if (debug) {
			System.out.print(" " + regions[j]);
		    }
		    regionFilter.add(regions[j]);
		}
		if (debug) {
		    System.out.println(".");
		}
		continue;
	    }

	    if (!args[i].endsWith(".csv")) {
		String errmsg = "Skipping non-csv file " + args[i];
		System.err.println(errmsg);
		errorMessages.add(errmsg);
		continue;
	    }

	    // read this csv file
	    try {
		String csvFileName = inputPath+"/"+args[i];
		Scanner s = new Scanner(new File(csvFileName));
		if (debug)
		    System.out.println("Processing csv file: " + csvFileName);
		// the first line is junk, ignore it
		s.nextLine();
		
		// remaining lines should be semicolon-separated lines
		// denoting highway description files:
		// system;region;routename;type;suffix;place;filename
		while (s.hasNext()) {
		    String fields[] = s.nextLine().split(";");
		    if ((regionFilter != null) && !regionFilter.contains(fields[1])) {
			if (debug) {
			    System.out.println("Region filter skipping file " + fields[6] + ".wpt from region " + fields[1]+ " in " + csvFileName);
			}
		    }
		    else {
			// if there is a type, use it and the suffix, otherwise
			// pass any suffix as an optional tiebreakers only
			String routeName = fields[2];
			String suffix = fields[4];
			if (!fields[3].equals("")) {
			    routeName = fields[2] + fields[3] + fields[4];
			    suffix = "";
			}
			// pass in the filename path, route name string,
			// suffix, and region
			processFile(inputPath+"/"+fields[0]+"/"+fields[6]+".wpt", 
				    routeName, suffix, fields[1], mergeNearMatches);
		    }
		}
	    }
	    catch (FileNotFoundException e) {
		String errmsg = "Skipping file " + args[i] + ": " + e.getMessage();
		System.err.println(errmsg);
		errorMessages.add(errmsg);
	    }
	}

	// we can now (and need to) remove any hidden labels for
	// points that have no hidden labels
	for (Waypoint w : waypoints) {
	    w.removeUnneededHiddenLabels();
	}

	// make sure we don't have duplicate vertex labels
	ArrayList<String> allLabels = new ArrayList<String>(waypoints.size());
	for (Waypoint w : waypoints) {
	    int index = 0;
	    String label = null;
	    while (index != -1) {
		label = w.vertexLabel();
		index = allLabels.indexOf(label);
		if (index != -1) {
		    // make a change to distinguish this label
		    // from the existing duplicate
		    Waypoint other = waypoints.get(index);
		    w.distinguishFrom(other);
		    allLabels.set(index, other.vertexLabel());
		}
	    }
	    allLabels.add(label);
	}

	// try to simplify labels for intersections, multiplexes, etc.
	if (simplifyLabels) {
	    for (Waypoint w : waypoints) {
		w.simplify();
	    }
	}

	// make sure we have a value for outputBase
	if (outputBase == null) {
	    System.out.println("Warning: output file name not specified (use -o), using \"unspecified\".");
	    outputBase = "unspecified";
	}

	// report/output possible near matches now, if requested
	if (reportNearMatches || outputNearMatches) {
	    System.out.println("Checking for nearly colocated waypoints.");
	    int nearMatches = 0;
	    PrintWriter pw = null;

	    if (outputNearMatches) {
		try {
		    pw = new PrintWriter(new File(outputBase + ".nmp"));

		}
		catch (Exception e) {
		    System.err.println(e);
		    errorMessages.add(e.toString());
		}
	    }

	    for (int i=0; i<waypoints.size()-1; i++) {
		for (int j=i+1; j<waypoints.size(); j++) {
		    if (waypoints.get(i).almostEquals(waypoints.get(j))) {
			if (reportNearMatches) {
			    System.out.println("Nearly colocated waypoints " + waypoints.get(i) + " and " + waypoints.get(j));
			}
			if (outputNearMatches) {
			    pw.println(waypoints.get(i));
			    pw.println(waypoints.get(j));
			}
			nearMatches++;
		    }
		}
	    }
	    System.out.println("Found " + nearMatches + " nearly colocated waypoint(s).");
	    if (outputNearMatches) {
		pw.close();
	    }
	}

	// produce the full graph (with hidden points as vertices)
	outputFullGraph(outputBase);

	// TODO: next, collapse hidden waypoints for a more compact
	// graph structure

	// if there were error messages, print them again now
	if (errorMessages.isEmpty()) {
	    if (debug) {
		System.out.println("Completed with no errors.");
	    }
	}
	else {
	    System.err.println("**** ERRORS WERE ENCOUNTERED ***");
	    System.err.println("The following were reported as they occurred:");
	    for (String errMsg : errorMessages) {
		System.err.println(errMsg);
	    }
	}
    }

    // process the given wpt file containing data for the specified highway
    private static void processFile(String wptfile, String highway, 
				    String suffix, String region, 
				    boolean mergeNearMatches) {
	
	try {
	    Scanner s = new Scanner(new File(wptfile));
	    if (debug) {
		System.out.print("Processing wpt file: " + wptfile + " for highway " + highway);
		if (suffix.length() > 0)
		    System.out.print(" with suffix " + suffix);
		System.out.println(" in region " + region);
	    }
	    Integer previousVertex = null;

	    // read line by line, a point name and Google Maps/OSM URL
	    while (s.hasNext()) {
		String pointName = s.next();
		// skip over alternate labels until we find something
		// that looks like an OSM URL
		String osmUrl = s.next();
		while (!osmUrl.startsWith("http://"))
		    osmUrl = s.next();
		LatLng point = new LatLng(osmUrl);
		//System.out.println("Looking for point " + point + " for highway " + highway + " pointName " + pointName);

		// see if we already have a vertex representing this point
		// in our data graph
		Waypoint w = new Waypoint(point);

		boolean foundExisting = false;
		int index = -1;
		// check for an existing "equal" or posisbly "nearby" point
		for (Waypoint existing : waypoints) {
		    if (existing.equals(w)) {
			w = existing;
			index = waypoints.indexOf(existing);
			if (debug)
			    System.out.println("Found existing equivalent point at index " + index);
			foundExisting = true;
		    }
		    else if (mergeNearMatches && existing.almostEquals(w)) {
			w = existing;
			index = waypoints.indexOf(existing);
			if (debug)
			    System.out.println("Found existing nearby point at index " + index);
			foundExisting = true;
		    }
		    if (foundExisting) break;
		}
		if (!foundExisting) {
		    waypoints.add(w);
		    index = waypoints.size()-1;
		    data.add(index);
		    if (debug)
			System.out.println("Adding new point at index " + index + ": " + w);
		}

		w.addLabel(highway,suffix,region,pointName);

		// flag to see if we just encountered two consecutive vertices
		// at the same location, in which case a self-referential edge
		// should not be added and the previousVertex should not be
		// updated
		boolean duplicate = false;
		// now add an edge if this is not the first entry from the file
		if (previousVertex != null) {
		    if (previousVertex == index) {
			duplicate = true;
		    }
		    else {
			ArrayList<String> connection = null;
			if (data.containsEdge(previousVertex, index)) {
			    Edge<Integer,Integer> e = data.getEdge(previousVertex, index);
			    connection = connections.get(e.label());
			    if (debug)
				System.out.println("Adding to connection for existing edge " + e);
			}
			else {
			    connection = new ArrayList<String>(1);
			    connections.add(connection);
			    data.addEdge(previousVertex, index, connections.size()-1);
			    if (debug)
				System.out.println("Adding to connection for new edge " + data.getEdge(previousVertex, index));
			}
			if (debug)
			    System.out.println("Adding highway to connection: " + highway);
			connection.add(highway);
		    }
		}
		if (!duplicate) previousVertex = index;
	    }
	}
	catch (FileNotFoundException e) {
	    String errmsg = "Skipping WPT file " + wptfile + ": " + e.getMessage();
	    System.err.println(errmsg);
	    errorMessages.add(errmsg);
	}
    }

    // write the full graph, including hidden waypoints as vertices and
    // edges connecting them
    private static void outputFullGraph(String outputBase) {
	PrintWriter pw;

	try {
	    pw = new PrintWriter(new File(outputBase + ".gra"));
	    
	    // first, write the number of vertices and number of edges
	    pw.println(data.size() + " " + data.edgeCount());
	    
	    // loop over vertices, writing out labels followed by a lat/lng pair
	    for (int vertexNumber=0; vertexNumber < waypoints.size(); vertexNumber++) {
		Waypoint w = waypoints.get(vertexNumber);
		pw.println(w.vertexInfo());
	    }
	    
	    // loop over edges, write out vertex endpoint indices (from list above)
	    // and a label representing the routes that traverse this edge
	    
	    Iterator<Edge<Integer,Integer>> edgeIter = data.edges();
	    while (edgeIter.hasNext()) {
		Edge<Integer,Integer> e = edgeIter.next();
		pw.print(e.here() + " " + e.there());
		ArrayList<String> connection = connections.get(e.label());
		pw.print(" " + connection.get(0));
		for (int i=1; i<connection.size(); i++) {
		    pw.print("," + connection.get(i));
		}
		pw.println();
	    }
	    
	    pw.close();
	}
	catch (Exception e) {
	    System.err.println(e);
	    errorMessages.add(e.toString());
	}
    }

    /*
    public static void oldmain(String args[]) {
	String dirPath = null;

	if (args.length == 0) {
	    dirPath = ".";
	}
	else if (args.length == 1) {
	    dirPath = args[0];
	}
	else {
	    System.err.println("Usage: java MakeData [directory path]");
	    System.exit(1);
	}

	File dir = new File(dirPath);

	if (!dir.isDirectory()) {
	    System.err.println("File " + dirPath + " is not a directory.  Aborting.");
	    System.exit(1);
	}

	File files[] = dir.listFiles();

	for (int i=0; i<files.length; i++) {
	    // skip non .wpt files
	    if (!files[i].endsWith(".wpt")) continue;
	    Scanner s = new Scanner(files[i]);
	}
    }
    */
}
