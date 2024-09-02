import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { minioConfig } from './minio.config';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;
  private readonly prisma: PrismaService;
  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });
    this.initializeBucket();
  }
  async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(
        minioConfig.bucketName,
      );
      if (!bucketExists) {
        await this.minioClient.makeBucket(minioConfig.bucketName, '');
        console.log(`Bucket "${minioConfig.bucketName}" created successfully`);
      }
    } catch (error) {
      console.log(`Error initializing "${minioConfig.bucketName}"`);
    }
  }

  async uploadFile(file: Express.Multer.File, id: string) {
    const metaData = {
      'Content-Type': file.mimetype,
    };
    try {
      const fileName = Date.now() + file.originalname;
      await this.minioClient.putObject(
        minioConfig.bucketName,
        fileName,
        file.buffer,
      );
      const filePath = `${minioConfig.bucketName}/${fileName}`;

      return filePath;
    } catch (e) {
      console.log('Error uploading file', e);
    }
  }
}
