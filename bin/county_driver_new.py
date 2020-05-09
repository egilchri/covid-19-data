#!/usr/bin/python

# import matplotlib.ticker as ticker
from datetime import datetime
from pylab import rcParams
import argparse
import csv
import matplotlib.pyplot as plt
import numpy as np
import os
import re
import sys

x = []
y = []
myindex = []

parser = argparse.ArgumentParser()
parser.add_argument("--base_counties", help="Base counties file (all_counties.txt, my_counties.txt")

parser.add_argument("--what_to_trace", help="cases or deaths ")

parser.add_argument("--TODAY", help="Date of Today ")

args = parser.parse_args()
base_file = args.base_counties
what_to_trace = args.what_to_trace
TODAY = args.TODAY




def county_driver (base_file, what_to_trace, output_file):
    counties_file = "county_data/%s" % (base_file)
    # counties_file = "county_data/counties.txt"

    out = open(output_file, mode="w")
    with open(counties_file) as fp: 
        all_lines = fp.readlines()
        
        if (0):
            counties_dict = {}
            for line in all_lines:
                line = line.rstrip()  
                [state,countyAndFips] = line.split('.')
                [county,fips] = countyAndFips.split('|')
                state = state.replace("_", " ")
                county = county.replace("_", " ")
                counties_dict["%s.%s.%s" % (state, county, fips)] = 1
        
        for line in all_lines:
            line = line.rstrip()  
            [state,countyAndFips] = line.split('.')
            [county,fips] = countyAndFips.split('|')
            state = state.replace("_", " ")
            county = county.replace("_", " ")
            # print "state: %s county: %s" % (state, county)

            graph_my_counties (state, county, fips, what_to_trace,out)
    out.close()



def graph_my_counties (state, county, fips, whatToTrack, output_file):
    build (county, state)
    mathOperation = 'trendline'
    if (mathOperation == "graph"):
        showGraph=1
        graph (county, state, whatToTrack, showGraph, 0, fips)
    elif (mathOperation == "trendline"):
        showGraph=0
#        graph (county, state, whatToTrack, )
        graph (county, state, whatToTrack, showGraph, 0, fips, output_file)
    elif (mathOperation == "trendlineOverTime"):
        showGraph=1
        overTime=1
        graph (county, state, whatToTrack, showGraph, 1, fips)

    elif(mathOperation == "trendlineTest"):
        # trendline(index,data, order=1):
        myIndex=[0,1,2,3,4,5,6]

        base=2
        seriesLabel="powers of %d" % (base)
        # data= [1,2,4,8,16,32,64]
        data= [base**0,base**1,base**2,base**3,base**4,base**5,base**6]
        slope=trendline(myIndex,data, order=1)
        print "%s %s" % (seriesLabel, slope)

        base=3
        seriesLabel="powers of %d" % (base)
        # data= [1,2,4,8,16,32,64]
        data= [base**0,base**1,base**2,base**3,base**4,base**5,base**6]
        slope=trendline(myIndex,data, order=1)
        print "%s %s" % (seriesLabel, slope)

        base=4
        seriesLabel="powers of %d" % (base)
        # data= [1,2,4,8,16,32,64]
        data= [base**0,base**1,base**2,base**3,base**4,base**5,base**6]
        slope=trendline(myIndex,data, order=1)
        print "%s %s" % (seriesLabel, slope)

        lineSlope=0
        seriesLabel="line slope %d" % (lineSlope)
        data= [lineSlope*0,lineSlope*1,lineSlope*2,lineSlope*3,lineSlope*4,lineSlope*5, lineSlope*6]
        slope=trendline(myIndex,data, order=1)
        print "%s %s" % (seriesLabel, slope)

        lineSlope=2
        seriesLabel="line slope %d" % (lineSlope)
        data= [lineSlope*0,lineSlope*1,lineSlope*2,lineSlope*3,lineSlope*4,lineSlope*5, lineSlope*6]
        slope=trendline(myIndex,data, order=1)
        print "%s %s" % (seriesLabel, slope)

        lineSlope=4
        seriesLabel="line slope %d" % (lineSlope)
        data= [lineSlope*0,lineSlope*1,lineSlope*2,lineSlope*3,lineSlope*4,lineSlope*5, lineSlope*6]
        slope=trendline(myIndex,data, order=1)
        print "%s %s" % (seriesLabel, slope)

        seriesLabel="New York"
        myIndex1=[0,1]
        data=[0,2141]
        slope=trendline(myIndex1,data, order=1)
        print "%s %s" % (seriesLabel, slope)


