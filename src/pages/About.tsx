import React, { useState } from 'react';
import '../App.css';
import { ThemeProvider } from "../components/theme-provider";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const About = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'team'>('about');

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === 'about' ? 'default' : 'outline'}
              onClick={() => setActiveTab('about')}
            >
              About
            </Button>
            <Button
              variant={activeTab === 'team' ? 'default' : 'outline'}
              onClick={() => setActiveTab('team')}
            >
              Team
            </Button>
          </div>

          {/* About Tab Content */}
          {activeTab === 'about' && (
            <div>
              <h1 className="text-4xl font-bold mb-4">About DevSync</h1>
              <p className="mb-6 text-lg text-muted-foreground">
              DevSync is a real-time collaborative coding IDE designed to help developers work together seamlessly from anywhere. Whether you’re building a project, reviewing code, or conducting a live coding interview, DevSync offers a smooth and intuitive experience for teams of all sizes.

With features like live code sharing, instant feedback, and integrated chat, DevSync boosts productivity and makes remote development feel as natural as working side by side. Our mission is to break down the barriers of distance and enable developers to collaborate efficiently, innovate faster, and deliver better software.
              </p>

              <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
              <p className="mb-6">
                We aim to transform the way developers collaborate by providing a smooth, live coding experience that bridges the gap between local and remote teams.
              </p>

              <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
              <Textarea
                placeholder="Write your message here..."
                className="mb-4"
              />
              <Button>Send Message</Button>
            </div>
          )}

          {/* Team Tab Content */}
          {activeTab === 'team' && (
            <div>
              <h1 className="text-4xl font-bold mb-4">Our Team</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 shadow">
                  <h3 className="text-xl font-semibold">Omkar Joshi</h3>
                  <p className="text-muted-foreground">Frontend Developer</p>
                </div>
                <div className="border rounded-lg p-4 shadow">
                  <h3 className="text-xl font-semibold">Arya Shukla</h3>
                  <p className="text-muted-foreground">Cloud Developer</p>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default About;
