#!/usr/bin/python

import argparse
import re
from datetime import date
import os

parser = argparse.ArgumentParser()
parser.add_argument("--state", help="My state")
parser.add_argument("--county", help="My county")

args = parser.parse_args()
county = args.county
state = args.state

today = date.today()

TODAY_FILE="%s.txt" % (today.strftime("%y%m%d"))
ROOT_DIR="/Users/egilchri/Documents/GitHub/covid-19-data"
data_file= "%s/output/%s" % (ROOT_DIR, TODAY_FILE)

with open(data_file) as fp: 
    all_lines = fp.readlines()


for line in all_lines:
    [rank,level,thisState,thisCounty,fips] = line.split('|')
    if ((thisState == state) and (thisCounty == county)):
        print "rank: %s state: %s county: %s fips: %s" % (rank, state, county, fips)





