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

    var data = {"OkPercent": 97.54551365409623, "KoPercent": 2.454486345903771};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3013654096228869, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8892857142857142, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.0, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.7214285714285714, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.15760086455331412, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.4024663677130045, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.5857142857142857, 500, 1500, "Course Page"], "isController": false}, {"data": [0.22857142857142856, 500, 1500, "Login"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6152, 151, 2.454486345903771, 2814.635078023411, 0, 28496, 1856.5, 6600.7, 8330.099999999997, 14211.880000000001, 20.133064107053446, 665.6717426384803, 4.858466110746579], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 140, 2, 1.4285714285714286, 397.8571428571429, 0, 7786, 83.0, 710.7000000000003, 1596.8499999999967, 6608.89000000001, 4.157016449907951, 1.643146583080943, 1.3325302311598077], "isController": false}, {"data": ["Get CSRF Token", 140, 0, 0.0, 12572.428571428565, 4584, 28496, 7912.5, 26948.7, 27375.85, 28143.4, 4.9086637915921605, 163.97566705234738, 0.6567255268048104], "isController": false}, {"data": ["StudentCourses", 140, 1, 0.7142857142857143, 947.5999999999999, 2, 8556, 74.0, 2589.8, 5036.0499999999865, 8442.43, 4.867195104992351, 7.178128204961062, 1.186039298254763], "isController": false}, {"data": ["GetSubmissionId", 2776, 73, 2.6296829971181555, 3402.298270893378, 0, 12392, 2830.5, 7217.100000000001, 8597.800000000003, 11018.2, 10.076042177092974, 435.1055157517559, 2.289889390619045], "isController": false}, {"data": ["TestcasesResults", 2676, 70, 2.615844544095665, 1881.7612107623345, 0, 14210, 1223.0, 4294.4000000000015, 6165.6, 9830.970000000001, 9.733776130423871, 265.64730770699737, 2.3049900038738684], "isController": false}, {"data": ["Course Page", 140, 4, 2.857142857142857, 1740.5785714285714, 0, 14214, 443.5, 5741.700000000001, 7489.599999999999, 13963.490000000002, 4.063270933101147, 154.50565048614135, 1.1525449862139023], "isController": false}, {"data": ["Login", 140, 1, 0.7142857142857143, 4593.407142857144, 206, 17588, 4435.0, 9222.000000000002, 9788.199999999999, 17447.780000000002, 4.984867366921844, 8.546495293306036, 2.9407796644116075], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 63, 41.72185430463576, 1.0240572171651496], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=qBTWITmDWGf6AfJFugg4XnzPyRQDTHWU", 1, 0.6622516556291391, 0.016254876462938883], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 52: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/results\\\/practice\\\/${SUBMISSION_ID}", 63, 41.72185430463576, 1.0240572171651496], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=0OUwz4m2Bu0zK7Xunpnj6pMyyRy3j4PE", 1, 0.6622516556291391, 0.016254876462938883], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=qBTWITmDWGf6AfJFugg4XnzPyRQDTHWU", 1, 0.6622516556291391, 0.016254876462938883], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 21, 13.907284768211921, 0.3413524057217165], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=0OUwz4m2Bu0zK7Xunpnj6pMyyRy3j4PE", 1, 0.6622516556291391, 0.016254876462938883], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6152, 151, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 63, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 52: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/results\\\/practice\\\/${SUBMISSION_ID}", 63, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 21, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=qBTWITmDWGf6AfJFugg4XnzPyRQDTHWU", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=0OUwz4m2Bu0zK7Xunpnj6pMyyRy3j4PE", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AssignmentsList", 140, 2, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=qBTWITmDWGf6AfJFugg4XnzPyRQDTHWU", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=0OUwz4m2Bu0zK7Xunpnj6pMyyRy3j4PE", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["StudentCourses", 140, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["GetSubmissionId", 2776, 73, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 63, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 10, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 2676, 70, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 52: http:\\\/\\\/10.129.131.6:9791\\\/evaluate\\\/results\\\/practice\\\/${SUBMISSION_ID}", 63, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 7, null, null, null, null, null, null], "isController": false}, {"data": ["Course Page", 140, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 2, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=qBTWITmDWGf6AfJFugg4XnzPyRQDTHWU", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=0OUwz4m2Bu0zK7Xunpnj6pMyyRy3j4PE", 1, null, null, null, null], "isController": false}, {"data": ["Login", 140, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
