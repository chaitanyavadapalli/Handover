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

    var data = {"OkPercent": 91.01754385964912, "KoPercent": 8.982456140350877};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.23614035087719298, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9833333333333333, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.16111111111111112, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.9, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.2786259541984733, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.0, 500, 1500, "Upload"], "isController": false}, {"data": [0.7944444444444444, 500, 1500, "Course Page"], "isController": false}, {"data": [0.005555555555555556, 500, 1500, "Login"], "isController": false}, {"data": [0.02895752895752896, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1425, 128, 8.982456140350877, 10194.34245614036, 0, 84731, 2666.0, 36029.800000000054, 50005.0, 60820.80000000003, 4.24124814724423, 112.6454929483669, 1.9687622772972684], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 90, 1, 1.1111111111111112, 91.98888888888887, 10, 619, 68.0, 178.50000000000003, 220.55000000000007, 619.0, 18.07955002008839, 7.2492796429288875, 5.8140584195460026], "isController": false}, {"data": ["Get CSRF Token", 90, 0, 0.0, 1903.5222222222224, 364, 3422, 1762.0, 2866.8, 3186.4, 3422.0, 24.52316076294278, 819.2028908378746, 3.280930688010899], "isController": false}, {"data": ["StudentCourses", 90, 0, 0.0, 237.15555555555562, 33, 1098, 60.5, 755.7, 868.5500000000002, 1098.0, 18.711018711018713, 23.15123115904366, 4.568119802494802], "isController": false}, {"data": ["GetSubmissionId", 262, 29, 11.068702290076336, 7744.694656488551, 0, 50097, 1754.0, 50003.0, 50004.0, 50049.87, 0.9711472882009311, 38.6935742170125, 0.2257991288864425], "isController": false}, {"data": ["TestcasesResults", 188, 4, 2.127659574468085, 28900.234042553184, 4920, 84731, 28325.5, 41339.599999999984, 47033.849999999984, 78903.2799999999, 0.6986691838577688, 18.25103395142019, 0.16989123709041445], "isController": false}, {"data": ["Upload", 266, 63, 23.68421052631579, 21087.522556390955, 0, 75592, 9859.5, 50006.0, 50029.8, 73389.79999999997, 0.9675612364414116, 33.28889986627831, 1.30348171432027], "isController": false}, {"data": ["Course Page", 90, 1, 1.1111111111111112, 446.28888888888895, 70, 1295, 344.5, 924.4000000000001, 1106.9, 1295.0, 17.647058823529413, 682.6637178308824, 5.09554993872549], "isController": false}, {"data": ["Login", 90, 0, 0.0, 3870.988888888889, 1228, 6018, 4137.0, 5441.300000000001, 5775.85, 6018.0, 13.657056145675266, 23.377039074355086, 8.106209692716236], "isController": false}, {"data": ["RunPractice", 259, 30, 11.583011583011583, 3342.888030888032, 0, 50003, 2170.0, 8219.0, 10134.0, 15284.199999999997, 0.9622851113315574, 24.358378870039495, 0.20111706579206468], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 2, 1.5625, 0.14035087719298245], "isController": false}, {"data": ["504\/Gateway Time-out", 94, 73.4375, 6.5964912280701755], "isController": false}, {"data": ["403\/Forbidden", 1, 0.78125, 0.07017543859649122], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 29, 22.65625, 2.0350877192982457], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 2, 1.5625, 0.14035087719298245], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1425, 128, "504\/Gateway Time-out", 94, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 29, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 2, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 2, "403\/Forbidden", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AssignmentsList", 90, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GetSubmissionId", 262, 29, "504\/Gateway Time-out", 28, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 1, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 188, 4, "504\/Gateway Time-out", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 266, 63, "504\/Gateway Time-out", 61, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 1, "403\/Forbidden", 1, null, null, null, null], "isController": false}, {"data": ["Course Page", 90, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["RunPractice", 259, 30, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 29, "504\/Gateway Time-out", 1, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