def build (county, state):
    mycsvfile = "%s.%s" % (state, county)
    mycsvfile = mycsvfile.replace(' ', '_')
    mycsvfile = mycsvfile.lower()
    mycsvfile = "county_data/%s.csv" % (mycsvfile)

    print "Calling build: county %s state %s" % (county, state)
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
	      
# https://stackoverflow.com/questions/42920537/finding-increasing-trend-in-pandas/42920821
def trendline(index,data, order=1):
#    index = index[-7:]
#    data = data[-7:]
#    print "index: %s data: %s\n" % (index, data)
    coeffs = np.polyfit(index, list(data), order)
    slope = coeffs[-2]
    return float(slope)

def graph (county, state, whatToTrack, showGraph, overTime, fips, out):
    rcParams['figure.figsize'] = 15, 10
    mycsvfile = "%s.%s" % (state, county)
    mycsvfile = mycsvfile.replace(' ', '_')
    mycsvfile = mycsvfile.lower()
    mycsvfile = "county_data/%s.csv" % (mycsvfile)

    with open (mycsvfile, 'r') as csvfile:
        plots = csv.reader(csvfile, delimiter=',')
        rowCounter = 0
        for row in plots:
            rowCounter += 1
            if (showGraph):
                print (row[0])
            mydate = datetime.strptime(row[0], '%Y-%m-%d')

	    if (whatToTrack == "cases"):
	        trackThis = int(row[4])
	    else:
      	        trackThis = int(row[5])
            if (showGraph):
                print trackThis
            if (showGraph):
                print (mydate)
            x.append(mydate)
            y.append(trackThis)
            myindex.append(rowCounter)


    if (overTime):
        dailySlopeArray=[]
        while (myindex):
            resultent=trendline(myindex,y)
            dailySlopeArray.append(resultent)
            myindex.pop()
            y.pop()
            # x.pop()
        print "%s" % (dailySlopeArray)
        print "backwards: %s" % (dailySlopeArray.reverse())
        plt.plot(x,dailySlopeArray, label="Daily change in slope")
        plt.xlabel('x')
        plt.ylabel('dailySlope')
        title = "State: %s County:%s Tracking: %s" % (state,county,whatToTrack)
        plt.title(title)
        plt.legend()
        if (showGraph):
            plt.show()


    else:
        resultent=trendline(myindex,y)
        # what actually shows up in non-graphical output
        outline =  "%s|%s|%s|%s\n" % (resultent, state, county, fips)
        out.write(outline)
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
        if (showGraph):
            plt.show()


def sortFn(line):
    return float(line.split('|')[0])

def assign_ranks(base_file, what_to_trace, sorted_file):
    datafile = base_file
    out = open(sorted_file, mode="w")
    with open(datafile) as fp: 
        all_lines = fp.readlines()
        newlist = []
        counter=0
        all_lines.sort(key=sortFn,reverse=True)
        for line in all_lines:
            line=line[:-1] # chomp 
            counter+=1
            outline = "%s|%s\n" % (counter, line)
            out.write(outline)
    out.close()

    
def main():
    OUTPUT_FILE = "output/%s.%s.txt" % (TODAY, what_to_trace)
    county_driver (base_file, what_to_trace, OUTPUT_FILE)
    # python bin/assign_ranks.py output/${base_name}.${TODAY}.${what_to_trace}.txt > output/${base_name}.${TODAY}.${what_to_trace}.txt.sorted
    SORTED_OUTPUT_FILE = "output/%s.%s.txt.sorted" % (TODAY, what_to_trace)
    assign_ranks (OUTPUT_FILE, what_to_trace, SORTED_OUTPUT_FILE)
main()
