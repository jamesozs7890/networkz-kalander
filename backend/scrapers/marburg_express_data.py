import requests
import datetime
import json
import csv

nowDatetime = datetime.datetime.now()
nowTimestamp = int(nowDatetime.timestamp())
inFourMonths_timestamp = nowTimestamp + 4*31*24*60*60 # 4 months from now

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    # 'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': 'https://www.marbuch-verlag.de',
    'Sec-GPC': '1',
    'Connection': 'keep-alive',
    'Referer': 'https://www.marbuch-verlag.de/events/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    # Requests doesn't support trailers
    # 'TE': 'trailers',
}

#fixed month and fixed year params might be problematic in future

data = {
    'action': 'eventon_init_load',
    'cals[evcal_calendar_202][sc][_cal_evo_rtl]': 'no',
    'cals[evcal_calendar_202][sc][accord]': 'no',
    'cals[evcal_calendar_202][sc][cal_id]': '',
    'cals[evcal_calendar_202][sc][cal_init_nonajax]': 'no',
    'cals[evcal_calendar_202][sc][calendar_type]': 'default',
    'cals[evcal_calendar_202][sc][etc_override]': 'no',
    'cals[evcal_calendar_202][sc][etop_month]': 'no',
    'cals[evcal_calendar_202][sc][evc_open]': 'no',
    'cals[evcal_calendar_202][sc][event_count]': '0',
    'cals[evcal_calendar_202][sc][event_location]': 'all',
    'cals[evcal_calendar_202][sc][event_order]': 'ASC',
    'cals[evcal_calendar_202][sc][event_organizer]': 'all',
    'cals[evcal_calendar_202][sc][event_past_future]': 'future',
    'cals[evcal_calendar_202][sc][event_tag]': 'all',
    'cals[evcal_calendar_202][sc][event_type]': 'all',
    'cals[evcal_calendar_202][sc][event_type_2]': 'all',
    'cals[evcal_calendar_202][sc][event_type_3]': 'all',
    'cals[evcal_calendar_202][sc][event_type_4]': 'all',
    'cals[evcal_calendar_202][sc][event_type_5]': 'all',
    'cals[evcal_calendar_202][sc][eventtop_style]': '0',
    'cals[evcal_calendar_202][sc][exp_jumper]': 'no',
    'cals[evcal_calendar_202][sc][exp_so]': 'yes',
    'cals[evcal_calendar_202][sc][filter_relationship]': 'AND',
    'cals[evcal_calendar_202][sc][filter_show_set_only]': 'no',
    'cals[evcal_calendar_202][sc][filter_type]': 'default',
    'cals[evcal_calendar_202][sc][filters]': 'yes',
    'cals[evcal_calendar_202][sc][fixed_month]': '4',
    'cals[evcal_calendar_202][sc][fixed_year]': '2026',
    'cals[evcal_calendar_202][sc][focus_end_date_range]':str(inFourMonths_timestamp),
    'cals[evcal_calendar_202][sc][focus_start_date_range]': str(nowTimestamp),
    'cals[evcal_calendar_202][sc][ft_event_priority]': 'no',
    'cals[evcal_calendar_202][sc][hide_arrows]': 'no',
    'cals[evcal_calendar_202][sc][hide_empty_months]': 'no',
    'cals[evcal_calendar_202][sc][hide_end_time]': 'no',
    'cals[evcal_calendar_202][sc][hide_ft]': 'no',
    'cals[evcal_calendar_202][sc][hide_month_headers]': 'no',
    'cals[evcal_calendar_202][sc][hide_mult_occur]': 'no',
    'cals[evcal_calendar_202][sc][hide_past]': 'no',
    'cals[evcal_calendar_202][sc][hide_past_by]': 'ee',
    'cals[evcal_calendar_202][sc][hide_so]': 'no',
    'cals[evcal_calendar_202][sc][ics]': 'no',
    'cals[evcal_calendar_202][sc][jumper]': 'yes',
    'cals[evcal_calendar_202][sc][jumper_count]': '3',
    'cals[evcal_calendar_202][sc][jumper_offset]': '2',
    'cals[evcal_calendar_202][sc][lang]': 'L1',
    'cals[evcal_calendar_202][sc][layout_changer]': 'no',
    'cals[evcal_calendar_202][sc][mapformat]': 'roadmap',
    'cals[evcal_calendar_202][sc][mapiconurl]': '',
    'cals[evcal_calendar_202][sc][mapscroll]': 'true',
    'cals[evcal_calendar_202][sc][mapzoom]': '18',
    'cals[evcal_calendar_202][sc][members_only]': 'no',
    'cals[evcal_calendar_202][sc][ml_priority]': 'no',
    'cals[evcal_calendar_202][sc][month_incre]': '0',
    'cals[evcal_calendar_202][sc][number_of_months]': '1',
    'cals[evcal_calendar_202][sc][only_ft]': 'no',
    'cals[evcal_calendar_202][sc][pec]': '',
    'cals[evcal_calendar_202][sc][s]': '',
    'cals[evcal_calendar_202][sc][search]': 'yes',
    'cals[evcal_calendar_202][sc][sep_month]': 'no',
    'cals[evcal_calendar_202][sc][show_et_ft_img]': 'no',
    'cals[evcal_calendar_202][sc][show_limit]': 'no',
    'cals[evcal_calendar_202][sc][show_limit_ajax]': 'no',
    'cals[evcal_calendar_202][sc][show_limit_paged]': '1',
    'cals[evcal_calendar_202][sc][show_limit_redir]': '',
    'cals[evcal_calendar_202][sc][show_repeats]': 'no',
    'cals[evcal_calendar_202][sc][show_upcoming]': '0',
    'cals[evcal_calendar_202][sc][show_year]': 'no',
    'cals[evcal_calendar_202][sc][sort_by]': 'sort_date',
    'cals[evcal_calendar_202][sc][tile_bg]': '0',
    'cals[evcal_calendar_202][sc][tile_count]': '2',
    'cals[evcal_calendar_202][sc][tile_height]': '0',
    'cals[evcal_calendar_202][sc][tile_style]': '0',
    'cals[evcal_calendar_202][sc][tiles]': 'no',
    'cals[evcal_calendar_202][sc][ux_val]': '0',
    'cals[evcal_calendar_202][sc][view_switcher]': 'no',
    'cals[evcal_calendar_202][sc][wpml_l1]': '',
    'cals[evcal_calendar_202][sc][wpml_l2]': '',
    'cals[evcal_calendar_202][sc][wpml_l3]': '',
    'cals[evcal_calendar_202][sc][yl_priority]': 'no',
    'cals[evcal_calendar_202][sc][fixed_day]': '1',
}

