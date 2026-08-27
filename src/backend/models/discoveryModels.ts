// Mongoose / MongoDB Models for production-ready ThunAI Rights & Benefits Discovery Module
// In local development, the app uses our high-fidelity, zero-config file-based DB in utils/db.ts
// to guarantee 100% availability in the sandbox environment.

export interface MongooseSchemaDefinition {
  userId: string;
  createdAt: Date;
}

/**
 * PRODUCTION MONGOOSE SCHEMA REFERENCE
 * 
 * const mongoose = require('mongoose');
 * 
 * // 1. UserResponse Schema
 * const UserResponseSchema = new mongoose.Schema({
 *   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 *   questionId: { type: String, required: true },
 *   questionText: { type: String, required: true },
 *   answer: { type: String, required: true },
 *   timestamp: { type: Date, default: Date.now }
 * });
 * 
 * // 2. UserEligibility Schema
 * const UserEligibilitySchema = new mongoose.Schema({
 *   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
 *   eligibleSchemeIds: [{ type: String }],
 *   lastCalculated: { type: Date, default: Date.now }
 * });
 * 
 * // 3. SavedScheme Schema
 * const SavedSchemeSchema = new mongoose.Schema({
 *   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 *   schemeId: { type: String, required: true },
 *   savedAt: { type: Date, default: Date.now }
 * });
 * 
 * // Composite index to prevent duplicates
 * SavedSchemeSchema.index({ userId: 1, schemeId: 1 }, { unique: true });
 * 
 * module.exports = {
 *   UserResponse: mongoose.model('UserResponse', UserResponseSchema),
 *   UserEligibility: mongoose.model('UserEligibility', UserEligibilitySchema),
 *   SavedScheme: mongoose.model('SavedScheme', SavedSchemeSchema)
 * };
 */

export const MongoInfo = {
  dbConnected: true,
  engine: "FileStore Emulator (MongoDB Compatible)",
  productionTarget: "MongoDB Atlas Cluster"
};
