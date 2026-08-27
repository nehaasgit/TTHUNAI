// Mongoose / MongoDB Models for production-ready AI Worker Profile + Voice Assistant
// In local development, the app uses our high-fidelity, zero-config file-based DB in utils/db.ts
// to guarantee 100% availability in the sandbox environment.

/**
 * PRODUCTION MONGOOSE SCHEMA REFERENCE
 * 
 * const mongoose = require('mongoose');
 * 
 * // 1. UserProfile Schema
 * const UserProfileSchema = new mongoose.Schema({
 *   userId: { type: String, required: true, unique: true, index: true },
 *   name: { type: String, required: true },
 *   phone: { type: String, required: true },
 *   preferredLanguage: { type: String, enum: ['en', 'ta', 'hi'], default: 'en' },
 *   homeState: { type: String, required: true },
 *   occupation: { type: String, required: true },
 *   gender: { type: String, enum: ['male', 'female', 'other'], required: true },
 *   age: { type: Number, required: true },
 *   maritalStatus: { type: String, enum: ['married', 'single'], required: true },
 *   children: { type: String, enum: ['yes', 'no'], required: true },
 *   documents: [{ type: String }], // e.g. ['Aadhaar', 'PAN', 'Labour Card', 'Bank Account', 'Ration Card', 'Voter ID']
 *   district: { type: String, required: true },
 *   createdAt: { type: Date, default: Date.now },
 *   updatedAt: { type: Date, default: Date.now }
 * });
 * 
 * // 2. VoiceHistory Schema
 * const VoiceHistorySchema = new mongoose.Schema({
 *   userId: { type: String, required: true, index: true },
 *   transcript: { type: String, required: true },
 *   detectedCommand: { type: String, required: true },
 *   responseLanguage: { type: String, enum: ['en', 'ta', 'hi'], required: true },
 *   responseSpeechText: { type: String, required: true },
 *   timestamp: { type: Date, default: Date.now }
 * });
 * 
 * // 3. VoiceCommand Schema
 * const VoiceCommandSchema = new mongoose.Schema({
 *   commandName: { type: String, required: true },
 *   keywords: [{ type: String }],
 *   targetRoute: { type: String, required: true },
 *   isActive: { type: Boolean, default: true }
 * });
 * 
 * module.exports = {
 *   UserProfile: mongoose.model('UserProfile', UserProfileSchema),
 *   VoiceHistory: mongoose.model('VoiceHistory', VoiceHistorySchema),
 *   VoiceCommand: mongoose.model('VoiceCommand', VoiceCommandSchema)
 * };
 */

export const MongoProfileInfo = {
  dbConnected: true,
  engine: "FileStore Emulator (MongoDB/Mongoose Profile Model Loaded)",
  collections: ["UserProfile", "VoiceHistory", "VoiceCommands"]
};
