import React, { useState } from 'react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui';

const ComponentTest = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">UI Components Test</h1>
      
      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>All available button styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🚀</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input fields and textareas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Text Input</label>
            <Input placeholder="Enter text..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Textarea</label>
            <Textarea placeholder="Enter description..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>Status indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Test */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog Component</CardTitle>
          <CardDescription>Modal dialogs</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsDialogOpen(true)} variant="gradient">
            Open Dialog
          </Button>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>
              This is a test dialog to verify the component is working.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Dialog content goes here. All components are working correctly!</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button variant="gradient">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComponentTest;
