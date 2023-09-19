const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        if (err) {
        const error = new Error("File not delete.");
        error.statusCode = 500;
        throw error;
        }
    })
}

exports.deleteFile = deleteFile;