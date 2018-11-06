// Getリクエストの受け取り口、起動時はここが呼ばれる模様
function doGet(request) {
    return HtmlService.createTemplateFromFile('index').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}

function apiGetMessage(params) {
    return params["key"] + ":" + params["value"];
}
