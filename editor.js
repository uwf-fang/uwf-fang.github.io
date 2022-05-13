function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function copyToClipboard() {
    var el = document.getElementById("text");
    var text = el.value;
    var wrapped = text;
    const btn = document.getElementById('html-check');
    if (btn.checked)
        wrapped = '<pre>' + escapeHtml(text) + '</pre>';
    navigator.clipboard.writeText(wrapped);
    el.value = 'Copied!';
    setTimeout(function () {
        el.value = text;
    }, 500);
}

function clearContent() {
    var el = document.getElementById("text");
    el.value = "";
}

function textAreaKeyHandler(e) {
    if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        // set textarea value to: text before caret + tab + text after caret
        var selectedText = '';
        var indentedText = '  ';
        var lines;
        // add indentation to each selected lines
        selectedText = this.value.substring(start, end + 1);
        lines = selectedText.split('\n');
        indentedText = lines.map(x => '  ' + x).join('\n');
        this.value = this.value.substring(0, start) +
            indentedText + this.value.substring(end);
        // put caret at right position again
        this.selectionStart =
            this.selectionEnd = start + 2;
    }
}

document.getElementById('copy').addEventListener('click', copyToClipboard);
document.getElementById('clear').addEventListener('click', clearContent);
document.getElementById('text').addEventListener('keydown', textAreaKeyHandler);
