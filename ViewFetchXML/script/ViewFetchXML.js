/* http://phuocle.net */
function onViewFetchXMLClick() {
    var webresourceurl = "/WebResources/pl_html/ViewFetchXML.html";
    var dialogwindow = new Mscrm.CrmDialog(Mscrm.CrmUri.create(webresourceurl), window, 800, 596);
    dialogwindow.setCallbackReference(function (result) {
    });
    if (localStorage) {
        var advFind = _mainWindow.$find("advFind");
        var fetchXml = advFind.get_fetchXml();
        fetchXml = fetchXml.replace(/&#37;/g, "%");
        localStorage.setItem('CurrentFetchXml', fetchXml);
    }
    dialogwindow.show();
}

function onViewFetchXMLLoad() {
    var editor = CodeMirror.fromTextArea(document.getElementById("fetchXml"), {
        mode: "xml",
        height: "400px",
        lineNumbers: false,
        readOnly: true
    });
    var fetchXml = localStorage.getItem("CurrentFetchXml");
    if (fetchXml.length == 0) return;
    fetchXml = fetchXml.replace(/"/g, "'");
    var fetch = vkbeautify.xml(fetchXml, 2);
    localStorage.setItem("fetch", fetch);
    editor.setValue(fetch);
}

function onViewFetchXMLJsLoad() {
    var editor = CodeMirror.fromTextArea(document.getElementById("fetchXmlJs"), {
        mode: "javascript",
        height: "400px",
        lineNumbers: false,
        readOnly: true
    });
    var fetchXml = localStorage.getItem("CurrentFetchXml");
    if (fetchXml.length == 0) return "ERROR";
    fetchXml = fetchXml.replace(/"/g, "'");
    var lines = vkbeautify.xml(fetchXml, 2).split('\n');
    var fetch = "";
    var data = [];
    var name = "";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var space = line.substring(0, line.indexOf("<"));
        if (line.trim().startsWith("<condition")) {
            var pattern = /('(.*?)' |'(.*?)'\/>)/g;
            var arr = line.match(new RegExp(pattern));
            name = arr[0].substring(1, arr[0].length - 2);
            if (arr.length === 3 || arr.length === 5) {
                var operator = arr[1].substring(1, arr[1].length - 2);
                var value = arr[arr.length - 1].substring(1, arr[arr.length - 1].length - 3);
                var fetchData = getFetchData(data, name, value);
                codeValue = "fetchData." + fetchData.name;
                data.push({ name: fetchData.name, value: fetchData.value });
                fetch += '"' + space + "<condition attribute='" + name + "' operator='" + operator + "' value='" + '", ' + codeValue + ', "' + "'" + '/>",\n';
            }
            else
                fetch += '"' + line + '",\n';
        }
        else if (line.trim().startsWith("<value")) {
            var pattern = />.*</g;
            var arr = line.match(new RegExp(pattern));
            if (arr.length === 1) {
                var value = arr[0].substring(1, arr[0].length - 1);
                var fetchData = getFetchData(data, name, value);
                codeValue = "fetchData." + fetchData.name;
                data.push({ name: fetchData.name, value: fetchData.value });
                fetch += '"' + space + '<value>", ' + codeValue + ',"</value>",\n';
            }
            else
                fetch += '"' + line + '",\n';
        }
        else
            fetch += '"' + line + '",\n';
    }
    var copied = "\tvar fetchXml = [\r\n";
    copied += fetch.substring(0, fetch.length - 1);
    copied += "\r\n";
    copied += '\t].join("");';
    var declare = "";
    if (data.length > 0) {
        declare = "\tvar fetchData = {\r\n";
        for (var i = 0; i < data.length; i++) {
            declare += "\t\t" + data[i].name + ": " + '"' + data[i].value + '",\r\n'
        }
        declare = declare.substring(0, declare.length - ",\r\n".length);
        declare += "\n";
        declare += "\t};\r\n";
    }
    var js = declare + copied;
    localStorage.setItem("js", js);
    editor.setValue(js);
}

function onViewFetchXMLCSharpLoad() {
    var editor = CodeMirror.fromTextArea(document.getElementById("fetchXmlCsharp"), {
        mode: "clike",
        height: "400px",
        lineNumbers: false,
        readOnly: true
    });
    var fetchXml = localStorage.getItem("CurrentFetchXml");
    if (fetchXml.length == 0) return "ERROR";
    fetchXml = fetchXml.replace(/"/g, "'");
    var lines = vkbeautify.xml(fetchXml, 2).split('\n');
    var fetch = "";
    var data = [];
    var name = "";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var space = line.substring(0, line.indexOf("<"));
        if (line.trim().startsWith("<condition")) {
            var pattern = /('(.*?)' |'(.*?)'\/>)/g;
            var arr = line.match(new RegExp(pattern));
            name = arr[0].substring(1, arr[0].length - 2);
            if (arr.length === 3 || arr.length === 5) {
                var operator = arr[1].substring(1, arr[1].length - 2);
                var value = arr[arr.length - 1].substring(1, arr[arr.length - 1].length - 3);
                var fetchData = getFetchData(data, name, value);
                codeValue = "fetchData." + fetchData.name;
                data.push({ name: fetchData.name, value: fetchData.value });
                fetch += space + "<condition attribute='" + name + "' operator='" + operator + "' value='{" + codeValue + "}'/>\n";
            }
            else
                fetch += line + '\n';
        }
        else if (line.trim().startsWith("<value")) {
            var pattern = />.*</g;
            var arr = line.match(new RegExp(pattern));
            if (arr.length === 1) {
                var value = arr[0].substring(1, arr[0].length - 1);
                var fetchData = getFetchData(data, name, value);
                codeValue = "fetchData." + fetchData.name;
                data.push({ name: fetchData.name, value: fetchData.value });
                fetch += space + '<value>{' + codeValue + '}</value>,\n';
            }
            else
                fetch += line + '\n';
        }
        else
            fetch += line + '\n';
    }
    var copied = '\tvar fetchXml = $@"\r\n';
    copied += fetch.substring(0, fetch.length - 1);
    copied += "\r\n";
    copied += '";';
    var declare = ""
    if (data.length > 0) {
        declare = "\tvar fetchData = new {\r\n";
        for (var i = 0; i < data.length; i++) {
            declare += "\t\t" + data[i].name + " = " + '"' + data[i].value + '",\r\n'
        }
        declare = declare.substring(0, declare.length - ",\r\n".length);
        declare += "\n";
        declare += "\t};\r\n";
    }
    var csharp = declare + copied;
    localStorage.setItem("csharp", csharp);
    editor.setValue(csharp);
}

function initClipboard_FetchXML() {
    var clipboard = new Clipboard('.copyFetchXML', {
        text: function () {
            var fetchXml = localStorage.getItem("fetch");
            return fetchXml;
        }
    });
    clipboard.on('success', function (e) {
        alert("FetchXml copied");
    });
}

function initClipboard_Js() {
    var clipboard = new Clipboard('.copyJavascript', {
        text: function () {
            var fetchXml = localStorage.getItem("js");
            return fetchXml;
        }
    });
    clipboard.on('success', function (e) {
        alert("Javascript copied");
    });
}

function initClipboard_CSharp() {
    var clipboard = new Clipboard('.copyCSharp', {
        text: function () {
            var fetchXml = localStorage.getItem("csharp");
            return fetchXml;
        }
    });
    clipboard.on('success', function (e) {
        alert("CSharp copied");
    });
}

function foundFetchData(data, name) {
    for (var i = 0; i < data.length; i++)
        if (data[i].name == name) return true;
    return false;
}

function getFetchData(data, name, value) {
    var fetchData = { name: name, value: value };
    var index = 1;
    var checkName = name;
    while (foundFetchData(data, checkName)) {
        index = index + 1;
        checkName = name + index;
    }
    fetchData.name = checkName;
    return fetchData;
}

function openTab(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        document.getElementsByClassName("copy" + tabcontent[i].id)[0].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    document.getElementsByClassName("copy" + name)[0].style.display = "block";
    evt.currentTarget.className += " active";
}