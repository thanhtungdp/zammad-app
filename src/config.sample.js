const config = {
  /**
   * Endpoint for a crashreporter server.
   * See https://github.com/exanion/zammad-crashreporter
   * Can be null if unused
   */
  CRASHREPORTER_ENDPONT: 'https://analytics.zammad.exanion.de/crash',
  /**
   * Static token used to authenticate with
   * the crashreporter server
   */
  CRASHREPORTER_TOKEN: 'abc123',
  /**
   * Licensing endpoint of exalicense server
   * used for this application
   */
  LICENSING_ENDPOINT:
    'https://licensingserver.example.com/api/licensing/123456',
  /**
   * Public key used for signing the leases
   */
  LICENSING_SIGNINGKEY: `-----BEGIN PUBLIC KEY-----
abc123
-----END PUBLIC KEY-----`,
  /**
   * Interval (seconds) to use for license checking
   * if the user has got a license
   */
  LICENSING_CHECK_INTERVAL: 3600,
};

export default config;
