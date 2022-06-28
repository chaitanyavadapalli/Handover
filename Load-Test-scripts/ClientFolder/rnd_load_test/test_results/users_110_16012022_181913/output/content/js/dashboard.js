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

    var data = {"OkPercent": 94.95996231747527, "KoPercent": 5.040037682524729};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.27037211493170044, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.9818181818181818, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.9681818181818181, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.3284671532846715, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.0, 500, 1500, "Upload"], "isController": false}, {"data": [0.9954545454545455, 500, 1500, "Course Page"], "isController": false}, {"data": [0.0, 500, 1500, "Login"], "isController": false}, {"data": [0.012224938875305624, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2123, 107, 5.040037682524729, 9263.020725388595, 0, 79176, 3369.0, 28579.200000000004, 48431.2, 50021.84, 6.38999753188979, 187.28822304624245, 3.0883269533060638], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 110, 0, 0.0, 95.32727272727273, 37, 298, 84.0, 141.40000000000003, 209.84999999999985, 296.46000000000004, 40.816326530612244, 15.617752782931355, 13.27327806122449], "isController": false}, {"data": ["Get CSRF Token", 110, 0, 0.0, 108.44545454545455, 32, 541, 57.5, 336.5000000000001, 438.94999999999965, 541.0, 39.04863329783458, 1304.4444860445508, 5.224280040823571], "isController": false}, {"data": ["StudentCourses", 110, 0, 0.0, 165.8818181818183, 32, 1406, 70.5, 351.0, 657.9499999999996, 1402.26, 27.093596059113302, 33.52303340517242, 6.614647475369459], "isController": false}, {"data": ["GetSubmissionId", 411, 6, 1.4598540145985401, 5462.51581508516, 276, 50053, 1316.0, 13446.000000000007, 37059.799999999996, 50003.88, 1.5602341490080553, 69.86449766202139, 0.3641562125126223], "isController": false}, {"data": ["TestcasesResults", 333, 3, 0.9009009009009009, 24312.930930930946, 4179, 70790, 23354.0, 33305.200000000004, 38600.80000000002, 62484.640000000036, 1.2078696516402363, 31.9430288147643, 0.29359714033232737], "isController": false}, {"data": ["Upload", 420, 85, 20.238095238095237, 15611.459523809532, 2238, 79176, 5244.0, 50005.0, 50007.0, 73116.82000000008, 1.5278394168018685, 55.987186611033906, 2.112765177902349], "isController": false}, {"data": ["Course Page", 110, 0, 0.0, 207.6636363636364, 80, 505, 177.5, 359.5000000000001, 408.34999999999997, 502.03000000000003, 37.4276964954066, 1463.260781728479, 10.928594972779857], "isController": false}, {"data": ["Login", 110, 0, 0.0, 4195.69090909091, 2158, 6021, 4131.0, 5563.6, 5794.6, 6007.36, 17.432646592709986, 29.84381190570523, 10.351252971473851], "isController": false}, {"data": ["RunPractice", 409, 13, 3.1784841075794623, 5482.271393643026, 0, 50003, 2804.0, 10968.0, 19590.5, 37328.29999999999, 1.54195900424887, 42.53229802080702, 0.3529397540311483], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504\/Gateway Time-out", 95, 88.78504672897196, 4.474799811587376], "isController": false}, {"data": ["500\/Internal Server Error", 1, 0.9345794392523364, 0.047103155911446065], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 11, 10.280373831775702, 0.5181347150259067], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2123, 107, "504\/Gateway Time-out", 95, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 11, "500\/Internal Server Error", 1, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GetSubmissionId", 411, 6, "504\/Gateway Time-out", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 333, 3, "504\/Gateway Time-out", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 420, 85, "504\/Gateway Time-out", 85, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RunPractice", 409, 13, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 11, "504\/Gateway Time-out", 1, "500\/Internal Server Error", 1, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
