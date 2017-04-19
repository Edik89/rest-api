import passport from "koa-passport";
import jwt from 'jwt-simple';
import Org from '../data/models/org';
import User from '../data/models/user';
import config from '../config';


export const GreateOrganization = async(ctx, next) => {
    return passport.authenticate('jwt', {
        session: false
    }, async function(err, user, info) {

        if(!user) {

            ctx.body = {
                "message": "Token Not Found"
            };

        } else {

            let org = new Org({
                name: ctx.request.body.name,
                email: ctx.request.body.email,
                address: ctx.request.body.address
            });

            let res = await org.save();

            ctx.body = {
                "message": "Successful created: " + res.name
            };

        }

    })(ctx, next);

};

export const getOrgs = async(ctx, next) => {
    let usr = await Org.find({});
    ctx.body = usr;
};

export const reqToJoinOrganization = async(ctx, next) => {
    return passport.authenticate('jwt', {
        session: false
    }, async function(err, user, info) {

        if (!user) {

            ctx.body = {
                "message": "Token Not Found"
            };

        } else {

            const res = await Org.findById(ctx.params.id);

            ctx.body = {status:ctx.response.status=200, "message": "Welcome! "+user+" in the "+res.name};
        }

    })(ctx, next);

};
