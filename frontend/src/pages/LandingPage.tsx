
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import {
  Heart,
  Baby,
  Stethoscope,
  ShieldCheck,
  Activity,
  Calendar,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-current" />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              Aal is Well
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Stories</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-rose-500 hover:bg-rose-600">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:pt-48 md:pb-32">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            #1 Maternal Health Platform
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-rose-900 to-purple-900 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-700">
            Expert Care for Every Step of Motherhood
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
            Your personal companion for a healthy pregnancy and joyful parenting.
            Connect with doctors, track milestones, and get AI-powered guidance 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
            <Link to="/signup">
              <Button size="lg" className="h-12 px-8 text-lg bg-rose-500 hover:bg-rose-600 rounded-full shadow-lg hover:shadow-xl transition-all">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
                I'm a Doctor
              </Button>
            </Link>
          </div>

          {/* Hero Stats Removed as per user request */}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Care Ecosystem</h2>
            <p className="text-lg text-muted-foreground">Everything you need for a safe and happy pregnancy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all border-none shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-rose-100 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>Health Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor vital stats, appointments, and milestones with our intuitive dashboard designed for mothers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-none shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>AI Companion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get instant answers to your questions about diet, symptoms, and care from our advanced AI chatbot.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-none shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Expert Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Direct connection to verified gynecologists and pediatricians for professional medical advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works / Roles */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Tailored for Every Role</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <Baby className="h-5 w-5 text-rose-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Pregnant Women</h3>
                    <p className="text-muted-foreground">Track pregnancy weeks, log symptoms, view diet plans, and chat with AI assistance.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Mothers</h3>
                    <p className="text-muted-foreground">Post-delivery care, vaccination tracking for the baby, and growth monitoring.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Doctors</h3>
                    <p className="text-muted-foreground">Monitor patient health data, manage appointments, and provide timely interventions.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 p-8 flex items-center justify-center">
                {/* Decorative Abstract UI */}
                <div className="w-full h-full bg-white rounded-xl shadow-xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-8 w-32 bg-gray-100 rounded"></div>
                    <div className="h-8 w-8 bg-rose-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-24 bg-rose-50 rounded-lg w-full"></div>
                    <div className="h-24 bg-purple-50 rounded-lg w-full"></div>
                    <div className="h-24 bg-blue-50 rounded-lg w-full"></div>
                  </div>
                  {/* Floating Element */}
                  <div className="absolute bottom-10 right-10 bg-white p-4 rounded-lg shadow-lg border animate-bounce">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                      <span className="font-semibold text-sm">Vitals Normal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & CTA */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-xl shadow-sm border p-2">
            <AccordionItem value="item-1" className="px-4">
              <AccordionTrigger className="text-lg">Is my data private and secure?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, we prioritize your privacy. All your health data is encrypted and only accessible to you and your authorized healthcare providers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="px-4">
              <AccordionTrigger className="text-lg">Can I consult doctors directly?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. Our platform connects you with verified specialists for chat or video consultations directly through the dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="px-4">
              <AccordionTrigger className="text-lg">Is the AI chatbot accurate?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI is trained on medically verified data to provide general guidance. However, for specific medical conditions, always consult your doctor.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready for a Better Care Experience?</h2>
            <Link to="/signup">
              <Button size="lg" className="h-14 px-10 text-xl bg-rose-500 hover:bg-rose-600 rounded-full shadow-xl hover:scale-105 transition-transform">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-rose-500 fill-current" />
                <span className="text-xl font-bold text-white">Aal is Well</span>
              </div>
              <p className="max-w-xs text-sm text-slate-400">
                Empowering mothers and healthcare providers with technology for a safer, healthier tomorrow.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-rose-400">Features</a></li>
                <li><a href="#" className="hover:text-rose-400">Doctors</a></li>
                <li><a href="#" className="hover:text-rose-400">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-rose-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-rose-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-rose-400">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Aal is Well. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
