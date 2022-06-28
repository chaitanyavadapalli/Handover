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

    var data = {"OkPercent": 98.38842975206612, "KoPercent": 1.6115702479338843};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18760330578512396, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9833333333333333, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.44722222222222224, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.9861111111111112, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.12638469284994966, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.375, 500, 1500, "CompareOutput"], "isController": false}, {"data": [0.027804410354745925, 500, 1500, "Upload"], "isController": false}, {"data": [0.9388888888888889, 500, 1500, "Course Page"], "isController": false}, {"data": [0.7638888888888888, 500, 1500, "Login"], "isController": false}, {"data": [0.01084710743801653, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4840, 78, 1.6115702479338843, 7842.7245867768725, 0, 89831, 4897.5, 17835.9, 25714.799999999992, 46649.520000000135, 15.287477218816232, 488.67754561961664, 7.584666570527703], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 180, 3, 1.6666666666666667, 44.87222222222221, 0, 291, 35.0, 75.80000000000001, 122.74999999999994, 253.7399999999999, 39.70880211780278, 15.787006397529229, 12.621634058570482], "isController": false}, {"data": ["Get CSRF Token", 180, 0, 0.0, 1600.2277777777776, 46, 5060, 1235.5, 3906.5000000000005, 4660.299999999999, 4957.94, 32.96099615455045, 880.886914026735, 4.345443828969053], "isController": false}, {"data": ["StudentCourses", 180, 0, 0.0, 86.38888888888894, 24, 827, 37.0, 243.40000000000003, 376.7999999999995, 693.3499999999997, 40.26845637583892, 67.55081620525728, 9.871801593959733], "isController": false}, {"data": ["GetSubmissionId", 993, 5, 0.5035246727089627, 4604.568982880162, 0, 50004, 3293.0, 9724.6, 11991.099999999999, 20966.679999999953, 3.596301567813644, 160.46203211636734, 0.8298324962787513], "isController": false}, {"data": ["TestcasesResults", 932, 18, 1.9313304721030042, 14837.29935622318, 3808, 89831, 13172.0, 24207.700000000004, 29516.79999999998, 38227.099999999955, 3.711816480146561, 105.64715963399577, 0.8835228404157871], "isController": false}, {"data": ["CompareOutput", 4, 0, 0.0, 2274.25, 446, 5755, 1448.0, 5755.0, 5755.0, 5755.0, 0.45740423098913663, 9.488792702973129, 0.10720411663807891], "isController": false}, {"data": ["Upload", 1043, 37, 3.5474592521572386, 11715.0958772771, 0, 78846, 6688.0, 33282.2, 39836.6, 62619.63999999988, 3.765859576403983, 163.84377992851907, 5.209237159565212], "isController": false}, {"data": ["Course Page", 180, 3, 1.6666666666666667, 189.91666666666663, 0, 993, 85.0, 447.9, 843.8499999999999, 958.9799999999999, 39.23278116826504, 1250.080457852005, 11.189388418156058], "isController": false}, {"data": ["Login", 180, 3, 1.6666666666666667, 534.422222222222, 30, 2284, 212.0, 1447.4, 1723.499999999999, 2177.08, 34.27265803503427, 58.914498345868246, 19.94441105769231], "isController": false}, {"data": ["RunPractice", 968, 9, 0.9297520661157025, 7115.801652892557, 0, 50002, 5195.5, 14977.6, 18851.45, 26858.66999999998, 3.485286546001822, 97.9022585615452, 0.8118008273955045], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=tRmKLG60y7UGReTEbUts6Wb6bROyhnOV", 1, 1.2820512820512822, 0.02066115702479339], "isController": false}, {"data": ["504\/Gateway Time-out", 39, 50.0, 0.8057851239669421], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=bFuogBQUuPzjfPee4U5vx0JilDRfngKi", 1, 1.2820512820512822, 0.02066115702479339], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 21, 26.923076923076923, 0.43388429752066116], "isController": false}, {"data": ["500\/Internal Server Error", 1, 1.2820512820512822, 0.02066115702479339], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 6, 7.6923076923076925, 0.12396694214876033], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=66Sg5IM3BwN5Nh3NPW6lgiUszV5ZP0m0", 1, 1.2820512820512822, 0.02066115702479339], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 5, 6.410256410256411, 0.10330578512396695], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=66Sg5IM3BwN5Nh3NPW6lgiUszV5ZP0m0", 1, 1.2820512820512822, 0.02066115702479339], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=bFuogBQUuPzjfPee4U5vx0JilDRfngKi", 1, 1.2820512820512822, 0.02066115702479339], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=tRmKLG60y7UGReTEbUts6Wb6bROyhnOV", 1, 1.2820512820512822, 0.02066115702479339], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4840, 78, "504\/Gateway Time-out", 39, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 21, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 6, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 5, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=tRmKLG60y7UGReTEbUts6Wb6bROyhnOV", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AssignmentsList", 180, 3, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=66Sg5IM3BwN5Nh3NPW6lgiUszV5ZP0m0", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=bFuogBQUuPzjfPee4U5vx0JilDRfngKi", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=tRmKLG60y7UGReTEbUts6Wb6bROyhnOV", 1, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GetSubmissionId", 993, 5, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 3, "504\/Gateway Time-out", 2, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 932, 18, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 16, "504\/Gateway Time-out", 2, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Upload", 1043, 37, "504\/Gateway Time-out", 33, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null, null, null], "isController": false}, {"data": ["Course Page", 180, 3, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=tRmKLG60y7UGReTEbUts6Wb6bROyhnOV", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=bFuogBQUuPzjfPee4U5vx0JilDRfngKi", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=66Sg5IM3BwN5Nh3NPW6lgiUszV5ZP0m0", 1, null, null, null, null], "isController": false}, {"data": ["Login", 180, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["RunPractice", 968, 9, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 5, "504\/Gateway Time-out", 2, "500\/Internal Server Error", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
