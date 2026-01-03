import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs Components', () => {
  describe('Tabs', () => {
    it('should render tabs with content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
    });

    it('should accept className', () => {
      render(
        <Tabs defaultValue="tab1" className="custom-class">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('should render tabs list', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
    });
  });

  describe('TabsTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Trigger Text</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByText('Trigger Text');
      expect(trigger).toBeInTheDocument();
      expect(trigger.closest('button')).toBeInTheDocument();
    });
  });

  describe('TabsContent', () => {
    it('should render content for active tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Active Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Active Content')).toBeInTheDocument();
    });
  });
});
