import Koa from 'koa';
import config from '../config';
import Router from 'koa-router';
import koaBody from 'koa-body';
import passport, {
  login,
  logout,
  register,
  updateImage,
  getUsers,
  getUser,
  JwtStr
} from "../middleware/UsrPassport";
import {
  GreateOrganization,
  reqToJoinOrganizations,
  reqToJoinOrganization,
  getOrgs
}
from "../middleware/OrgPassport";

export default async function createServer(port) {

  const app = new Koa(),
  router = new Router();

  JwtStr(passport);

  app
    .use(koaBody({
      multipart: true,
      formLimit: "10000kb",
      formidable: {  keepExtensions: true, uploadDir: config.get("root")+'/pic' }
    }))
    .use(router.routes())
    .use(router.allowedMethods())
    .use(passport.initialize());


  router
    .post('/register', register)
    .get('/users', getUsers)
    .get('/user/:id', getUser)
    .post('/login', login)
    .get('/logout',  logout)
    .put('/updateAvatar', updateImage)
    .post('/greatOrg', GreateOrganization)
    .get('/orgs', getOrgs)
    .get('/org/:id', reqToJoinOrganization);

     app.listen(port);

}
