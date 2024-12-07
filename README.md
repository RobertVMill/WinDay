# Winday - Personal Development Platform

A comprehensive personal development platform built with Next.js, focusing on four key empires of life: Mind, Body, Heart, and Gut.

## Features

### 🎯 Goals Tracking
- North Star Vision tracking
- Empire-specific goals (Mind, Body, Heart, Gut)
- Progress visualization
- Subscriber milestone tracking

### 📅 Calendar & Planning
- AI-powered scheduling assistant
- Daily action planning
- Empire-balanced time management

### 💪 Performance Tracking
- Workout performance monitoring
- Categories: Endurance, Upper Strength, Lower Strength
- Best day highlights
- Progress tracking

### 📝 Journal
- Daily gratitude practice
- Gift documentation
- Strategy implementation
- Workout notes

### ⏲️ Meditation Timer
- Customizable meditation sessions
- Interval bells
- Session tracking

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app` - Next.js app router pages and layouts
  - `/goals` - Goals tracking interface
  - `/calendar` - AI-powered calendar
  - `/performance` - Workout tracking
  - `/journal` - Journal entries
  - `/meditation` - Meditation timer
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations

## Contributing

This is a personal project but suggestions and feedback are welcome!
