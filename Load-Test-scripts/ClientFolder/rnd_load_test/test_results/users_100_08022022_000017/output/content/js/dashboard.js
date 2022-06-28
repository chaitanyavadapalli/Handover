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

    var data = {"OkPercent": 58.32406377456433, "KoPercent": 41.67593622543567};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4933259176863181, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.98, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.12, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.995, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.4508420573509331, 500, 1500, "Upload"], "isController": false}, {"data": [0.875, 500, 1500, "Course Page"], "isController": false}, {"data": [0.43, 500, 1500, "Login"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2697, 1124, 41.67593622543567, 381.85576566555443, 0, 6134, 236.0, 596.2000000000003, 1636.5999999999967, 4338.759999999999, 8.95147880288492, 210.9977258541161, 4.281510130571441], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 100, 2, 2.0, 79.96000000000005, 0, 202, 72.5, 143.3000000000001, 169.95, 201.85999999999993, 16.603021749958494, 6.61299653411921, 5.291240349493608], "isController": false}, {"data": ["Get CSRF Token", 100, 0, 0.0, 3189.9000000000015, 50, 5272, 3601.0, 5064.6, 5263.85, 5271.99, 18.439977872026557, 615.9943037755854, 2.4670673520191775], "isController": false}, {"data": ["StudentCourses", 100, 0, 0.0, 171.3500000000001, 37, 598, 134.5, 350.9000000000001, 430.74999999999926, 596.8199999999994, 16.747613465081226, 31.59672793501926, 4.148959554513482], "isController": false}, {"data": ["Upload", 2197, 1114, 50.70550751024124, 252.14792899408323, 0, 6134, 4.0, 464.0, 544.1999999999998, 2692.22, 7.945491828475745, 202.49653803085974, 4.10166915905088], "isController": false}, {"data": ["Course Page", 100, 2, 2.0, 316.18000000000006, 0, 951, 283.5, 645.9, 764.75, 949.9699999999995, 15.767896562598551, 604.5000406516084, 4.512020557395144], "isController": false}, {"data": ["Login", 100, 6, 6.0, 1001.57, 100, 2374, 865.5, 1867.5000000000002, 1982.1999999999998, 2373.77, 16.134236850596967, 28.530183627783153, 9.228027186189093], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 46, 4.092526690391459, 1.7055988134964775], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=wvLCRQTUO2CMJOaGKtGKtALR7pVGy0BQ", 1, 0.08896797153024912, 0.03707823507601038], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=vwYQ3lDDD0miPrVnubltaxIQnYD9xirm", 1, 0.08896797153024912, 0.03707823507601038], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=wvLCRQTUO2CMJOaGKtGKtALR7pVGy0BQ", 1, 0.08896797153024912, 0.03707823507601038], "isController": false}, {"data": ["Non HTTP response code: java.io.FileNotFoundException\/Non HTTP response message: \\\/home\\\/panda\\\/LoadTest\\\/ClientFolder\\\/rnd_load_test\\\/student_solutions\\\/1\\\/${filename} (No such file or directory)", 1068, 95.01779359430606, 39.59955506117909], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=vwYQ3lDDD0miPrVnubltaxIQnYD9xirm", 1, 0.08896797153024912, 0.03707823507601038], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 6, 0.5338078291814946, 0.22246941045606228], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2697, 1124, "Non HTTP response code: java.io.FileNotFoundException\/Non HTTP response message: \\\/home\\\/panda\\\/LoadTest\\\/ClientFolder\\\/rnd_load_test\\\/student_solutions\\\/1\\\/${filename} (No such file or directory)", 1068, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 46, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 6, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=wvLCRQTUO2CMJOaGKtGKtALR7pVGy0BQ", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=vwYQ3lDDD0miPrVnubltaxIQnYD9xirm", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AssignmentsList", 100, 2, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=wvLCRQTUO2CMJOaGKtGKtALR7pVGy0BQ", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=vwYQ3lDDD0miPrVnubltaxIQnYD9xirm", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Upload", 2197, 1114, "Non HTTP response code: java.io.FileNotFoundException\/Non HTTP response message: \\\/home\\\/panda\\\/LoadTest\\\/ClientFolder\\\/rnd_load_test\\\/student_solutions\\\/1\\\/${filename} (No such file or directory)", 1068, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9791\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 46, null, null, null, null, null, null], "isController": false}, {"data": ["Course Page", 100, 2, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=wvLCRQTUO2CMJOaGKtGKtALR7pVGy0BQ", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9791\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=vwYQ3lDDD0miPrVnubltaxIQnYD9xirm", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Login", 100, 6, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9791 failed to respond", 6, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
