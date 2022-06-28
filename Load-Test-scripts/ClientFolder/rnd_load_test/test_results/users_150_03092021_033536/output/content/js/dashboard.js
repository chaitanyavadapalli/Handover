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

    var data = {"OkPercent": 98.24032176973354, "KoPercent": 1.7596782302664655};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3481649069884364, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [1.0, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [1.0, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.5252774352651048, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.3022113022113022, 500, 1500, "Upload"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "Course Page"], "isController": false}, {"data": [0.7866666666666666, 500, 1500, "Login"], "isController": false}, {"data": [0.0, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3978, 70, 1.7596782302664655, 6549.19281045751, 0, 81806, 2089.0, 18209.59999999999, 31521.94999999999, 58737.03, 4.382833571315247, 137.43279472710307, 2.1056929856345965], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 150, 0, 0.0, 50.50666666666667, 24, 183, 43.0, 84.70000000000002, 98.44999999999999, 180.96000000000004, 43.2152117545376, 16.599593056755978, 13.968979580812446], "isController": false}, {"data": ["Get CSRF Token", 150, 0, 0.0, 34.47333333333333, 23, 123, 29.0, 46.0, 80.44999999999999, 123.0, 54.4464609800363, 1455.0557934437388, 7.178000226860254], "isController": false}, {"data": ["StudentCourses", 150, 0, 0.0, 109.9533333333334, 25, 427, 77.5, 241.0, 281.1499999999999, 401.50000000000045, 49.1320013101867, 61.30304720766459, 11.899156567310841], "isController": false}, {"data": ["GetSubmissionId", 811, 7, 0.8631319358816276, 3212.14056720098, 219, 50014, 729.0, 7995.600000000002, 17625.599999999995, 42175.24, 1.0595060950994903, 46.46043767212075, 0.2449153546405975], "isController": false}, {"data": ["TestcasesResults", 795, 9, 1.1320754716981132, 15469.325786163507, 5197, 78146, 9628.0, 33231.19999999999, 42162.19999999997, 58369.71999999999, 1.0467812464202058, 30.020911553897385, 0.25096621529986], "isController": false}, {"data": ["Upload", 814, 37, 4.545454545454546, 8292.649877149861, 416, 81806, 1287.5, 28702.0, 57240.0, 72121.3, 1.055478764648982, 44.83694776798333, 1.4373733632137122], "isController": false}, {"data": ["Course Page", 150, 0, 0.0, 179.9933333333334, 50, 695, 101.5, 457.5, 537.7999999999997, 688.3700000000001, 42.7715996578272, 1384.925183115911, 12.405434666381522], "isController": false}, {"data": ["Login", 150, 0, 0.0, 486.5799999999998, 94, 1654, 439.0, 910.9, 992.45, 1543.330000000002, 47.908016608112426, 82.10797768284894, 28.351814516129036], "isController": false}, {"data": ["RunPractice", 808, 17, 2.103960396039604, 5284.759900990095, 0, 50004, 2656.5, 11039.500000000002, 16977.449999999993, 49855.659999999945, 1.059530397245221, 29.41095553857058, 0.2461760852974422], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504\/Gateway Time-out", 51, 72.85714285714286, 1.2820512820512822], "isController": false}, {"data": ["500\/Internal Server Error", 2, 2.857142857142857, 0.05027652086475616], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 10, 14.285714285714286, 0.2513826043237808], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 7, 10.0, 0.17596782302664657], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3978, 70, "504\/Gateway Time-out", 51, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 10, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 7, "500\/Internal Server Error", 2, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GetSubmissionId", 811, 7, "504\/Gateway Time-out", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 795, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 8, "504\/Gateway Time-out", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 814, 37, "504\/Gateway Time-out", 36, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RunPractice", 808, 17, "504\/Gateway Time-out", 8, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 7, "500\/Internal Server Error", 2, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
