import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from "koa-passport";
import jwt from 'jwt-simple';
import fs from 'fs';
import getToken from './getToken';
import User from '../data/models/user';
import config from '../config';
import { uploadImage } from './cloudinaryAPI';

export const JwtStr = function(passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
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
    ctx.body = {error: err.message, "message":"Username already axist."};
  }

};

export const logout = async (ctx, next) => {
  ctx.logout();
  await next();
};

export const register = async (ctx, next) => {

  const img_url = ctx.request.body.files.avatar.path;
  const req_body = ctx.request.body.fields;

  let {name, password} = req_body;

  try {

    if(!name || !password) {

      ctx.body = {message:"Please passs name or password"};

    } else {

      let img = await uploadImage(name, img_url);

      let user = new User({...req_body, avatar:img.url});

      let result = await user.save();

      if(result.name) {
        ctx.body = {message: "Successful created: "+ result.name};
      }
    }
   } catch(err) {
      ctx.body = {err: err.message, messege:"user already exists!"};
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

export const getUser = async (ctx, next) => {

   const token = getToken(ctx.request.headers);

    try {

      if(token) {

        let decodedName = jwt.decode(token, config.get("secret"));

        const usr = await User.findOne({name: decodedName});

        if(usr.name) {

          const res = await User.findById(ctx.params.id);
          ctx.body = {"message": "Welcome! "+usr.name };

        } else {

          ctx.body = {message: "Token not provided."};
        }

      } else {
        ctx.body = {message: "Token Not Found"};
      }
    } catch(err) {
      ctx.body = {err:err.message, message:"Authentication failed, User Not Found"};
    }
};

export const updateImage = (ctx, next) => {
  return passport.authenticate('jwt', {session:false}, async function(err, user, info ) {

   try {

      const token = getToken(ctx.request.headers);

      let decodedName = jwt.decode(token, config.get("secret"));

      const usr = await User.findOne({name: decodedName});

      if(!usr) {
        ctx.body = {message:"Authentication failed, User Not Found."};
      } else {

        let file_write = fs.createWriteStream(config.get("root")+'/pic/'+usr.name+'.jpg');

        ctx.req.pipe(file_write);

        let img = await uploadImage(usr.name, file_write.path);

        await User.findByIdAndUpdate(usr.id, { $set: { avatar:img.url } }, { new: true });

        ctx.body = {message:"Updated avatar"};
      }
    } catch(err) {
      ctx.body = { message: err.message };
    }

  })(ctx, next);

};

export default passport;
