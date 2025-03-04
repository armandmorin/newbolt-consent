# ConsentHub

ConsentHub is a comprehensive consent management platform that helps websites comply with privacy regulations like GDPR, CCPA, and ePrivacy Directive by managing cookie consent and user preferences.

## Features

- Customizable consent banners and preference centers
- Multi-language support
- Detailed analytics and reporting
- Easy implementation with a simple JavaScript snippet
- Compliance with major privacy regulations
- Subscription-based pricing model

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Supabase for database and authentication
- Stripe for payment processing (simulated)
- Vite for development and building

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm run dev
```

### Database Setup

1. Connect to Supabase by clicking the "Connect to Supabase" button in the top right
2. The initial migration will create all necessary tables and seed data

## Project Structure

- `/src`: Source code
  - `/components`: React components
  - `/context`: React context providers
  - `/lib`: Utility functions and API calls
  - `/pages`: Page components
  - `/types`: TypeScript type definitions
- `/supabase`: Supabase migrations and configuration

## Deployment

The project is configured for deployment to Netlify. The `netlify.toml` file contains the necessary configuration.

## License

This project is licensed under the MIT License.
