import Link from 'next/link';
import { ArrowRight, CheckCircle, Code, FileSearch, Github, Shield, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Shield,
    title: 'Security Analysis',
    description: 'Detect vulnerabilities, hardcoded secrets, and security misconfigurations.',
  },
  {
    icon: Code,
    title: 'Code Quality',
    description: 'Identify code smells, duplications, and maintainability issues.',
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Find bottlenecks and improve load times.',
  },
  {
    icon: FileSearch,
    title: 'Architecture Review',
    description: 'Evaluate project structure and scalability.',
  },
];

const modules = ['Code Quality', 'Security', 'Deployment', 'Architecture', 'UX/Frontend', 'Monetization', 'AI Integration'];

const pricing = [
  {
    name: 'Starter',
    price: 'EUR 19',
    credits: 30,
    features: ['3 audit modules', 'JSON/YAML export', 'Email support'],
  },
  {
    name: 'Pro',
    price: 'EUR 49',
    credits: 80,
    features: ['All modules', 'Priority processing', 'Detailed reports'],
    popular: true,
  },
  {
    name: 'Advanced',
    price: 'EUR 99',
    credits: 150,
    features: ['Everything in Pro', 'Re-audit included', 'Priority support'],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">AI Audit</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Powered by Gemini 2.5 Flash
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            AI-Powered Code Audits
            <br />
            <span className="text-primary">in Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get comprehensive security, quality, and architecture analysis of your codebase.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free Audit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com" target="_blank">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Ship Quality Code</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">7 Audit Modules</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {modules.map((module) => (
              <Badge key={module} variant="outline" className="text-base py-2 px-4">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {module}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Credit-Based Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white p-8 rounded-xl border ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && <Badge className="mb-4">Most Popular</Badge>}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600"> one-time</span>
                </div>
                <p className="text-2xl font-semibold text-primary mb-6">{plan.credits} credits</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Developers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-1 mb-4 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">Found critical security issues in minutes. The detailed reports saved us weeks.</p>
                <p className="font-medium">Developer #{i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          Copyright {new Date().getFullYear()} AI Audit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
