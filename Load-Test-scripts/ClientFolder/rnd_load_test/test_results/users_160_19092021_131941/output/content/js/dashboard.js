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

    var data = {"OkPercent": 99.48805460750853, "KoPercent": 0.5119453924914675};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2052047781569966, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [1.0, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [1.0, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.10571142284569138, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.05544455544455545, 500, 1500, "Upload"], "isController": false}, {"data": [1.0, 500, 1500, "Course Page"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": false}, {"data": [0.001006036217303823, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4688, 24, 0.5119453924914675, 7673.619240614329, 23, 34738, 6609.0, 15810.700000000003, 20514.5, 28141.00999999997, 14.089163245556565, 458.6701438613113, 6.9206542337740204], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 160, 0, 0.0, 32.38749999999998, 25, 63, 32.0, 37.0, 38.94999999999999, 59.33999999999992, 58.88847994111152, 22.593565973500183, 19.035241074714758], "isController": false}, {"data": ["Get CSRF Token", 160, 0, 0.0, 34.54375000000001, 25, 135, 29.0, 40.0, 80.79999999999973, 135.0, 57.38880918220947, 1533.803493767934, 7.565907460545194], "isController": false}, {"data": ["StudentCourses", 160, 0, 0.0, 38.03124999999997, 23, 148, 30.0, 61.900000000000006, 73.89999999999998, 133.9699999999997, 58.50091407678245, 72.99760054844607, 14.16819012797075], "isController": false}, {"data": ["GetSubmissionId", 998, 0, 0.0, 5809.1142284569205, 273, 23679, 5217.0, 11556.0, 13651.449999999997, 19914.129999999997, 3.6765789396127433, 163.64357696386602, 0.8509269616095901], "isController": false}, {"data": ["TestcasesResults", 895, 18, 2.011173184357542, 14396.525139664807, 5309, 34738, 13125.0, 22746.8, 26127.399999999994, 32129.279999999995, 3.054909871625519, 86.89870928457935, 0.7249810988118278], "isController": false}, {"data": ["Upload", 1001, 2, 0.1998001998001998, 9630.153846153844, 400, 31564, 9277.0, 17265.600000000006, 22757.8, 28520.620000000003, 3.6350563234001756, 162.25918546231668, 4.99125521676883], "isController": false}, {"data": ["Course Page", 160, 0, 0.0, 68.76874999999998, 53, 148, 64.5, 82.80000000000001, 108.89999999999998, 140.06999999999982, 57.88712011577424, 1874.5452836695008, 16.789526049204053], "isController": false}, {"data": ["Login", 160, 0, 0.0, 140.19374999999997, 77, 351, 110.5, 243.9, 298.95, 344.28999999999985, 56.91924581999289, 97.55202774813235, 33.684631803628605], "isController": false}, {"data": ["RunPractice", 994, 4, 0.4024144869215292, 7647.413480885307, 28, 31316, 6385.0, 14722.0, 18441.5, 23832.39999999996, 3.6711885565285476, 103.64555945806572, 0.8578379321679587], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 23, 95.83333333333333, 0.4906143344709898], "isController": false}, {"data": ["500\/Internal Server Error", 1, 4.166666666666667, 0.021331058020477817], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4688, 24, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 23, "500\/Internal Server Error", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["TestcasesResults", 895, 18, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 18, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 1001, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RunPractice", 994, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 3, "500\/Internal Server Error", 1, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
