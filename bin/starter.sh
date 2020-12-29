#!/bin/bash

# USAGE
# time ./starter.sh old my_counties

set -x


if [ "$1" == "-h" ]; then
   echo "./starter.sh my_counties deaths"
   echo "./starter.sh all_counties cases"
   echo "./starter.sh my_counties cases; ./starter.sh my_counties deaths 200630"
   echo "./starter.sh all_counties cases 200626; ./starter.sh all_counties deaths 200626"
fi


# TODAY=`date +%y%m%d`
# ROOT_DIR=~/Documents/GitHub/covid-19-data

base_name=$1
what_to_trace=$2
TODAY_DATE=$3
echo "base_name is ${base_name}"

if [ -z "$base_name" ]; then
    base_name=all_counties
fi

echo "base_name is now ${base_name}"

#base_name=my_counties
#base_name=more_counties
#base_name=all_counties
if [ -z "$what_to_trace" ]; then
    what_to_trace=deaths
fi

# cd ${ROOT_DIR}

#technique=old
technique=new
# technique=$1
# base_name=$2
date

echo "technique is ${technique}"

if [ "$technique" == "old" ]; then
  echo "OLD technique is ${technique}"
  python bin/county_driver.py --base_counties ${base_name}.txt --what_to_trace ${what_to_trace} > output/${base_name}.${TODAY}.${what_to_trace}.txt

  python bin/assign_ranks.py output/${base_name}.${TODAY}.${what_to_trace}.txt > output/${base_name}.${TODAY}.${what_to_trace}.txt.sorted

  what_to_trace=cases
  python bin/county_driver.py --base_counties ${base_name}.txt --what_to_trace ${what_to_trace} > output/${base_name}.${TODAY}.${what_to_trace}.txt

  python bin/assign_ranks.py output/${base_name}.${TODAY}.${what_to_trace}.txt > output/${base_name}.${TODAY}.${what_to_trace}.txt.sorted

else
    echo "NEW technique is ${technique}"
    nice -n 20 python county_driver_more_better.py --base_counties ${base_name}.txt --what_to_trace ${what_to_trace} --today_date ${TODAY_DATE}
#    nice -n 20 python assign_ranks.py output/${base_name}.${TODAY}.${what_to_trace}.txt > output/${base_name}.${TODAY}.${what_to_trace}.txt.sorted


fi

date
