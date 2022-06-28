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

    var data = {"OkPercent": 97.18851132686085, "KoPercent": 2.8114886731391584};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18608414239482202, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.95, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.08333333333333333, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.9527777777777777, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.2478176527643065, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.02619047619047619, 500, 1500, "Upload"], "isController": false}, {"data": [0.8222222222222222, 500, 1500, "Course Page"], "isController": false}, {"data": [0.6277777777777778, 500, 1500, "Login"], "isController": false}, {"data": [0.018031189083820662, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4944, 139, 2.8114886731391584, 6443.720266990293, 0, 76132, 2916.0, 18584.5, 20677.75, 50005.55, 15.316364717836874, 486.00522513820823, 7.533861177437793], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 180, 8, 4.444444444444445, 60.755555555555496, 0, 911, 40.0, 74.9, 105.44999999999987, 820.2799999999997, 18.911536036982557, 7.973584589724732, 5.8413171096869085], "isController": false}, {"data": ["Get CSRF Token", 180, 0, 0.0, 5300.605555555555, 162, 8999, 6776.0, 7660.6, 7785.2, 8159.029999999998, 19.045603639826474, 508.9915873650936, 2.5108950111099353], "isController": false}, {"data": ["StudentCourses", 180, 1, 0.5555555555555556, 157.10000000000002, 22, 4360, 38.5, 423.8, 743.1499999999996, 1672.4199999999923, 18.915510718789406, 42.72317265001051, 4.707326804854981], "isController": false}, {"data": ["GetSubmissionId", 1031, 11, 1.066925315227934, 2296.1542192046527, 0, 50004, 1558.0, 3915.2000000000025, 5282.2, 13768.279999999899, 3.759658968664646, 167.8502421693524, 0.862559519576847], "isController": false}, {"data": ["TestcasesResults", 937, 4, 0.42689434364994666, 16286.23372465315, 3543, 56122, 17475.0, 21266.2, 22185.69999999999, 24400.88, 3.4146856995003696, 98.58091005177603, 0.8243463992740604], "isController": false}, {"data": ["Upload", 1050, 78, 7.428571428571429, 8319.536190476181, 0, 76132, 3198.5, 20127.0, 50005.0, 71662.94, 3.80376899167518, 159.82643436053212, 5.28073654778983], "isController": false}, {"data": ["Course Page", 180, 15, 8.333333333333334, 359.9722222222221, 0, 3808, 109.5, 1042.0, 2346.199999999993, 3692.1699999999996, 19.03955997461392, 567.7041670523058, 5.062031448328749], "isController": false}, {"data": ["Login", 180, 8, 4.444444444444445, 941.961111111111, 22, 3881, 414.0, 2881.3, 3735.85, 3880.19, 17.484215638659542, 30.204665492957748, 9.887232880038853], "isController": false}, {"data": ["RunPractice", 1026, 14, 1.364522417153996, 4158.901559454184, 0, 41633, 3194.5, 7663.000000000002, 9281.599999999999, 13028.92, 3.7285770354541885, 104.33062306825366, 0.8636643626531768], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=Vptccddv8FWeOlzemmIjPFgExh0yFJ7b", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=yZBEjwWyE4xpSfjainxC13osPcjaXB1p", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["504\/Gateway Time-out", 66, 47.48201438848921, 1.3349514563106797], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=PkwT6ZwsbYuHGAJD5SnGJpv1c1ciBZmX", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 22, 15.827338129496402, 0.4449838187702265], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 16, 11.510791366906474, 0.32362459546925565], "isController": false}, {"data": ["403\/Forbidden", 7, 5.0359712230215825, 0.14158576051779936], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 10, 7.194244604316546, 0.2022653721682848], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=0yhUYJsK2aPd4xv1RARkyCZDpVZu11Sq", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=VM2e2cngMJuEHm2D89BPgxdb3uYOVSUM", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=PkwT6ZwsbYuHGAJD5SnGJpv1c1ciBZmX", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=kHs1etDqSXHH0hOLWotpfhMEzABF7TVu", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=yZBEjwWyE4xpSfjainxC13osPcjaXB1p", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=Vptccddv8FWeOlzemmIjPFgExh0yFJ7b", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=oDfJ7hPaLulX2yEZRQ082bSSlwfScWgV", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=kHs1etDqSXHH0hOLWotpfhMEzABF7TVu", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=1Ys14sitq7L7Ru08eUs5tA4J3HlZDSw0", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["500\/Internal Server Error", 2, 1.4388489208633093, 0.040453074433656956], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=0yhUYJsK2aPd4xv1RARkyCZDpVZu11Sq", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=VM2e2cngMJuEHm2D89BPgxdb3uYOVSUM", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=oDfJ7hPaLulX2yEZRQ082bSSlwfScWgV", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=1Ys14sitq7L7Ru08eUs5tA4J3HlZDSw0", 1, 0.7194244604316546, 0.020226537216828478], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4944, 139, "504\/Gateway Time-out", 66, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 22, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 16, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 10, "403\/Forbidden", 7], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AssignmentsList", 180, 8, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=yZBEjwWyE4xpSfjainxC13osPcjaXB1p", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=Vptccddv8FWeOlzemmIjPFgExh0yFJ7b", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=PkwT6ZwsbYuHGAJD5SnGJpv1c1ciBZmX", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=oDfJ7hPaLulX2yEZRQ082bSSlwfScWgV", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=VM2e2cngMJuEHm2D89BPgxdb3uYOVSUM", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["StudentCourses", 180, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["GetSubmissionId", 1031, 11, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 8, "504\/Gateway Time-out", 2, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 937, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 3, "504\/Gateway Time-out", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 1050, 78, "504\/Gateway Time-out", 63, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 8, "403\/Forbidden", 7, null, null, null, null], "isController": false}, {"data": ["Course Page", 180, 15, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 7, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=yZBEjwWyE4xpSfjainxC13osPcjaXB1p", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=Vptccddv8FWeOlzemmIjPFgExh0yFJ7b", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=kHs1etDqSXHH0hOLWotpfhMEzABF7TVu", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=1Ys14sitq7L7Ru08eUs5tA4J3HlZDSw0", 1], "isController": false}, {"data": ["Login", 180, 8, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["RunPractice", 1026, 14, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 10, "500\/Internal Server Error", 2, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 2, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
