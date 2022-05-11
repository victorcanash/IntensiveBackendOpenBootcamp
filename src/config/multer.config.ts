export const katasMulterConfig = {
    allowedMimes: [
        'image/jpeg', 
        'image/jpg', 
        'image/png',
        'video/mp4',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        'application/x-rar-compressed', // rar
        'application/zip', 'application/octet-stream', 'application/x-zip-compressed', 'multipart/x-zip', // zip
        'application/octet-stream' // rar and zip
    ],
    fileLimits: {
        fileSize: 209715200, // bytes(B)
        files: 3
    },
    fieldName: 'files',
    destination: 'tmp/',
    preservePath: false
};
