#!/usr/bin/python

import argparse
import os

counties_csv = "us-counties.csv"
# counties_file = "county_data/counties.txt"

big_dict = {}

with open(counties_csv) as fp: 
    all_lines = fp.readlines()


for line in all_lines:
    line = line.rstrip()  
    [date,county,state,fips,cases,deaths] = line.split(',')
    state = state.replace(" ", "_")
    county = county.replace(" ", "_")
    # like St. Francis
    county = county.replace(".", "")
    if (county == "county"):
        continue
    big_dict ["%s.%s" % (state,county)] = fips

for stateCounty in big_dict:
    print "%s|%s" % (stateCounty, big_dict[stateCounty])








