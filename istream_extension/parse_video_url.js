// JavaScript source code
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        var regex = /watch?/gi, result, indices = [];
        while ((result = regex.exec(message.content))) {
            indices.push(result.index);
        }
        var link_array = [];
        indices.forEach(function (entry) {
            var cur = entry;
            link_array.push(message.content.substr(cur, message.content.indexOf("\">", cur - 1)));
            console.log("link added;")
        })
        console.log(indices);
        console.log(link_array);
        console.log(message.content);
    });

chrome.tabs.onActivated.addListener(function (tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "chrome.runtime.sendMessage({content: document.body.innerHTML}, function(response) { console.log('success'); });"
    }, function () { console.log('done'); });
});