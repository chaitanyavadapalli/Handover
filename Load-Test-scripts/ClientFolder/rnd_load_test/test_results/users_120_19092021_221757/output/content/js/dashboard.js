/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.6641074856046, "KoPercent": 0.33589251439539347};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.23188579654510558, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [1.0, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [1.0, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.30254424778761063, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.10087719298245613, 500, 1500, "Upload"], "isController": false}, {"data": [1.0, 500, 1500, "Course Page"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": false}, {"data": [0.0011098779134295228, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4168, 14, 0.33589251439539347, 5658.837092130522, 22, 47178, 2974.0, 15419.2, 17777.249999999996, 27863.090000000135, 13.071280502529268, 435.0320302773178, 6.5114610137220215], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 120, 0, 0.0, 30.05000000000001, 24, 49, 29.0, 37.0, 42.0, 48.579999999999984, 56.41748942172074, 21.620276504466386, 18.236512693935122], "isController": false}, {"data": ["Get CSRF Token", 120, 0, 0.0, 34.59166666666667, 23, 132, 29.0, 45.900000000000006, 56.69999999999993, 132.0, 54.42176870748299, 1454.3947526927436, 7.174744897959183], "isController": false}, {"data": ["StudentCourses", 120, 0, 0.0, 31.800000000000004, 22, 79, 26.0, 53.900000000000006, 67.89999999999998, 77.94999999999996, 55.81395348837209, 69.64934593023256, 13.517441860465118], "isController": false}, {"data": ["GetSubmissionId", 904, 0, 0.0, 2095.801991150446, 254, 17577, 1429.0, 4244.0, 6253.25, 10519.350000000017, 3.3193801865315415, 148.500104849407, 0.7682549845781009], "isController": false}, {"data": ["TestcasesResults", 851, 10, 1.1750881316098707, 14687.549941245576, 5441, 47178, 14534.0, 18970.0, 21023.399999999998, 28149.320000000003, 3.0309182150705376, 86.89394852558829, 0.7254247648456226], "isController": false}, {"data": ["Upload", 912, 2, 0.21929824561403508, 5080.445175438601, 632, 46567, 2678.5, 11283.600000000008, 21997.0, 38765.090000000004, 3.309251753504287, 148.4288254605557, 4.582711705253437], "isController": false}, {"data": ["Course Page", 120, 0, 0.0, 59.416666666666664, 50, 116, 57.0, 69.70000000000002, 72.94999999999999, 110.5399999999998, 55.02063273727648, 1781.6301474381019, 15.958132737276479], "isController": false}, {"data": ["Login", 120, 0, 0.0, 128.73333333333335, 72, 325, 103.5, 214.9, 263.7499999999997, 324.78999999999996, 53.71530886302596, 92.06090532676814, 31.78855192479857], "isController": false}, {"data": ["RunPractice", 901, 2, 0.22197558268590456, 5021.9822419533875, 73, 42688, 3964.0, 9045.000000000002, 11725.49999999999, 20045.68000000003, 3.317085382734957, 93.79747198793184, 0.7765790209996171], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 13, 92.85714285714286, 0.31190019193857965], "isController": false}, {"data": ["500\/Internal Server Error", 1, 7.142857142857143, 0.02399232245681382], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4168, 14, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 13, "500\/Internal Server Error", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["TestcasesResults", 851, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 912, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RunPractice", 901, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, "500\/Internal Server Error", 1, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
