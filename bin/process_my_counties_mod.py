# import matplotlib.pyplot as plt
import numpy as np
from pylab import rcParams
from death_rates import get_population,normalize_county_name
import logging
# import matplotlib.ticker as ticker
import csv
import os
import sys
from datetime import datetime

logging.basicConfig(format='%(levelname)s:%(message)s', filename='../output/covid.log', level=logging.INFO)

x = []
y = []
myindex = []

countiesFile = "../covid-19-data/us-counties.csv"

LOOK_BACK= int (os.environ['DAYS_LOOK_BACK'])
# print (mycsvfile)

full_us_data_dict = {}

def initialize_us_counties(popdict):
        full_us_data_dict = {}
        with open (countiesFile, 'r') as csvfile:
                plots = csv.reader(csvfile, delimiter=',')
                for row in plots:
                        date = row[0]
                        countyName = row[1]
                        stateName = row[2]
                        try:
                                population = popdict[(countyName, stateName)]
                        except:
                                continue
                        code = row[3]
                        cases = row[4]
                        deaths = row[5]
                        death_rate = compute_rate (deaths, population);
                        case_rate = compute_rate (cases, population);
                        key = str((countyName, stateName))
                        listVal = (date, code, cases,deaths,
                                   case_rate, death_rate)
                        if key in full_us_data_dict:
                                full_us_data_dict[key].append(listVal)
                        else:
                                full_us_data_dict[key] = [listVal]
                                
        return full_us_data_dict


def initialize_populations():
        popdict = {}

        with open ("all_pops.csv", 'r') as csvfile:
                plots = csv.reader(csvfile, delimiter=',')
                for row in plots:
                        stateName = row[0]
                        countyName = row[1]
                        population = row[2]
                        normalized_county_name = normalize_county_name(countyName,stateName)
                        popdict[str((normalized_county_name, stateName))] = population
        return popdict

def build (county, state, popdict, full_us_data_dict):
        # Read the csv file for state and county, with all the historical
        # data from previous runs, and add to it all lines from NY times
        # data that has come in since

        # But the inefficiency is that the NYtimes data is all jumbled,
        # so we are reading through the entire nytimes files to pick out
        # lines for state and county

        # actually, we are not appending to csvfile, but actually overwriting it
        
        # my_rows = full_us_data_dict[('Fairfield', 'Connecticut')]
        mycsvfile = "%s.%s" % (state, county)
        mycsvfile = mycsvfile.replace(' ', '_')
        mycsvfile = mycsvfile.lower()
        mycsvfile = "../county_data/%s.csv" % (mycsvfile)
        # for efficiency, all the data has been preloaded in
        # full_us_data_dict
        my_tuple = (county, state)
        try:
                my_rows = full_us_data_dict["{}".format(my_tuple)]
        except:
                return
        out = open(mycsvfile, mode="w")
        for row in my_rows:
            date = row[0]
            code = row[1]
            cases = row[2]
            deaths = row[3]
            case_rate = row[4]
            death_rate = row[5]

            # full_county = countyName + " County"
            try:
                population = popdict[(county, state)]
            except:
                logging.info ("what's up with {},{}".format(full_county, state))

            outline = "%s,%s,%s,%s,%s,%s,%s,%s\n" % (date,county, state,code,cases,deaths,death_rate, case_rate)
            out.write (outline)
        out.close()      
        logging.info (mycsvfile)

              
# https://stackoverflow.com/questions/42920537/finding-increasing-trend-in-pandas/42920821

def compute_rate(trend, population):
    try:
        rate = float(trend) / float(population)
        rate = truncate (rate, 6)
    except:
        rate = 0.0
    rate = float (rate)
    rate *= 10000
    rate = truncate (rate, 2)
    return rate




def trendline(index,data, order=1):

    # only look at last 7 days
    index = index[-7:]
    data = data[-7:]
#    print "index: %s data: %s\n" % (index, data)
    coeffs = np.polyfit(index, list(data), order)
    slope = coeffs[-2]
    return float(slope)

def crunch (county, state, whatToTrack, fips, outfile):
    mycsvfile = "%s.%s" % (state, county)
    mycsvfile = mycsvfile.replace(' ', '_')
    mycsvfile = mycsvfile.lower()
    mycsvfile = "county_data/%s.csv" % (mycsvfile)

    latest_death_rate = 0.0
    latest_case_rate = 0.0
    rcParams['figure.figsize'] = 15, 10

    stackOfWhatToTrack = []
    with open (mycsvfile, 'r') as csvfile:
        plots = csv.reader(csvfile, delimiter=',')
        rowCounter = 0
        for row in plots:
            # 2020-06-18,Fairfield,Connecticut,09001,16398,1352,14.33,173.82
            rowCounter += 1
            death_rate = row[6]
            latest_death_rate = death_rate
            case_rate = row[7]
            latest_case_rate = case_rate
            mydate = datetime.strptime(row[0], '%Y-%m-%d')
            if (whatToTrack == "cases"):
                trackThis = int(row[4])
                stackOfWhatToTrack.append(trackThis)
            else:
                trackThis = int(row[5])
                stackOfWhatToTrack.append(trackThis)
            x.append(mydate)
            y.append(trackThis)
            myindex.append(rowCounter)



    resultent=trendline(myindex,y)
    resultent = truncate (resultent, 2)
    # **Sun Jun 28 08:41:54 2020** -- egilchri
    # gonna add trackThis (number of cases or deaths)  to the output csv file


    before = 0
    nowNumber = 0
    try:
        # print ("{} for {},{}: {} -> {}".format(whatToTrack, county, state, stackOfWhatToTrack[-LOOK_BACK], stackOfWhatToTrack[-1]))
        nowNumber = stackOfWhatToTrack[-1]
        before = stackOfWhatToTrack[-LOOK_BACK]
    except:
        print ("Could not look 7 days back for {}, {}".format(county, state))
    # increase is how much the cases or the deaths went up
    # rate_of_increase is that number, adjusted for population
    # I want to start including rate_of_increase in the final JSON
    increase = nowNumber - before
    rate_of_increase = compute_pop_rate(increase, state, county)

    if (whatToTrack == "cases"):
#        outfile.write("{}|{}|{}|{}|{}\n".format (resultent, state, county, fips, latest_case_rate))
        outfile.write("{}|{}|{}|{}|{}|{}|{}|{}\n".format (resultent, state, county, fips, latest_case_rate,trackThis,before,rate_of_increase))
    else:
#        outfile.write("{}|{}|{}|{}|{}\n".format (resultent, state, county, fips, latest_death_rate))
        outfile.write("{}|{}|{}|{}|{}|{}|{}|{}\n".format (resultent, state, county, fips, latest_death_rate,trackThis, before,rate_of_increase))
    outfile.flush()




def process_my_counties(state, county, fips, mathOperation, whatToTrack, outfile, popdict, full_us_data_dict):

    build (county, state, popdict, full_us_data_dict)
    
    if (mathOperation == "trendline"):
        crunch (county, state, whatToTrack, fips, outfile)

def truncate(f, n):
    '''Truncates/pads a float f to n decimal places without rounding'''
    s = '{}'.format(f)
    if 'e' in s or 'E' in s:
        return '{0:.{1}f}'.format(f, n)
    i, p, d = s.partition('.')
    return '.'.join([i, (d+'0'*n)[:n]])


def compute_pop_rate(number, state, county):
    population = get_population(state, county)
    return compute_rate (number, population)

