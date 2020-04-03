module.exports = function returnable(callback, returnValue) {
    return (...args) => {
        callback(...args);
        return returnValue;
    };
}
