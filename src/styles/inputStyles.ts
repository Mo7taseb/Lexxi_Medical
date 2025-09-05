/**
 * 🎨 LEXXI INPUT STYLING STANDARDS
 * 
 * Use these standardized classes for all input fields to ensure:
 * - HIGH CONTRAST text that's always readable
 * - Consistent styling across the app
 * - Perfect accessibility
 * - Beautiful, modern design
 */

// ✅ CORRECT INPUT CLASSES - USE THESE ALWAYS
export const STANDARD_INPUT_CLASSES = {
  // Main input styling with DARK text that's always visible
  base: "w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl transition-all duration-200 placeholder:text-gray-500 placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none hover:border-gray-400",
  
  // For error states
  error: "w-full px-4 py-3 text-gray-900 bg-white border border-red-300 rounded-xl transition-all duration-200 placeholder:text-gray-500 placeholder:font-normal focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none",
  
  // For success states
  success: "w-full px-4 py-3 text-gray-900 bg-white border border-green-300 rounded-xl transition-all duration-200 placeholder:text-gray-500 placeholder:font-normal focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none",
  
  // For select dropdowns
  select: "w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none hover:border-gray-400 cursor-pointer",
  
  // For textareas
  textarea: "w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl transition-all duration-200 placeholder:text-gray-500 placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none hover:border-gray-400 resize-none",
  
  // For labels
  label: "block text-sm font-semibold text-gray-800 mb-2",
  
  // For search inputs
  search: "w-full px-4 py-3 pl-10 text-gray-900 bg-white border border-gray-300 rounded-xl transition-all duration-200 placeholder:text-gray-500 placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none hover:border-gray-400"
};

// ❌ NEVER USE THESE - INVISIBLE TEXT CLASSES
export const AVOID_THESE_CLASSES = [
  "text-gray-400", // Too light
  "text-gray-500", // Too light  
  "text-gray-600", // Too light on white backgrounds
  "placeholder-gray-400", // Invisible placeholders
  "placeholder-white/60", // Invisible on light backgrounds
];

// 🎯 KEY PRINCIPLES:
// 1. ALWAYS use text-gray-900 for input text (dark, visible)
// 2. ALWAYS use placeholder:text-gray-500 for placeholders (visible but subtle)
// 3. ALWAYS use text-gray-800 for labels (strong contrast)
// 4. ALWAYS use bg-white for input backgrounds
// 5. ALWAYS include hover and focus states
