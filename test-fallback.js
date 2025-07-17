// Test the enhanced fallback note generation
import { generateEnhancedFallbackNote } from './src/utils/fallbackNoteGenerator';

const testData = {
  transcript: "المريض يشكو من صداع شديد منذ يومين مع حرارة وألم في الرقبة. يعاني من غثيان وقيء. لديه تاريخ مرضي من ارتفاع الضغط.",
  noteType: 'soap'
};

console.log('Testing SOAP note generation:');
console.log(generateEnhancedFallbackNote(testData));

console.log('\n' + '='.repeat(50) + '\n');

const testData2 = {
  transcript: "Patient complains of severe headache for two days with fever and neck pain. Has nausea and vomiting. History of hypertension.",
  noteType: 'progress'
};

console.log('Testing Progress note generation:');
console.log(generateEnhancedFallbackNote(testData2));
