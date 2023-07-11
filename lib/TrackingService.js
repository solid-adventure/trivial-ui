class TrackingService {
  static identify(user) {
    try {
      const previousId = window.posthog.get_distinct_id();
      window.posthog.identify(user.Email);
      posthog.alias(user.Email, previousId);
    } catch (e) {
      console.log(`[TrackingService] Could not identify: ${e}`);
    }
  }

  static track(event, payload) {
    try {
      window.posthog.capture(event, payload);
    } catch (e) {
      console.log(`[TrackingService] Failed to track event ${e}`);
    }
  }

  static identifyLandingReferer() {
    try {
      if (!window || !window.location || !window.location.search) return;
      const params = new URLSearchParams(window.location.search);
      const referId = params.get("refer_id");
      const optOut = params.get("opt_out");
      if (!referId) return;
      window.posthog.identify(referId);
      if (optOut === "true") {
        window.posthog.opt_out_capturing();
      }
    } catch (e) {
      console.log(`[TrackingService] Could not identify: ${e}`);
    }
  }
}
module.exports = TrackingService;
