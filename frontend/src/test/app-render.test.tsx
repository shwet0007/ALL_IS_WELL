import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("app render", () => {
  it("renders the landing page", async () => {
    render(<App />);
    expect(await screen.findByText(/Expert Care for Every Step of Motherhood/i)).toBeInTheDocument();
  });
});
