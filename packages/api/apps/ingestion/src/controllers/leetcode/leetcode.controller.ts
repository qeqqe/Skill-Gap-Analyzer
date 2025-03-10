import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, UserPayload } from '@app/common';
import { LeetcodeService } from '../../services/leetcode/leetcode.service';

interface RequestWithUser extends Request {
  user: UserPayload;
}

@Controller('leetcode')
export class LeetcodeController {
  constructor(private readonly leetcodeService: LeetcodeService) {}

  @Get()
  getAll() {
    return { message: 'LeetCode base path works!' };
  }

  @Get('test')
  test() {
    return { message: 'LeetCode test path works!' };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  async getByUsername(
    @Param('username') username: string,
    @Req() req: RequestWithUser,
  ) {
    return this.leetcodeService.fetchData(username, req.user);
  }
}
