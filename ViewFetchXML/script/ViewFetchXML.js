/* https://phuocle.net */
//@ts-check
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
    if (sessionStorage) {
        var filterFields = _mainWindow.$.find(".ms-crm-AdvFind-FilterField");
        if (filterFields !== null && filterFields !== undefined && filterFields.length > 0) {
            var arr = [];
            for (var i = 0; i < filterFields.length; i++) {
                var field = filterFields[i];
                _mainWindow.$(field).find("optgroup").children().each(function (index, item) {
                    var optionsxml = _mainWindow.$(item).attr("optionsxml");
                    var value = _mainWindow.$(item).attr("value");
                    if (value !== undefined && optionsxml !== undefined) {
                        arr.push({ value: value + (i === 0 ? "" : (i + 1).toString()), optionsxml });
                    }
                });
            }
            sessionStorage.setItem("View-FetchXML-advFindFilterFields", JSON.stringify(arr));
        }
        var clientUrl = Xrm?.Utility?.getGlobalContext()?.getClientUrl();
        if (clientUrl === null) {
            clientUrl = Xrm?.Page?.context?.getClientUrl();
        }
        if (clientUrl !== null) {
            sessionStorage.setItem("View-FetchXML-clientUrl", clientUrl);
        }
        var version = Xrm?.Utility?.getGlobalContext()?.getVersion();
        if (version === null) {
            version = "8.2";
        }
        var versionArray = version.split(".");
        if (versionArray.length >= 2) {
            version = versionArray[0] + "." + versionArray[1];
        }
        else {
            version = "8.2";
        }
        sessionStorage.setItem("View-FetchXML-version", version);
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
                var codeValue = "fetchData." + fetchData.name;
                data.push({ name: fetchData.name, value: fetchData.value });
                fetch += space + "<condition attribute='" + name + "' operator='" + operator + "' value='${" +  codeValue + "}'/>\n";
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
                var codeValue = "fetchData." + fetchData.name;
                data.push({ name: fetchData.name, value: fetchData.value });
                fetch += space + '<value>${' + codeValue + '}</value>\n';
            }
            else
                fetch += line + '\n';
        }
        else
            fetch += line + '\n';
    }
    var copied = "\tvar fetchXml = `\r\n";
    copied += fetch.substring(0, fetch.length - 1);
    copied += "\r\n`;";
    var declare = "";
    if (data.length > 0) {
        declare = "\tvar fetchData = {\r\n";
        for (var i = 0; i < data.length; i++) {
            var comment = getOptionSetComment(data[i].name, data[i].value);
            declare += "\t\t" + data[i].name + ": " + '"' + data[i].value + '"' + (comment.length > 0 ? " /* " + comment + " */": "") +',\r\n'
        }
        declare = declare.substring(0, declare.length - ",\r\n".length);
        declare += "\n";
        declare += "\t};\r\n";
    }
    var js = declare + copied;
    localStorage.setItem("js", js);
    editor.setValue(js);
}

function getOptionSetComment(field, value) {
    try {
        var comment = '';
        var json = sessionStorage.getItem("View-FetchXML-advFindFilterFields");
        if (json === null || json === undefined) return comment;
        var arr = JSON.parse(json);
        for (var i = 0; i < arr.length; i++) {
            if (field === arr[i].value) {
                var optionsxml = arr[i].optionsxml.replaceAll('\"', '"').replaceAll('"', "'");
                optionsxml = optionsxml.substring(optionsxml.indexOf(`<option value='${value}'`));
                optionsxml = optionsxml.substring(`<option value='${value}'`.length + 1);
                return optionsxml.substring(0, optionsxml.indexOf(`</option>`));
            }
        }
        return comment
    }
    catch {
        return '';
    }
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
                var codeValue = "fetchData." + fetchData.name;
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
                var codeValue = "fetchData." + fetchData.name;
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
            var comment = getOptionSetComment(data[i].name, data[i].value);
            declare += "\t\t" + data[i].name + " = " + '"' + data[i].value + '"' + (comment.length > 0 ? " /* " + comment + " */" : "") + ',\r\n'
        }
        declare = declare.substring(0, declare.length - ",\r\n".length);
        declare += "\n";
        declare += "\t};\r\n";
    }
    var csharp = declare + copied;
    localStorage.setItem("csharp", csharp);
    editor.setValue(csharp);
}

function onViewFetchXMLWebApiCsLoad() {
    var editor = CodeMirror.fromTextArea(document.getElementById("fetchXmlWebApiCs"), {
        mode: "javascript",
        height: "400px",
        lineNumbers: false,
        readOnly: true
    });
    editor.setValue('');
}

