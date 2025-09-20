import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// ✅ Sahi export
export default mongoose.models.Todo || mongoose.model('Todo', TodoSchema);