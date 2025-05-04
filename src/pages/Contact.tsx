import React from 'react';
import '../App.css';
import { ThemeProvider } from "../components/theme-provider";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const Contact = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-card p-8 rounded-2xl shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-center">Contact Us</h2>
            <Textarea
              placeholder="Write your message here..."
              className="mb-4 min-h-[150px]"
            />
            <Button className="w-full">Send Message</Button>
          </div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Contact;
