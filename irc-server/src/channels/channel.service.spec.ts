import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from './channel.service';
import { getModelToken } from '@nestjs/mongoose';
import { Channel } from './channel.schema';
import { Model } from 'mongoose';

const mockChannel = { name: 'test-channel', users: [] };

function MockChannelModel(data: any) {
  Object.assign(this, data);
}
MockChannelModel.prototype.save = jest.fn().mockResolvedValue(mockChannel);

(MockChannelModel as any).find = jest.fn().mockImplementation((query: any) => {
  return {
    exec: () => Promise.resolve([mockChannel]),
  };
});
(MockChannelModel as any).create = jest.fn().mockResolvedValue(mockChannel);
(MockChannelModel as any).deleteOne = jest.fn().mockImplementation((query: any) => {
  return {
    exec: () => Promise.resolve({ deletedCount: 1 }),
  };
});
(MockChannelModel as any).findOneAndUpdate = jest.fn().mockImplementation((query: any, update: any, options: any) => {
  return {
    exec: () => Promise.resolve(mockChannel),
  };
});

describe('ChannelService', () => {
  let service: ChannelService;
  let model: Model<Channel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: getModelToken(Channel.name),
          useValue: MockChannelModel, 
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    model = module.get<Model<Channel>>(getModelToken(Channel.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a channel', async () => {
    const channel = await service.createChannel('test-channel');
    expect(channel).toEqual(mockChannel);
    const instance = new model({ name: 'test-channel' });
    expect(instance.save).toBeDefined();
  });

  it('should return channels', async () => {
    const channels = await service.getChannels();
    expect(channels).toEqual([mockChannel]);
    expect((model as any).find).toHaveBeenCalled();
  });

  it('should delete a channel', async () => {
    await service.deleteChannel('test-channel');
    expect((model as any).deleteOne).toHaveBeenCalledWith({ name: 'test-channel' });
  });

  it('should rename a channel', async () => {
    const newChannel = await service.renameChannel('test-channel', 'new-name');
    expect(newChannel).toEqual(mockChannel);
    expect((model as any).findOneAndUpdate).toHaveBeenCalledWith(
      { name: 'test-channel' },
      { $set: { name: 'new-name' } },
      { new: true },
    );
  });
});
