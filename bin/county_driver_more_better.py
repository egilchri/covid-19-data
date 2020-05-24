#!/usr/bin/python

import boto3
import json
import argparse
import os
from process_my_counties_mod import process_my_counties
from assign_ranks_mod import assign_ranks
import logging

from datetime import date

parser = argparse.ArgumentParser()
parser.add_argument("--base_counties", help="Base counties file (all_counties.txt, my_counties.txt")

parser.add_argument("--what_to_trace", help="cases or deaths ")

args = parser.parse_args()
base_file = args.base_counties
what_to_trace = args.what_to_trace

counties_file = "county_data/%s" % (base_file)
# counties_file = "county_data/counties.txt"

today = date.today()

# dd/mm/YY
today_date = today.strftime("%y%m%d")
#print("d1 =", d1)

filename = "output/{}.{}.{}.txt".format(base_file, today_date, what_to_trace)
filename_sorted = "output/{}.{}.{}.sorted".format(base_file, today_date, what_to_trace)
outfile = open (filename, "w+")

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
        process_my_counties(state=state, county=county, fips=fips, mathOperation='trendline', whatToTrack=what_to_trace, outfile=outfile);
    except Exception as e:
        # Just print(e) is cleaner and more likely what you want,
        # but if you insist on printing message specifically whenever possible...
        logging.exception("An exception was thrown!")
#        if hasattr(e, 'message'):
#            print(e.message)
#        else:
#            print(e)

outfile.close()
assign_ranks (datafile=filename, outputfile=filename_sorted)

# Create an S3 client
s3 = boto3.client('s3')
s3resource = boto3.resource('s3')
filename = filename_sorted
# bucket_name = "covid-counties"
bucket_name = "covid-counties"

mimetype = 'text/json' # you can programmatically get mimetype using the `mimetypes` module
s3.upload_file(
    Filename=filename,
    Bucket=bucket_name,
    Key=filename_sorted,
    ExtraArgs={
        'ACL': 'public-read',
        "ContentType": mimetype
    }
)

