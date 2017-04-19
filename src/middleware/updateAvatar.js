import fs from 'fs';
import jwt from 'jwt-simple';
import passport, { getToken } from "../middleware/passport";
import config from '../config';
import User from '../data/models/user';
import uploadImage from './cloudinaryAPI';

export const updateAvatar = async function(ctx, next) {
    return passport.authenticate('jwt', {
        session: false
    }, async function(err, user, info) {

        if (!user) {
            ctx.body = {
                message: "Authentication failed, User Not Found."
            };
        } else {

            let file_write = fs.createWriteStream(config.get("root") + '/pic/' + user.name + '.jpg');

            ctx.req.pipe(file_write);

            let img = await uploadImage(user.name, file_write.path);

            if(!img.error) {

                await User.findByIdAndUpdate(user.id, {
                    $set: {
                        avatar: img.url
                    }
                }, {
                    new: true
                });

                ctx.body = {
                    message: "Updated avatar"
                };

            } else {

                ctx.body = {
                    message: "Images not Found. Please download the images."
                };
            }
        }

    })(ctx, next);
};
