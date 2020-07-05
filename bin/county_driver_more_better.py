#!/usr/bin/python

import boto3
import csv
import json
import argparse
import os
from process_my_counties_mod import process_my_counties
from assign_ranks_mod import assign_ranks
import logging

from datetime import date
import datetime


parser = argparse.ArgumentParser()
parser.add_argument("--base_counties", help="Base counties file (all_counties.txt, my_counties.txt")

parser.add_argument("--what_to_trace", help="cases or deaths ")
parser.add_argument("--today_date", help="today date")

args = parser.parse_args()
base_file = args.base_counties
what_to_trace = args.what_to_trace
today_date = args.today_date
counties_file = "county_data/%s" % (base_file)
# counties_file = "county_data/counties.txt"

#today = date.today()
#today = utcnow()
#today = datetime.datetime.utcnow().date()
today = datetime.datetime.utcnow()

# dd/mm/YY
# today_date = today.strftime("%y%m%d")
print ("today_date: {}\n".format (today_date))
#exit()
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


jsonfile_name = "{}.json".format(filename_sorted)
csvfile = open(filename_sorted, 'r')
jsonfile = open(jsonfile_name, 'w')

fieldnames = ("order", "slope","state","county","code","rate","now", "wk_ago")
reader = csv.DictReader(csvfile, fieldnames, delimiter='|')
out = json.dumps( [ row for row in reader ], indent=4, separators=(',', ': ') )

jsonfile.write(out)
jsonfile.close()
###



# Create an S3 client
s3 = boto3.client('s3')
s3resource = boto3.resource('s3')
filename = jsonfile_name
# bucket_name = "covid-counties"
bucket_name = "covid-counties"

mimetype = 'application/json'
# mimetype = 'text/json' # you can programmatically get mimetype using the `mimetypes` module


print ("filename: {}".format (filename))

if (1):
    s3resource.upload_file(
        Filename=filename,
        Bucket=bucket_name,
        Key=filename,
        ExtraArgs={
            'ACL': 'public-read',
            "ContentType": mimetype
        }
    )


