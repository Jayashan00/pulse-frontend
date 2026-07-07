module.exports = {
  apps: [
    {
      name: 'pulse-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      autorestart: true,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production' },
    },
  ],
};
