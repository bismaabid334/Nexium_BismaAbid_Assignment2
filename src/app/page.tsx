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
  TrendingUp,
  Clock,
  BookOpen,
  Star
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
      await new Promise(resolve => setTimeout(resolve, 800));

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
      } catch {
        console.error('Invalid JSON in scrape response:', scrapeText);
        throw new Error('Invalid response from scrape API');
      }

      setCurrentStep('Generating summary...');
      setProgress(60);
      setSummary(scrapeData.summary);

      await new Promise(resolve => setTimeout(resolve, 600));

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
      } catch {
        console.error('Invalid JSON in translate response:', translateText);
        throw new Error('Invalid response from translate API');
      }

      setTranslated(translateData.urduTranslation || '');
      setCurrentStep('Complete!');
      setProgress(100);

      await new Promise(resolve => setTimeout(resolve, 400));
      setShowResults(true);

    } catch (err: unknown) {
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
      } else if (type === 'both') {
        setCopiedBoth(true);
        setTimeout(() => setCopiedBoth(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const wordCount = summary ? summary.split(' ').length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={`min-h-screen transition-all duration-700 ${darkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-1000">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,200,255,0.2),transparent_50%)] dark:bg-[radial-gradient(circle_at_40%_40%,rgba(120,200,255,0.05),transparent_50%)]" />
      </div>

      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setDarkMode(!darkMode)}
          variant="outline"
          size="sm"
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`text-center transition-all duration-1000 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Animated Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse" />
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-full shadow-2xl transform group-hover:scale-110 transition-all duration-500">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-all duration-500 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Blog Summarizer
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 font-medium">
              Transform lengthy articles into 
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> concise summaries </span>
              with instant
              <span className="text-purple-600 dark:text-purple-400 font-semibold"> Urdu translation</span>
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="secondary" className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                <Zap className="w-4 h-4 mr-2" />
                AI Powered
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <Languages className="w-4 h-4 mr-2" />
                Instant Translation
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                <TrendingUp className="w-4 h-4 mr-2" />
                Smart Analysis
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className={`backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CardHeader className="pb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800 dark:text-slate-200">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              Enter Blog URL
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            {/* URL Input Section */}
            <div className="space-y-4">
              <Label htmlFor="url" className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Blog Post URL
              </Label>
              
              <div className="relative group">
                <Input
                  id="url"
                  placeholder="https://example.com/amazing-blog-post"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                  className="pl-12 pr-4 h-14 text-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                />
                <ExternalLink className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                
                {/* Input Status Indicator */}
                {url && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {isValidUrl(url) ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    )}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 animate-in slide-in-from-top-2 duration-300">
                  <AlertDescription className="text-red-700 dark:text-red-400 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* URL Validation Feedback */}
              {url && isValidUrl(url) && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-in slide-in-from-left-2 duration-300">
                  <Check className="w-4 h-4" />
                  Valid URL format detected
                </div>
              )}
            </div>

            {/* Progress Section */}
            {loading && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {currentStep}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleSummarize}
              className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-xl group"
              disabled={loading || !url || !isValidUrl(url)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Processing your content...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                  Generate Summary
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>

            {/* Results Section */}
            {showResults && (summary || translated) && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                <Separator className="my-8 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                
                {/* Success Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        Summary Generated Successfully
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {wordCount} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          ~{readingTime} min read
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Copy Both Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => copyToClipboard(`English Summary:\n${summary}\n\nاردو ترجمہ:\n${translated}`, 'both')}
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border-blue-200 dark:border-blue-800"
                    >
                      {copiedBoth ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          Copied Both!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Both
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Enhanced Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <TabsTrigger 
                      value="summary" 
                      className="flex items-center gap-2 h-10 rounded-lg transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      English Summary
                    </TabsTrigger>
                    <TabsTrigger 
                      value="translation" 
                      className="flex items-center gap-2 h-10 rounded-lg transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                      disabled={!translated}
                    >
                      <Languages className="w-4 h-4" />
                      اردو ترجمہ
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        English Summary
                      </Label>
                      <Button
                        onClick={() => copyToClipboard(summary, 'summary')}
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      >
                        {copiedSummary ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Text
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-inner">
                      <CardContent className="p-6">
                        <Textarea
                          value={summary}
                          readOnly
                          rows={Math.min(Math.ceil(summary.split(' ').length / 15), 12)}
                          className="resize-none border-0 bg-transparent text-slate-800 dark:text-slate-200 focus:ring-0 p-0 text-base leading-relaxed font-medium"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="translation" className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Languages className="w-5 h-5 text-purple-600" />
                        اردو ترجمہ
                      </Label>
                      <Button
                        onClick={() => copyToClipboard(translated, 'translation')}
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                      >
                        {copiedTranslation ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Text
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-inner">
                      <CardContent className="p-6">
                        <Textarea
                          value={translated}
                          readOnly
                          rows={Math.min(Math.ceil(translated.split(' ').length / 12), 12)}
                          className="resize-none border-0 bg-transparent text-slate-800 dark:text-slate-200 focus:ring-0 p-0 text-base leading-relaxed font-medium"
                          style={{ direction: 'rtl', fontFamily: 'system-ui, -apple-system' }}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
