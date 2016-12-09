import passport from "koa-passport";
import Org from '../data/models/org';
import jwt from 'jwt-simple';
import config from '../config';
import User from '../data/models/user';
import getToken from './getToken';

export const GreateOrganization = async (ctx, next) => {
  return passport.authenticate('jwt', {session:false}, async function(err, user, info ) {

    const token = getToken(ctx.request.headers);

    try {

      let decodedName = jwt.decode(token, config.get("secret"));

      const usr = await User.findOne({name: decodedName});

      let org = new Org({
        name:ctx.request.body.name,
        email:ctx.request.body.email,
        address:ctx.request.body.address
      });

       let res = await org.save();

      ctx.body = { "message": "Successful created: " + res.name};

      await next();

    } catch(err) {

      ctx.body = {error: err.message, message:"Authentication failed"};

    }

  })(ctx, next);

};

export const getOrgs = async (ctx, next) => {
  try {
    let usr = await Org.find({});
    ctx.body = usr;
    await next();
  } catch(err) {
    console.log(err.stack);
  }
};


export const reqToJoinOrganization = async (ctx, next) => {

  const token = getToken(ctx.request.headers);

    try {

      if(token) {

        let decodedName = jwt.decode(token, config.get("secret"));

        const usr = await User.findOne({name: decodedName});

        if(usr.name) {

          const res = await Org.findById(ctx.params.id);

          ctx.body = {"message": "Welcome! "+usr.name+" in the "+res.name};

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
