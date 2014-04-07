var Duplex = require('readable-stream').Duplex,
    inherits = require('util').inherits;

function DataStream() {
    Duplex.call(this);
    this._finished = false;
    this._size = 0;
    this._buffer = new Buffer(0);
}
inherits(DataStream, Duplex);

DataStream.prototype._write = function (chunk, encoding, callback) {
    this._buffer = Buffer.concat([this._buffer, new Buffer(chunk, encoding)]);
    this._push();
    callback();
};

DataStream.prototype._push = function () {
    // ALL written & flushed
    if (this._finished && this._buffer.length === 0) {
        this.push(null);
        return;
    }

    // Nothing to read
    if (!this._size || !this._buffer.length) {
        return;
    }

    var chunk = this._buffer.slice(0, this._size);
    this._size -= chunk.length;

    this._buffer = this._buffer.slice(chunk.length);
    this.push(chunk);
};

DataStream.prototype._read = function (size) {
    this._size += size;
    this._push();
};

DataStream.prototype.end = function () {
    this._finished = true;
    this._push();
    Duplex.prototype.end.apply(this, arguments);
};

module.exports = DataStream;
