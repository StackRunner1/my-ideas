/**
 * Style Guide Page
 *
 * Interactive documentation of the design system including:
 * - Color palette
 * - Typography scale
 * - Spacing system
 * - shadcn/ui components
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function StyleGuide() {
  const navigate = useNavigate();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Color palette tokens
  const colors = [
    { name: "Background", var: "--background", hsl: "0 0% 100%" },
    { name: "Foreground", var: "--foreground", hsl: "0 0% 3.9%" },
    { name: "Primary", var: "--primary", hsl: "0 0% 9%" },
    {
      name: "Primary Foreground",
      var: "--primary-foreground",
      hsl: "0 0% 98%",
    },
    { name: "Secondary", var: "--secondary", hsl: "0 0% 96.1%" },
    {
      name: "Secondary Foreground",
      var: "--secondary-foreground",
      hsl: "0 0% 9%",
    },
    { name: "Muted", var: "--muted", hsl: "0 0% 96.1%" },
    { name: "Muted Foreground", var: "--muted-foreground", hsl: "0 0% 45.1%" },
    { name: "Accent", var: "--accent", hsl: "0 0% 96.1%" },
    { name: "Accent Foreground", var: "--accent-foreground", hsl: "0 0% 9%" },
    { name: "Destructive", var: "--destructive", hsl: "0 84.2% 60.2%" },
    {
      name: "Destructive Foreground",
      var: "--destructive-foreground",
      hsl: "0 0% 98%",
    },
    { name: "Border", var: "--border", hsl: "0 0% 89.8%" },
    { name: "Input", var: "--input", hsl: "0 0% 89.8%" },
    { name: "Ring", var: "--ring", hsl: "0 0% 3.9%" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Design System</h1>
          <p className="text-muted-foreground text-lg">
            Interactive documentation for the my-ideas design system
          </p>
        </div>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Home
        </Button>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                Design tokens for colors using HSL format with CSS variables.
                Click any swatch to copy the HSL value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colors.map((color) => (
                  <button
                    key={color.var}
                    onClick={() => copyToClipboard(color.hsl, color.var)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors text-left group"
                  >
                    <div
                      className="w-12 h-12 rounded-md border shadow-sm"
                      style={{ backgroundColor: `hsl(${color.hsl})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{color.name}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {color.var}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        hsl({color.hsl})
                      </div>
                    </div>
                    {copiedColor === color.var && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Headings</CardTitle>
              <CardDescription>
                Semantic heading elements with responsive sizing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold">Heading 1</h1>
                <code className="text-xs text-muted-foreground">
                  text-5xl font-bold
                </code>
              </div>
              <div>
                <h2 className="text-4xl font-bold">Heading 2</h2>
                <code className="text-xs text-muted-foreground">
                  text-4xl font-bold
                </code>
              </div>
              <div>
                <h3 className="text-3xl font-semibold">Heading 3</h3>
                <code className="text-xs text-muted-foreground">
                  text-3xl font-semibold
                </code>
              </div>
              <div>
                <h4 className="text-2xl font-semibold">Heading 4</h4>
                <code className="text-xs text-muted-foreground">
                  text-2xl font-semibold
                </code>
              </div>
              <div>
                <h5 className="text-xl font-medium">Heading 5</h5>
                <code className="text-xs text-muted-foreground">
                  text-xl font-medium
                </code>
              </div>
              <div>
                <h6 className="text-lg font-medium">Heading 6</h6>
                <code className="text-xs text-muted-foreground">
                  text-lg font-medium
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Text</CardTitle>
              <CardDescription>
                Standard text styles for paragraphs and inline elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-base">
                  This is regular body text using the base font size with normal
                  line height. Perfect for most content blocks and readable
                  paragraphs.
                </p>
                <code className="text-xs text-muted-foreground">text-base</code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  This is small text using the sm font size, often used for
                  secondary information and helper text.
                </p>
                <code className="text-xs text-muted-foreground">
                  text-sm text-muted-foreground
                </code>
              </div>
              <div>
                <p className="text-lg font-medium">
                  This is large text with medium weight, useful for emphasis or
                  lead paragraphs.
                </p>
                <code className="text-xs text-muted-foreground">
                  text-lg font-medium
                </code>
              </div>
              <div>
                <p>
                  Inline styles: <strong>bold text</strong>,{" "}
                  <em>italic text</em>,{" "}
                  <code className="px-1 py-0.5 bg-muted rounded text-sm">
                    inline code
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>
                Consistent spacing tokens based on Tailwind's spacing scale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "xs", size: "4px", class: "w-1" },
                  { name: "sm", size: "8px", class: "w-2" },
                  { name: "md", size: "16px", class: "w-4" },
                  { name: "lg", size: "24px", class: "w-6" },
                  { name: "xl", size: "32px", class: "w-8" },
                  { name: "2xl", size: "48px", class: "w-12" },
                  { name: "3xl", size: "64px", class: "w-16" },
                ].map((spacing) => (
                  <div key={spacing.name} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">
                      {spacing.name}
                    </div>
                    <div className="w-16 text-sm text-muted-foreground">
                      {spacing.size}
                    </div>
                    <div
                      className={`${spacing.class} h-8 bg-primary rounded`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                shadcn/ui Button component with various variants and sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>
                Input, Label, and form components from shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>
                Example of Card component composition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Simple Card</CardTitle>
                    <CardDescription>
                      With title and description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Card content goes here.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Another Card</CardTitle>
                    <CardDescription>Demonstrating layout</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">More card content here.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
