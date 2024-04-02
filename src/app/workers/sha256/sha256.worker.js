var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var MerkleTree = require('merkletreejs').MerkleTree;
console.log('Sha256Worker');

function concatArrayBuffers(bufs) {
    var offset = 0;
    var bytes = 0;
    var bufs2 = bufs.map(function (buf, total) {
        bytes += buf.byteLength;
        return buf;
    });
    var buffer = new ArrayBuffer(bytes);
    var store = new Uint8Array(buffer);
    bufs2.forEach(function (buf) {
        store.set(new Uint8Array(buf.buffer || buf, buf.byteOffset), offset);
        offset += buf.byteLength;
    });
    return buffer
}

function bytesToHexString(bytes) {
    if (!bytes){return null;}
    bytes = new Uint8Array(bytes);
    var hexBytes = [];
    for (var i = 0; i < bytes.length; ++i) {
        var byteString = bytes[i].toString(16);
        if (byteString.length < 2)
            byteString = "0" + byteString;
        hexBytes.push(byteString);
    }
    return hexBytes.join("");
}

function loadNext(file, currentChunk, chunkSize, fileReader, blobSlice) {
    var start = currentChunk * chunkSize,
        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
}

function arrayBufferToWordArray(ab) {
    var i8a = new Uint8Array(ab);
    return CryptoJS.lib.WordArray.create(i8a, i8a.length);
}

function handle(data/*UploadWorkerModelParams*/) {
    var reader = new FileReader();
    var file = data.file;
    var size = file.size;
    var chunk_size = data.chunkingData.chunk_size; // chunk for upload
    var total_chunks = data.chunkingData.chunk_total;
    var chunk_size_for_hash = data.chunkingData.chunk_size_for_hash; // chunk for hash
    var uploadId = data.chunkingData.uploadId;
    var chunk_id = data.chunkingData.chunk_id;
    var offset = chunk_id*chunk_size;
    var hashes_chunk = [];
    //var chunkCollector = [];
    reader.onloadend = (e) => {
        if (reader.readyState === FileReader.DONE) {
            var chunk = reader.result;
            var new_offset_hash = offset + chunk_size_for_hash;
            var percent = (new_offset_hash/size)*100;
            var do_upload = false;
            var upload_offset_from;
            var upload_offset_to;
            if (chunk.byteLength) {
                var hash = SHA256(arrayBufferToWordArray(chunk)).toString();
                hashes_chunk.push(hash); // for every {chunkSize};
                //chunkCollector.push(chunk);
                // every chunk by chunkingUploadSize
                if ((size <= chunk_size && new_offset_hash >= size) || new_offset_hash%chunk_size === 0 || new_offset_hash >= size) { //
                    do_upload = true;
                    upload_offset_from = chunk_id*chunk_size;
                    upload_offset_to = upload_offset_from + chunk_size;
                    var tree = new MerkleTree(hashes_chunk, SHA256);
                    var root = tree.getRoot().toString('hex');
                }

                // var superChunk = concatArrayBuffers(chunkCollector);
                // var superChunk = chunkCollector.each
                var res = {
                    for: 'chunk',
                    // hashes_all: hashes,
                    root: root,
                    percent: percent,
                    // chunk: superChunk,
                    chunk_id: chunk_id,
                    chunk_total: total_chunks,
                    uploadId: uploadId,
                    upload_offset_from: upload_offset_from,
                    upload_offset_to: upload_offset_to,
                    size: size,
                    do_upload: do_upload,
                };

                self.postMessage(res/* as UploadWorkerModelParams*/);
                if (do_upload === true) {
                    // debugger;
                    hashes_chunk = [];
                    //chunkCollector = [];
                    chunk_id = chunk_id + 1;
                    data.chunkingData.chunk_id = chunk_id;
                    // globalChunkId = globalChunkId+1;
                }


                if (offset < size) {
                    offset += chunk_size_for_hash;
                    var blob = file.slice(offset, offset + chunk_size_for_hash);
                    reader.readAsArrayBuffer(blob);
                }
                // }, 500)
            } else {
                self.postMessage({
                    for: 'file',
                    chunk_id: chunk_id,
                    total_chunks: total_chunks,
                    // offset: new_offset,
                    // hashes_all: hashes,
                    uploadId: uploadId
                });
            }


        }
    };

    reader.onerror = function (e) {
        console.warn('oops, something went wrong.', e);
    };
    var blob = file.slice(offset, offset + chunk_size_for_hash);
    reader.readAsArrayBuffer(blob);
}

addEventListener("message", (d) => {
    "use strict";
    handle(d.data/* as UploadWorkerModelParams*/);
});






