response = requests.post('https://www.marbuch-verlag.de/wp-admin/admin-ajax.php', headers=headers, data=data)

"""
# to output into a json file, legacy code 
filename = "output_pyfile.json"
data= response.content
file = open(filename, 'w')
file.write(data.decode())
file.close()
"""

data = response.content
json_string= data.decode()  # byte code to string
json_object = json.loads(json_string) #string to json
json_object_cals = json_object["cals"]  # take out the cals dictionary
#print(type(json_object_cals)) # it is of type dict, just confirming
#print(json_object_cals)

#json_object_cals structure is as follooews
"""
{
    evcal_calendar_202:{
        'sc':{},
        'json':{}, # this is what we need
        .....
    }
}
"""

for i in json_object_cals.values(): # this enters inside evcal_calendar_202{} , WE DONT USE THE KEY NAME INCASE IT CHANGES
    actual_events = i['json']                #   i iterates through 'sc' and then to 'json'

with open('marburg_events.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Title', 'Date', 'Category', 'Location', 'URL'])  # Header
    for i in actual_events:
        event_date_timestamp = i['event_start_unix']
        event_date = datetime.datetime.fromtimestamp(event_date_timestamp).strftime("%a., %d %B, %Y %H:%M")
        event_name = i['event_title']
        event_location =str(i['event_pmv']['evcal_location_name'][0])
        event_type= "Marburg express featured" # marburg express doesnt give event type
        event_url = "no url provided"

        writer.writerow([event_name, event_date, event_type, event_location, event_url])



