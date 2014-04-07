var Duplex = require('readable-stream').Duplex,
    inherits = require('util').inherits;

function DataStream() {
    Duplex.call(this);
    this._finished = false;
    this._receiverCapacity = 0;
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

    // Nothing to read or ca not write
    if (!this._receiverCapacity || !this._buffer.length) {
        return;
    }

    var chunkSize = this._receiverCapacity > this._buffer.length ? this._buffer.length : this._receiverCapacity;
    var chunk = this._buffer.slice(0, chunkSize);
    this._receiverCapacity -= chunk.length;

    this._buffer = this._buffer.slice(chunk.length);
    this.push(chunk);
};

DataStream.prototype._read = function (size) {
    this._receiverCapacity += size;
    this._push();
};

DataStream.prototype.end = function () {
    Duplex.prototype.end.apply(this, arguments);
    this._finished = true;
    this._push();
};

module.exports = DataStream;
