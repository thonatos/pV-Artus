import { addTag, Injectable, ScopeEnum } from '@artus/core';

export const ROUTER_METADATA = Symbol.for('ROUTE_METADATA');
export const MIDDLEWARE_METADATA = Symbol.for('MIDDLEWARE_METADATA');

export const WEB_CONTROLLER_TAG = 'WEB_CONTROLLER_TAG';
export const CONTROLLER_METADATA = Symbol.for('CONTROLLER_METADATA');

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
}

export function HTTPController(prefix?: string) {
  return (target: any) => {
    const controllerMetadata = {
      prefix,
    };

    Reflect.defineMetadata(CONTROLLER_METADATA, controllerMetadata, target);
    addTag(WEB_CONTROLLER_TAG, target);
    Injectable({ scope: ScopeEnum.EXECUTION })(target);
  };
}

function buildMethod(method: HTTPMethod, path: string) {
  return (
    _target: object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    const routeMetadataList =
      Reflect.getMetadata(ROUTER_METADATA, descriptor.value) ?? [];

    routeMetadataList.push({
      path,
      method: method,
    });

    Reflect.defineMetadata(
      ROUTER_METADATA,
      routeMetadataList,
      descriptor.value
    );

    return descriptor;
  };
}

export const GET = (path: string) => {
  return buildMethod(HTTPMethod.GET, path);
};

export const POST = (path: string) => {
  return buildMethod(HTTPMethod.POST, path);
};
