#!/usr/bin/env python3
# METAL Project, Jim Teresco, 2018
"""Program to generate a METAL TMG-format graph of the project logo
that can be rendered in HDX.

(c) 2018, Jim Teresco
"""

class VertexInfo:
    """This class encapsulates information needed for a vertex.
    """

    def __init__(self, lat, lng, label):
        self.lat = lat
        self.lng = lng
        self.label = label

class EdgeInfo:
    """This class encapsulates information needed for an edge.
    """

    def __init__(self, src, dest, label):
        self.src = src
        self.dest = dest
        self.label = label

# Execution code starts

# within what bounding box on the map should the graph be drawn?
toplat = 43.5
bottomlat = 42.0
leftlng = -76.0
rightlng = -72.0

# how much wider are letters than the space between them?
charwidthfactor = 6

# we need to solve this system of equations to find
# letterwidth and spacewidth to be used for letter positioning
# along the longitudes
#
# The 5 is the number of letters (assuming fixed-width) and 4
# is the number of spaces between letters
#
# 5 * letterwidth + 4 * spacewidth = rightlng - leftlng
# letterwidth = charwidthfactor * spacewidth
#
# the following are the result of solving the system
spacewidth = (rightlng - leftlng) / (5 * charwidthfactor + 4)
letterwidth = charwidthfactor * spacewidth

# letter height
height = toplat - bottomlat

#print("spacewidth " + str(spacewidth))
#print("letterwidth " + str(letterwidth))
#print("height " + str(height))

# lists of vertices and edges
vertices = []
edges = []

# look up vertex number given label
def vertex_num(vertices, label):
    for i in range(len(vertices)):
        if label == vertices[i].label:
            return i
    return -1

# build the 'M'
leftedge = leftlng
vertices.append(VertexInfo(bottomlat, leftedge, "MSW"))
vertices.append(VertexInfo(toplat, leftedge, "MNW"))
vertices.append(VertexInfo(bottomlat + height/2, leftedge + letterwidth/2, "Mpoint"))
vertices.append(VertexInfo(toplat, leftedge + letterwidth, "MNE"))
vertices.append(VertexInfo(bottomlat, leftedge + letterwidth, "MSE"))

edges.append(EdgeInfo(vertex_num(vertices, "MSW"), vertex_num(vertices, "MNW"), "M"))
edges.append(EdgeInfo(vertex_num(vertices, "MNW"), vertex_num(vertices, "Mpoint"), "M"))
edges.append(EdgeInfo(vertex_num(vertices, "Mpoint"), vertex_num(vertices, "MNE"), "M"))
edges.append(EdgeInfo(vertex_num(vertices, "MNE"), vertex_num(vertices, "MSE"), "M"))

# build the 'E'
leftedge += letterwidth + spacewidth
vertices.append(VertexInfo(bottomlat, leftedge, "ESW"))
vertices.append(VertexInfo(bottomlat + height/2, leftedge, "Econn"))
vertices.append(VertexInfo(toplat, leftedge, "ENW"))
vertices.append(VertexInfo(bottomlat, leftedge + letterwidth, "ESE"))
vertices.append(VertexInfo(bottomlat + height/2, leftedge + letterwidth, "Epoint"))
vertices.append(VertexInfo(toplat, leftedge + letterwidth, "ENE"))

edges.append(EdgeInfo(vertex_num(vertices, "ESW"), vertex_num(vertices, "Econn"), "E"))
edges.append(EdgeInfo(vertex_num(vertices, "Econn"), vertex_num(vertices, "ENW"), "E"))
edges.append(EdgeInfo(vertex_num(vertices, "ENW"), vertex_num(vertices, "ENE"), "E"))
edges.append(EdgeInfo(vertex_num(vertices, "Econn"), vertex_num(vertices, "Epoint"), "E"))
edges.append(EdgeInfo(vertex_num(vertices, "ESW"), vertex_num(vertices, "ESE"), "E"))

# build the 'T'
leftedge += letterwidth + spacewidth
vertices.append(VertexInfo(bottomlat, leftedge + letterwidth/2, "Tbottom"))
vertices.append(VertexInfo(toplat, leftedge, "TNW"))
vertices.append(VertexInfo(toplat, leftedge + letterwidth/2, "Tconn"))
vertices.append(VertexInfo(toplat, leftedge + letterwidth, "TNE"))

edges.append(EdgeInfo(vertex_num(vertices, "TNW"), vertex_num(vertices, "Tconn"), "T"))
edges.append(EdgeInfo(vertex_num(vertices, "TNE"), vertex_num(vertices, "Tconn"), "T"))
edges.append(EdgeInfo(vertex_num(vertices, "Tbottom"), vertex_num(vertices, "Tconn"), "T"))

# build the 'A'
leftedge += letterwidth + spacewidth
vertices.append(VertexInfo(bottomlat, leftedge, "ASW"))
vertices.append(VertexInfo(toplat, leftedge + letterwidth/2, "Atop"))
vertices.append(VertexInfo(bottomlat, leftedge + letterwidth, "ASE"))
vertices.append(VertexInfo(bottomlat + height/2, leftedge + letterwidth/4, "Aleftconn"))
vertices.append(VertexInfo(bottomlat + height/2, leftedge + 3*letterwidth/4, "Arightconn"))

edges.append(EdgeInfo(vertex_num(vertices, "ASW"), vertex_num(vertices, "Aleftconn"), "A"))
edges.append(EdgeInfo(vertex_num(vertices, "Atop"), vertex_num(vertices, "Aleftconn"), "A"))
edges.append(EdgeInfo(vertex_num(vertices, "ASE"), vertex_num(vertices, "Arightconn"), "A"))
edges.append(EdgeInfo(vertex_num(vertices, "Atop"), vertex_num(vertices, "Arightconn"), "A"))
edges.append(EdgeInfo(vertex_num(vertices, "Aleftconn"), vertex_num(vertices, "Arightconn"), "A"))

# build the "L"
leftedge += letterwidth + spacewidth
vertices.append(VertexInfo(bottomlat, leftedge, "LSW"))
vertices.append(VertexInfo(toplat, leftedge, "LNW"))
vertices.append(VertexInfo(bottomlat, leftedge + letterwidth, "LSE"))

edges.append(EdgeInfo(vertex_num(vertices, "LSW"), vertex_num(vertices, "LNW"), "L"))
edges.append(EdgeInfo(vertex_num(vertices, "LSW"), vertex_num(vertices, "LSE"), "L"))


# output TMG file
print("TMG 1.0 collapsed")
print(str(len(vertices)) + " " + str(len(edges)))
for v in vertices:
    print(v.label + " " + str(v.lat) + " " + str(v.lng))

for e in edges:
    print(str(e.src) + " " + str(e.dest) + " " + e.label)
