#!/usr/bin/python

import argparse
import os

parser = argparse.ArgumentParser()
parser.add_argument("--base_counties", help="Base counties file (all_counties.txt, my_counties.txt")

parser.add_argument("--what_to_trace", help="cases or deaths ")

args = parser.parse_args()
base_file = args.base_counties
what_to_trace = args.what_to_trace

counties_file = "county_data/%s" % (base_file)
# counties_file = "county_data/counties.txt"

with open(counties_file) as fp: 
    all_lines = fp.readlines()


for line in all_lines:
    line = line.rstrip()  
    [state,countyAndFips] = line.split('.')
    [county,fips] = countyAndFips.split('|')
    state = state.replace("_", " ")
    county = county.replace("_", " ")
    # print "state: %s county: %s" % (state, county)
    try:
            com = "python bin/graph-my-counties.py --state \"%s\" --county \"%s\" --fips \"%s\" --build y --mathOperation trendline --whatToTrack %s" % (state, county, fips, what_to_trace)
    # print "com: %s\n" % (com)
            os.system(com)
    except:
            print "An exception occurred: %s" % (com)





