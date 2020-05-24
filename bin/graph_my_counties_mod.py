import matplotlib.pyplot as plt
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

def graph (county, state, whatToTrack, showGraph, overTime, fips):
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
            if (showGraph):
                print (row[0])
            mydate = datetime.strptime(row[0], '%Y-%m-%d')

            if (whatToTrack == "cases"):
                trackThis = int(row[4])
            else:
                trackThis = int(row[5])
            if (showGraph):
                print (trackThis)
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
        #print "%s" % (dailySlopeArray)
        print ("{}".format (dailySlopeArray))
        # print "backwards: %s" % (dailySlopeArray.reverse())
        print("backwards: {}".format (dailySlopeArray.reverse()))
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
        # print "%s|%s|%s|%s|%s" % (resultent, state, county, fips, latest_death_rate)
        print("{}|{}|{}|{}|{}".format (resultent, state, county, fips, latest_death_rate))
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




def graph_my_counties(state, county, fips, mathOperation, whatToTrack):

    build (county, state)
    
    if (mathOperation == "graph"):
        showGraph=1
        graph (county, state, whatToTrack, showGraph, 0, fips)
    elif (mathOperation == "trendline"):
        showGraph=0
#        graph (county, state, whatToTrack, )
        graph (county, state, whatToTrack, showGraph, 0, fips)
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
        print ("{} {}".format(seriesLabel, slope))

        base=3
        seriesLabel="powers of %d" % (base)
        # data= [1,2,4,8,16,32,64]
        data= [base**0,base**1,base**2,base**3,base**4,base**5,base**6]
        slope=trendline(myIndex,data, order=1)
        # print "%s %s" % (seriesLabel, slope)
        print ("{} {}".format(seriesLabel, slope))

        base=4
        seriesLabel="powers of %d" % (base)
        # data= [1,2,4,8,16,32,64]
        data= [base**0,base**1,base**2,base**3,base**4,base**5,base**6]
        slope=trendline(myIndex,data, order=1)
        print( "{} {}".format(seriesLabel, slope))

        lineSlope=0
        seriesLabel="line slope %d" % (lineSlope)
        data= [lineSlope*0,lineSlope*1,lineSlope*2,lineSlope*3,lineSlope*4,lineSlope*5, lineSlope*6]
        slope=trendline(myIndex,data, order=1)
        print( "{} {}".format(seriesLabel, slope))

        lineSlope=2
        seriesLabel="line slope %d" % (lineSlope)
        data= [lineSlope*0,lineSlope*1,lineSlope*2,lineSlope*3,lineSlope*4,lineSlope*5, lineSlope*6]
        slope=trendline(myIndex,data, order=1)
        print ("{} {}".format(seriesLabel, slope))

        lineSlope=4
        seriesLabel="line slope %d" % (lineSlope)
        data= [lineSlope*0,lineSlope*1,lineSlope*2,lineSlope*3,lineSlope*4,lineSlope*5, lineSlope*6]
        slope=trendline(myIndex,data, order=1)
        print ("{} {}".format(seriesLabel, slope))

        seriesLabel="New York"
        myIndex1=[0,1]
        data=[0,2141]
        slope=trendline(myIndex1,data, order=1)
        print ("{} {}".format(seriesLabel, slope))

def truncate(f, n):
    '''Truncates/pads a float f to n decimal places without rounding'''
    s = '{}'.format(f)
    if 'e' in s or 'E' in s:
        return '{0:.{1}f}'.format(f, n)
    i, p, d = s.partition('.')
    return '.'.join([i, (d+'0'*n)[:n]])


