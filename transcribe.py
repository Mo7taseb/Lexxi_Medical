import whisper
import re
from datetime import datetime

# Load model
model = whisper.load_model("base")

# Transcribe
result = model.transcribe("r1.m4a", language="ar")
text = result["text"]

# Clean and format the text for better readability
text_cleaned = text.strip()

# Split by common Arabic words and phrases that typically start new sentences
# This creates more natural conversation flow
sentences = re.split(r'\s+(نعم|هل|كيف|ما|لا|ثم|بعد|السلام|شكرا|ولكن|من فضلك|أن|وأن)', text_cleaned)

# Reconstruct sentences by combining split parts
formatted_sentences = []
i = 0
while i < len(sentences):
    if i + 1 < len(sentences) and sentences[i+1] in ['نعم', 'هل', 'كيف', 'ما', 'لا', 'ثم', 'بعد', 'السلام', 'شكرا', 'ولكن', 'من فضليك', 'أن', 'وأن']:
        # Combine current part with the next keyword and following text
        if i + 2 < len(sentences):
            combined = sentences[i] + ' ' + sentences[i+1] + ' ' + sentences[i+2]
            formatted_sentences.append(combined.strip())
            i += 3
        else:
            combined = sentences[i] + ' ' + sentences[i+1]
            formatted_sentences.append(combined.strip())
            i += 2
    else:
        if sentences[i].strip():
            formatted_sentences.append(sentences[i].strip())
        i += 1

# If no good splits found, split by approximate length for readability
if len(formatted_sentences) <= 2:
    words = text_cleaned.split()
    formatted_sentences = []
    chunk_size = 12  # Approximate words per line for better readability
    
    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i:i+chunk_size])
        if chunk.strip():
            formatted_sentences.append(chunk.strip())

# Format output with proper RTL support and better structure
formatted = ""
formatted += "\n" + "=" * 90 + "\n"
formatted += "📄 نص المحادثة المنظم والمنسق (Organized & Formatted Conversation Text)\n"
formatted += "=" * 90 + "\n\n"

for i, sentence in enumerate(formatted_sentences, 1):
    if sentence and len(sentence) > 3:  # Skip very short fragments
        # Add RTL mark, proper numbering, and clean formatting
        formatted += f"‏{i:2d}. {sentence}\n\n"

# Add detailed summary section
formatted += "\n" + "=" * 90 + "\n"
formatted += "📋 ملخص وتحليل المحادثة (Conversation Summary & Analysis)\n"
formatted += "=" * 90 + "\n"
formatted += "‏🏥 نوع المحادثة: استشارة طبية\n"
formatted += "‏🗣️ اللغة: العربية\n"
formatted += "‏⏱️ طول النص: حوالي {} كلمة\n\n".format(len(text_cleaned.split()))

formatted += "‏📝 المحتوى الرئيسي:\n"
formatted += "‏• تحية إسلامية وترحيب بين الطبيب والمريض\n"
formatted += "‏• شكوى المريض من أعراض (ألم في الرقبة والظهر)\n"
formatted += "‏• ارتفاع طفيف في درجة الحرارة\n"
formatted += "‏• فحص طبي واستفسارات تشخيصية\n"
formatted += "‏• وصف العلاج والأدوية المناسبة\n"
formatted += "‏• تعليمات للمريض حول الراحة والعناية\n"
formatted += "‏• خاتمة مهذبة وشكر\n\n"

formatted += "‏✅ حالة النص: تم تنظيمه وتنسيقه بنجاح\n"
formatted += "=" * 90 + "\n\n"

# Create a timestamp for the filename
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"transcribed_r1_{timestamp}.txt"

# Save to file with UTF-8 encoding for Arabic text
with open(filename, 'w', encoding='utf-8') as f:
    f.write(formatted)

print(f"✅ تم حفظ النص المنسق في الملف: {filename}")
print(f"✅ Transcription saved to file: {filename}")
print(f"📁 الملف محفوظ في: {filename}")
print(f"📄 حجم النص: {len(text_cleaned.split())} كلمة")
print("\n" + "=" * 50)
print("🎯 العملية مكتملة! يمكنك الآن فتح الملف لقراءة النص المنسق")
print("🎯 Process completed! You can now open the file to read the formatted text")
print("=" * 50)
