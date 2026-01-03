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
  DialogClose,
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

  describe('DialogClose', () => {
    it('should render close button', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getAllByText('Close').length).toBeGreaterThan(0);
    });
  });

  describe('DialogContent with showCloseButton', () => {
    it('should not render close button when showCloseButton is false', () => {
      render(
        <Dialog open>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });
  });

  describe('DialogOverlay', () => {
    it('should render overlay', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      // DialogContent includes DialogOverlay by default
      const overlay = document.querySelector('[data-slot="dialog-overlay"]');
      expect(overlay).toBeTruthy();
    });
  });

  describe('DialogPortal', () => {
    it('should render portal', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      // DialogContent renders inside a portal
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });
});
