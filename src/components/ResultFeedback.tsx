import React from "react";
import type { ResultFeedbackProps } from "../types";
import { renderWithKaTeX } from "../utils";

function formatCorrectMessage(): string {
  return "Correct!";
}

function formatIncorrectMessage(expectedAnswer: string): React.JSX.Element {
  return <>Incorrect. Expected: {renderWithKaTeX(expectedAnswer)}</>;
}

function formatResultMessage(message: string): string | React.JSX.Element {
  if (message.includes("Correct!")) {
    return formatCorrectMessage();
  }
  if (message.includes("Incorrect")) {
    return formatIncorrectMessage(message.replace("Incorrect. Expected: ", ""));
  }
  return message;
}

function ResultFeedback({ isCorrect, message, details }: ResultFeedbackProps) {
  return (
    <div
      className={`alert ${isCorrect ? "alert-success" : "alert-danger"} mb-3`}
    >
      <div
        className={`mb-2 ${isCorrect ? "valid-feedback d-block" : "invalid-feedback d-block"}`}
      >
        <span className='fw-bold'>{formatResultMessage(message)}</span>
      </div>
      {!isCorrect && details}
    </div>
  );
}

export default ResultFeedback;
