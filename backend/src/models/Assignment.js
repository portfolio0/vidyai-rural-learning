const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    class: { type: Number, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    points: { type: Number, default: 50 },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        studentName: String,
        submissionText: String,
        fileUrl: String,
        submittedAt: { type: Date, default: Date.now },
        marks: Number,
        feedback: String,
      },
    ],
  },
  { timestamps: true }
);

AssignmentSchema.index({ class: 1, createdAt: -1 });
AssignmentSchema.index({ teacher: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
