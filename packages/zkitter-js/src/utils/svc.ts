// import logger from './logger';
import EventEmitter2, { ConstructorOptions } from "eventemitter2";

let callerId = 0;
let getterId = 0;

export class GenericService extends EventEmitter2 {
  name: string;
  main?: MainService;

  constructor(props: ConstructorOptions) {
    super({
      wildcard: true,
      ...props,
    });
    this.name = "";
  }

  get(name: string, propName: string) {
    const id = getterId++;
    if (this.main) {
      const service: any = this.main.services[name];
      const prop = service[propName];

      if (prop) return prop;

      console.error(`${name}.${prop} does not exist`, {
        id: id,
        origin: this.name,
      });

      throw new Error(`${name}.${prop} does not exist`);
    }

    console.error("main service not found", {
      id: id,
      origin: this.name,
    });

    throw new Error("Main service not found");
  }

  async call(name: string, methodName: string, ...args: any[]) {
    const id = callerId++;

    if (this.main) {
      const service: any = this.main.services[name];
      const method = service[methodName];
      if (typeof method === "function") {
        try {
          return method.apply(service, args);
        } catch (e: any) {
          console.error(e.message, {
            id: id,
            method: `${name}.${methodName}`,
            origin: this.name,
          });
          return Promise.reject(e);
        }
      } else {
        console.error(`${name}.${methodName} is not a function`, {
          id: id,
          origin: this.name,
        });
        return Promise.reject(
          new Error(`${name}.${methodName} is not a function`)
        );
      }
    }

    console.error("main service not found", {
      id: id,
      origin: this.name,
    });

    return Promise.reject(new Error("Main service not found"));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async start(): Promise<any> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async stop(): Promise<any> {}
}

export class MainService extends GenericService {
  services: {
    [name: string]: GenericService;
  };

  constructor(props: ConstructorOptions) {
    super(props);
    this.services = {};
    this.main = this;
  }

  add(name: string, service: GenericService): MainService {
    service.name = name;
    this.services[name] = service;
    service.main = this;
    return this;
  }

  async start() {
    for (const name in this.services) {
      try {
        await this.services[name].start();
      } catch (e: any) {
        console.error(e.message, {
          service: name,
        });
        return Promise.reject(e);
      }
    }
  }
}
