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

COVID_ENV=$1
what_to_trace=$2
TODAY_DATE=$3



echo "base_name is now ${base_name}"

#base_name=my_counties
#base_name=more_counties
#base_name=all_counties
if [ -z "$what_to_trace" ]; then
    what_to_trace=deaths
fi

propsFile="../covid.${COVID_ENV}.properties"
if [ -f "$propsFile" ] ; then
    echo "I see ${propsFile}"
    #set -a so the env is shared with the node process  below
    set -a
    source "$propsFile"
else
    echo "I do not see ${propsFile}"
fi


# cd ${ROOT_DIR}


# technique=$1
# base_name=$2
date


echo "NEW technique is ${technique}"
#    python county_driver_more_better.py --base_counties ${BASE_NAME}.txt --what_to_trace ${what_to_trace} --today_date ${TODAY_DATE}
exec python $PYTHON_ARGS county_driver_more_better.py --base_counties ${BASE_NAME}.txt --what_to_trace ${what_to_trace} --today_date ${TODAY_DATE}
#    python -m pdb county_driver_more_better.py --base_counties ${BASE_NAME}.txt --what_to_trace ${what_to_trace} --today_date ${TODAY_DATE}

#    nice -n 20 python assign_ranks.py output/${BASE_NAME}.${TODAY}.${what_to_trace}.txt > output/${BASE_NAME}.${TODAY}.${what_to_trace}.txt.sorted




date
