import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';

describe('Accordion Components', () => {
  describe('Accordion', () => {
    it('should render accordion with items', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
    });

    it('should support multiple type accordion', () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });
  });

  describe('AccordionItem', () => {
    it('should render with value prop', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="test-item">
            <AccordionTrigger>Test</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('AccordionTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="test">
            <AccordionTrigger>Trigger Text</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Trigger Text');
      expect(trigger).toBeInTheDocument();
      expect(trigger.closest('button')).toBeInTheDocument();
    });
  });

  describe('AccordionContent', () => {
    it('should render without errors', () => {
      const { container } = render(
        <Accordion type="single">
          <AccordionItem value="test">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Test Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      // Component renders successfully
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
