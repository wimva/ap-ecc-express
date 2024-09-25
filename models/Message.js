import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: { type: String,  required: true },
  sender: { type: String,  default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
