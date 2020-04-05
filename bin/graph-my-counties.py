import argparse
import matplotlib.pyplot as plt
import numpy as np
from pylab import rcParams
# import matplotlib.ticker as ticker
import csv
import sys
from datetime import datetime

x = []
y = []
myindex = []

# python bin/graph-my-counties.py --county "New York" --graph y --whatToTrack deaths
# python bin/graph-my-counties.py --state "New York" --county "New York City" --build y --whatToTrack deaths
# python bin/graph-my-counties.py --state "New York" --county "New York City" --build y --graph y --whatToTrack deaths
# python bin/graph-my-counties.py --state "New Hampshire" --county "Rockingham" --build y --graph y --whatToTrack cases
# python bin/graph-my-counties.py --state "Maine" --county "Cumberland" --build y --graph y --whatToTrack cases

# python bin/graph-my-counties.py --state "New Hampshire" --county "Rockingham" --build y --mathOperation graph --whatToTrack cases


parser = argparse.ArgumentParser()
parser.add_argument("--county", help="County")
parser.add_argument("--state", help="State")
parser.add_argument("--build", help="Build County")
parser.add_argument("--whatToTrack", help="What to Track")
parser.add_argument("--mathOperation", help="Math Operation (graph)")

args = parser.parse_args()

county = args.county
state = args.state
whatToTrack = args.whatToTrack
mathOperation = args.mathOperation
build = args.build


mycsvfile = "%s.%s" % (state, county)
mycsvfile = mycsvfile.replace(' ', '_')
mycsvfile = mycsvfile.lower()
mycsvfile = "%s.csv" % (mycsvfile)

# print (mycsvfile)

def build (county, state):
    out = open(mycsvfile, mode="w")
    with open ("us-counties.csv", 'r') as csvfile:
        plots = csv.reader(csvfile, delimiter=',')
        for row in plots:
            date = row[0]
            countyName = row[1]
	    stateName = row[2]
	    code = row[3]
	    cases = row[4]
	    deaths = row[5]
            if ((countyName == county) and (stateName == state)):
	        # out.write "{},{},{},{},{},{}".format(date,county, state,code,cases,deaths)
	        outline = "%s,%s,%s,%s,%s,%s\n" % (date,county, state,code,cases,deaths)
	        out.write (outline)
    out.close()	     
	      
def trendline(index,data, order=1):
    coeffs = np.polyfit(index, list(data), order)
    slope = coeffs[-2]
    return float(slope)

def graph (count, state, whatToTrack, noShow):
    rcParams['figure.figsize'] = 15, 10
    with open (mycsvfile, 'r') as csvfile:
        plots = csv.reader(csvfile, delimiter=',')
        rowCounter = 0
        for row in plots:
            rowCounter += 1
            if (not noShow):
                print (row[0])
            mydate = datetime.strptime(row[0], '%Y-%m-%d')

	    if (whatToTrack == "cases"):
	        trackThis = int(row[4])
	    else:
      	        trackThis = int(row[5])
            if (not noShow):
                print trackThis
            if (not noShow):
                print (mydate)
            x.append(mydate)
            y.append(trackThis)
            myindex.append(rowCounter)

    resultent=trendline(myindex,y)
    print "%s\t%s %s" % (resultent, state, county)

    plt.plot(x,y, label="Loading: %s" % (mycsvfile))
    plt.xlabel('x')
    plt.ylabel('y')
    # plt.xticks(x, x[::2], rotation='vertical')
    title = "State: %s County:%s Tracking: %s" % (state,county,whatToTrack)
    plt.title(title)
    plt.legend()
    # fig = plt.figure()
    # fig.add_subplot(221)
    # fig.show()
    #fig.canvas.draw()
    # fig.canvas.flush_events()
    # plt.xticks(np.arange(min(x), max(x)+1, 1.0))
    if (not (noShow)):
        plt.show()



def main():
    build (county, state)
    
    if (mathOperation == "graph"):
        graph (county, state, whatToTrack, 0)
    elif (mathOperation == "trendline"):
        graph (county, state, whatToTrack, 1)
main()        
