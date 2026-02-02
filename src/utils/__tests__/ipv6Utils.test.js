import { renderIPv6Question, renderWithKaTeX } from '../ipv6Utils.js';
import { render } from '@testing-library/react';

describe('IPv6 Utils', () => {
  describe('renderWithKaTeX', () => {
    test('should render simple text without LaTeX', () => {
      const result = renderWithKaTeX('Simple text');
      expect(result).toBe('Simple text');
    });

    test('should handle LaTeX fractions', () => {
      const result = renderWithKaTeX('\\frac{60}{4}');
      // Should contain the fraction content
      expect(result).toContain('60');
      expect(result).toContain('4');
    });

    test('should handle texttt formatting', () => {
      const result = renderWithKaTeX('\\texttt{2001:DB8::1}');
      expect(result).toContain('2001:DB8::1');
    });
  });

  describe('renderIPv6Question', () => {
    test('should render IPv6 addresses in monospace when wrapped in texttt', () => {
      const question = '\\texttt{2001:DB8:0000:0000:0000:0000:0000:0001}';
      const result = renderIPv6Question(question);
      
      // Render the component to test its structure
      const { container } = render(result);
      const element = container.firstChild;
      
      expect(element).toHaveClass('font-monospace');
      expect(element.textContent).toContain('2001:DB8');
    });

    test('should handle LaTeX formatting in questions without texttt', () => {
      const question = 'Convert 2001:DB8::1 to full form';
      const result = renderIPv6Question(question);
      
      const { container } = render(result);
      const element = container.firstChild;
      
      // This should render as KaTeX, not with font-monospace
      expect(element.textContent).toContain('Convert 2001:DB8::1 to full form');
    });

    test('should handle math expressions', () => {
      const question = '\\frac{64}{4}';
      const result = renderIPv6Question(question);
      
      const { container } = render(result);
      const element = container.firstChild;
      
      // This should render as KaTeX
      expect(element.textContent).toContain('64');
      expect(element.textContent).toContain('4');
    });

    test('should handle IPv6 addresses with prefix in texttt', () => {
      const question = '\\texttt{2001:DB8::/64}';
      const result = renderIPv6Question(question);
      
      const { container } = render(result);
      const element = container.firstChild;
      
      expect(element).toHaveClass('font-monospace');
      expect(element.textContent).toContain('2001:DB8');
      expect(element.textContent).toContain('/64');
    });
  });
});