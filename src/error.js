export function doError(message) {
    const panel = getErrorPanel();
    const div = document.createElement('div');
    div.className = 'error';
    div.innerHTML = message;
    panel.appendChild(div);
}

function getErrorPanel() {
    const panel = document.querySelector('#error-panel');
    if (panel) {
        return panel;
    }
    const div = document.createElement('div');
    div.id = 'error-panel';
    div.className = 'error-list';
    document.body.insertBefore(div, document.body.childNodes[0]);
    return div;
}