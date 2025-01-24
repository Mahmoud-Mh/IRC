import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Nickname can only contain letters, numbers, and underscores.',
  })
  nickname: string;
}

export class UpdateNicknameDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Nickname can only contain letters, numbers, and underscores.',
  })
  newNickname: string;
}

export class AddChannelDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Channel name can only contain letters, numbers, and underscores.',
  })
  channel: string;
}