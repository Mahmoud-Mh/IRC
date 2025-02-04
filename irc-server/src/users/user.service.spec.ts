import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';

const mockUser = { nickname: 'TestUser', channels: ['channelId'] };

function MockUserModel(data: any) {
  Object.assign(this, data);
}
MockUserModel.prototype.save = jest.fn().mockResolvedValue(mockUser);

(MockUserModel as any).create = jest.fn().mockResolvedValue(mockUser);
(MockUserModel as any).findOneAndUpdate = jest.fn().mockReturnValue({
  exec: jest.fn().mockResolvedValue(mockUser),
});
(MockUserModel as any).findOne = jest.fn().mockReturnValue({
  exec: jest.fn().mockResolvedValue(mockUser),
});
(MockUserModel as any).find = jest.fn().mockResolvedValue([mockUser]);

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.createUser('TestUser');
    expect(user).toEqual(mockUser);
    const instance = new model({ nickname: 'TestUser' });
    expect(instance.save).toBeDefined();
  });

  it('should update user nickname', async () => {
    const updatedUser = await service.updateUserNickname('TestUser', 'NewName');
    expect(updatedUser).toEqual(mockUser);
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { nickname: 'TestUser' },
      { $set: { nickname: 'NewName' } },
      { new: true },
    );
  });

  it('should get user by nickname', async () => {
    const user = await service.getUserByNickname('TestUser');
    expect(user).toEqual(mockUser);
    expect(model.findOne).toHaveBeenCalledWith({ nickname: 'TestUser' });
  });
});
