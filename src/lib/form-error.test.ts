import { describe, expect, it } from "vitest";
import { withContactEmail } from "./form-error";

const EMAIL = "info@ecommercesteem.com";

describe("withContactEmail", () => {
  it("appends the email to a generic message", () => {
    expect(withContactEmail("We couldn't send your message. Please try again.", EMAIL)).toBe(
      "We couldn't send your message. Please try again, or email us at info@ecommercesteem.com.",
    );
  });
  it("leaves a message that already names the email untouched", () => {
    const msg = "Our form is down — email info@ecommercesteem.com.";
    expect(withContactEmail(msg, EMAIL)).toBe(msg);
  });
  it("adds a sentence when the message doesn't end in 'Please try again.'", () => {
    expect(withContactEmail("Something went wrong", EMAIL)).toBe(
      "Something went wrong. You can also email us at info@ecommercesteem.com.",
    );
  });
});
