import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('should render dialog with trigger', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });
  });

  describe('DialogTrigger', () => {
    it('should render trigger element', () => {
      render(
        <Dialog>
          <DialogTrigger>Click Me</DialogTrigger>
        </Dialog>
      );

      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });
  });

  describe('DialogContent', () => {
    it('should render content with title', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
  });

  describe('DialogHeader', () => {
    it('should render header content', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
              <DialogDescription>Header Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Header Title')).toBeInTheDocument();
      expect(screen.getByText('Header Description')).toBeInTheDocument();
    });
  });

  describe('DialogTitle', () => {
    it('should render title as heading', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>My Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const title = screen.getByText('My Title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toMatch(/H[1-6]/); // Should be some heading tag
    });
  });

  describe('DialogDescription', () => {
    it('should render description', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogDescription>Dialog description text</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Dialog description text')).toBeInTheDocument();
    });
  });

  describe('DialogFooter', () => {
    it('should render footer content', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
              <button>OK</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();
    });
  });
});
