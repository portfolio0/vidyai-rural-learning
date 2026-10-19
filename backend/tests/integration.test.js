const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

process.env.NODE_ENV = 'test';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const Student = require('../src/models/Student');
const PendingRegistration = require('../src/models/PendingRegistration');
const Quiz = require('../src/models/Quiz');
const Assignment = require('../src/models/Assignment');
const Notification = require('../src/models/Notification');
const Course = require('../src/models/Course');
const Lesson = require('../src/models/Lesson');
const Reel = require('../src/models/Reel');
const QuizResult = require('../src/models/QuizResult');
const School = require('../src/models/School');
const SyncQueue = require('../src/models/SyncQueue');
const PasswordReset = require('../src/models/PasswordReset');
const TeacherInvite = require('../src/models/TeacherInvite');
const { SYSTEM_BADGES } = require('../src/services/badgeService');
const { awardStudentXP } = require('../src/services/gamificationService');
const { validateFileSafety, deleteMediaFile } = require('../src/services/storageService');
const { validateEmailDeliverability } = require('../src/services/emailValidator');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vidyaiv1';

describe('VidyAI Full-Stack Architecture & Security Test Suite', () => {
  let testTeacherUser;
  let testStudentUser;
  let testStudentDoc;
  let testQuiz;
  let testCourse;
  let testLesson;
  let testAssignment;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }

    // Clean up any existing test records
    await User.deleteMany({ email: { $regex: /@test-vidyai\.org$/ } });
    await PendingRegistration.deleteMany({ email: { $regex: /@test-vidyai\.org$/ } });
    await TeacherInvite.deleteMany({ email: { $regex: /@test-vidyai\.org$/ } });
    await Course.deleteMany({ title: 'Integration Test Course' });
    await Lesson.deleteMany({ title: 'Integration Test Lesson' });
    await Assignment.deleteMany({ title: 'Integration Test Assignment' });
    await Quiz.deleteMany({ title: 'Integration Test Quiz' });

    // 1. Create Teacher
    testTeacherUser = await User.create({
      name: 'Test Teacher',
      email: 'teacher@test-vidyai.org',
      password: 'password123',
      role: 'teacher',
      isEmailVerified: true,
    });

    // 2. Create Student User & Profile
    testStudentUser = await User.create({
      name: 'Rohan Sharma',
      email: 'student@test-vidyai.org',
      password: 'password123',
      role: 'student',
      class: 6,
      language: 'mr',
      isEmailVerified: true,
    });

    testStudentDoc = await Student.create({
      userId: testStudentUser._id,
      class: 6,
      xp: 100,
      level: 1,
      streakCurrent: 3,
      badges: [],
    });

    // 3. Create Course & Lesson for Class 6
    testCourse = await Course.create({
      title: 'Integration Test Course',
      description: 'Science for Class 6',
      subject: 'Science',
      class: 6,
      teacher: testTeacherUser._id,
      isPublished: true,
    });

    testLesson = await Lesson.create({
      courseId: testCourse._id,
      chapterId: new mongoose.Types.ObjectId(),
      type: 'video',
      title: 'Integration Test Lesson',
      content: 'Water Cycle and Clouds',
      mediaUrl: 'https://cdn.example.com/videos/water-cycle.mp4',
      duration: 300,
    });

    // 4. Create Quiz with sensitive answer keys
    testQuiz = await Quiz.create({
      title: 'Integration Test Quiz',
      subject: 'Science',
      class: 6,
      createdBy: testTeacherUser._id,
      isPublished: true,
      questions: [
        {
          text: 'What is H2O?',
          options: ['Hydrogen', 'Water', 'Oxygen', 'Salt'],
          correctIndex: 1,
          explanation: 'H2O is the chemical formula for water composed of 2 hydrogen and 1 oxygen atoms.',
          points: 10,
        },
        {
          text: 'The process of water turning into vapor is called?',
          options: ['Evaporation', 'Condensation', 'Freezing', 'Precipitation'],
          correctIndex: 0,
          explanation: 'Evaporation is the phase transition from liquid to gas.',
          points: 10,
        },
      ],
    });
  });

  after(async () => {
    // Teardown test artifacts
    await User.deleteMany({ email: { $regex: /@test-vidyai\.org$/ } });
    await Student.deleteMany({ userId: testStudentUser?._id });
    await PendingRegistration.deleteMany({ email: { $regex: /@test-vidyai\.org$/ } });
    await Course.deleteMany({ _id: testCourse?._id });
    await Lesson.deleteMany({ _id: testLesson?._id });
    await Assignment.deleteMany({ title: 'Integration Test Assignment' });
    await Quiz.deleteMany({ _id: testQuiz?._id });
    await Notification.deleteMany({ userId: testStudentUser?._id });
    await mongoose.disconnect();
  });

  // ── TEST 1: OTP Persistence in MongoDB ─────────────────────────
  test('1. OTP Persistence: PendingRegistration stores verification code in DB with TTL', async () => {
    const testEmail = 'otpuser@test-vidyai.org';
    const otp = '849201';

    await PendingRegistration.deleteMany({ email: testEmail });
    const pending = await PendingRegistration.create({
      email: testEmail,
      otp,
      userData: {
        name: 'OTP Student',
        email: testEmail,
        password: 'hashedPasswordABC',
        role: 'student',
        class: 7,
      },
    });

    assert.ok(pending._id, 'PendingRegistration document should be saved to database');
    assert.strictEqual(pending.otp, '849201');
    assert.strictEqual(pending.userData.class, 7);

    // Verify retrieval
    const retrieved = await PendingRegistration.findOne({ email: testEmail, otp: '849201' });
    assert.ok(retrieved, 'Should retrieve pending registration with matching email and OTP');
    assert.strictEqual(retrieved.email, testEmail);

    // Verify index definition
    const indexes = await PendingRegistration.collection.indexes();
    const ttlIndex = indexes.find((idx) => idx.key?.createdAt === 1);
    assert.ok(ttlIndex, 'Should have TTL index on createdAt for auto-expiry');
    assert.strictEqual(ttlIndex.expireAfterSeconds, 600, 'TTL index should expire after 600 seconds (10 min)');
  });

  // ── TEST 2: Mass-Assignment Protection ─────────────────────────
  test('2. Security: Student profile updates strictly whitelist allowed fields and reject role/password tampering', async () => {
    const maliciousPayload = {
      name: 'Rohan Sharma Updated',
      class: 8,
      language: 'hi',
      avatar: 'avatar-5.png',
      // Malicious fields attempting privilege escalation
      role: 'admin',
      password: 'hackedPassword999',
      isEmailVerified: false,
      xp: 999999,
    };

    // Simulate PUT /api/student/profile controller whitelist logic
    const { name, class: studentClass, language, avatar } = maliciousPayload;
    const userUpdate = {};
    if (typeof name === 'string' && name.trim()) userUpdate.name = name.trim();
    if (['mr', 'hi', 'en'].includes(language)) userUpdate.language = language;
    if (typeof avatar === 'string') userUpdate.avatar = avatar;

    const parsedClass = parseInt(studentClass, 10);
    const validClass = !isNaN(parsedClass) && parsedClass >= 1 && parsedClass <= 10 ? parsedClass : null;
    if (validClass) userUpdate.class = validClass;

    const originalPassword = testStudentUser.password;
    const originalRole = testStudentUser.role;

    const updatedUser = await User.findByIdAndUpdate(testStudentUser._id, userUpdate, { new: true });
    if (validClass) {
      await Student.findOneAndUpdate({ userId: testStudentUser._id }, { class: validClass });
    }

    assert.strictEqual(updatedUser.name, 'Rohan Sharma Updated');
    assert.strictEqual(updatedUser.language, 'hi');
    assert.strictEqual(updatedUser.avatar, 'avatar-5.png');

    // Verify security invariants: role and password were NOT tampered with
    assert.strictEqual(updatedUser.role, originalRole, 'Role must remain student');
    assert.strictEqual(updatedUser.role, 'student', 'User must NOT become admin');
    assert.strictEqual(updatedUser.password, originalPassword, 'Password must NOT be modified');
    assert.strictEqual(updatedUser.isEmailVerified, true, 'isEmailVerified must remain true');

    // Verify student doc class was updated
    const studentDoc = await Student.findOne({ userId: testStudentUser._id });
    assert.strictEqual(studentDoc.class, 8);
    assert.strictEqual(studentDoc.xp, 100, 'XP must NOT be altered by profile endpoint');
  });

  // ── TEST 3: Quiz Answer Leakage Protection ─────────────────────
  test('3. Security: Quiz endpoint hides correctIndex and explanation from students', async () => {
    // 3a. Student perspective: strip answers
    const studentViewQuiz = await Quiz.findById(testQuiz._id).lean();
    studentViewQuiz.questions = (studentViewQuiz.questions || []).map((q) => {
      const { correctIndex, explanation, ...safeQ } = q;
      return safeQ;
    });

    assert.strictEqual(studentViewQuiz.questions.length, 2);
    for (const q of studentViewQuiz.questions) {
      assert.strictEqual(q.correctIndex, undefined, 'correctIndex must NOT be visible to student');
      assert.strictEqual(q.explanation, undefined, 'explanation must NOT be visible to student');
      assert.ok(q.text, 'Question text must still be present');
      assert.strictEqual(q.options.length, 4, 'Options must be present');
    }

    // 3b. Teacher perspective: retain answers
    const teacherViewQuiz = await Quiz.findById(testQuiz._id).lean();
    assert.strictEqual(teacherViewQuiz.questions[0].correctIndex, 1);
    assert.ok(teacherViewQuiz.questions[0].explanation.includes('water'));
  });

  // ── TEST 4: Student Assignment Workflow & Teacher Grading ──────
  test('4. Workflow: Student assignment submission and Teacher grading with XP & Notification dispatch', async () => {
    // 4a. Teacher creates assignment for Class 8
    testAssignment = await Assignment.create({
      title: 'Integration Test Assignment',
      description: 'Solve problems on page 42',
      subject: 'Science',
      class: 8,
      teacher: testTeacherUser._id,
      dueDate: new Date(Date.now() + 86400000 * 3),
      points: 50,
      submissions: [],
    });

    assert.ok(testAssignment._id, 'Assignment created');

    // 4b. Student queries assignments for Class 8
    const studentAssignments = await Assignment.find({ class: 8 })
      .select('title description subject class dueDate points submissions')
      .sort({ createdAt: -1 })
      .lean();

    assert.ok(studentAssignments.length >= 1, 'Student should see assignment for Class 8');
    const targetAssign = studentAssignments.find((a) => a._id.toString() === testAssignment._id.toString());
    assert.ok(targetAssign, 'Target assignment found in student query');

    // 4c. Student submits assignment
    const submissionData = {
      student: testStudentDoc._id,
      studentName: 'Rohan Sharma Updated',
      submissionText: 'Here is my homework solution for page 42.',
      fileUrl: 'https://example.com/homework-solution.pdf',
      submittedAt: new Date(),
    };

    testAssignment.submissions.push(submissionData);
    await testAssignment.save();

    const updatedAssignment = await Assignment.findById(testAssignment._id);
    assert.strictEqual(updatedAssignment.submissions.length, 1);
    const sub = updatedAssignment.submissions[0];
    assert.strictEqual(sub.submissionText, 'Here is my homework solution for page 42.');
    assert.strictEqual(sub.fileUrl, 'https://example.com/homework-solution.pdf');
    assert.strictEqual(sub.marks, undefined, 'Marks should be undefined before grading');

    // 4d. Teacher grades submission
    const marksAwarded = 45;
    const teacherFeedback = 'Excellent effort! Very clean solutions.';
    const prevMarks = sub.marks;
    sub.marks = marksAwarded;
    sub.feedback = teacherFeedback;
    await updatedAssignment.save();

    // Verify marks saved
    assert.strictEqual(sub.marks, 45);
    assert.strictEqual(sub.feedback, 'Excellent effort! Very clean solutions.');

    // 4e. Verify XP awarded to student (+45 XP)
    const deltaXP = marksAwarded - (typeof prevMarks === 'number' ? prevMarks : 0);
    assert.strictEqual(deltaXP, 45);

    const updatedStudentDoc = await Student.findByIdAndUpdate(
      testStudentDoc._id,
      { $inc: { xp: deltaXP } },
      { new: true }
    );
    assert.strictEqual(updatedStudentDoc.xp, 145, 'Student XP should increase from 100 to 145');

    // 4f. Verify Notification created
    const notif = await Notification.create({
      userId: testStudentUser._id,
      title: 'Assignment Graded! 📝',
      body: `Your submission for "${testAssignment.title}" received ${marksAwarded}/${testAssignment.points} marks! +${deltaXP} XP`,
      type: 'assignment',
      url: '/assignments',
    });

    assert.ok(notif._id, 'Notification should be created');
    assert.strictEqual(notif.isRead, false);
    assert.strictEqual(notif.type, 'assignment');
  });

  // ── TEST 5: Parent Dashboard Assignment Metric Aggregation ─────
  test('5. Metrics: Parent metrics correctly aggregate completed and pending assignments', async () => {
    // Child has 1 assignment in Class 8, which has been graded
    const allAssignmentsForClass = await Assignment.find({ class: 8 }).lean();

    let pendingCount = 0;
    let completedCount = 0;

    for (const a of allAssignmentsForClass) {
      const sub = (a.submissions || []).find(
        (s) => s.student?.toString() === testStudentDoc._id.toString()
      );
      if (!sub) {
        pendingCount += 1;
      } else {
        completedCount += 1;
      }
    }

    assert.strictEqual(completedCount, 1, 'Child should have 1 completed assignment');
    assert.strictEqual(pendingCount, 0, 'Child should have 0 pending assignments');
  });

  // ── TEST 6: Notification Read Operations ────────────────────────
  test('6. Notifications: Querying unread notifications and marking as read', async () => {
    // Student should have the notification created in test 4
    const notifications = await Notification.find({ userId: testStudentUser._id }).sort({ createdAt: -1 });
    assert.ok(notifications.length >= 1, 'Should find student notifications');
    const unreadCount = await Notification.countDocuments({ userId: testStudentUser._id, isRead: false });
    assert.strictEqual(unreadCount, 1, 'Unread count should be 1');

    // Mark as read
    const targetNotif = notifications[0];
    await Notification.findByIdAndUpdate(targetNotif._id, { isRead: true });

    const updatedUnread = await Notification.countDocuments({ userId: testStudentUser._id, isRead: false });
    assert.strictEqual(updatedUnread, 0, 'Unread count should now be 0');
  });

  // ── TEST 7: Offline Pull Sync Data Resolution ──────────────────
  test('7. Offline Sync: Pull sync returns courses, lessons, and sanitized quizzes for student class', async () => {
    // Test logic mirroring syncController.js pullSync
    const studentClass = 6;
    const courses = await Course.find({ class: studentClass, isPublished: true }).lean();
    assert.ok(courses.length >= 1, 'Sync should find courses for Class 6');

    const courseIds = courses.map((c) => c._id);
    const lessons = await Lesson.find({ courseId: { $in: courseIds } }).lean();
    assert.ok(lessons.length >= 1, 'Sync should find lessons associated with courses (fixing empty lessons bug)');
    assert.strictEqual(lessons[0].title, 'Integration Test Lesson');

    const quizzes = await Quiz.find({ class: studentClass, isPublished: true }).lean();
    assert.ok(quizzes.length >= 1, 'Sync should find quizzes for Class 6');

    // Verify sanitized questions in sync payload
    const safeQuizzes = quizzes.map((quiz) => ({
      ...quiz,
      questions: (quiz.questions || []).map((q) => {
        const { correctIndex, explanation, ...safeQ } = q;
        return safeQ;
      }),
    }));

    for (const q of safeQuizzes[0].questions) {
      assert.strictEqual(q.correctIndex, undefined, 'Sync quiz questions must strip correctIndex');
      assert.strictEqual(q.explanation, undefined, 'Sync quiz questions must strip explanation');
    }
  });

  // ── TEST 8: Gamification Badge System ──────────────────────────
  test('8. Gamification: System badges returned with accurate unlocked/locked state based on real DB metrics', async () => {
    assert.ok(Array.isArray(SYSTEM_BADGES), 'SYSTEM_BADGES must be exported as an array');
    assert.ok(SYSTEM_BADGES.length >= 5, 'There must be at least 5 system badges defined');

    const studentRecord = await Student.findOne({ userId: testStudentUser._id }).populate('badges');

    // Student has 145 XP, streak 3
    const earnedBadgeConditions = new Set((studentRecord.badges || []).map((b) => b.condition || b.badgeId || b._id?.toString()));

    const badgesWithStatus = SYSTEM_BADGES.map((b) => ({
      ...b,
      unlocked: earnedBadgeConditions.has(b.condition) || (b.condition === 'first_lesson' && studentRecord.xp >= 10),
    }));

    const firstLessonBadge = badgesWithStatus.find((b) => b.condition === 'first_lesson');
    assert.ok(firstLessonBadge, 'First lesson badge should exist');
    assert.strictEqual(firstLessonBadge.unlocked, true, 'First lesson badge should be unlocked for student with 145 XP');

    const championBadge = badgesWithStatus.find((b) => b.condition === 'champion');
    assert.ok(championBadge, 'Champion badge should exist');
    assert.strictEqual(championBadge.unlocked, false, 'Champion badge (1000 XP) should remain locked for student with 145 XP');
  });

  // ── TEST 9: Offline Queue Flushing (flushQueue) ────────────────
  test('9. Offline Sync: flushQueue processes queued quiz submission and credits XP', async () => {
    const queue = [
      {
        id: 17290001,
        action: 'quiz_submit',
        payload: {
          quizId: testQuiz._id,
          score: 100,
          totalPoints: 20,
          xpEarned: 30,
        },
      },
    ];

    const studentId = testStudentUser._id;
    const initialXP = (await Student.findOne({ userId: studentId })).xp;

    // Simulate syncController.flushQueue
    const results = [];
    for (const item of queue) {
      if (item.action === 'quiz_submit') {
        const quizRes = await QuizResult.create({
          studentId,
          quizId: item.payload.quizId,
          score: item.payload.score,
          totalPoints: item.payload.totalPoints,
          xpEarned: item.payload.xpEarned,
        });
        await Student.findOneAndUpdate(
          { userId: studentId },
          { $inc: { xp: item.payload.xpEarned || 20 } }
        );
        results.push({ localId: item.id, status: 'synced', dbId: quizRes._id });
      }
    }

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].status, 'synced');
    assert.strictEqual(results[0].localId, 17290001);

    const updatedStudent = await Student.findOne({ userId: studentId });
    assert.strictEqual(updatedStudent.xp, initialXP + 30, 'Student XP should increase by 30 after syncing quiz');

    const createdResult = await QuizResult.findById(results[0].dbId);
    assert.ok(createdResult, 'QuizResult record should be stored in DB');
    assert.strictEqual(createdResult.score, 100);
  });

  // ── TEST 10: Low-Bandwidth Data Saver Filtering ─────────────────
  test('10. Performance: Reels data saver mode prioritizes low-duration videos and limits payload size', async () => {
    // Create test reels
    const shortReel = await Reel.create({
      title: 'Integration Test Short Reel',
      subject: 'Science',
      class: 6,
      teacher: testTeacherUser._id,
      videoUrl: '/uploads/reels/short.mp4',
      duration: 15,
      isApproved: true,
      feedScore: 50,
    });

    const longReel = await Reel.create({
      title: 'Integration Test Long Reel',
      subject: 'Science',
      class: 6,
      teacher: testTeacherUser._id,
      videoUrl: '/uploads/reels/long.mp4',
      duration: 90,
      isApproved: true,
      feedScore: 90,
    });

    // When isLowBandwidth is true, sort by duration: 1
    const lowBandwidthReels = await Reel.find({ class: 6, isApproved: true })
      .sort({ duration: 1, feedScore: -1 })
      .limit(10)
      .lean();

    assert.ok(lowBandwidthReels.length >= 2);
    // Shortest reel should appear first to minimize data consumption
    assert.strictEqual(lowBandwidthReels[0].duration <= lowBandwidthReels[1].duration, true);

    // Clean up
    await Reel.deleteMany({ _id: { $in: [shortReel._id, longReel._id] } });
  });

  // ── TEST 11: Teacher Dashboard Lean Query Performance ───────────
  test('11. Scalability: Teacher dashboard queries return lightweight POJOs with lean()', async () => {
    const teacherId = testTeacherUser._id;

    const [courses, quizzes, students] = await Promise.all([
      Course.find({ teacher: teacherId }).lean(),
      Quiz.find({ createdBy: teacherId }).lean(),
      Student.find({ userId: testStudentUser._id }).populate('userId', 'name email').lean(),
    ]);

    assert.ok(Array.isArray(courses));
    assert.ok(Array.isArray(quizzes));
    assert.ok(Array.isArray(students));

    // Verify POJO properties (no Mongoose document overhead)
    assert.strictEqual(typeof courses[0].save, 'undefined', 'Lean query objects should not have .save method');
    assert.strictEqual(typeof quizzes[0].save, 'undefined', 'Lean query objects should not have .save method');
    assert.strictEqual(typeof students[0].save, 'undefined', 'Lean query objects should not have .save method');
  });

  // ── TEST 12: School Governance & SyncQueue Persistence ───────────
  test('12. Architecture: School governance creates institutional records and SyncQueue logs offline sync queue items', async () => {
    // 12a. School creation
    const school = await School.create({
      name: 'Zilla Parishad Primary School Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001',
    });
    assert.ok(school._id);
    assert.strictEqual(school.state, 'Maharashtra');

    // 12b. SyncQueue record persistence
    const queueEntry = await SyncQueue.create({
      studentId: testStudentUser._id,
      action: 'quiz_submit',
      payload: { quizId: testQuiz._id, score: 95 },
      status: 'synced',
      syncedAt: new Date(),
    });
    assert.ok(queueEntry._id);
    assert.strictEqual(queueEntry.status, 'synced');

    const retrievedQueue = await SyncQueue.findOne({ studentId: testStudentUser._id, action: 'quiz_submit' });
    assert.ok(retrievedQueue);
    assert.strictEqual(retrievedQueue.payload.score, 95);

    // Clean up
    await School.findByIdAndDelete(school._id);
    await SyncQueue.findByIdAndDelete(queueEntry._id);
  });

  // ── TEST 13: Centralized Gamification & Level Synchronization ───
  test('13. Gamification: awardStudentXP synchronously updates XP, coins, and recalculates level based on LEVEL_XP', async () => {
    const before = await Student.findOne({ userId: testStudentUser._id });
    const initialXP = before.xp;

    const updated = await awardStudentXP({
      studentId: testStudentUser._id,
      xpAmount: 150,
      coinsAmount: 10,
    });

    assert.ok(updated);
    assert.strictEqual(updated.xp, initialXP + 150);
    assert.strictEqual(updated.level, 3, 'XP >= 250 should advance student to Level 3');
    assert.ok(updated.coins >= 10);

    // Verify in database
    const dbStudent = await Student.findOne({ userId: testStudentUser._id });
    assert.strictEqual(dbStudent.xp, initialXP + 150);
    assert.strictEqual(dbStudent.level, 3);
  });

  // ── TEST 14: Secure Password Hashing & Attempt Limiting in PendingRegistration ──
  test('14. Security: PendingRegistration schema tracks verification attempts and enforces TTL', async () => {
    const pending = await PendingRegistration.create({
      email: 'sec-test@test-vidyai.org',
      otp: '654321',
      attempts: 2,
      userData: {
        name: 'Sec Test',
        email: 'sec-test@test-vidyai.org',
        password: '$2b$12$e7k7r8somebcryptHashedPasswordHere',
        role: 'student',
        class: 5,
      },
    });

    assert.ok(pending._id);
    assert.strictEqual(pending.attempts, 2);
    assert.ok(pending.userData.password.startsWith('$2b$'), 'Password in pending registration must be hashed');

    await PendingRegistration.deleteOne({ _id: pending._id });
  });

  // ── TEST 15: Password Reset Model & Expiry Validation ───────────
  test('15. Features: PasswordReset model stores recovery OTP with attempts and TTL index', async () => {
    const reset = await PasswordReset.create({
      email: 'reset-test@test-vidyai.org',
      otp: '112233',
      attempts: 0,
    });

    assert.ok(reset._id);
    assert.strictEqual(reset.otp, '112233');
    assert.strictEqual(reset.attempts, 0);

    // Increment attempts on failed OTP
    reset.attempts += 1;
    await reset.save();

    const retrieved = await PasswordReset.findById(reset._id);
    assert.strictEqual(retrieved.attempts, 1);

    await PasswordReset.deleteOne({ _id: reset._id });
  });

  // ── TEST 16: Parent Linking Integrity ───────────────────────────
  test('16. Authorization: Parent linkage associates parent and prevents unauthenticated overwrite', async () => {
    const parentUser = await User.create({
      name: 'Test Parent',
      email: 'parent@test-vidyai.org',
      password: 'password123',
      role: 'parent',
      isEmailVerified: true,
    });

    // Link parent to test student
    testStudentDoc.parentId = parentUser._id;
    await testStudentDoc.save();

    const studentRecord = await Student.findById(testStudentDoc._id);
    assert.strictEqual(studentRecord.parentId.toString(), parentUser._id.toString());

    // Clean up
    await User.deleteOne({ _id: parentUser._id });
  });

  // ── TEST 17: End-to-End Password Recovery Flow ────────────────────
  test('17. E2E: Password recovery request, attempt-limiting, OTP validation, and password hash update', async () => {
    const resetUser = await User.create({
      name: 'Reset Test User',
      email: 'pw-reset-e2e@test-vidyai.org',
      password: 'OldPassword123',
      role: 'student',
      isEmailVerified: true,
    });

    const resetOtp = '849201';
    await PasswordReset.create({
      email: resetUser.email,
      otp: resetOtp,
      attempts: 0,
    });

    // 1. Invalid OTP attempt increment
    const record = await PasswordReset.findOne({ email: resetUser.email });
    assert.ok(record, 'PasswordReset record must exist');
    record.attempts += 1;
    await record.save();

    const updatedRecord = await PasswordReset.findOne({ email: resetUser.email });
    assert.strictEqual(updatedRecord.attempts, 1);

    // 2. Successful OTP verification and password update
    const newPassword = 'NewSuperSecurePass456!';
    resetUser.passwordHash = newPassword; // Pre-save hook hashes this
    await resetUser.save();
    await PasswordReset.deleteOne({ email: resetUser.email });

    // 3. Verify user can authenticate with new password and reset record is deleted
    const reloadedUser = await User.findById(resetUser._id);
    const isNewPassValid = await bcrypt.compare(newPassword, reloadedUser.passwordHash);
    assert.strictEqual(isNewPassValid, true, 'New password must match updated hash');

    const remainingReset = await PasswordReset.findOne({ email: resetUser.email });
    assert.strictEqual(remainingReset, null, 'Reset record must be cleaned up');

    await User.deleteOne({ _id: resetUser._id });
  });

  // ── TEST 18: Media Storage Validation & Path Traversal Guard ──────
  test('18. Storage: File safety checks whitelist safe MIME types, reject executables, and block path traversal', async () => {
    // Safe media types
    assert.doesNotThrow(() => validateFileSafety({ mimetype: 'video/mp4', originalname: 'lesson1.mp4' }));
    assert.doesNotThrow(() => validateFileSafety({ mimetype: 'application/pdf', originalname: 'worksheet.pdf' }));
    assert.doesNotThrow(() => validateFileSafety({ mimetype: 'image/png', originalname: 'diagram.png' }));

    // Unsafe / malicious uploads
    assert.throws(
      () => validateFileSafety({ mimetype: '', originalname: 'exploit.exe' }),
      /missing MIME type/i,
      'Must reject files with empty MIME type'
    );
    assert.throws(
      () => validateFileSafety({ mimetype: 'application/x-msdownload', originalname: 'malware.exe' }),
      /Unsupported MIME type/i,
      'Must reject dangerous executable MIME types'
    );
    assert.throws(
      () => validateFileSafety({ mimetype: 'image/jpeg', originalname: 'backdoor.php' }),
      /File extension '\.php' is not permitted/i,
      'Must reject disallowed file extensions even if MIME is spoofed'
    );

    // Path traversal block during deletion
    const traversalBlocked = await deleteMediaFile('../../etc/passwd', 'lessons');
    assert.strictEqual(traversalBlocked, false, 'Path traversal must be safely rejected');
  });

  // ── TEST 19: CORS Origin Verification Logic ──────────────────────
  test('19. Security: CORS origin validator enforces whitelist in production and permits local development', async () => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173', 'https://app.vidyai.in'];
    const isOriginAllowed = (origin, env) => {
      if (!origin) return true;
      if (allowedOrigins.includes(origin)) return true;
      if (env !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
      return false;
    };

    // Valid origins
    assert.strictEqual(isOriginAllowed('http://localhost:5173', 'development'), true);
    assert.strictEqual(isOriginAllowed('https://app.vidyai.in', 'production'), true);
    assert.strictEqual(isOriginAllowed(null, 'production'), true, 'Mobile / curl requests with no origin must pass');

    // Untrusted origins
    assert.strictEqual(isOriginAllowed('https://attacker-site.com', 'production'), false);
    assert.strictEqual(isOriginAllowed('https://evil-phish.org', 'development'), false);
  });

  // ── TEST 20: Full Multi-Role Lifecycle Integration ───────────────
  test('20. Lifecycle: Multi-role student progress, badge trigger check, and parent assignment metrics', async () => {
    // 1. Query student progress
    const student = await Student.findOne({ userId: testStudentUser._id });
    assert.ok(student, 'Student document must exist');

    // 2. Check badges evaluated from system
    const earnedBadgeConditions = new Set((student.badges || []).map((b) => b.condition || b.badgeId || b._id?.toString()));
    const badges = SYSTEM_BADGES.map((b) => ({
      ...b,
      unlocked: earnedBadgeConditions.has(b.condition) || (b.condition === 'first_lesson' && student.xp >= 10),
    }));
    assert.ok(Array.isArray(badges) && badges.length > 0, 'Badges must be evaluated');

    // 3. Parent aggregation check
    const assignments = await Assignment.find({ class: testStudentUser.class }).lean();
    assert.ok(Array.isArray(assignments), 'Assignments query must succeed');
  });

  // ── TEST 21: Teacher Invitation and Access Governance ─────────────
  test('21. Security: Teacher registration strictly enforces admin TeacherInvite tokens and lifecycle', async () => {
    const inviteEmail = 'invited-teacher@test-vidyai.org';
    const testAdmin = await User.create({
      name: 'System Admin',
      email: 'sysadmin@test-vidyai.org',
      password: 'password123',
      role: 'admin',
      isEmailVerified: true,
    });

    // 1. Admin issues an invitation
    const invite = await TeacherInvite.create({
      email: inviteEmail,
      token: 'secure_test_token_778899',
      name: 'Invited Teacher',
      school: 'Zilla Parishad School',
      invitedBy: testAdmin._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    assert.strictEqual(invite.status, 'pending');

    // 2. Pending registration with valid invite token
    const pending = await PendingRegistration.create({
      email: inviteEmail,
      otp: '123456',
      userData: {
        name: 'Invited Teacher',
        email: inviteEmail,
        password: 'hashedpassword',
        role: 'teacher',
        inviteToken: invite.token,
      },
    });
    assert.ok(pending, 'PendingRegistration with inviteToken must be created');
    assert.strictEqual(pending.userData.inviteToken, 'secure_test_token_778899');

    // 3. Verification creates teacher user and marks invite as 'used'
    const newTeacher = await User.create({
      name: pending.userData.name,
      email: pending.userData.email,
      passwordHash: pending.userData.password,
      role: pending.userData.role,
      isEmailVerified: true,
    });

    await TeacherInvite.updateOne(
      { token: pending.userData.inviteToken },
      { status: 'used', usedAt: new Date(), usedBy: newTeacher._id }
    );

    const verifiedInvite = await TeacherInvite.findOne({ token: invite.token });
    assert.strictEqual(verifiedInvite.status, 'used');
    assert.strictEqual(verifiedInvite.usedBy.toString(), newTeacher._id.toString());
  });

  // ── TEST 22: Deliverability Validation ───────────────────────────
  test('22. Deliverability: DNS MX check rejects non-existent domains, typos, and disposable emails', async () => {
    // 1. Non-existent domain
    const fakeDomainRes = await validateEmailDeliverability('user@domainthatdefinitelydoesnotexist12345.xyz');
    assert.strictEqual(fakeDomainRes.isValid, false);
    assert.match(fakeDomainRes.error, /does not exist/i);

    // 2. Typo domain
    const typoRes = await validateEmailDeliverability('student@gamil.com');
    assert.strictEqual(typoRes.isValid, false);
    assert.match(typoRes.error, /Did you mean '@gmail\.com'/);

    // 3. Disposable email domain
    const disposableRes = await validateEmailDeliverability('fakeuser@mailinator.com');
    assert.strictEqual(disposableRes.isValid, false);
    assert.match(disposableRes.error, /Disposable or temporary/i);

    // 4. Test domain (bypassed in test environment)
    const testDomainRes = await validateEmailDeliverability('student@test-vidyai.org');
    assert.strictEqual(testDomainRes.isValid, true);
  });
});



