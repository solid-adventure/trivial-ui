export default class TrackingService {
  static identify(user) {
    try {
      return false // Implement your analytics platform's user identify logic here
    } catch (e) {
      console.log(`[TrackingService] Could not identify: ${e}`);
    }
  }

  static track(event, payload) {
    try {
      return false // Implement your analytics platform's event logic here
    } catch (e) {
      console.log(`[TrackingService] Failed to track event ${e}`);
    }
  }

  // Merge a user identify across domains while handling an opt-out that occured on the landing domain
  static identifyLandingReferer() {
    try {
      if (!window || !window.location || !window.location.search) return;
      const params = new URLSearchParams(window.location.search);
      const referId = params.get("refer_id");
      const optOut = params.get("opt_out");
      if (!referId) return;
      return false // Implement your analytics platform's user identify merge logic here
      if (optOut === "true") {
        return false // Implement your analytics platform's user opt-out logic here
      }
    } catch (e) {
      console.log(`[TrackingService] Could not identify: ${e}`);
    }
  }
}