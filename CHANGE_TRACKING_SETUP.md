# Medical AI Change Tracking Setup Guide

This guide will help you set up the Medical AI Change Tracking system to collect data for improving your AI models.

## 🎯 What This Does

- **Tracks AI-generated notes** (with all patient data removed)
- **Records doctor edits** to understand improvements
- **Collects learning data** for training better AI models
- **Maintains complete privacy** - no PHI is stored

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose your organization and enter:
   - **Project name**: `lexxi-medical-tracking`
   - **Database password**: Generate a secure password
   - **Region**: Choose closest to your location
4. Wait for project creation (2-3 minutes)

### 2. Get Your Supabase Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **API Key (anon/public)** (starts with `eyJ`)
   - **API Key (service_role)** (starts with `eyJ` - keep this secret!)

### 3. Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_create_note_tracking_tables.sql`
3. Paste into SQL Editor and click **Run**
4. You should see tables created successfully

### 4. Configure Environment Variables

Create/update your `.env.local` file with:

```bash
# Your existing variables
GROQ_API_KEY=your_groq_api_key_here

# Add these new Supabase variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Enable tracking
ENABLE_CHANGE_TRACKING=true
```

### 5. Test the Setup

1. Restart your Next.js development server:

   ```bash
   npm run dev
   ```

2. Generate a medical note in your app
3. Edit the note and save it
4. Check your Supabase database - you should see data in the tracking tables!

## 🔒 Privacy & Security

### What Gets Stored

- ✅ **Redacted transcripts** (names, IDs, contacts removed)
- ✅ **AI-generated notes** (anonymized)
- ✅ **Doctor's final edits** (anonymized)
- ✅ **Change patterns** for learning
- ✅ **Anonymous doctor ID** (per device/browser)

### What Does NOT Get Stored

- ❌ **Patient names** or any identifiers
- ❌ **Medical record numbers**
- ❌ **Phone numbers or emails**
- ❌ **Hospital/clinic names**
- ❌ **Doctor's real identity**

### Built-in Safeguards

- **Automatic PHI removal** before storage
- **Validation checks** to catch missed PHI
- **User consent required** - off by default
- **Easy opt-out** at any time

## 📊 Using the Data

### View Your Data

```sql
-- See your note generations
SELECT * FROM note_generations
WHERE doctor_anon_id = 'your-anon-id'
ORDER BY created_at DESC;

-- See edit patterns
SELECT section_type, COUNT(*) as edit_count
FROM section_diffs
GROUP BY section_type
ORDER BY edit_count DESC;
```

### Export Learning Data

```sql
-- Common corrections for AI training
SELECT
  original_pattern,
  corrected_pattern,
  frequency,
  note_type,
  language
FROM learning_insights
WHERE confidence_score > 0.7
ORDER BY frequency DESC;
```

## 🔧 Configuration Options

### Enable/Disable Tracking

```typescript
// In your component
const { updateConsent } = useChangeTracking();

// Enable tracking
updateConsent(true);

// Disable tracking
updateConsent(false);
```

### Consent Component

```tsx
import { ChangeTrackingConsent } from "@/components/ChangeTrackingConsent";

// Add to your settings page
<ChangeTrackingConsent
  language="en"
  onConsentChange={(consent) => console.log("Consent:", consent)}
/>;
```

## 🎓 Understanding the Data

### Table Structure

- **`doctor_sessions`** - Anonymous doctor tracking
- **`note_generations`** - Original AI outputs
- **`note_edits`** - Final doctor versions
- **`section_diffs`** - Detailed change analysis
- **`learning_insights`** - Patterns for training

### Key Metrics

```sql
-- Your contribution stats
SELECT
  COUNT(*) as total_notes,
  AVG(edit_duration_seconds) as avg_edit_time,
  AVG(total_changes) as avg_changes_per_note
FROM note_edits ne
JOIN note_generations ng ON ne.note_generation_id = ng.id
WHERE ng.doctor_anon_id = 'your-anon-id';
```

## 🚨 Troubleshooting

### Common Issues

**"Failed to track note generation"**

- Check Supabase URL and keys in `.env.local`
- Verify database tables exist
- Check browser console for errors

**"Potential PHI detected"**

- Review redaction patterns in `services/dataRedaction.ts`
- Add custom patterns for your locale
- Check data before manual review

**"Database connection failed"**

- Verify Supabase project is active
- Check API keys are correct
- Ensure RLS policies allow access

### Testing Redaction

```typescript
import { DataRedactionService } from "@/services/dataRedaction";

const redactor = DataRedactionService.getInstance();

// Test with sample data
const original = "Patient John Smith, MRN: 12345, Phone: 555-1234";
const redacted = redactor.redactTranscript(original, "en");
console.log(redacted); // Should show: "Patient [PATIENT_NAME], [MRN], Phone: [PHONE]"
```

## 📈 Next Steps

1. **Monitor data quality** - Regular checks for PHI leaks
2. **Analyze patterns** - Identify common corrections
3. **Train better models** - Use collected data for fine-tuning
4. **Scale deployment** - Move to production with proper auth

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review browser console errors
3. Verify Supabase configuration
4. Test with simple examples first

---

**Remember**: This system is designed to be privacy-first. All patient data is automatically removed, but always review your data to ensure compliance with local healthcare regulations.
