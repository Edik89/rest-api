import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from "koa-passport";
import User from '../data/models/user';
import config from '../config';

export const JwtStr = function(passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.get("secret");
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id:jwt_payload.id}, function(err, res) {
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

export default passport;
