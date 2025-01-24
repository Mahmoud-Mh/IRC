import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ default: [] })
  channels: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);