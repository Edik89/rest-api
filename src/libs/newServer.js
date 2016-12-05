import Koa from 'koa';
import convert from 'koa-convert';
import config from '../config';
import Router from 'koa-router';
import KoaBody from 'koa-bodyparser';
import passport, {
  login,
  logout,
  register,
  uploadImage,
  getUsers,
  getUser,
  JwtStr
} from "../middleware/UsrPassport";
import {
  GreateOrganization,
  reqToJoinOrganizations,
  reqToJoinOrganization
}
from "../middleware/OrgPassport";

export default async function createServer(port) {

  const app = new Koa(),
  router = new Router();

  JwtStr(passport);

  app
    .use(KoaBody())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(passport.initialize());


  router
    .post('/register', register)
    .get('/users', getUsers)
    .post('/login', login)
    .get('/logout',  logout)
    .put('/updateAvatar', uploadImage)
    .post('/greatOrg', GreateOrganization)
    .get('/getOrg/:id', reqToJoinOrganization);

     app.listen(port);

}
