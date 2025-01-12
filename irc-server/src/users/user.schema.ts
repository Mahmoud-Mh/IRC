import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  nickname: string; // Nickname of the user

  @Prop({ default: [] })
  channels: string[]; // List of channels the user has joined
}

export const UserSchema = SchemaFactory.createForClass(User);
