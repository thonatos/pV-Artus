import Router from 'find-my-way';
import path from 'path';
import http from 'http';
import {
  Inject,
  ArtusInjectEnum,
  ArtusApplication,
  ApplicationLifecycle,
  Container,
  Logger,
  LifecycleHook,
  LifecycleHookUnit,
} from '@artus/core';
import {
  CONTROLLER_METADATA,
  ROUTER_METADATA,
  WEB_CONTROLLER_TAG,
} from './decorator';

import HttpTrigger from './trigger';
import { Input } from '@artus/pipeline';

@LifecycleHookUnit()
export default class ApplicationHttpLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  private readonly app: ArtusApplication;

  @Inject()
  private readonly container: Container;

  @Inject()
  private logger!: Logger;

  @Inject()
  trigger: HttpTrigger;

  private router = Router({
    ignoreTrailingSlash: true,
    onBadUrl: (path, req, res) => {
      res.statusCode = 400;
      res.end(`Bad path: ${path} with ${req.method}`);
    },
  });

  @LifecycleHook()
  async didLoad() {
    const middlewares = this.app.config.middlewares;
    this.trigger.use(middlewares);
  }

  @LifecycleHook()
  public async willReady() {
    const controllerClazzList =
      this.container.getInjectableByTag(WEB_CONTROLLER_TAG);

    for (const controllerClazz of controllerClazzList) {
      const controllerMetadata = Reflect.getMetadata(
        CONTROLLER_METADATA,
        controllerClazz
      );

      const controller = this.container.get(controllerClazz) as any;

      const handlerDescriptorList = Object.getOwnPropertyDescriptors(
        controllerClazz.prototype
      );

      for (const key of Object.keys(handlerDescriptorList)) {
        const handlerDescriptor = handlerDescriptorList[key];

        const routeMetadataList =
          Reflect.getMetadata(ROUTER_METADATA, handlerDescriptor.value) ?? [];
        if (routeMetadataList.length === 0) continue;

        this.registerRoute(
          controllerMetadata,
          routeMetadataList,
          controller[key].bind(controller)
        );
      }
    }

    const server = http.createServer((req, res) => {
      this.router.lookup(req, res);
    });
    const port = this.app.config.port || 7001;

    server.listen(port, () => {
      this.logger.info(`Server listening on: http://localhost:${port}`);
    });
  }

  private registerRoute(controllerMetadata, routeMetadataList, handler) {
    for (const routeMetadata of routeMetadataList) {
      const routePath = path.normalize(
        controllerMetadata.prefix ?? '/' + routeMetadata.path
      );
      this.router.on(routeMetadata.method, routePath, async (req, res) => {
        const input = new Input();
        input.params.req = req;
        input.params.res = res;

        const ctx = await this.trigger.initContext(input);
        await this.trigger.startPipeline(ctx);

        await handler(req, res, ctx.output.data);
      });
    }
  }
}
