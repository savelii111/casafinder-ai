/**
 * CRITICAL PIPELINE VALIDATOR
 * 
 * Enforces NO TRUNCATION rules across the entire data pipeline.
 * Throws errors when implicit limits are detected.
 */

export class PipelineValidator {
  static validateNoTruncation(data, stageName, expectedMinimum = null) {
    const count = Array.isArray(data) ? data.length : 0;
    
    console.log(`[VALIDATOR] ${stageName}: ${count} items`);
    
    // CRITICAL: Detect implicit 20-item limit
    if (count === 20) {
      console.error(`🚨 [VALIDATOR] CRITICAL: ${stageName} has EXACTLY 20 items`);
      console.error(`🚨 This is a known truncation pattern`);
      
      if (expectedMinimum && expectedMinimum > 20) {
        throw new Error(
          `PIPELINE FAILURE at ${stageName}: Expected ${expectedMinimum}+ items, got exactly 20 (implicit limit detected)`
        );
      }
    }
    
    return count;
  }
  
  static validateCountMatch(actual, expected, stageName) {
    if (actual !== expected) {
      console.error(`🚨 [VALIDATOR] COUNT MISMATCH at ${stageName}`);
      console.error(`   Expected: ${expected}`);
      console.error(`   Actual: ${actual}`);
      throw new Error(
        `PIPELINE FAILURE at ${stageName}: Count mismatch (expected ${expected}, got ${actual})`
      );
    }
    console.log(`✅ [VALIDATOR] ${stageName}: Count match (${actual})`);
  }
  
  static logPipelineStage(stageName, inputCount, outputCount, note = '') {
    console.log(`[PIPELINE] ${stageName}:`);
    console.log(`  Input: ${inputCount}`);
    console.log(`  Output: ${outputCount}`);
    if (note) console.log(`  Note: ${note}`);
    
    if (inputCount !== outputCount) {
      console.warn(`⚠️  Data transformation: ${inputCount} → ${outputCount}`);
    }
  }
}

export default PipelineValidator;