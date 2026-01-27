import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage extends Document {
  userInput: string
  botResponse: string
  timestamp: Date
  sessionId?: string
  createdAt: Date
}

const MessageSchema: Schema = new Schema({
  userInput: {
    type: String,
    required: true,
  },
  botResponse: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  sessionId: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Prevent re-compilation during development
const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)

export default Message

