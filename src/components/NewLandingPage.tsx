import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Zap, Shield } from 'lucide-react';

const NewLandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold text-xl">YourBrand</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="#features" className="text-foreground/60 hover:text-foreground">
                Features
              </a>
              <a href="#about" className="text-foreground/60 hover:text-foreground">
                About
              </a>
              <a href="#contact" className="text-foreground/60 hover:text-foreground">
                Contact
              </a>
            </nav>
            <Button variant="default" size="sm">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build something{' '}
            <span className="text-primary">amazing</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Create beautiful, responsive applications with our modern platform. 
            Everything you need to bring your ideas to life.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features to help you build faster and better.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <dt className="text-base font-semibold leading-7">
                  Lightning Fast
                </dt>
                <dd className="mt-1 text-base leading-7 text-muted-foreground">
                  Built for speed and performance from the ground up.
                </dd>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <dt className="text-base font-semibold leading-7">
                  Secure by Default
                </dt>
                <dd className="mt-1 text-base leading-7 text-muted-foreground">
                  Enterprise-grade security built into every component.
                </dd>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Star className="h-6 w-6 text-primary-foreground" />
                </div>
                <dt className="text-base font-semibold leading-7">
                  Easy to Use
                </dt>
                <dd className="mt-1 text-base leading-7 text-muted-foreground">
                  Intuitive design that gets you up and running quickly.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of users who are already building amazing things.
            </p>
            <div className="mt-8">
              <Button size="lg">
                Start Building Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-4">
              <span className="font-bold">YourBrand</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 YourBrand. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLandingPage;