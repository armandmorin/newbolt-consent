import React, { useState } from 'react';
import { Search, Book, Code, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface HelpTopic {
  id: string;
  title: string;
  category: 'getting-started' | 'implementation' | 'consent-management' | 'analytics';
  content: React.ReactNode;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'what-is-consenthub',
    title: 'What is ConsentHub?',
    category: 'getting-started',
    content: (
      <div className="space-y-4">
        <p>
          ConsentHub is a comprehensive consent management platform that helps websites comply with privacy regulations like GDPR, CCPA, and ePrivacy Directive by managing cookie consent and user preferences.
        </p>
        <p>
          Our platform provides an easy-to-use interface for creating, customizing, and managing cookie consent banners and preference centers for your websites.
        </p>
        <h3 className="text-lg font-medium mt-4">Key Features:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Customizable consent banners and preference centers</li>
          <li>Multi-language support</li>
          <li>Detailed analytics and reporting</li>
          <li>Easy implementation with a simple JavaScript snippet</li>
          <li>Compliance with major privacy regulations</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'adding-consent-banner',
    title: 'How to add a consent banner to your website',
    category: 'implementation',
    content: (
      <div className="space-y-4">
        <p>
          Adding a ConsentHub consent banner to your website is a simple process that requires just a few steps:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Create a client:</strong> In the ConsentHub dashboard, navigate to the Clients section and click "Add Client" to create a new client for your website.
          </li>
          <li>
            <strong>Configure consent settings:</strong> Customize the appearance, position, and behavior of your consent banner in the client's settings.
          </li>
          <li>
            <strong>Get your code snippet:</strong> Once configured, go to the "Get Code" section to obtain your unique JavaScript snippet.
          </li>
          <li>
            <strong>Add the snippet to your website:</strong> Copy the JavaScript snippet and paste it into the {'<head>'} section of your website's HTML.
          </li>
        </ol>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h4 className="font-medium mb-2">Example Snippet:</h4>
          <pre className="text-xs overflow-x-auto p-2 bg-gray-800 text-white rounded">
            {`<script>
  (function() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://consenthub.io/api/snippet/admin_123/client_456.js';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  })();
</script>`}
          </pre>
        </div>
      </div>
    ),
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {topic.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
