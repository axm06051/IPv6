/* eslint-disable testing-library/render-result-naming-convention */
/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import { render } from "@testing-library/react";
import { renderIPv6Question, renderWithKaTeX } from "../";

describe("IPv6 Utils", () => {
  describe("renderWithKaTeX", () => {
    test("should render simple text without LaTeX", () => {
      const textOutput = renderWithKaTeX("Simple text");
      expect(textOutput).toBe("Simple text");
    });

    test("should handle LaTeX fractions", () => {
      const fractionOutput = renderWithKaTeX("\\frac{60}{4}");
      expect(fractionOutput).toContain("60");
      expect(fractionOutput).toContain("4");
    });

    test("should handle texttt formatting", () => {
      const formattedOutput = renderWithKaTeX("\\texttt{2001:DB8::1}");
      expect(formattedOutput).toContain("2001:DB8::1");
    });
  });

  describe("renderIPv6Question", () => {
    test("should render IPv6 addresses in monospace when wrapped in texttt", () => {
      const question = "\\texttt{2001:DB8:0000:0000:0000:0000:0000:0001}";
      const ipv6Component = renderIPv6Question(question);

      const { container } = render(ipv6Component);
      const monospaceElement = container.querySelector(".font-monospace");

      expect(monospaceElement).not.toBeNull();
      expect(monospaceElement).toHaveClass("font-monospace");
      expect(monospaceElement).toHaveTextContent("2001:DB8");
    });

    test("should handle LaTeX formatting in questions without texttt", () => {
      const question = "Convert 2001:DB8::1 to full form";
      const latexComponent = renderIPv6Question(question);

      const { container } = render(latexComponent);
      const katexElement = container.querySelector(".katex");

      expect(katexElement).not.toBeNull();
      expect(katexElement).toHaveTextContent(
        "Convert 2001:DB8::1 to full form"
      );
    });

    test("should handle math expressions", () => {
      const question = "\\frac{64}{4}";
      const fractionComponent = renderIPv6Question(question);

      const { container } = render(fractionComponent);
      const katexElement = container.querySelector(".katex");

      expect(katexElement).not.toBeNull();
      expect(katexElement).toHaveTextContent("64");
      expect(katexElement).toHaveTextContent("4");
    });

    test("should handle IPv6 addresses with prefix in texttt", () => {
      const question = "\\texttt{2001:DB8::/64}";
      const prefixComponent = renderIPv6Question(question);

      const { container } = render(prefixComponent);
      const monospaceElement = container.querySelector(".font-monospace");

      expect(monospaceElement).not.toBeNull();
      expect(monospaceElement).toHaveClass("font-monospace");
      expect(monospaceElement).toHaveTextContent("2001:DB8");
      expect(monospaceElement).toHaveTextContent("/64");
    });
  });
});
