#!/usr/bin/python

import boto3
from botocore.errorfactory import ClientError
import datetime
import logging
import os
import sys

thisd = os.getcwd()
os.chdir("../covid-19-data")
os.system("git pull")
os.chdir (thisd)

logging.basicConfig(format='%(levelname)s:%(message)s', filename='../output/covid.log', level=logging.INFO)

COVID_ENV = sys.argv[1]

print ("COVID_ENV: {}".format (COVID_ENV))

s3 = boto3.client('s3')

propertiesFile= "../covid.{}.properties".format(COVID_ENV)

separator = "="
keys = {}


with open(propertiesFile) as f:

    for line in f:
        if separator in line:

            # Find the name and value by splitting the string
            name, value = line.split(separator, 1)

            # Assign key value pair to dict
            # strip() removes white space from the ends of strings
            keys[name.strip()] = value.strip()



days_to_look_back = int (keys["DAYS_LOOK_BACK"])

bucket_name = "covid-counties"

if (not (days_to_look_back)):
    days_to_look_back = 8

print ("days to look back: {}".format(days_to_look_back))
logging.info ("days to look back: {}".format(days_to_look_back))
    
day_array = []
end_date = datetime.date.today()
delta = datetime.timedelta(days = days_to_look_back) 
start_date = end_date -delta

for i in range(delta.days + 1):
    day = start_date + datetime.timedelta(days=i)
    pretty_day = day.strftime("%y%m%d")
    day_array.append(pretty_day)


count = 0
for day in (day_array):
    count += 1
    # if (os.environ.get('DO_PROFILING')):
    #    if (count > 2):
    #        exit()
    print ("count: {}".format (count))    
#    cases_path = "output/all_counties.txt.2007{}.cases.sorted.json".format(day)
#    deaths_path = "output/all_counties.txt.2007{}.deaths.sorted.json".format(day)
    cases_path = "output/all_counties.txt.{}.cases.sorted.json".format(day)
    deaths_path = "output/all_counties.txt.{}.deaths.sorted.json".format(day)
    print ("Looking for {}".format (cases_path))
    print ("Also Looking for {}".format (deaths_path))
    try:
        s3.head_object(Bucket=bucket_name, Key=cases_path)
    except ClientError:
        # Not found
        print ("Re-Execute: ./starter.sh  cases {}".format(day))
        os.system ("./starter.sh {}  cases {}".format(COVID_ENV, day))
    try:
        s3.head_object(Bucket=bucket_name, Key=deaths_path)
    except ClientError:
        # Not found
        print ("Re-Execute: ./starter.sh  deaths {}".format(day))
        os.system ("./starter.sh {} deaths {}".format(COVID_ENV, day))
    # this exist is just for debugging
    # exit()    
