import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { OAuthService } from './oauth.service';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('facebook/start')
  startFacebookAuth(@Query('userId') userId: string) {
    return this.oauthService.startFacebookAuth(userId);
  }

  @Post('facebook/complete')
  completeFacebookAuth(@Body() body: { code: string; state: string }) {
    return this.oauthService.completeFacebookAuth(body.code, body.state);
  }

  // Repeat for Instagram, TikTok, YouTube
  @Get('instagram/start')
  startInstagramAuth(@Query('userId') userId: string) {
    return this.oauthService.startInstagramAuth(userId);
  }

  @Post('instagram/complete')
  completeInstagramAuth(@Body() body: { code: string; state: string }) {
    return this.oauthService.completeInstagramAuth(body.code, body.state);
  }

  @Get('tiktok/start')
  startTikTokAuth(@Query('userId') userId: string) {
    return this.oauthService.startTikTokAuth(userId);
  }

  @Post('tiktok/complete')
  completeTikTokAuth(@Body() body: { code: string; state: string }) {
    return this.oauthService.completeTikTokAuth(body.code, body.state);
  }

  @Get('youtube/start')
  startYouTubeAuth(@Query('userId') userId: string) {
    return this.oauthService.startYouTubeAuth(userId);
  }

  @Post('youtube/complete')
  completeYouTubeAuth(@Body() body: { code: string; state: string }) {
    return this.oauthService.completeYouTubeAuth(body.code, body.state);
  }
}
