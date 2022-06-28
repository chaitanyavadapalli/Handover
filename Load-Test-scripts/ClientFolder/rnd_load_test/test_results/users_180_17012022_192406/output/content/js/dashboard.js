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

    var data = {"OkPercent": 96.44987219539904, "KoPercent": 3.5501278046009657};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.31099119568304456, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.9527777777777777, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.9916666666666667, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.42246376811594205, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.0014326647564469914, 500, 1500, "Upload"], "isController": false}, {"data": [0.9888888888888889, 500, 1500, "Course Page"], "isController": false}, {"data": [0.49166666666666664, 500, 1500, "Login"], "isController": false}, {"data": [0.008784773060029283, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3521, 125, 3.5501278046009657, 9316.76143141153, 0, 120427, 2301.0, 39467.6, 43105.5, 54649.23999999977, 10.157687935978583, 308.8814358002605, 4.915357634060709], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 180, 0, 0.0, 71.82777777777777, 33, 241, 65.0, 109.80000000000001, 140.79999999999995, 193.20999999999987, 58.91980360065467, 22.51687806873977, 19.160443944353517], "isController": false}, {"data": ["Get CSRF Token", 180, 0, 0.0, 118.97222222222224, 29, 896, 36.0, 463.70000000000005, 624.5999999999997, 882.23, 42.25352112676056, 1411.4899684565728, 5.65305897887324], "isController": false}, {"data": ["StudentCourses", 180, 0, 0.0, 172.52777777777777, 35, 543, 146.0, 326.5, 407.69999999999993, 543.0, 54.7112462006079, 67.69448138297872, 13.357237841945288], "isController": false}, {"data": ["GetSubmissionId", 690, 1, 0.14492753623188406, 2656.9289855072484, 232, 50002, 872.0, 6395.0, 12381.599999999999, 19830.72, 2.533365153378738, 114.15607416747746, 0.5912834684155452], "isController": false}, {"data": ["TestcasesResults", 550, 1, 0.18181818181818182, 32928.79454545454, 4419, 120427, 38385.5, 43190.5, 44877.149999999994, 64882.210000000014, 1.8172926964658613, 53.01708146716647, 0.44109681977908327], "isController": false}, {"data": ["Upload", 698, 94, 13.46704871060172, 13566.320916905464, 1108, 80842, 3529.5, 50005.0, 50006.0, 71658.51999999999, 2.5196918611786963, 99.4104617919684, 3.4962543611786963], "isController": false}, {"data": ["Course Page", 180, 0, 0.0, 193.28888888888886, 69, 553, 149.5, 365.8, 433.29999999999984, 536.8, 57.45292052345994, 2246.2274701763486, 16.775803941908713], "isController": false}, {"data": ["Login", 180, 0, 0.0, 1130.5777777777776, 135, 3362, 970.0, 2358.4, 2857.8499999999995, 3211.3399999999997, 43.870338776504994, 75.1365235803071, 26.08228735071899], "isController": false}, {"data": ["RunPractice", 683, 29, 4.24597364568082, 4520.076134699857, 0, 50003, 2602.0, 7320.200000000002, 15288.799999999988, 33807.75999999992, 2.5261211280628757, 69.32046419902913, 0.5718945041608876], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504\/Gateway Time-out", 97, 77.6, 2.7548991763703494], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 26, 20.8, 0.7384265833570008], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 2, 1.6, 0.05680204487361545], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3521, 125, "504\/Gateway Time-out", 97, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 26, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 2, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GetSubmissionId", 690, 1, "504\/Gateway Time-out", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 550, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 698, 94, "504\/Gateway Time-out", 93, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RunPractice", 683, 29, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 26, "504\/Gateway Time-out", 3, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
