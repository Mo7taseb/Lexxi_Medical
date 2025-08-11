# Deployment Setup Instructions

## Environment Variables Required for Vercel

Your application requires the following environment variables to be set in your Vercel dashboard:

### 1. GROQ_API_KEY

- **Description**: API key for Groq Whisper transcription service
- **Required**: Yes
- **Format**: String starting with `gsk_`
- **How to get**: Sign up at https://console.groq.com/keys
- **Example**: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Setting Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project (lexxi)
3. Go to Settings → Environment Variables
4. Add the following:

```
GROQ_API_KEY = your_actual_groq_api_key_here
```

### Common Issues:

#### 1. "Failed to transcribe audio. Please check your Groq API key" Error

- **Cause**: GROQ_API_KEY is not set in Vercel environment variables
- **Solution**: Add the environment variable in Vercel dashboard and redeploy

#### 2. File Size Errors for Small Files

- **Cause**: Network issues or deployment environment differences
- **Solution**: The app should handle this automatically now with better error messages

#### 3. Works Locally but Not in Deployment

- **Cause**: Environment variables are only set locally (in .env.local)
- **Solution**: Set the same variables in Vercel dashboard

### Vercel Deployment Steps:

1. Set environment variables in Vercel dashboard
2. Redeploy your application
3. Check the function logs in Vercel dashboard for any errors
4. Test with a small audio file first

### Debugging:

If you continue to have issues, check the Vercel function logs:

1. Go to Vercel dashboard → Your Project → Functions
2. Click on any recent transcription request
3. Check the logs for detailed error messages

The updated code now provides more detailed logging to help identify issues.
