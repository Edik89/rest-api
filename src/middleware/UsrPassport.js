import jwt from 'jwt-simple';
import passport from "koa-passport";
import User from '../data/models/user';
import config from '../config';
import uploadImage from './cloudinaryAPI';
import { updateAvatar } from './updateAvatar';

export const login = async(ctx, next) => {

    let name = ctx.request.body.name;
    let pass = ctx.request.body.password;


    let usr = await User.findOne({
        name: name
    });
    if (!usr) {
        ctx.body = {
            message: "Authentication failed, User not Found."
        };
    } else {
        if (usr.checkPassword(pass)) {
            let token = jwt.encode(usr.name, config.get("secret"));
            ctx.body = {
                token: 'JWT ' + token,
                message: "Authentication Succces."
            };
        } else {
            ctx.body = {
                message: "Authentication failed, Wrong password."
            };
        }
    }

};

export const logout = async (ctx, next) => {
    ctx.logout;
    ctx.redirect('/');

};

export const register = async(ctx, next) => {

    const req_body = ctx.request.body.fields;

    let { name, password } = req_body;

    if (!name || !password) {

        ctx.body = {
            message: "Please passs name or password"
        };

    } else {

        let token = jwt.encode(name, config.get("secret"));

        const img_url = ctx.request.body.files;

        let img = (img_url.avatar) ? await uploadImage(name, img_url.avatar.path) : {url:"Avatar not uploaded"};

        let user = new User({...req_body,
            avatar: img.url
        });

        let result = await user.save();

        ctx.body = {
            token: 'JWT ' + token,
            message: "Successful created: " + result.name
        };

    }

};

export const getUsers = async(ctx, next) => {
    let usr = await User.find({});
    ctx.body = usr;
};

/*export const getUser = async(ctx, next) => {

    const token = getToken(ctx.request.headers);

    if (token) {

        let decodedName = jwt.decode(token, config.get("secret"));

        const usr = await User.findOne({
            name: decodedName
        });

        if (usr.name) {

            const res = await User.findById(ctx.params.id);
            ctx.body = {
                "message": "Welcome! " + usr.name
            };

        } else {

            ctx.body = {
                message: "Token not provided."
            };
        }

    } else {
        ctx.body = {
            message: "Token Not Found"
        };
    }

};*/

export const updateImage = async (ctx, next) => {

    await updateAvatar(ctx, next);
};

export default passport;
