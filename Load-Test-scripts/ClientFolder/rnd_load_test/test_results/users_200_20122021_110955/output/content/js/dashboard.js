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

    var data = {"OkPercent": 98.28009828009829, "KoPercent": 1.71990171990172};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1252047502047502, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.95, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.0, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.9325, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.11878172588832488, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "CompareOutput"], "isController": false}, {"data": [0.0019138755980861245, 500, 1500, "Upload"], "isController": false}, {"data": [0.4675, 500, 1500, "Course Page"], "isController": false}, {"data": [0.0475, 500, 1500, "Login"], "isController": false}, {"data": [0.011075949367088608, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4884, 84, 1.71990171990172, 9594.487714987716, 0, 86039, 5488.0, 22557.0, 33546.75, 60250.45, 14.914889848469116, 471.2007973637077, 7.46791859566723], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 200, 0, 0.0, 146.94, 35, 729, 74.0, 518.3000000000002, 630.9, 713.7800000000002, 84.8536274925753, 32.441596839202376, 27.42827216801018], "isController": false}, {"data": ["Get CSRF Token", 200, 0, 0.0, 4862.894999999996, 1797, 7121, 4753.5, 6329.7, 6455.549999999999, 6849.090000000001, 27.999440011199777, 748.2831202750946, 3.691332423351533], "isController": false}, {"data": ["StudentCourses", 200, 0, 0.0, 204.56500000000028, 30, 1210, 92.5, 566.8, 1037.2999999999997, 1144.0, 84.56659619450318, 105.54307610993656, 20.480972515856234], "isController": false}, {"data": ["GetSubmissionId", 985, 4, 0.40609137055837563, 5162.931979695434, 67, 50004, 3304.0, 11203.399999999996, 17255.39999999998, 27429.339999999997, 3.8110640800439533, 171.50200963502772, 0.8793664613786378], "isController": false}, {"data": ["TestcasesResults", 903, 13, 1.4396456256921373, 18680.79734219275, 3740, 86039, 15590.0, 31811.600000000002, 40724.0, 59186.640000000014, 3.4821707459095097, 99.55774904100515, 0.8349328631310229], "isController": false}, {"data": ["CompareOutput", 3, 0, 0.0, 581.0, 137, 1266, 340.0, 1266.0, 1266.0, 1266.0, 0.04482897745102434, 0.9315875948880021, 0.010506791590083829], "isController": false}, {"data": ["Upload", 1045, 52, 4.976076555023924, 14411.453588516757, 303, 74439, 8247.0, 39219.79999999998, 50005.0, 70097.62, 3.861731533901938, 166.85575947694787, 5.409607131176923], "isController": false}, {"data": ["Course Page", 200, 0, 0.0, 1062.9349999999997, 296, 1814, 1083.5, 1570.8000000000002, 1694.8, 1758.89, 70.2000702000702, 2273.0978111837485, 20.360762548262546], "isController": false}, {"data": ["Login", 200, 0, 0.0, 2164.6200000000003, 315, 4428, 2111.5, 2865.8, 3141.8, 3682.140000000001, 42.780748663101605, 73.32052139037434, 25.31751336898396], "isController": false}, {"data": ["RunPractice", 948, 15, 1.5822784810126582, 8602.454641350221, 0, 50004, 5335.5, 18989.7, 26616.19999999999, 50002.0, 3.672980732348964, 102.48282997135811, 0.8572225601605573], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504\/Gateway Time-out", 63, 75.0, 1.28992628992629], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 19, 22.61904761904762, 0.389025389025389], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 2, 2.380952380952381, 0.04095004095004095], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4884, 84, "504\/Gateway Time-out", 63, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 19, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 2, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GetSubmissionId", 985, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 3, "504\/Gateway Time-out", 1, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 903, 13, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 9, "504\/Gateway Time-out", 4, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Upload", 1045, 52, "504\/Gateway Time-out", 47, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 5, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RunPractice", 948, 15, "504\/Gateway Time-out", 11, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 2, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 2, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
