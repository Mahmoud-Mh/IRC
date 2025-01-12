import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  recipient?: string; // Optional for private messages

  @Prop()
  channel?: string; // Optional for channel messages

  @Prop({ required: true })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
