import { IsString, IsEnum } from 'class-validator';
import { SocialPlatform } from '../../entities/connected-account.entity';

export class ConnectAccountDto {
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @IsString()
  code: string;

  @IsString()
  state: string;
}

