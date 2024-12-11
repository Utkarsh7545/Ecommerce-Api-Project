import { Injectable } from '@nestjs/common';
import { createSigner, createVerifier, createDecoder } from 'fast-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly jwtSigner;
  private readonly jwtVerifier;
  private readonly jwtDecoder;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET');

    this.jwtSigner = createSigner({ key: secret });
    this.jwtVerifier = createVerifier({ key: secret });
    this.jwtDecoder = createDecoder();
  }

  createToken(payload: object): string {
    console.log('payload :', payload);
    return this.jwtSigner(payload);
  }

  verifyToken(token: string): object {
    return this.jwtVerifier(token);
  }

  decodeToken(token: string): object {
    return this.jwtDecoder(token);
  }
}
