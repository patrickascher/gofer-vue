import {http} from "./http";

class UploadFilesService {
    upload(url, file, onUploadProgress) {
        let formData = new FormData();
        formData.append("file", file);
        return http.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress
        });
    }

    deleteFile(url, filename) {
        return http.delete(url, {data: {File: filename}});
    }
}

export default new UploadFilesService();
