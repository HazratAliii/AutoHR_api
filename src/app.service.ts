import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    try {
      return 'Up and running';
    } catch (e) {
      throw new ServiceUnavailableException(e);
    }
  }
}
