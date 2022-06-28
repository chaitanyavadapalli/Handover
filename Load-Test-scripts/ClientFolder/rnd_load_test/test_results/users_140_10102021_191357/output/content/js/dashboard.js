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

    var data = {"OkPercent": 98.95502044525216, "KoPercent": 1.044979554747842};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.17298955020445253, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9642857142857143, 500, 1500, "AssignmentsList"], "isController": false}, {"data": [0.30714285714285716, 500, 1500, "Get CSRF Token"], "isController": false}, {"data": [1.0, 500, 1500, "StudentCourses"], "isController": false}, {"data": [0.14361140443505807, 500, 1500, "GetSubmissionId"], "isController": false}, {"data": [0.0, 500, 1500, "TestcasesResults"], "isController": false}, {"data": [0.05299055613850997, 500, 1500, "Upload"], "isController": false}, {"data": [0.9464285714285714, 500, 1500, "Course Page"], "isController": false}, {"data": [0.8535714285714285, 500, 1500, "Login"], "isController": false}, {"data": [0.005324813631522897, 500, 1500, "RunPractice"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4402, 46, 1.044979554747842, 6267.667423898211, 0, 33161, 4517.0, 14163.2, 17991.1, 26451.390000000047, 13.370185882638804, 436.57982624282437, 6.539545857505163], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["AssignmentsList", 140, 5, 3.5714285714285716, 34.392857142857174, 0, 101, 33.0, 43.0, 55.89999999999998, 97.31000000000003, 21.039975954313192, 8.733586000901713, 6.5581147148331835], "isController": false}, {"data": ["Get CSRF Token", 140, 0, 0.0, 2840.628571428571, 54, 6905, 2398.5, 6242.5, 6432.949999999999, 6856.620000000001, 19.64085297418631, 524.9138520622896, 2.589370265151515], "isController": false}, {"data": ["StudentCourses", 140, 0, 0.0, 54.371428571428545, 24, 260, 35.0, 119.9, 136.84999999999997, 230.07000000000025, 20.768431983385256, 45.03154089712209, 5.1616854880581515], "isController": false}, {"data": ["GetSubmissionId", 947, 9, 0.9503695881731784, 4104.7476240760325, 0, 30268, 3029.0, 8233.0, 11411.599999999999, 19368.44, 3.448200527243333, 151.58589673581577, 0.790485235457114], "isController": false}, {"data": ["TestcasesResults", 863, 4, 0.46349942062572425, 12306.349942062569, 5300, 33161, 11378.0, 19096.4, 22673.199999999997, 28522.840000000015, 3.006392503178833, 86.77387608646427, 0.7247358955600843], "isController": false}, {"data": ["Upload", 953, 10, 1.0493179433368311, 7151.703043022036, 0, 32748, 5284.0, 14979.2, 19426.099999999995, 29371.46, 3.4478392214323184, 152.24650888754726, 4.680829534559795], "isController": false}, {"data": ["Course Page", 140, 5, 3.5714285714285716, 116.61428571428567, 0, 1152, 67.0, 253.6000000000003, 362.4999999999999, 1071.6400000000008, 20.839535576064304, 651.6345138527091, 5.828412241366478], "isController": false}, {"data": ["Login", 140, 5, 3.5714285714285716, 309.7500000000001, 16, 1099, 238.5, 660.7, 799.2499999999995, 1084.65, 19.599608007839844, 33.80645277719446, 11.184737242755146], "isController": false}, {"data": ["RunPractice", 939, 8, 0.8519701810436635, 6173.926517571881, 0, 33082, 4379.0, 13032.0, 17228.0, 23937.800000000003, 3.4022108935966693, 95.6373053873774, 0.7905996260828921], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=d1TPLcLausB4OIZaic34YAKa3qfbMZHV", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=6yyFTm3BEQcJoF8ePH1fderHlbIwkLYq", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 20, 43.47826086956522, 0.45433893684688775], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 10, 21.73913043478261, 0.22716946842344388], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=gb7xiNW9oTIw74lr0cgdjwndCJ1fhBW1", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=2sDInVi2IdVFBn8ASLPOOokIsqmsIZ5R", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 6, 13.043478260869565, 0.13630168105406634], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=3oGTnuqPst98AMW9aWNUvLWmpREcJ9o1", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=2sDInVi2IdVFBn8ASLPOOokIsqmsIZ5R", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=6yyFTm3BEQcJoF8ePH1fderHlbIwkLYq", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=3oGTnuqPst98AMW9aWNUvLWmpREcJ9o1", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=gb7xiNW9oTIw74lr0cgdjwndCJ1fhBW1", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=d1TPLcLausB4OIZaic34YAKa3qfbMZHV", 1, 2.1739130434782608, 0.02271694684234439], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4402, 46, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 20, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 10, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 6, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=d1TPLcLausB4OIZaic34YAKa3qfbMZHV", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=6yyFTm3BEQcJoF8ePH1fderHlbIwkLYq", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AssignmentsList", 140, 5, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=3oGTnuqPst98AMW9aWNUvLWmpREcJ9o1", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=gb7xiNW9oTIw74lr0cgdjwndCJ1fhBW1", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=6yyFTm3BEQcJoF8ePH1fderHlbIwkLYq", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=2sDInVi2IdVFBn8ASLPOOokIsqmsIZ5R", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 48: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/api\\\/course\\\/${COURSE_ID}\\\/all_published_assignments\\\/?format=json&amp;csrfmiddlewaretoken=d1TPLcLausB4OIZaic34YAKa3qfbMZHV", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GetSubmissionId", 947, 9, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 5, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 4, null, null, null, null, null, null], "isController": false}, {"data": ["TestcasesResults", 863, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Upload", 953, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 5, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 46: http:\\\/\\\/10.129.131.6:9769\\\/assignments\\\/details\\\/${ASSIGNMENT_ID}", 5, null, null, null, null, null, null], "isController": false}, {"data": ["Course Page", 140, 5, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=6yyFTm3BEQcJoF8ePH1fderHlbIwkLYq", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=d1TPLcLausB4OIZaic34YAKa3qfbMZHV", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=gb7xiNW9oTIw74lr0cgdjwndCJ1fhBW1", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=3oGTnuqPst98AMW9aWNUvLWmpREcJ9o1", 1, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/courseware\\\/course\\\/${COURSE_ID}\\\/content\\\/?csrfmiddlewaretoken=2sDInVi2IdVFBn8ASLPOOokIsqmsIZ5R", 1], "isController": false}, {"data": ["Login", 140, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["RunPractice", 939, 8, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in path at index 44: http:\\\/\\\/10.129.131.6:9769\\\/evaluate\\\/practice\\\/${SUBMISSION_ID}", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 10.129.131.6:9769 failed to respond", 2, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
