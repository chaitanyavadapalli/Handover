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

    var data = {"OkPercent": 94.75538160469668, "KoPercent": 5.244618395303327};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.20078277886497065, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.971875, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.046875, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [0.88125, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.039886039886039885, 500, 1500, "Upload"], "isController": false}, {"data": [0.675, 500, 1500, "Course Page"], "isController": false}, {"data": [0.19375, 500, 1500, "Login"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2555, 134, 5.244618395303327, 9318.982387475538, 0, 87450, 5970.0, 25057.200000000008, 32819.79999999999, 50006.0, 8.393312944098238, 278.53655823661586, 8.440837152892984], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 160, 2, 1.25, 125.70624999999998, 0, 950, 75.0, 263.00000000000006, 418.39999999999964, 923.1599999999994, 9.861325115562405, 3.8819337442218793, 3.1667709938366717], "isController": false}, {"data": ["Get CSRF Token", 160, 0, 0.0, 19810.38125, 109, 40012, 15506.0, 36813.5, 37931.74999999999, 39437.37999999999, 3.9988003598920323, 133.58031164869288, 0.5349957512746176], "isController": false}, {"data": ["StudentCourses", 160, 1, 0.625, 484.5187499999999, 35, 23497, 119.5, 806.3000000000001, 1086.4499999999987, 12829.319999999761, 4.743973670946126, 6.85533729467489, 1.156285672458268], "isController": false}, {"data": ["Upload", 1755, 128, 7.293447293447294, 10517.737321937338, 0, 87450, 7395.0, 24109.0, 37405.399999999994, 50008.76, 6.873134854430528, 284.70089793174446, 9.074257515410704], "isController": false}, {"data": ["Course Page", 160, 2, 1.25, 740.3749999999999, 0, 4847, 467.5, 1729.0000000000002, 1985.8499999999997, 3936.2699999999795, 9.510788801046187, 367.3316943321643, 2.7423625765321287], "isController": false}, {"data": ["Login", 160, 1, 0.625, 12285.087500000001, 121, 31863, 13829.5, 25662.8, 28612.399999999987, 31820.3, 3.924261748258609, 6.72784305865545, 2.3179587094084178], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=IyZm9I3RaBuCM6eBcE6S06QVD6Mik6hW", 1, 0.746268656716418, 0.03913894324853229], "isController": false}, {"data": ["504\/Gateway Time-out", 41, 30.597014925373134, 1.6046966731898238], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=buKSkG4HlJxI0tBud37RmFMF0evm6nRz", 1, 0.746268656716418, 0.03913894324853229], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 49, 36.56716417910448, 1.917808219178082], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 40, 29.850746268656717, 1.5655577299412915], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=buKSkG4HlJxI0tBud37RmFMF0evm6nRz", 1, 0.746268656716418, 0.03913894324853229], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=IyZm9I3RaBuCM6eBcE6S06QVD6Mik6hW", 1, 0.746268656716418, 0.03913894324853229], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2555, 134, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 49, "504\/Gateway Time-out", 41, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 40, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=IyZm9I3RaBuCM6eBcE6S06QVD6Mik6hW", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=buKSkG4HlJxI0tBud37RmFMF0evm6nRz", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AssignmentsList", 160, 2, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=IyZm9I3RaBuCM6eBcE6S06QVD6Mik6hW", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=buKSkG4HlJxI0tBud37RmFMF0evm6nRz", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["StudentCourses", 160, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 1755, 128, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 47, "504\/Gateway Time-out", 41, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 40, null, null, null, null], "isController": false}, {"data": ["Course Page", 160, 2, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=buKSkG4HlJxI0tBud37RmFMF0evm6nRz", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=IyZm9I3RaBuCM6eBcE6S06QVD6Mik6hW", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Login", 160, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
