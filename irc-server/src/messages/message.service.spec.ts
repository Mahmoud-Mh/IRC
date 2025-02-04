// src/messages/message.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';

const mockMessage = {
  sender: 'TestUser',
  content: 'Hello world!',
  timestamp: new Date(),
  channel: 'channelId',
  localId: 'local123',
};

function MockMessageModel(data: any) {
  Object.assign(this, data);
}
MockMessageModel.prototype.save = jest.fn().mockResolvedValue(mockMessage);

(MockMessageModel as any).create = jest.fn().mockResolvedValue(mockMessage);
(MockMessageModel as any).find = jest.fn().mockReturnValue({
  sort: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockMessage]),
  }),
});

describe('MessageService', () => {
  let service: MessageService;
  let model: Model<Message>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: MockMessageModel,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    model = module.get<Model<Message>>(getModelToken(Message.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a message with localId', async () => {
    const message = await service.createMessage('TestUser', 'channelId', 'Hello world!', 'local123');
    expect(message).toEqual(mockMessage);
    expect(model.create).toHaveBeenCalledWith({
      sender: 'TestUser',
      channel: 'channelId',
      content: 'Hello world!',
      timestamp: expect.any(Date),
      localId: 'local123',
    });
  });

  it('should create a private message', async () => {
    const privateMessage = await service.createPrivateMessage('UserA', 'UserB', 'Private hello');
    expect(privateMessage).toEqual(mockMessage);
    expect(model.create).toHaveBeenCalledWith({
      sender: 'UserA',
      recipient: 'UserB',
      content: 'Private hello',
      timestamp: expect.any(Date),
    });
  });

  it('should get messages by channel', async () => {
    const messages = await service.getMessagesByChannel('channelId');
    expect(messages).toEqual([mockMessage]);
    expect(model.find).toHaveBeenCalledWith({ channel: 'channelId' });
  });
});
