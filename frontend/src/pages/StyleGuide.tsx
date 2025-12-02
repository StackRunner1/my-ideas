/**
 * Style Guide Page
 *
 * Interactive documentation of the design system including:
 * - Color palette
 * - Typography scale
 * - Spacing system
 * - Native HTML elements
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
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

export default function StyleGuide() {
  const navigate = useNavigate();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [htmlDisabled, setHtmlDisabled] = useState(false);
  const [htmlError, setHtmlError] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
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
          <TabsTrigger value="html">HTML Elements</TabsTrigger>
          <TabsTrigger value="components">shadcn/ui</TabsTrigger>
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

        {/* HTML Elements Tab */}
        <TabsContent value="html" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>
                Native HTML form controls with consistent styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Types */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Input Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="html-text"
                      className="block text-sm font-medium mb-1"
                    >
                      Text Input
                    </label>
                    <input
                      id="html-text"
                      type="text"
                      placeholder="Enter text"
                      disabled={htmlDisabled}
                      className={`w-full px-3 py-2 border rounded-md ${
                        htmlError ? "border-red-500" : "border-input"
                      } ${htmlDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="html-email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email Input
                    </label>
                    <input
                      id="html-email"
                      type="email"
                      placeholder="email@example.com"
                      disabled={htmlDisabled}
                      className={`w-full px-3 py-2 border rounded-md ${
                        htmlError ? "border-red-500" : "border-input"
                      } ${htmlDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                    {htmlError && (
                      <p className="text-xs text-red-500 mt-1">
                        Please enter a valid email
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="html-password"
                      className="block text-sm font-medium mb-1"
                    >
                      Password Input
                    </label>
                    <input
                      id="html-password"
                      type="password"
                      placeholder="••••••••"
                      disabled={htmlDisabled}
                      className={`w-full px-3 py-2 border rounded-md border-input ${
                        htmlDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="html-number"
                      className="block text-sm font-medium mb-1"
                    >
                      Number Input
                    </label>
                    <input
                      id="html-number"
                      type="number"
                      placeholder="123"
                      disabled={htmlDisabled}
                      className={`w-full px-3 py-2 border rounded-md border-input ${
                        htmlDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="html-date"
                      className="block text-sm font-medium mb-1"
                    >
                      Date Input
                    </label>
                    <input
                      id="html-date"
                      type="date"
                      disabled={htmlDisabled}
                      className={`w-full px-3 py-2 border rounded-md border-input ${
                        htmlDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Textarea and Select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="html-textarea"
                    className="block text-sm font-medium mb-1"
                  >
                    Textarea
                  </label>
                  <textarea
                    id="html-textarea"
                    rows={4}
                    placeholder="Enter multiline text..."
                    disabled={htmlDisabled}
                    className={`w-full px-3 py-2 border rounded-md border-input ${
                      htmlDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="html-select"
                    className="block text-sm font-medium mb-1"
                  >
                    Select Dropdown
                  </label>
                  <select
                    id="html-select"
                    disabled={htmlDisabled}
                    className={`w-full px-3 py-2 border rounded-md border-input ${
                      htmlDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>

              <Separator />

              {/* Checkboxes and Radio Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Checkboxes & Radio Buttons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={htmlDisabled}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Checkbox option 1</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        disabled={htmlDisabled}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Checkbox option 2</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="radio-group"
                        disabled={htmlDisabled}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Radio option 1</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="radio-group"
                        defaultChecked
                        disabled={htmlDisabled}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Radio option 2</span>
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Button Types */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Native Button Types
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={htmlDisabled}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    Button
                  </button>
                  <button
                    type="submit"
                    disabled={htmlDisabled}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
                  >
                    Submit
                  </button>
                  <button
                    type="reset"
                    disabled={htmlDisabled}
                    className="px-4 py-2 border border-input rounded-md hover:bg-accent disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <Separator />

              {/* Interactive Controls */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-3">
                  Interactive Controls
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={htmlDisabled}
                      onChange={(e) => setHtmlDisabled(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Disabled State</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={htmlError}
                      onChange={(e) => setHtmlError(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Error State</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Semantic HTML Elements</CardTitle>
              <CardDescription>
                Proper use of semantic containers for accessibility and SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Page Structure</h3>
                  <div className="border rounded-lg p-4 space-y-2 text-sm">
                    <div className="p-2 bg-blue-50 border-l-4 border-blue-500">
                      <code>&lt;header&gt;</code> - Site or section header
                    </div>
                    <div className="ml-4 p-2 bg-green-50 border-l-4 border-green-500">
                      <code>&lt;nav&gt;</code> - Navigation links
                    </div>
                    <div className="p-2 bg-purple-50 border-l-4 border-purple-500">
                      <code>&lt;main&gt;</code> - Main content (only one per
                      page)
                    </div>
                    <div className="ml-4 p-2 bg-yellow-50 border-l-4 border-yellow-500">
                      <code>&lt;section&gt;</code> - Thematic content grouping
                    </div>
                    <div className="ml-8 p-2 bg-orange-50 border-l-4 border-orange-500">
                      <code>&lt;article&gt;</code> - Self-contained content
                    </div>
                    <div className="ml-4 p-2 bg-pink-50 border-l-4 border-pink-500">
                      <code>&lt;aside&gt;</code> - Sidebar or tangential content
                    </div>
                    <div className="p-2 bg-gray-50 border-l-4 border-gray-500">
                      <code>&lt;footer&gt;</code> - Site or section footer
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Accessibility Notes
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        Use <code>&lt;nav&gt;</code> for major navigation blocks
                        with <code>aria-label</code> for multiple nav elements
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        Only one <code>&lt;main&gt;</code> per page, wraps
                        primary content
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        Use <code>&lt;article&gt;</code> for blog posts,
                        comments, forum posts
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        Use <code>&lt;section&gt;</code> when content has a
                        natural heading
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links & Navigation</CardTitle>
              <CardDescription>
                Anchor tag examples with different states and patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Link States</h3>
                <div className="space-y-2">
                  <a href="#" className="text-primary hover:underline block">
                    Default link (hover for underline)
                  </a>
                  <a href="#" className="text-primary underline block">
                    Always underlined link
                  </a>
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    External link
                    <span className="text-xs">↗</span>
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground block"
                  >
                    Muted link
                  </a>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Navigation Patterns
                </h3>

                {/* Horizontal Nav */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">
                    Horizontal Navigation
                  </h4>
                  <nav className="flex gap-6 border-b pb-2">
                    <a href="#" className="text-sm hover:text-primary">
                      Home
                    </a>
                    <a
                      href="#"
                      className="text-sm hover:text-primary border-b-2 border-primary"
                    >
                      Products
                    </a>
                    <a href="#" className="text-sm hover:text-primary">
                      About
                    </a>
                    <a href="#" className="text-sm hover:text-primary">
                      Contact
                    </a>
                  </nav>
                </div>

                {/* Vertical Nav */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">
                    Vertical Navigation
                  </h4>
                  <nav className="space-y-1 border-l-2 pl-4">
                    <a href="#" className="block text-sm hover:text-primary">
                      Dashboard
                    </a>
                    <a
                      href="#"
                      className="block text-sm text-primary font-medium"
                    >
                      Settings
                    </a>
                    <a href="#" className="block text-sm hover:text-primary">
                      Profile
                    </a>
                  </nav>
                </div>

                {/* Breadcrumbs */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Breadcrumbs</h4>
                  <nav className="flex items-center gap-2 text-sm">
                    <a href="#" className="text-primary hover:underline">
                      Home
                    </a>
                    <span className="text-muted-foreground">/</span>
                    <a href="#" className="text-primary hover:underline">
                      Category
                    </a>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">Current Page</span>
                  </nav>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* shadcn/ui Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Component</CardTitle>
              <CardDescription>
                shadcn/ui Button with all variants, sizes, and states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <Separator />

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <span className="text-lg">★</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* States */}
              <div>
                <h3 className="text-sm font-semibold mb-3">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <span className="animate-spin mr-2">⏳</span>
                    Loading
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Code Example */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">Code Example</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyCode(
                        `import { Button } from "@/components/ui/button"\n\n<Button variant="default">Click me</Button>`,
                        "button-code"
                      )
                    }
                  >
                    {copiedCode === "button-code" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="text-xs overflow-x-auto">
                  <code>{`import { Button } from "@/components/ui/button"

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost" size="sm">Small Ghost</Button>`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Component</CardTitle>
              <CardDescription>
                Flexible container with header, content, and footer sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Basic Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Simple Card</CardTitle>
                      <CardDescription>
                        With title and description
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        This is a basic card with header and content sections.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Card with Footer</CardTitle>
                      <CardDescription>Includes action buttons</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Content goes here.</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                      <Button size="sm">Save</Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Interactive Card</h3>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>Hoverable Card</CardTitle>
                    <CardDescription>
                      Hover to see shadow effect
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Cards can be interactive with hover effects and click
                      handlers.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Code Example */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">Code Example</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyCode(
                        `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"`,
                        "card-code"
                      )
                    }
                  >
                    {copiedCode === "card-code" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="text-xs overflow-x-auto">
                  <code>{`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>
                Input, Label, Checkbox, and other form elements from shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Text Inputs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shadcn-email">Email</Label>
                    <Input
                      id="shadcn-email"
                      type="email"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shadcn-password">Password</Label>
                    <Input
                      id="shadcn-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shadcn-disabled">Disabled Input</Label>
                    <Input
                      id="shadcn-disabled"
                      disabled
                      placeholder="Cannot edit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shadcn-with-helper">With Helper Text</Label>
                    <Input id="shadcn-with-helper" placeholder="Enter value" />
                    <p className="text-xs text-muted-foreground">
                      This is helper text for the input
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Checkboxes</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Accept terms and conditions
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing" defaultChecked />
                    <label
                      htmlFor="marketing"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Receive marketing emails
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled" disabled />
                    <label
                      htmlFor="disabled"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Disabled checkbox
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tab Component</CardTitle>
              <CardDescription>
                Organize content into switchable views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Overview</TabsTrigger>
                  <TabsTrigger value="tab2">Details</TabsTrigger>
                  <TabsTrigger value="tab3">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <p className="text-sm">
                    This is the overview tab. Tabs help organize related content
                    into separate views.
                  </p>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <p className="text-sm">
                    This is the details tab with additional information.
                  </p>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4">
                  <p className="text-sm">
                    This is the settings tab for configuration.
                  </p>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              {/* Code Example */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">Code Example</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyCode(
                        `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"`,
                        "tabs-code"
                      )
                    }
                  >
                    {copiedCode === "tabs-code" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="text-xs overflow-x-auto">
                  <code>{`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
