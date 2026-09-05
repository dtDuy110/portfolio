export class ContactForm {
  constructor(config, onSuccess) {
    this.config = config;
    this.onSuccess = onSuccess;
  }
  bind(form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form)),
        status = form.querySelector(".form-status"),
        button = form.querySelector("button");
      if (!this.config.endpoint && !this.config.email) {
        status.textContent =
          "Transmission preview ready. No message was sent — the portfolio owner has not added a delivery address yet.";
        return;
      }
      if (!this.config.endpoint) {
        const subject = encodeURIComponent(
          `Portfolio message from ${data.name}`,
        );
        const body = encodeURIComponent(
          `From: ${data.name} <${data.email}>\n\n${data.message}`,
        );
        location.href = `mailto:${encodeURIComponent(this.config.email)}?subject=${subject}&body=${body}`;
        status.textContent =
          "Opening your email app with a draft. Send it there to complete your transmission.";
        return;
      }
      button.disabled = true;
      status.textContent = "Sending your transmission…";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(this.config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Delivery failed");
        status.textContent =
          "Transmission received. Thank you for reaching out.";
        form.reset();
        this.onSuccess();
      } catch {
        status.textContent =
          "Your transmission could not be delivered. Your message is still here — please try again.";
      } finally {
        clearTimeout(timeout);
        button.disabled = false;
      }
    });
  }
}
