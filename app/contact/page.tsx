"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Contact Us
      </p>

      <h1 className="text-3xl sm:text-5xl font-bold mt-3">
        Get in Touch
      </h1>

      <p className="mt-4 text-muted-foreground">
        Have a question? Send us a message.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <Input
          placeholder="Your name"
          required
        />

        <Input
          type="email"
          placeholder="Your email"
          required
        />

        <Input
          placeholder="Subject"
          required
        />

        <Textarea
          placeholder="Your message"
          required
          className="min-h-32"
        />

        <Button type="submit">
          Send Message
        </Button>

        {submitted && (
          <p className="text-sm text-green-600">
            Message submitted successfully.
          </p>
        )}
      </form>
    </main>
  );
}