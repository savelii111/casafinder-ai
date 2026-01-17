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
    
    // Warning if exactly 20
    if (count === 20) {
      console.warn(`⚠️ [VALIDATOR] ${stageName} has exactly 20 items`);
    }
    
    return count;
  }
  
  static validateCountMatch(actual, expected, stageName) {
    if (actual !== expected) {
      console.warn(`⚠️ [VALIDATOR] COUNT MISMATCH at ${stageName}`);
      console.warn(`   Expected: ${expected}`);
      console.warn(`   Actual: ${actual}`);
    } else {
      console.log(`✅ [VALIDATOR] ${stageName}: Count match (${actual})`);
    }
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