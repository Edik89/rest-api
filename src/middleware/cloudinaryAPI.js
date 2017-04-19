import cloudinary from 'cloudinary';
import config from '../config';
import fs from 'fs';

export default function(name, img_url) {

    return new Promise(function(resolve, reject) {

        cloudinary.config({
            cloud_name: config.get("cloudinary:cloud_name"),
            api_key: config.get("cloudinary:api_key"),
            api_secret: config.get("cloudinary:api_secret")
        });

        let stream = cloudinary.uploader.upload_stream(

            function(result) {

                resolve(result);

            }, {
                public_id: name
            }

        );

        let file_reader = fs.createReadStream(img_url).pipe(stream);

        file_reader.on('error', function(err) {
            reject(err);
        });

    });

}


