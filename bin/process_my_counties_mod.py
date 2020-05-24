# import matplotlib.pyplot as plt
import numpy as np
from pylab import rcParams
from death_rates import get_population
import logging
# import matplotlib.ticker as ticker
import csv
import sys
from datetime import datetime

x = []
y = []
myindex = []



# print (mycsvfile)

def build (county, state):
    mycsvfile = "%s.%s" % (state, county)
    mycsvfile = mycsvfile.replace(' ', '_')
    mycsvfile = mycsvfile.lower()
    mycsvfile = "county_data/%s.csv" % (mycsvfile)

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
                population = get_population(state, county)
                
                try:
                    death_rate = float(deaths) / float(population)
                    death_rate = truncate (death_rate, 6)
                except:
                    death_rate = 0.0
                death_rate = float (death_rate)
                death_rate *= 10000
                outline = "%s,%s,%s,%s,%s,%s,%s\n" % (date,county, state,code,cases,deaths,death_rate)
                out.write (outline)
    out.close()      
              
# https://stackoverflow.com/questions/42920537/finding-increasing-trend-in-pandas/42920821
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
    rcParams['figure.figsize'] = 15, 10
    with open (mycsvfile, 'r') as csvfile:
        plots = csv.reader(csvfile, delimiter=',')
        rowCounter = 0
        for row in plots:
            rowCounter += 1
            death_rate = row[6]
            latest_death_rate = death_rate
            mydate = datetime.strptime(row[0], '%Y-%m-%d')

            if (whatToTrack == "cases"):
                trackThis = int(row[4])
            else:
                trackThis = int(row[5])
            x.append(mydate)
            y.append(trackThis)
            myindex.append(rowCounter)



    resultent=trendline(myindex,y)
    outfile.write("{}|{}|{}|{}|{}\n".format (resultent, state, county, fips, latest_death_rate))
    outfile.flush()




def process_my_counties(state, county, fips, mathOperation, whatToTrack, outfile):

    build (county, state)
    
    if (mathOperation == "trendline"):
        crunch (county, state, whatToTrack, fips, outfile)

def truncate(f, n):
    '''Truncates/pads a float f to n decimal places without rounding'''
    s = '{}'.format(f)
    if 'e' in s or 'E' in s:
        return '{0:.{1}f}'.format(f, n)
    i, p, d = s.partition('.')
    return '.'.join([i, (d+'0'*n)[:n]])


