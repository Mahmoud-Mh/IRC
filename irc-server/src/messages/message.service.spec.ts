import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';

describe('MessageService', () => {
    let service: MessageService;
    let messageModel: Model<Message>;

    const mockMessageModel = {
        create: jest.fn(),
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageService,
                {
                    provide: getModelToken(Message.name),
                    useValue: mockMessageModel,
                },
            ],
        }).compile();

        service = module.get<MessageService>(MessageService);
        messageModel = module.get<Model<Message>>(getModelToken(Message.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createMessage', () => {
        it('should create and return a new message', async () => {
            const messageData = {
                sender: 'Alice',
                channelId: '123',
                content: 'Hello World',
            };
            const savedMessage = { ...messageData, id: '1', timestamp: new Date() };
            mockMessageModel.create.mockResolvedValue(savedMessage);

            const result = await service.createMessage(
                messageData.sender,
                messageData.channelId,
                messageData.content,
            );

            expect(result).toEqual(savedMessage);
            expect(mockMessageModel.create).toHaveBeenCalledWith({
                sender: 'Alice',
                channel: '123',
                content: 'Hello World',
                timestamp: expect.any(Date),
            });
        });
    });

    describe('createPrivateMessage', () => {
        it('should create and return a new private message', async () => {
            const messageData = {
                sender: 'Alice',
                recipient: 'Bob',
                content: 'Hey Bob',
            };
            const savedMessage = { ...messageData, id: '2', timestamp: new Date() };
            mockMessageModel.create.mockResolvedValue(savedMessage);

            const result = await service.createPrivateMessage(
                messageData.sender,
                messageData.recipient,
                messageData.content,
            );

            expect(result).toEqual(savedMessage);
            expect(mockMessageModel.create).toHaveBeenCalledWith({
                sender: 'Alice',
                recipient: 'Bob',
                content: 'Hey Bob',
                timestamp: expect.any(Date),
            });
        });
    });

    describe('getMessagesByChannel', () => {
        it('should return messages from a specific channel', async () => {
            const messages = [
                { id: '1', sender: 'Alice', channel: '123', content: 'Hello' },
                { id: '2', sender: 'Bob', channel: '123', content: 'Hi' },
            ];
            mockMessageModel.exec.mockResolvedValue(messages);

            const result = await service.getMessagesByChannel('123');

            expect(result).toEqual(messages);
            expect(mockMessageModel.find).toHaveBeenCalledWith({ channel: '123' });
            expect(mockMessageModel.sort).toHaveBeenCalledWith({ timestamp: 1 });
            expect(mockMessageModel.exec).toHaveBeenCalled();
        });
    });

    describe('getPrivateMessages', () => {
        it('should return private messages between two users', async () => {
            const messages = [
                { id: '3', sender: 'Alice', recipient: 'Bob', content: 'Hey' },
                { id: '4', sender: 'Bob', recipient: 'Alice', content: 'Hello' },
            ];
            mockMessageModel.exec.mockResolvedValue(messages);

            const result = await service.getPrivateMessages('Alice', 'Bob');

            expect(result).toEqual(messages);
            expect(mockMessageModel.find).toHaveBeenCalledWith({
                $or: [
                    { sender: 'Alice', recipient: 'Bob' },
                    { sender: 'Bob', recipient: 'Alice' },
                ],
            });
            expect(mockMessageModel.sort).toHaveBeenCalledWith({ timestamp: 1 });
            expect(mockMessageModel.exec).toHaveBeenCalled();
        });
    });
});
