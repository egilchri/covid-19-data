#!/usr/bin/python

import argparse
import os

counties_file = "county_data/my_counties.txt"
# counties_file = "county_data/counties.txt"

with open(counties_file) as fp: 
    all_lines = fp.readlines()


for line in all_lines:
    if (line.isspace()):
        continue
    line = line.rstrip()  
    try:
        [state,countyAndFips] = line.split('.')
    except:
        print "Hmm. Splitting state from county didn't work"
    [county,fips] = countyAndFips.split('|')
    state = state.replace("_", " ")
    county = county.replace("_", " ")
    # print "state: %s county: %s" % (state, county)
    com = "python bin/graph-my-counties.py --state \"%s\" --county \"%s\" --fips \"%s\" --build y --mathOperation trendline --whatToTrack cases" % (state, county, fips)
    # print "com: %s\n" % (com)
    os.system(com)




