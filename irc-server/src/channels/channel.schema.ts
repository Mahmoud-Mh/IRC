import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Channel extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: [] })
  users: string[]; // List of users in the channel
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
