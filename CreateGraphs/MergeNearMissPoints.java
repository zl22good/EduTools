/**
   Rewrite a set of WPT files to merge points that are likely intended
   to be the same but which use slightly different coordinates.

   This program will take all of the files in a given CSV file or files
   (specified on the command line) and rewrite files as needed

   @author Jim Teresco

   The College of Saint Rose
 */
/*

   Modification History

   2013-12-29  JDT Initial implementation

   $Id: MergeNearMissPoints.java 2295 2013-12-31 04:45:42Z terescoj $
*/

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Scanner;

// non-public class to represent the data in a line of a WPT file
// which is the information about a point location
class WPTLine {

    // the coordinates of the waypoint
    protected LatLng point;

    // the list of labels of this waypoint
    protected ArrayList<String> labels;

    protected static DecimalFormat df = new DecimalFormat("#.000000");

    public WPTLine(String line) {

	// build the line from this string
	Scanner s = new Scanner(line);
	labels = new ArrayList<String>(1);
	String item = null;
	while (s.hasNext()) {
	    item = s.next();
	    if (!item.startsWith("http://")) {
		labels.add(item);
	    }
	}
	point = new LatLng(item);
    }

    public String toString() {

	StringBuffer s = new StringBuffer();
	for (String label : labels) {
	    s.append(label + " ");
	}
	s.append("http://www.openstreetmap.org/?lat=" + 
		 df.format(point.lat()) + "&lon=" + df.format(point.lng()));
	return s.toString();
    }

    // get the point
    public LatLng getCoordinates() {

	return point;
    }

    // replace the coordinates with those from elsewhere
    public void replaceCoordinates(LatLng newCoords) {

	point = newCoords;
    }

    public boolean equals(Object o) {
	WPTLine other = (WPTLine)o;
	return other.point.equals(point);
    }

    public boolean almostEquals(Object o) {
	WPTLine other = (WPTLine)o;
	return other.point.almostEquals(point);
    }

}

// represent a WPT file
class WPTFile {

    // original file name
    protected String fileName;

    // arraylist of lines from the file as WPTLine objects
    protected ArrayList<WPTLine> lines;

    // has this file been changed since read?
    protected boolean changed;

    public WPTFile(String wptfile, String highway, 
		   String suffix, String region, boolean debug,
		   ArrayList<String> errorMessages) {
	
	changed = false;
	lines = new ArrayList<WPTLine>();
	// grab the base file name
	fileName = wptfile.substring(wptfile.lastIndexOf("/")+1);

	try {
	    Scanner s = new Scanner(new File(wptfile));
	    if (debug) {
		System.out.print("Processing wpt file: " + wptfile + " for highway " + highway);
		if (suffix.length() > 0)
		    System.out.print(" with suffix " + suffix);
		System.out.println(" in region " + region);
	    }

	    // read lines while we have them
	    while (s.hasNextLine()) {
		lines.add(new WPTLine(s.nextLine()));
	    }

	    s.close();
	}
	catch (FileNotFoundException e) {
	    String errmsg = "Skipping WPT file " + wptfile + ": " + e.getMessage();
	    System.err.println(errmsg);
	    errorMessages.add(errmsg);
	}
    }

    public int matchWith(WPTFile base) {
	int changes = 0;
	// we update any point in this to match coordinates with
	// close but not equal points in base
	for (WPTLine myLine : lines) {
	    for (WPTLine baseLine : base.lines) {
		if (myLine.almostEquals(baseLine) && !myLine.equals(baseLine)) {
		    //if (debug) {
			System.out.println("Matching point in " + fileName);
			System.out.println(myLine);
			System.out.println("with point from " + base.fileName);
			System.out.println(baseLine);
			//}
		    myLine.replaceCoordinates(baseLine.getCoordinates());
		    changed = true;
		    changes++;
		}
	    }
	}
	return changes;
    }

    // have we changed the contents?
    public boolean hasChanged() {

	return changed;
    }

    // write out an updated version of the wpt file to the given folder
    public void writeTo(String path) {
	try {
	    PrintWriter pw = new PrintWriter(new File(path + "/" + fileName));
	    for (WPTLine line : lines) {
		pw.println(line);
	    }
	    pw.close();
	}
	catch (IOException e) {
	    System.err.println("Error writing file to " + path + "/" + fileName);
	}
    }
}


public class MergeNearMissPoints {

    static protected ArrayList<WPTFile> routeFiles;
    static protected boolean debug = false;
    static protected ArrayList<String> errorMessages;
    static protected ArrayList<String> regionFilter;

    protected static void usage() {
	System.err.println("Usage: java MergeNearMissPoints -h");
	System.err.println("Usage: java MergeNearMissPoints [-d] [-r regionlist] [-t tolerance] -i inputpath -o outputbase csvfile [csvfile] ...");
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
	    System.out.println("-t tolerance sets tolerance (in degrees latitude/longitude) for points");
	    System.out.println("              to be considered \"very close\".");
	    System.out.println("-r regionlist specifies one or more comma-separated regions to restrict to,");
	    System.out.println("              any route in a region not listed will be ignored");
	    System.out.println("-i inputpath specifies a path to the input csv files and which should contain");
	    System.out.println("             the subdirectories for each system containing the waypoint files");
	    System.out.println("-o outputpath specifies that output files should be in outputpath");
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

	String outputPath = null;
	String inputPath = ".";

	// the list of files
	routeFiles = new ArrayList<WPTFile>();

	for (int i=0; i<args.length; i++) {

	    // -d turns on a debug mode
	    if (args[i].equals("-d")) {
		debug = true;
		System.out.println("Debug mode enabled.");
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

	    // -o specifies an output file name
	    if (args[i].equals("-o")) {
		i++;
		outputPath = args[i];
		if (debug)
		    System.out.println("Setting directory for output graphs to " + outputPath);
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
			WPTFile file = 
			    new WPTFile(inputPath+"/"+fields[0]+"/"+fields[6]+".wpt", 
					routeName, suffix, fields[1], debug,
					errorMessages);
			routeFiles.add(file);
		    }
		}
	    }
	    catch (FileNotFoundException e) {
		String errmsg = "Skipping file " + args[i] + ": " + e.getMessage();
		System.err.println(errmsg);
		errorMessages.add(errmsg);
	    }
	}

	// make sure we have a value for outputPath
	if (outputPath == null) {
	    System.out.println("Warning: output directory not specified (use -o), using \"/tmp\".");
	    outputPath = "/tmp";
	}

	// we have all of the data in place - now search for points that
	// should match up
	int changeCount = 0;
	for (int fileNumBase = 0; fileNumBase < routeFiles.size(); 
	     fileNumBase++) {
	    // for this file, check each entry against entries in each subsequent file
	    for (int fileNumMatch = fileNumBase + 1;
		 fileNumMatch < routeFiles.size(); fileNumMatch++) {
		changeCount += 
		    routeFiles.get(fileNumMatch).matchWith(routeFiles.get(fileNumBase));
	    }
	}
	// report total
	System.out.println("Changed coordinates for " + changeCount + " points");

	// generate updated files for anything that changed
	for (WPTFile file : routeFiles) {
	    if (file.hasChanged()) {
		file.writeTo(outputPath);
	    }
	}
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
}
