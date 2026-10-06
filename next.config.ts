export default {
  // Old links to the Results page open the Results tab.
  async redirects() {
    return [
      { source: '/results', destination: '/?tab=results', permanent: true }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  }
};