function onViewFetchXMLWebApiJsLoad(output) {
    var editor = CodeMirror.fromTextArea(document.getElementById("fetchXmlWebApiJs"), {
        mode: "javascript",
        height: "400px",
        lineNumbers: false,
        readOnly: true
    });
    var fetchXml = localStorage.getItem("CurrentFetchXml");
    if (fetchXml.length == 0) return "ERROR";
    fetchXml = fetchXml.replace(/"/g, "'");
    var lines = vkbeautify.xml(fetchXml, 2).split('\n');
    var data = [];
    var name = "";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.trim().startsWith("<condition")) {
            var pattern = /('(.*?)' |'(.*?)'\/>)/g;
            var arr = line.match(new RegExp(pattern));
            name = arr[0].substring(1, arr[0].length - 2);
            if (arr.length === 3 || arr.length === 5) {
                var value = arr[arr.length - 1].substring(1, arr[arr.length - 1].length - 3);
                var fetchData = getFetchData(data, name, value);
                data.push({ name: fetchData.name, value: fetchData.value });
            }
        }
        else if (line.trim().startsWith("<value")) {
            var pattern = />.*</g;
            var arr = line.match(new RegExp(pattern));
            if (arr.length === 1) {
                var value = arr[0].substring(1, arr[0].length - 1);
                var fetchData = getFetchData(data, name, value);
                data.push({ name: fetchData.name, value: fetchData.value });
            }
        }
    }

    var copied = convertFetchXmlToWebApiJs();

    var declare = ""
    if (data.length > 0) {
        declare = "\tvar fetchData = {\r\n";
        for (var i = 0; i < data.length; i++) {
            var comment = getOptionSetComment(data[i].name, data[i].value);
            declare += "\t\t" + data[i].name + ": " + '"' + data[i].value + '"' + (comment.length > 0 ? " /* " + comment + " */" : "") + ',\r\n'
        }
        declare = declare.substring(0, declare.length - ",\r\n".length);
        declare += "\n";
        declare += "\t};\r\n";
    }
    var webApi = declare + copied;
    localStorage.setItem("webapijs", webApi);
    editor.setValue(webApi);
}

function convertFetchXmlToWebApiJs() {
    var options = ``;
    options += '\tvar options = `?\r\n';
    //$select=name,_primarycontactid_value,telephone1,accountid&$expand=parentaccountid($select=accountnumber,name),transactioncurrencyid($select=isocurrencycode)&$filter=(accountid eq 60e1c27f-dd03-ec11-b6e5-000d3aa2e9c5) and (primarycontactid/contactid eq 74e1c27f-dd03-ec11-b6e5-000d3aa2e9c5) and (transactioncurrencyid/transactioncurrencyid eq f89d2c96-c802-ec11-b6e5-000d3aa2eb72)&$orderby=name asc
    var url = webApi.WebApiJs.substring(webApi.WebApiJs.indexOf('?$') + 1);
    var array = url.split('$');
    for (var i = 0; i < array.length; i++) {
        options += "$" + array[i] + "\r\n";
    }

    options += '\r\n`;\r\n';
    return options;
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

function initClipboard_WebApiJs() {
    var clipboard = new Clipboard('.copyWebApiJs', {
        text: function () {
            var fetchXml = localStorage.getItem("webapijs");
            return fetchXml;
        }
    });
    clipboard.on('success', function (e) {
        alert("WebApiJs copied");
    });
}

function initClipboard_WebApiCs() {
    var clipboard = new Clipboard('.copyWebApiCs', {
        text: function () {
            var fetchXml = localStorage.getItem("webapics");
            return fetchXml;
        }
    });
    clipboard.on('success', function (e) {
        alert("WebApiCs copied");
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

var loaded = {
    Js: false,
    Cs: false,
    WebApiJs: false,
    WebApiCs: false
};
var webApi = {
    WebApiJs: '',
    WebApiCs: ''
};

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
    if (name === 'Javascript' && !loaded.Js) {
        onViewFetchXMLJsLoad();
        loaded.Js = true;
    }
    else if (name === 'CSharp' && !loaded.Cs) {
        onViewFetchXMLCSharpLoad();
        loaded.Cs = true;
    }
    else if (name === 'WebApiJs' && !loaded.WebApiJs) {
        loaded.WebApiJs = true;
        if (webApi.WebApiJs === '' && webApi.WebApiCs === '') {
            var Url = `${sessionStorage.getItem("View-FetchXML-clientUrl")}/api/data/v${sessionStorage.getItem("View-FetchXML-version")}`;
            var FetchXml = localStorage.getItem("CurrentFetchXml").replaceAll('\"', "'");
            callAction("ConvertFetchXmlToWebApi", { Url, FetchXml }, function (output) {
                webApi.WebApiJs = output.WebApiJs;
                webApi.WebApiCs = output.WebApiCs;
                onViewFetchXMLWebApiJsLoad();
            });
        }
        else {
            onViewFetchXMLWebApiJsLoad();
        }
    }
    else if (name === 'WebApiCs' && !loaded.WebApiCs) {
        loaded.WebApiCs = true;
        if (webApi.WebApiJs === '' && webApi.WebApiCs === '') {
            var Url = `${sessionStorage.getItem("View-FetchXML-clientUrl")}/api/data/v${sessionStorage.getItem("View-FetchXML-version")}`;
            var FetchXml = localStorage.getItem("CurrentFetchXml").replaceAll('\"', "'");
            callAction("ConvertFetchXmlToWebApi", { Url, FetchXml }, function (output) {
                webApi.WebApiJs = output.WebApiJs;
                webApi.WebApiCs = output.WebApiCs;
                onViewFetchXMLWebApiCsLoad();
            });
        }
        else {
            onViewFetchXMLWebApiCsLoad();
        }
    }
}

function callAction(f, i, callback) {
    var url = `${sessionStorage.getItem("View-FetchXML-clientUrl")}/api/data/v${sessionStorage.getItem("View-FetchXML-version")}/pl_ViewFetchXML`;
    var req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var output = JSON.parse(JSON.parse(this.response).output);
                callback(output);
            }
        }
    };
    req.send(JSON.stringify({ function: f, input: JSON.stringify(i) }));
}