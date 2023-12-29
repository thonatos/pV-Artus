import { ArtusInjectEnum, Inject } from '@artus/core';
import { GET, POST, HTTPController } from '../plugin';
import type { HttpRequest, HttpReponse } from '../types';

@HTTPController()
export default class UserController {
  @Inject(ArtusInjectEnum.Config)
  config: Record<string, any>;

  @GET('/')
  async home(_req: HttpRequest, res: HttpReponse, ctx: any) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ctx));
  }

  @GET('/get')
  async getInfo(req: HttpRequest, res: HttpReponse) {
    console.log(req.method);
    res.end(
      JSON.stringify({
        data: 'info',
      })
    );
  }

  @POST('/post')
  async postInfo(req: HttpRequest, res: HttpReponse) {
    console.log(req.method);
    res.end(
      JSON.stringify({
        data: 'info',
      })
    );
  }
}
