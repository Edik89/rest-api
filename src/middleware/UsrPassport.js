import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from "koa-passport";
import User from '../data/models/user';
import cloudinary from 'cloudinary';
import config from '../config';
import jwt from 'jwt-simple';
import getToken from './getToken';

export const JwtStr = function(passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.versionOneCompatibility({ tokenBodyField : "MY_CUSTOM_BODY_FIELD" });
  opts.secretOrKey = config.get("secret");
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.find({id:jwt_payload.id}, function(err, res) {
      if(err) {
        return done(err, false);
      }
      if(res) {
        done(null, res);
      } else {
        done(null, false);
      }
    });
  }));
};

export const login = async (ctx, next) => {

  let name = ctx.request.body.name;
  let pass = ctx.request.body.password;

  try {
    let usr = await User.findOne({name: name});
    if(!usr) {
      ctx.body = {message:"Authentication failed, User not Found."};
    } else {
      if (usr.checkPassword(pass)) {
          let token = jwt.encode(usr.name, config.get("secret"));
          ctx.body = {token: 'JWT '+token, message:"Authentication Succces."};
      } else {
        ctx.body = {message:"Authentication failed, Wrong password."};
      }
    }
    await next();
  } catch(err) {
    console.log(err.stack);
    ctx.body = {error: err.message, "message":"Username already axist."};
  }

};

export const logout = async (ctx, next) => {
  ctx.logout();
  await next();
};

export const register = async (ctx, next) => {

  let name = ctx.request.body.name;
  let password = ctx.request.body.password;
  try {
    if(!name || !password) {
      ctx.body = {message:"Please passs name or password"};
    } else {
      let user = new User({...ctx.request.body});
      let result = await user.save();
      if(result.name) {
        ctx.body = {message: "Successful created: "+ result.name};
      }
    }
   } catch(err) {
      ctx.body = {err: err.message};
   }
};

export const getUsers = async (ctx, next) => {
  try {
    let usr = await User.find({});
    ctx.body = usr;
    await next();
  } catch(err) {
    console.log(err.stack);
  }
};

export const uploadImage = (ctx, next) => {
  return passport.authenticate('jwt', {session:false}, async function(err, user, info ) {

  const token = getToken(ctx.request.headers);

   try {
      let decodedName = jwt.decode(token, config.get("secret"));
      const usr = await User.findOne({name: decodedName});
      if(!usr) {
        ctx.body = {message:"Authentication failed, User Not Found."};
      } else {

        cloudinary.config({
          cloud_name: 'dybrhiiqtp',
          api_key: '283625262347148',
          api_secret: 'TQBMlYD7bLy6Z_hiqK3i3pfLtQ8'
        });

        const img = ctx.request.body.avatar;

        let usrImg = await new Promise(
          (resolve, reject) => cloudinary.uploader.upload(img, function(result, err) {
          return resolve(result);
        }, {use_filename: true}));

         await User.findByIdAndUpdate(usr.id, { $set: { avatar:usrImg.url }}, { new: true });

         ctx.body = {message:"Updated avatar"};
      }
    } catch(err) {
      ctx.body = { message: err.message };
      console.log(err.stack);
    }

  })(ctx, next);

};

export default passport;
