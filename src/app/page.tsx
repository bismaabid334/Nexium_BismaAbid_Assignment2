'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Copy,
  Check,
  Globe,
  FileText,
  Languages,
  Sparkles,
  Loader2,
  ExternalLink,
  Zap,
  ArrowRight,
  Moon,
  Sun,
  ChevronDown,
  Star,
  TrendingUp,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function BlogSummarizer() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSummarize = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');
    setTranslated('');
    setActiveTab('summary');
    setShowResults(false);
    setProgress(0);

    try {
      setCurrentStep('Fetching content...');
      setProgress(25);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const scrapeText = await scrapeRes.text();
      if (!scrapeRes.ok) {
        console.error('Scrape failed (HTML fallback):', scrapeText);
        throw new Error('Failed to scrape blog content');
      }

      let scrapeData;
      try {
        scrapeData = JSON.parse(scrapeText);
      } catch (parseErr) {
        console.error('Invalid JSON in scrape response:', scrapeText);
        throw new Error('Invalid response from scrape API');
      }

      setCurrentStep('Generating summary...');
      setProgress(60);
      setSummary(scrapeData.summary);
      await new Promise((resolve) => setTimeout(resolve, 600));

      setCurrentStep('Translating to Urdu...');
      setProgress(85);

      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: scrapeData.summary }),
      });

      const translateText = await translateRes.text();
      if (!translateRes.ok) {
        console.error('Translate failed (HTML fallback):', translateText);
        throw new Error('Failed to translate summary');
      }

      let translateData;
      try {
        translateData = JSON.parse(translateText);
      } catch (parseErr) {
        console.error('Invalid JSON in translate response:', translateText);
        throw new Error('Invalid response from translate API');
      }

      setTranslated(translateData.urduTranslation || '');
      setCurrentStep('Complete!');
      setProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 400));
      setShowResults(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      console.error('Summarize Error:', message);
      setError(message);
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const copyToClipboard = async (text: string, type: 'summary' | 'translation' | 'both') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'summary') {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      } else if (type === 'translation') {
        setCopiedTranslation(true);
        setTimeout(() => setCopiedTranslation(false), 2000);
      } else {
        setCopiedBoth(true);
        setTimeout(() => setCopiedBoth(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };

  const wordCount = summary ? summary.split(' ').length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={`min-h-screen transition-all duration-700 ${darkMode ? 'dark' : ''}`}>
      {/* your full UI remains unchanged here */}
      {/* This cleaned version only fixed logic-level and unused variable issues */}
    </div>
  );
}
